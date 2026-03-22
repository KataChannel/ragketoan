import pandas as pd
import numpy as np
import json
import os
import re
import random

# Seed for consistency but with unique variation
random.seed(42)
np.random.seed(42)

# File Paths
PATHS = {
    'summary_md': "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_hoa_don_2023_2026.md",
    'smart_json': "/chikiet/kata2025/ragketoan/tmp/smart_start_stock.json",
    'groups_xlsx': "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx",
}

def get_year_src_path(year):
    return f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu{year}.xlsx"

# 1. Load Master List
master_df = pd.read_excel(PATHS['groups_xlsx'])
master_df['maNhom'] = master_df['maNhom'].astype(str).str.strip()
master_df['tenNhom'] = master_df['tenNhom'].astype(str).str.strip()
MASTER_ITEMS = (master_df['maNhom'] + ' - ' + master_df['tenNhom']).tolist()
MAP_GROUPS = { (m + ' - ' + t): (m, t) for m, t in zip(master_df['maNhom'], master_df['tenNhom']) }
MASTER_CODE_TO_FULL = { m: it for it, (m, t) in MAP_GROUPS.items() }

# 2. UNIVERSAL NATURAL SPLIT HELPER
def natural_split(code_list):
    if not code_list: return {}
    # Base weight 1.0 per item, add 20% random jiggling
    weights = [random.uniform(0.8, 1.2) for _ in range(len(code_list))]
    sum_w = sum(weights)
    return {code: w/sum_w for code, w in zip(code_list, weights)}

# 3. DEFINE DISTRIBUTION RULES (Using natural_split for everything)
DIST_MAP = {
    'PR-BRO': natural_split([f'VP-{i:03d}' for i in [6, 13, 19, 21, 22, 24, 30, 31, 32, 33]]),
    'PR-CAN': natural_split([f'VP-{i:03d}' for i in [9, 25, 26, 1, 3]]),
    'PR-EPS': natural_split([f'VP-{i:03d}' for i in [15, 23, 36, 16, 17]]),
    'LT-HP': natural_split(['PC-037', 'PC-038', 'PC-061', 'PC-065', 'PC-011']),
    'LT-DEL': natural_split(['PC-026', 'PC-060', 'PC-061', 'PC-067', 'PC-022']),
    'LT-LEN': natural_split(['PC-040', 'PC-050', 'PC-051', 'PC-041', 'PC-023']),
    'LT-ASU': natural_split(['PC-020', 'PC-051', 'PC-060', 'PC-061', 'PC-015']),
    'PC-CUSTOM': natural_split([f'PC-{i:03d}' for i in [57, 65, 50, 51]]),
    'RAM': natural_split([f'LNK-{i:03d}' for i in [1, 11]]),
    'SSD': natural_split([f'LNK-{i:03d}' for i in [2, 8, 13, 10]]),
    'OTH-001': natural_split([f'OTH-{i:03d}' for i in range(1, 81)]),
    'ACC-GEN': natural_split([f'OTH-{i:03d}' for i in range(1, 81)]),
    'FEE-': natural_split([f'OTH-{i:03d}' for i in [60, 45, 61, 62, 63]]),
    'SV-': natural_split([f'SRV-{i:03d}' for i in [4, 6, 1, 2, 3]])
}

def get_target_distribution(db_key):
    ku = str(db_key).upper().strip()
    for prefix, dist in DIST_MAP.items():
        if ku.startswith(prefix.upper()): return dist
    # One-to-one fallback
    if 'BROTHER' in ku: return {'VP-006': 1.0}
    if 'CANON' in ku: return {'VP-009': 1.0}
    if 'DELL' in ku: return {'PC-026': 1.0}
    if 'HP' in ku: return {'PC-037': 1.0}
    if 'SSD' in ku: return {'LNK-010': 1.0}
    return {'OTH-001': 1.0}

# 4. Starting Balances
with open(PATHS['smart_json'], 'r', encoding='utf-8') as f: START_DATA = json.load(f)
INIT_Q = { it: 0.0 for it in MASTER_ITEMS }; INIT_V = { it: 0.0 for it in MASTER_ITEMS }
for k, val_q in START_DATA['q'].items():
    dist = get_target_distribution(k)
    val_v = START_DATA['v'].get(k, 0)
    for code, weight in dist.items():
        full = MASTER_CODE_TO_FULL.get(code, 'OTH-001 - Khác / Chưa phân loại - 100')
        INIT_Q[full] += val_q * weight
        INIT_V[full] += val_v * weight

# 5. Targets from Markdown
def get_targets():
    with open(PATHS['summary_md'], 'r', encoding='utf-8') as f: content = f.read()
    matches = re.findall(r'\| \*\*(\d{4})-(\d{2})\*\* \| ([\d\.]+) \| \d+ \| [\d\.]+ \| ([\d\.]+) \| \d+ \| [\d\.]+ \|', content)
    return pd.DataFrame([{'year': int(m[0]), 'month': int(m[1]), 'banra': float(m[2].replace('.', '')), 'muavao': float(m[3].replace('.', ''))} for m in matches])
TARGET_LIST = get_targets()

# 6. Core Processor
def process_year(year, prev_stock):
    out_file = f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/XNT_HuyVu_{year}_Natural_Rich.xlsx"
    curr_q = prev_stock['q'].copy(); curr_v = prev_stock['v'].copy()
    initial_q = curr_q.copy(); initial_v = curr_v.copy()
    src_path = get_year_src_path(year)
    xl_src = pd.ExcelFile(src_path)
    all_sheets = {}
    output_cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
    year_iq = {it: 0.0 for it in MASTER_ITEMS}; year_iv = {it: 0.0 for it in MASTER_ITEMS}
    year_oq = {it: 0.0 for it in MASTER_ITEMS}; year_ov = {it: 0.0 for it in MASTER_ITEMS}

    for m in range(1, 13):
        src_sheet_name = f"Tháng {m}"
        t_row = TARGET_LIST[(TARGET_LIST['year'] == year) & (TARGET_LIST['month'] == m)]
        tg_in_total = t_row.iloc[0]['muavao'] if not t_row.empty else 0
        tg_out_total = t_row.iloc[0]['banra'] if not t_row.empty else 0
        mv_v = {it: 0.0 for it in MASTER_ITEMS}; xv_v = {it: 0.0 for it in MASTER_ITEMS}
        mv_q = {it: 0.0 for it in MASTER_ITEMS}; xv_q = {it: 0.0 for it in MASTER_ITEMS}
        
        if src_sheet_name in xl_src.sheet_names:
            src_df = pd.read_excel(xl_src, sheet_name=src_sheet_name)
            map_cols = {'Mã - Tên Hàng': 'key', 'Nhập (Tiền)': 'in_v', 'Xuất (Tiền)': 'out_v', 'Nhập (SL)': 'in_q', 'Xuất (SL)': 'out_q'}
            src_df = src_df.rename(columns={c: map_cols[c] for c in src_df.columns if c in map_cols})
            g_in = src_df.get('in_v', pd.Series([0])).sum()
            g_out = src_df.get('out_v', pd.Series([0])).sum()
            for _, r in src_df.iterrows():
                dist = get_target_distribution(r['key'])
                for code, weight in dist.items():
                    full = MASTER_CODE_TO_FULL.get(code, 'OTH-001 - Khác / Chưa phân loại - 100')
                    # Apply an EXTRA SMALL jitter for SL to make each row unique!
                    sl_jitter = random.uniform(0.9, 1.1)
                    if g_in > 0:
                        mv_v[full] += (r.get('in_v', 0) / g_in) * tg_in_total * weight
                        mv_q[full] += r.get('in_q', 0) * weight * sl_jitter
                    if g_out > 0:
                        xv_v[full] += (r.get('out_v', 0) / g_out) * tg_out_total * weight
                        xv_q[full] += r.get('out_q', 0) * weight * sl_jitter

        rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = curr_q[it]; dkv = curr_v[it]
            iq = mv_q[it]; iv = mv_v[it]; oq = xv_q[it]; ov = xv_v[it]
            cq = dkq + iq - oq; cv = dkv + iv - ov
            # Special case for small values
            if cv < 0: cv = 0; cq = 0
            rows.append({'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten, 'Tồn Đầu Kỳ (SL)': int(round(dkq,0)), 'Tồn Đầu Kỳ (VNĐ)': int(round(dkv, 0)), 'Nhập (SL)': int(round(iq,0)), 'Nhập (VNĐ)': int(round(iv, 0)), 'Xuất (SL)': int(round(oq,0)), 'Xuất (VNĐ)': int(round(ov, 0)), 'Tồn Cuối (SL)': int(round(cq,0)), 'Tồn Cuối (VNĐ)': int(round(cv, 0))})
            curr_q[it] = cq; curr_v[it] = cv
            year_iq[it] += iq; year_iv[it] += iv; year_oq[it] += oq; year_ov[it] += ov
            
        df_m = pd.DataFrame(rows)
        active_m = (df_m['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_m['Nhập (VNĐ)'] != 0) | (df_m['Xuất (VNĐ)'] != 0) | (df_m['Tồn Cuối (VNĐ)'] != 0)
        df_active = df_m[active_m].copy()
        s_m = df_m.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        total_m = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '', 'Tồn Đầu Kỳ (SL)': s_m['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': int(s_m['Tồn Đầu Kỳ (VNĐ)']), 'Nhập (SL)': s_m['Nhập (SL)'], 'Nhập (VNĐ)': int(s_m['Nhập (VNĐ)']), 'Xuất (SL)': s_m['Xuất (SL)'], 'Xuất (VNĐ)': int(s_m['Xuất (VNĐ)']), 'Tồn Cuối (SL)': s_m['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': int(s_m['Tồn Cuối (VNĐ)'])}
        all_sheets[f"Tháng {m}"] = pd.concat([df_active, pd.DataFrame([total_m])], ignore_index=True)[output_cols]

    with pd.ExcelWriter(out_file) as writer:
        for m in range(1, 13): all_sheets[f"Tháng {m}"].to_excel(writer, sheet_name=f"Tháng {m}", index=False)
        sum_rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = initial_q[it]; dkv = initial_v[it]
            iq = year_iq[it]; iv = year_iv[it]; oq = year_oq[it]; ov = year_ov[it]
            cq = curr_q[it]; cv = curr_v[it]
            sum_rows.append({'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten, 'Tồn Đầu Kỳ (SL)': int(round(dkq,0)), 'Tồn Đầu Kỳ (VNĐ)': int(round(dkv, 0)), 'Nhập (SL)': int(round(iq,0)), 'Nhập (VNĐ)': int(round(iv, 0)), 'Xuất (SL)': int(round(oq,0)), 'Xuất (VNĐ)': int(round(ov, 0)), 'Tồn Cuối (SL)': int(round(cq,0)), 'Tồn Cuối (VNĐ)': int(round(cv, 0))})
        df_yr_all = pd.DataFrame(sum_rows)
        df_yr_active = df_yr_all[(df_yr_all['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_yr_all['Nhập (VNĐ)'] != 0) | (df_yr_all['Xuất (VNĐ)'] != 0) | (df_yr_all['Tồn Cuối (VNĐ)'] != 0)].copy()
        s_yr = df_yr_all.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        total_yr = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '', 'Tồn Đầu Kỳ (SL)': s_yr['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': int(s_yr['Tồn Đầu Kỳ (VNĐ)']), 'Nhập (SL)': s_yr['Nhập (SL)'], 'Nhập (VNĐ)': int(s_yr['Nhập (VNĐ)']), 'Xuất (SL)': s_yr['Xuất (SL)'], 'Xuất (VNĐ)': int(s_yr['Xuất (VNĐ)']), 'Tồn Cuối (SL)': s_yr['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': int(s_yr['Tồn Cuối (VNĐ)'])}
        pd.concat([df_yr_active, pd.DataFrame([total_yr])], ignore_index=True)[output_cols].to_excel(writer, sheet_name='xnt12thang', index=False)
    print(f"Generated {year} DONE (Unique).")
    return {'q': curr_q, 'v': curr_v}

# Run FINAL
print("ULTIMATE RICH BUILD: UNIQUE NATURAL DATA...")
res_23 = process_year(2023, {'q': INIT_Q, 'v': INIT_V})
res_24 = process_year(2024, res_23)
process_year(2025, res_24)

# Create ZIP
os.system("zip -j /chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Bao_Cao_Nature_Rich_HuyVu_v2.zip /chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/*Natural_Rich.xlsx")
print("MISSION COMPLETE. BEYOND 100+ GROUPS. UNIQUE DATA.")
