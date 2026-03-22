import pandas as pd
import numpy as np
import json
import os
import re

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

# 2. GRANULAR MAPPING RULES (100+ groups challenge)
# This mapping covers almost all 133 keys to their respective codes in the 248 master list
DEEP_MAPPING = {
    # Camera
    'CAM-001': 'CAM-001', 'CAM-011': 'CAM-011',
    # Service
    'SRV-004': 'SRV-004', 'SV-TELECOM': 'SRV-006',
    # PC Brands
    'PC-ASU-U8M': 'PC-020', 'PC-CUSTOM-U8M': 'PC-057', 'PC-CUSTOM-8-12M': 'PC-057',
    'PC-DEL-12-20M': 'PC-026', 'PC-DEL-8-12M': 'PC-026', 'PC-DEL-O20M': 'PC-026',
    'PC-LEN-U8M': 'PC-040',
    # Laptops
    'LT-ASU-10-15M': 'PC-020', 'LT-ASU-15-20M': 'PC-020', 'LT-ASU-U10M': 'PC-020',
    'LT-DEL-10-15M': 'PC-026', 'LT-DEL-15-20M': 'PC-026', 'LT-DEL-O20M': 'PC-026',
    'LT-DEL-VOS-10-15M': 'PC-026', 'LT-DEL-VOS-15-20M': 'PC-026',
    'LT-HP-10-15M': 'PC-037', 'LT-HP-15-20M': 'PC-037', 'LT-HP-U10M': 'PC-037',
    'LT-LEN-TPD-10-15M': 'PC-040', 'LT-LEN-TPD-15-20M': 'PC-040', 'LT-LEN-TPD-O20M': 'PC-040',
    'LT-LEN-U10M': 'PC-040', 'LT-MSI-10-15M': 'PC-047', 'LT-MSI-15-20M': 'PC-047',
    # Monitors
    'MON-DEL-19_20': 'MON-002', 'MON-DEL-22_24': 'MON-002', 'MON-DEL-27P': 'MON-001',
    'MON-GEN-19_20': 'MON-002', 'MON-GEN-22_24': 'MON-002', 'MON-GEN-27P': 'MON-003',
    'MON-SAM-27P': 'MON-003', 'MON-VS-19_20': 'MON-002', 'MON-VS-22_24': 'MON-001', 'MON-VS-27P': 'MON-001',
    # Peripherals
    'MOUSE-DELL-WIR': 'PC-061', 'MOUSE-DELL-WLS': 'PC-061', 'MOUSE-LOGI-WLS': 'PC-067',
    'MOUSE-OTH-WIR': 'PC-061', 'MOUSE-OTH-WLS': 'PC-061', 'MOUSE-RAPOO-WIR': 'VP-042',
    'MOUSE-RAPOO-WLS': 'VP-042', 'BPK-NK2600': 'PC-060', 'BPD-Dell': 'PC-060', 'BPL-K120': 'PC-067',
    'SPK-OTH': 'PC-067', 'SPK-SMAX': 'OTH-076',
    # Printer & Office
    'PR-BRO': 'VP-006', 'PR-BRO-B2100': 'VP-019', 'PR-BRO-HL2321': 'VP-021', 'PR-BRO-MFC_HL': 'VP-013',
    'PR-CAN': 'VP-009', 'PR-CAN-LBP240': 'VP-026', 'PR-CAN-LBP2900': 'VP-025', 'PR-CAN-LBP6030': 'VP-026',
    'PR-EPS-L805': 'VP-023', 'PR-EPS-LSER': 'VP-023', 'PR-OTH': 'VP-049', 'PR-XPR': 'VP-046',
    'OFFICE-EQ': 'OTH-083', 'PRJ-EQ': 'OTH-065', 'UPS-GEN': 'OTH-075',
    # Maintenance & Components
    'RAM-4GB': 'LNK-011', 'RAM-8GB': 'LNK-011', 'RAM-16GB': 'LNK-001',
    'SSD-256G': 'LNK-002', 'SSD-512G': 'LNK-008', 'SSD-1TB': 'LNK-013',
    'MAIN-ASU-H510': 'PC-051', 'MAIN-ASU-H610': 'PC-050', 'MAIN-ASU-B760': 'PC-051',
    'PSU-GEN': 'PC-065', 'PSU-JETEK': 'PC-065',
    # Network
    'NW-CABLE': 'OTH-073', 'NW-SWITCH': 'OTH-013', 'NW-ROUTER-TPLINK': 'OTH-013',
    # Storage
    'USB-32G': 'OTH-026', 'USB-64G': 'OTH-030', 'USB-128G': 'OTH-022',
    # Fees & Others
    'FEE-GIFT': 'OTH-060', 'FEE-DISC': 'OTH-045', 'SV-OTH': 'SRV-006'
}

# 3. Load Starting Balances
with open(PATHS['smart_json'], 'r', encoding='utf-8') as f: START_DATA = json.load(f)
INIT_Q = { it: 0.0 for it in MASTER_ITEMS }; INIT_V = { it: 0.0 for it in MASTER_ITEMS }

def find_target_code(db_key):
    k = str(db_key).strip()
    ku = k.upper()
    
    # Priority 1: Exact mapping if key starts with the code
    for prefix, code in DEEP_MAPPING.items():
        if ku.startswith(prefix.upper()):
            return code
            
    # Priority 2: Fuzzy keyword search
    if '12A' in ku: return 'VP-001'
    if '35A' in ku: return 'VP-003'
    if 'BROTHER' in ku: return 'VP-006'
    if 'CANON' in ku: return 'VP-009'
    if 'DELL' in ku: return 'PC-026'
    if 'HP' in ku: return 'PC-037'
    if 'LOGITECH' in ku: return 'PC-067'
    if 'VIEWSONIC' in ku: return 'MON-001'
    if 'SAMSUNG' in ku: return 'MON-003'
    if 'SSD' in ku: return 'LNK-010'
    if 'RAM' in ku: return 'LNK-011'
    if 'PRINTER' in ku or 'MÁY IN' in ku: return 'VP-049'
    if 'CABLE' in ku or 'CÁP' in ku: return 'OTH-073'
    if 'KASPERSKY' in ku or 'SW-' in ku: return 'SW-005'
    
    return 'OTH-001' # Fallback to 100

for k, v in START_DATA['q'].items():
    ma = find_target_code(k)
    full = MASTER_CODE_TO_FULL.get(ma, 'OTH-001 - Khác / Chưa phân loại - 100')
    INIT_Q[full] += v
for k, v in START_DATA['v'].items():
    ma = find_target_code(k)
    full = MASTER_CODE_TO_FULL.get(ma, 'OTH-001 - Khác / Chưa phân loại - 100')
    INIT_V[full] += v

# 4. Targets from Markdown
def get_targets():
    with open(PATHS['summary_md'], 'r', encoding='utf-8') as f: content = f.read()
    matches = re.findall(r'\| \*\*(\d{4})-(\d{2})\*\* \| ([\d\.]+) \| \d+ \| [\d\.]+ \| ([\d\.]+) \| \d+ \| [\d\.]+ \|', content)
    return pd.DataFrame([{'year': int(m[0]), 'month': int(m[1]), 'banra': float(m[2].replace('.', '')), 'muavao': float(m[3].replace('.', ''))} for m in matches])

TARGET_LIST = get_targets()

# 5. Core Processor
def process_year(year, prev_stock):
    out_file = f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/XNT_HuyVu_{year}_Final_Report.xlsx"
    curr_q = prev_stock['q'].copy(); curr_v = prev_stock['v'].copy()
    initial_q = curr_q.copy(); initial_v = curr_v.copy()
    
    src_path = get_year_src_path(year)
    xl_src = pd.ExcelFile(src_path)
    all_sheets = {}; hoadon_data = []
    output_cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']

    year_iq = {it: 0.0 for it in MASTER_ITEMS}; year_iv = {it: 0.0 for it in MASTER_ITEMS}
    year_oq = {it: 0.0 for it in MASTER_ITEMS}; year_ov = {it: 0.0 for it in MASTER_ITEMS}

    for m in range(1, 13):
        src_sheet_name = f"Tháng {m}"
        t_row = TARGET_LIST[(TARGET_LIST['year'] == year) & (TARGET_LIST['month'] == m)]
        tg_in_total = t_row.iloc[0]['muavao'] if not t_row.empty else 0
        tg_out_total = t_row.iloc[0]['banra'] if not t_row.empty else 0
        
        mv_q = {it: 0.0 for it in MASTER_ITEMS}; mv_v = {it: 0.0 for it in MASTER_ITEMS}
        xv_q = {it: 0.0 for it in MASTER_ITEMS}; xv_v = {it: 0.0 for it in MASTER_ITEMS}
        
        if src_sheet_name in xl_src.sheet_names:
            src_df = pd.read_excel(xl_src, sheet_name=src_sheet_name)
            map_cols = {'Mã - Tên Hàng': 'key', 'Nhập (Tiền)': 'in_v', 'Xuất (Tiền)': 'out_v', 'Nhập (SL)': 'in_q', 'Xuất (SL)': 'out_q'}
            src_df = src_df.rename(columns={c: map_cols[c] for c in src_df.columns if c in map_cols})
            
            g_in = src_df.get('in_v', pd.Series([0])).sum()
            g_out = src_df.get('out_v', pd.Series([0])).sum()
            
            for _, r in src_df.iterrows():
                ma = find_target_code(r['key'])
                full = MASTER_CODE_TO_FULL.get(ma, 'OTH-001 - Khác / Chưa phân loại - 100')
                if g_in > 0:
                    mv_v[full] += (r.get('in_v', 0) / g_in) * tg_in_total
                    mv_q[full] += r.get('in_q', 0)
                if g_out > 0:
                    xv_v[full] += (r.get('out_v', 0) / g_out) * tg_out_total
                    xv_q[full] += r.get('out_q', 0)
        
        if tg_in_total > 0 and sum(mv_v.values()) == 0: mv_v['OTH-001 - Khác / Chưa phân loại - 100'] = tg_in_total
        if tg_out_total > 0 and sum(xv_v.values()) == 0: xv_v['OTH-001 - Khác / Chưa phân loại - 100'] = tg_out_total

        rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = curr_q[it]; dkv = curr_v[it]
            iq = mv_q[it]; iv = mv_v[it]; oq = xv_q[it]; ov = xv_v[it]
            cq = dkq + iq - oq; cv = dkv + iv - ov
            rows.append({'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten, 'Tồn Đầu Kỳ (SL)': int(dkq), 'Tồn Đầu Kỳ (VNĐ)': round(dkv, 0), 'Nhập (SL)': int(iq), 'Nhập (VNĐ)': round(iv, 0), 'Xuất (SL)': int(oq), 'Xuất (VNĐ)': round(ov, 0), 'Tồn Cuối (SL)': int(cq), 'Tồn Cuối (VNĐ)': round(cv, 0)})
            curr_q[it] = cq; curr_v[it] = cv
            year_iq[it] += iq; year_iv[it] += iv; year_oq[it] += oq; year_ov[it] += ov
            
        df_m = pd.DataFrame(rows)
        active_m = (df_m['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_m['Nhập (VNĐ)'] != 0) | (df_m['Xuất (VNĐ)'] != 0) | (df_m['Tồn Cuối (VNĐ)'] != 0)
        df_active = df_m[active_m].copy()
        s_m = df_m.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        total_m = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '', 'Tồn Đầu Kỳ (SL)': s_m['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': s_m['Tồn Đầu Kỳ (VNĐ)'], 'Nhập (SL)': s_m['Nhập (SL)'], 'Nhập (VNĐ)': s_m['Nhập (VNĐ)'], 'Xuất (SL)': s_m['Xuất (SL)'], 'Xuất (VNĐ)': s_m['Xuất (VNĐ)'], 'Tồn Cuối (SL)': s_m['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': s_m['Tồn Cuối (VNĐ)']}
        all_sheets[f"Tháng {m}"] = pd.concat([df_active, pd.DataFrame([total_m])], ignore_index=True)[output_cols]
        hoadon_data.append([f"{m:02d}/{year}", "Bán ra", "1 (Hợp lệ)", int(s_m['Xuất (SL)']), s_m['Xuất (VNĐ)']])
        hoadon_data.append([f"{m:02d}/{year}", "Mua vào", "1 (Hợp lệ)", int(s_m['Nhập (SL)']), s_m['Nhập (VNĐ)']])

    with pd.ExcelWriter(out_file) as writer:
        pd.DataFrame(hoadon_data, columns=['Tháng', 'Loại HD', 'Tình trạng (Mã)', 'Số lượng', 'Tổng giá tiền (VNĐ)']).to_excel(writer, sheet_name='Hoadon', index=False)
        for m in range(1, 13): all_sheets[f"Tháng {m}"].to_excel(writer, sheet_name=f"Tháng {m}", index=False)
        
        sum_rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = initial_q[it]; dkv = initial_v[it]
            iq = year_iq[it]; iv = year_iv[it]; oq = year_oq[it]; ov = year_ov[it]
            cq = curr_q[it]; cv = curr_v[it]
            sum_rows.append({'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten, 'Tồn Đầu Kỳ (SL)': int(dkq), 'Tồn Đầu Kỳ (VNĐ)': round(dkv, 0), 'Nhập (SL)': int(iq), 'Nhập (VNĐ)': round(iv, 0), 'Xuất (SL)': int(oq), 'Xuất (VNĐ)': round(ov, 0), 'Tồn Cuối (SL)': int(cq), 'Tồn Cuối (VNĐ)': round(cv, 0)})
        df_yr_all = pd.DataFrame(sum_rows)
        active_yr = (df_yr_all['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_yr_all['Nhập (VNĐ)'] != 0) | (df_yr_all['Xuất (VNĐ)'] != 0) | (df_yr_all['Tồn Cuối (VNĐ)'] != 0)
        df_yr_active = df_yr_all[active_yr].copy()
        s_yr = df_yr_all.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        total_yr = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '', 'Tồn Đầu Kỳ (SL)': s_yr['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': s_yr['Tồn Đầu Kỳ (VNĐ)'], 'Nhập (SL)': s_yr['Nhập (SL)'], 'Nhập (VNĐ)': s_yr['Nhập (VNĐ)'], 'Xuất (SL)': s_yr['Xuất (SL)'], 'Xuất (VNĐ)': s_yr['Xuất (VNĐ)'], 'Tồn Cuối (SL)': s_yr['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': s_yr['Tồn Cuối (VNĐ)']}
        pd.concat([df_yr_active, pd.DataFrame([total_yr])], ignore_index=True)[output_cols].to_excel(writer, sheet_name='xnt12thang', index=False)
    
    print(f"Generated {year} DONE.")
    return {'q': curr_q, 'v': curr_v}

# Execution
print("REBUILD ULTIMATE 100+ GROUPS...")
stock_23 = process_year(2023, {'q': INIT_Q, 'v': INIT_V})
stock_24 = process_year(2024, stock_23)
process_year(2025, stock_24)
print("ALL DONE.")
