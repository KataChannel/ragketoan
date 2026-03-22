import pandas as pd
import numpy as np
import json
import os

PATHS = {
    'goc': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_goc.xlsx",
    'details_24_25': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv",
    'summary': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_23_25.csv",
    'items': "/chikiet/kata2025/ragketoan/tmp/items_list.json"
}

# The target Starting Balance (1/1/2023)
TARGET_START_CORE_TIEN = 20528682383
CURRENT_START_CORE_TIEN = 4241000000
FACTOR = TARGET_START_CORE_TIEN / CURRENT_START_CORE_TIEN

with open(PATHS['items'], 'r') as f:
    item_ctx = json.load(f)
    MASTER_ITEMS = item_ctx['items']
    DVT_MAP = item_ctx['dvt']

def get_targets():
    df_sodung = pd.read_excel(PATHS['goc'], sheet_name='Sodung')
    t23 = []
    for _, row in df_sodung.iterrows():
        t23.append({'year': 2023, 'month': int(row['Tháng']),
                    'banra': row['Doanh Thu Bán Ra'] + row['Doanh Thu Bán Ra Không Chịu Thuế'],
                    'muavao': row['Doanh Thu Mua Vào']})
    df_sum = pd.read_csv(PATHS['summary'])
    pivoted = df_sum.pivot_table(index=['year', 'month'], columns='loaihd', values='tgtcthue').reset_index()
    return pd.concat([pd.DataFrame(t23), pivoted[pivoted['year'] > 2023]], ignore_index=True)

xl_goc = pd.ExcelFile(PATHS['goc'])
df_2425 = pd.read_csv(PATHS['details_24_25'] if os.path.exists(PATHS['details_24_25']) else "/dev/null") # Handle first run if needed

def map_item(name):
    name_low = str(name).lower()
    for it in MASTER_ITEMS:
        code = it.split(' - ')[0].lower()
        if code in name_low: return it
    return MASTER_ITEMS[0]

def get_monthly_weights(year, month):
    res = []
    if year == 2023:
        df = pd.read_excel(xl_goc, sheet_name=f'Tháng {month}')
        df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for _, r in df.iterrows():
            if r['Nhập (Tiền)'] > 0: res.append({'Mapped': r['Mã - Tên Hàng'], 'loaihd': 'muavao', 'val': r['Nhập (Tiền)'], 'qty': r['Nhập (SL)']})
            if r['Xuất (Tiền)'] > 0: res.append({'Mapped': r['Mã - Tên Hàng'], 'loaihd': 'banra', 'val': r['Xuất (Tiền)'], 'qty': r['Xuất (SL)']})
    else:
        df = df_2425[df_2425['month'] == month]
        for _, r in df.iterrows():
            m = map_item(r['ten'])
            res.append({'Mapped': m, 'loaihd': r['loaihd'], 'val': r['thtien'], 'qty': r['sluong']})
    return pd.DataFrame(res)

def process_year(year, targets_df, start_stock):
    targets_yr = targets_df[targets_df['year'] == year].sort_values('month')
    all_sheets = {}
    current_stock = start_stock.copy()
    hoadon_data = []

    for m in range(1, 13):
        t_m = targets_yr[targets_yr['month'] == m].iloc[0]
        weights = get_monthly_weights(year, m)
        
        nhap_val = {it: 0.0 for it in MASTER_ITEMS}; nhap_qty = {it: 0.0 for it in MASTER_ITEMS}
        xuat_val = {it: 0.0 for it in MASTER_ITEMS}; xuat_qty = {it: 0.0 for it in MASTER_ITEMS}
        
        # Scaling inputs
        pv = weights[weights['loaihd'] == 'muavao'].groupby('Mapped')[['val', 'qty']].sum()
        sv = weights[weights['loaihd'] == 'banra'].groupby('Mapped')[['val', 'qty']].sum()
        
        if pv['val'].sum() > 0:
            scale_p = t_m['muavao'] / pv['val'].sum()
            for it, row in pv.iterrows(): nhap_val[it] = row['val']*scale_p; nhap_qty[it] = row['qty']
        elif t_m['muavao'] > 0: nhap_val[MASTER_ITEMS[0]] = t_m['muavao']; nhap_qty[MASTER_ITEMS[0]] = 1
            
        if sv['val'].sum() > 0:
            scale_s = t_m['banra'] / sv['val'].sum()
            for it, row in sv.iterrows(): xuat_val[it] = row['val']*scale_s; xuat_qty[it] = row['qty']
        elif t_m['banra'] > 0: xuat_val[MASTER_ITEMS[0]] = t_m['banra']; xuat_qty[MASTER_ITEMS[0]] = 1

        start_qty_map = {r['Mã - Tên Hàng']: r['Đầu Kỳ (SL)'] for _, r in current_stock.iterrows()}
        start_val_map = {r['Mã - Tên Hàng']: r['Đầu Kỳ (Tiền)'] for _, r in current_stock.iterrows()}

        # Rebalance Stock (Qty & Val)
        for it in MASTER_ITEMS:
            avail_q = start_qty_map.get(it, 0) + nhap_qty[it]
            if xuat_qty[it] > avail_q and xuat_qty[it] > 0:
                short_q = xuat_qty[it] - avail_q
                donors = sorted([d for d in MASTER_ITEMS if d != it and nhap_qty[d] > 0], key=lambda x: nhap_qty[x], reverse=True)
                for d in donors:
                    move_q = min(short_q, nhap_qty[d])
                    move_v = nhap_val[d] * (move_q / nhap_qty[d])
                    nhap_qty[d] -= move_q; nhap_val[d] -= move_v
                    nhap_qty[it] += move_q; nhap_val[it] += move_v
                    short_q -= move_q
                    if short_q <= 0: break
                if short_q > 0:
                    delta_q = short_q; xuat_qty[it] -= delta_q
                    delta_v = (delta_q / (xuat_qty[it]+delta_q)) * xuat_val[it]
                    xuat_val[it] -= delta_v
                    recipients = sorted([r for r in MASTER_ITEMS if r != it], key=lambda x: start_qty_map.get(x,0) + nhap_qty[x] - xuat_qty[x], reverse=True)
                    if recipients: xuat_qty[recipients[0]] += delta_q; xuat_val[recipients[0]] += delta_v

        # Final Sheet Prep
        rows = []
        for it in MASTER_ITEMS:
            ck_q = max(0, start_qty_map.get(it, 0) + nhap_qty[it] - xuat_qty[it])
            ck_v = max(0, start_val_map.get(it, 0) + nhap_val[it] - xuat_val[it])
            rows.append({
                'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP.get(it, 'Cái'),
                'Đầu Kỳ (SL)': round(start_qty_map.get(it, 0), 2), 'Đầu Kỳ (Tiền)': round(start_val_map.get(it,0), 0),
                'Nhập (SL)': round(nhap_qty[it], 2), 'Nhập (Tiền)': round(nhap_val[it], 0),
                'Xuất (SL)': round(xuat_qty[it], 2), 'Xuất (Tiền)': round(xuat_val[it], 0),
                'Cuối Kỳ (SL)': round(ck_q, 2), 'Cuối Kỳ (Tiền)': round(ck_v, 0)
            })
        
        final_sheet = pd.DataFrame(rows)
        all_sheets[f'Tháng {m}'] = pd.concat([final_sheet, pd.DataFrame([['TỔNG CỘNG', ''] + final_sheet.select_dtypes(include=[np.number]).sum().tolist()], columns=final_sheet.columns)], ignore_index=True)
        current_stock = final_sheet[['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy()
        current_stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
        hoadon_data.append([f"{m:02d}/{year}", "Bán ra", "1 (Hợp lệ)", int(sum(xuat_qty.values())), sum(xuat_val.values())])
        hoadon_data.append([f"{m:02d}/{year}", "Mua vào", "1 (Hợp lệ)", int(sum(nhap_qty.values())), sum(nhap_val.values())])

    # Save
    out_file = f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu{year}.xlsx"
    with pd.ExcelWriter(out_file) as writer:
        pd.DataFrame(hoadon_data, columns=['Tháng', 'Loại HD', 'Tình trạng (Mã)', 'Số lượng', 'Tổng giá tiền (VNĐ)']).to_excel(writer, sheet_name='Hoadon', index=False)
        for m in range(1, 13): all_sheets[f'Tháng {m}'].to_excel(writer, sheet_name=f'Tháng {m}', index=False)
        # xnt12thang
        m1 = all_sheets['Tháng 1'].iloc[:-1]; m12 = all_sheets['Tháng 12'].iloc[:-1]
        xnt12 = m1[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']].copy()
        in_q = np.zeros(len(xnt12)); in_v = np.zeros(len(xnt12)); out_q = np.zeros(len(xnt12)); out_v = np.zeros(len(xnt12))
        for m in range(1, 13):
            cur = all_sheets[f'Tháng {m}'].iloc[:-1]
            in_q += cur['Nhập (SL)'].values; in_v += cur['Nhập (Tiền)'].values
            out_q += cur['Xuất (SL)'].values; out_v += cur['Xuất (Tiền)'].values
        xnt12['Nhập (SL)'] = in_q; xnt12['Nhập (Tiền)'] = in_v
        xnt12['Xuất (SL)'] = out_q; xnt12['Xuất (Tiền)'] = out_v
        xnt12['Cuối Kỳ (SL)'] = m12['Cuối Kỳ (SL)'].values; xnt12['Cuối Kỳ (Tiền)'] = m12['Cuối Kỳ (Tiền)'].values
        pd.concat([xnt12, pd.DataFrame([['TỔNG CỘNG', ''] + xnt12.select_dtypes(include=[np.number]).sum().tolist()], columns=xnt12.columns)], ignore_index=True).to_excel(writer, sheet_name='xnt12thang', index=False)
    
    return current_stock

# Preparation Start
targets = get_targets()
start_23_raw = pd.read_excel(xl_goc, sheet_name='Tháng 1')
start_23_raw = start_23_raw[start_23_raw['Mã - Tên Hàng'] != 'TỔNG CỘNG']
start_23_dict_q = {str(r['Mã - Tên Hàng']).strip(): r['Đầu Kỳ (SL)'] for _, r in start_23_raw.iterrows()}
start_23_dict_v = {str(r['Mã - Tên Hàng']).strip(): r['Đầu Kỳ (Tiền)'] for _, r in start_23_raw.iterrows()}

start_23_rows = []
for it in MASTER_ITEMS:
    q = start_23_dict_q.get(it, 0)
    v = start_23_dict_v.get(it, 0)
    # APPLY THE SCALING FACTOR TO BOTH QTY AND VALUE TO REACH THE TARGET STARTING BALANCE
    # (Scaling both keeps the unit price consistent)
    start_23_rows.append({
        'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP.get(it, 'Cái'), 
        'Đầu Kỳ (SL)': q * FACTOR, 
        'Đầu Kỳ (Tiền)': v * FACTOR
    })
start_23 = pd.DataFrame(start_23_rows)

print(f"Applying Factor {FACTOR:.4f} to Start Stock...")
st_24 = process_year(2023, targets, start_23)
st_25 = process_year(2024, targets, st_24)
process_year(2025, targets, st_25)
print("Adjustment Complete.")
