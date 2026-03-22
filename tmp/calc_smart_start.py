import pandas as pd
import numpy as np
import json
import os

PATHS = {
    'goc': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_goc.xlsx",
    'details_24_25': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv",
    'summary': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_23_25.csv"
}

# 1. Extract Items
xl_goc = pd.ExcelFile(PATHS['goc'])
MASTER_ITEMS = set()
for s in xl_goc.sheet_names:
    if 'Tháng' in s:
        df = pd.read_excel(xl_goc, sheet_name=s); df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for it in df['Mã - Tên Hàng']: MASTER_ITEMS.add(str(it).strip())
MASTER_ITEMS = sorted(list(MASTER_ITEMS))

def map_item(name):
    name_low = str(name).lower()
    for it in MASTER_ITEMS:
        if it.split(' - ')[0].lower() in name_low: return it
    return MASTER_ITEMS[0]

# 2. Extract Prices and Volume from all available data (2023 GOC + 2024-25 details)
stats = {it: {'v': 0.0, 'q': 0.0} for it in MASTER_ITEMS}

# 2023
for s in xl_goc.sheet_names:
    if 'Tháng' in s:
        df = pd.read_excel(xl_goc, sheet_name=s); df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for _, r in df.iterrows():
            it = str(r['Mã - Tên Hàng']).strip()
            if it in stats:
                stats[it]['v'] += (r['Nhập (Tiền)'] + r['Xuất (Tiền)'])
                stats[it]['q'] += (r['Nhập (SL)'] + r['Xuất (SL)'])

# 2024-25
df_det = pd.read_csv(PATHS['details_24_25'])
for _, r in df_det.iterrows():
    it = map_item(r['ten'])
    stats[it]['v'] += r['thtien']
    stats[it]['q'] += r['sluong']

# Compute ref prices and weights
ref_prices = {}
weights = {}
for it in MASTER_ITEMS:
    if stats[it]['q'] > 0:
        ref_prices[it] = stats[it]['v'] / stats[it]['q']
        weights[it] = stats[it]['q']
    else:
        ref_prices[it] = 1000000.0 # 1M default
        weights[it] = 0.01 # Small default

# Normalize weights so sum matches something reasonable (but total value must be 20.5B)
# The logic: Importance[i] = weights[i] * ref_prices[i]
importance = {it: weights[it] * ref_prices[it] for it in MASTER_ITEMS}
total_imp = sum(importance.values())

TARGET_START_TIEN = 20528682383
final_start_v = {it: (importance[it] / total_imp) * TARGET_START_TIEN for it in MASTER_ITEMS}
final_start_q = {it: final_start_v[it] / ref_prices[it] for it in MASTER_ITEMS}

# Save these distributions for the rebuild script
with open('/chikiet/kata2025/ragketoan/tmp/smart_start_stock.json', 'w') as f:
    json.dump({'q': final_start_q, 'v': final_start_v}, f)
print("Smart distribution calculated.")
