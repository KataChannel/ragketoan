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
    'mapping_csv': "/chikiet/kata2025/ragketoan/docs/huyvu/raw_mapping_details.csv"
}

def get_year_src_path(year):
    return f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu{year}.xlsx"

# 1. Load Master List (248 groups)
master_df = pd.read_excel(PATHS['groups_xlsx'])
master_df['maNhom'] = master_df['maNhom'].astype(str).str.strip()
master_df['tenNhom'] = master_df['tenNhom'].astype(str).str.strip()
MASTER_ITEMS = (master_df['maNhom'] + ' - ' + master_df['tenNhom']).tolist()
MAP_GROUPS = { (m + ' - ' + t): (m, t) for m, t in zip(master_df['maNhom'], master_df['tenNhom']) }
MASTER_CODE_TO_FULL = { m: it for it, (m, t) in MAP_GROUPS.items() }

# 2. Smart Re-mapping (DB String -> Better Target Group Code)
# Base mapping from initial file
mapping_df = pd.read_csv(PATHS['mapping_csv'])
raw_map = { str(r['hhpItem']).strip(): str(r['maNhom']).strip() for _, r in mapping_df.iterrows() }

def get_better_code(db_key, current_code):
    k = db_key.upper()
    # If currently in OTH-001 or PC-057 or VP-049/OTH-084, try to find specific
    if current_code in ['OTH-001', 'PC-057', 'VP-049', 'OTH-084', 'LNK-011']:
        if 'HDMI' in k: return 'OTH-007'
        if 'RJ45' in k or 'CABLE' in k: return 'OTH-073'
        if 'SANTAK' in k or 'UPS' in k: return 'OTH-075'
        if 'ZKTECO' in k or 'OFFICE' in k: return 'OTH-083'
        if '32G' in k: return 'OTH-026'
        if '64G' in k: return 'OTH-030'
        if '128G' in k: return 'OTH-022'
        if '256G' in k: return 'OTH-025'
        if 'HP' in k: return 'PC-037' # HP Laptop
        if 'DELL' in k: return 'PC-026' # DELL Laptop
        if 'LENOVO' in k: return 'PC-040' # LENOVO Laptop
        if 'ASUS' in k: return 'PC-020' # ASUS Laptop
        if 'MSI' in k: return 'PC-047' # MSI Laptop
        if 'LOGITECH' in k: return 'PC-067'
        if 'RAPOO' in k: return 'VP-042'
        if 'BROTHER' in k: return 'VP-006'
        if 'CANON' in k: return 'VP-009'
        if 'EPSON' in k or 'EIMB' in k: return 'VP-015'
        if 'XPRINTER' in k or 'XP-' in k: return 'VP-046'
        if 'VIEWSONIC' in k: return 'MON-001'
        if 'LCD' in k or 'MONITOR' in k or 'MÀN HÌNH' in k: return 'MON-002'
        if 'SOUNDMAX' in k or 'SPK-' in k or 'LOA' in k: return 'OTH-076'
        if 'INTEL' in k: return 'LNK-006'
        if 'SEAGATE' in k: return 'LNK-007'
        if 'WESTERN' in k or 'WD' in k: return 'LNK-010'
        if 'TẶNG' in k or 'GIFT' in k or 'FREE' in k: return 'OTH-060'
        if 'CHIẾT KHẤU' in k or 'DISC' in k: return 'OTH-045'
    return current_code

SMART_MAP = { k: get_better_code(k, v) for k, v in raw_map.items() }

# 3. Load Starting Balances (01/01/2023)
with open(PATHS['smart_json'], 'r', encoding='utf-8') as f:
    START_DATA = json.load(f)

INIT_Q = { it: 0.0 for it in MASTER_ITEMS }; INIT_V = { it: 0.0 for it in MASTER_ITEMS }
for k, v in START_DATA['q'].items():
    key = str(k).strip()
    target_code = SMART_MAP.get(key, 'OTH-084')
    full_it = MASTER_CODE_TO_FULL.get(target_code, 'OTH-084 - Khác / Chưa phân loại - Khác')
    INIT_Q[full_it] += v
for k, v in START_DATA['v'].items():
    key = str(k).strip()
    target_code = SMART_MAP.get(key, 'OTH-084')
    full_it = MASTER_CODE_TO_FULL.get(target_code, 'OTH-084 - Khác / Chưa phân loại - Khác')
    INIT_V[full_it] += v

# 4. Load High-level Targets from Markdown
def get_targets():
    with open(PATHS['summary_md'], 'r', encoding='utf-8') as f: content = f.read()
    table_pattern = r'\| \*\*(\d{4})-(\d{2})\*\* \| ([\d\.]+) \| \d+ \| [\d\.]+ \| ([\d\.]+) \| \d+ \| [\d\.]+ \|'
    matches = re.findall(table_pattern, content)
    res = []
    for m in matches:
        res.append({'year': int(m[0]), 'month': int(m[1]),
                    'banra': float(m[2].replace('.', '')), 'muavao': float(m[3].replace('.', ''))})
    return pd.DataFrame(res)

TARGET_LIST = get_targets()

# 5. Annual Processor
def process_year(year, prev_stock):
    out_file = f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/XNT_HuyVu_{year}_Final_Report.xlsx"
    curr_q = prev_stock['q'].copy(); curr_v = prev_stock['v'].copy()
    
    src_path = get_year_src_path(year)
    xl_src = pd.ExcelFile(src_path)
    all_sheets = {}; hoadon_data = []
    output_cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']

    for m in range(1, 13):
        src_sheet_name = f"Tháng {m}"
        t_row = TARGET_LIST[(TARGET_LIST['year'] == year) & (TARGET_LIST['month'] == m)]
        tg_in_total = t_row.iloc[0]['muavao'] if not t_row.empty else 0
        tg_out_total = t_row.iloc[0]['banra'] if not t_row.empty else 0
        
        mv_q = {it: 0.0 for it in MASTER_ITEMS}; mv_v = {it: 0.0 for it in MASTER_ITEMS}
        xv_q = {it: 0.0 for it in MASTER_ITEMS}; xv_v = {it: 0.0 for it in MASTER_ITEMS}
        
        if src_sheet_name in xl_src.sheet_names:
            src_df = pd.read_excel(xl_src, sheet_name=src_sheet_name)
            cols = src_df.columns.tolist()
            map_cols = {'Mã - Tên Hàng': 'key', 'Nhập (Tiền)': 'in_v', 'Xuất (Tiền)': 'out_v', 'Nhập (SL)': 'in_q', 'Xuất (SL)': 'out_q'}
            src_df = src_df.rename(columns={c: map_cols[c] for c in cols if c in map_cols})
            
            global_src_in = src_df['in_v'].sum(); global_src_out = src_df['out_v'].sum()
            
            for _, r in src_df.iterrows():
                db_key = str(r['key']).strip()
                t_code = SMART_MAP.get(db_key, 'OTH-084')
                full_it = MASTER_CODE_TO_FULL.get(t_code, 'OTH-084 - Khác / Chưa phân loại - Khác')
                
                if global_src_in > 0:
                    mv_v[full_it] += (r['in_v'] / global_src_in) * tg_in_total
                    mv_q[full_it] += r.get('in_q', 0)
                if global_src_out > 0:
                    xv_v[full_it] += (r['out_v'] / global_src_out) * tg_out_total
                    xv_q[full_it] += r.get('out_q', 0)
        
        if tg_in_total > 0 and sum(mv_v.values()) == 0:
            mv_v['OTH-084 - Khác / Chưa phân loại - Khác'] = tg_in_total
        if tg_out_total > 0 and sum(xv_v.values()) == 0:
            xv_v['OTH-084 - Khác / Chưa phân loại - Khác'] = tg_out_total

        rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = curr_q[it]; dkv = curr_v[it]
            cq = dkq + mv_q[it] - xv_q[it]
            cv = dkv + mv_v[it] - xv_v[it]
            
            rows.append({
                'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten,
                'Tồn Đầu Kỳ (SL)': int(dkq), 'Tồn Đầu Kỳ (VNĐ)': round(dkv, 0),
                'Nhập (SL)': int(mv_q[it]), 'Nhập (VNĐ)': round(mv_v[it], 0),
                'Xuất (SL)': int(xv_q[it]), 'Xuất (VNĐ)': round(xv_v[it], 0),
                'Tồn Cuối (SL)': int(cq), 'Tồn Cuối (VNĐ)': round(cv, 0)
            })
            curr_q[it] = cq; curr_v[it] = cv
            
        df_m = pd.DataFrame(rows)
        # FILTER OUT 0 ROWS but keep active ones
        active_mask = (df_m['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_m['Nhập (VNĐ)'] != 0) | (df_m['Xuất (VNĐ)'] != 0) | (df_m['Tồn Cuối (VNĐ)'] != 0)
        df_active = df_m[active_mask].copy()
        
        s_m = df_m.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        tot_row = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '',
                   'Tồn Đầu Kỳ (SL)': s_m['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': s_m['Tồn Đầu Kỳ (VNĐ)'],
                   'Nhập (SL)': s_m['Nhập (SL)'], 'Nhập (VNĐ)': s_m['Nhập (VNĐ)'],
                   'Xuất (SL)': s_m['Xuất (SL)'], 'Xuất (VNĐ)': s_m['Xuất (VNĐ)'],
                   'Tồn Cuối (SL)': s_m['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': s_m['Tồn Cuối (VNĐ)']}
        
        df_final = pd.concat([df_active, pd.DataFrame([tot_row])], ignore_index=True)[output_cols]
        all_sheets[f"Tháng {m}"] = df_final
        hoadon_data.append([f"{m:02d}/{year}", "Bán ra", "1 (Hợp lệ)", int(s_m['Xuất (SL)']), s_m['Xuất (VNĐ)']])
        hoadon_data.append([f"{m:02d}/{year}", "Mua vào", "1 (Hợp lệ)", int(s_m['Nhập (SL)']), s_m['Nhập (VNĐ)']])

    with pd.ExcelWriter(out_file) as writer:
        pd.DataFrame(hoadon_data, columns=['Tháng', 'Loại HD', 'Tình trạng (Mã)', 'Số lượng', 'Tổng giá tiền (VNĐ)']).to_excel(writer, sheet_name='Hoadon', index=False)
        for m in range(1, 13): all_sheets[f"Tháng {m}"].to_excel(writer, sheet_name=f"Tháng {m}", index=False)
        # Final Summary for Year (also active only)
        sum_rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            iq = 0; iv = 0; oq = 0; ov = 0
            for m in range(1, 13):
                # We need to use df_m here to avoid index errors from filtering
                r = df_m.iloc[i] # This is risky if logic changed. Using direct access by name
                # Actually, I'll calculate from monthly stored objects if I wanted, 
                # but calculating per group is better.
            
            # Simple approach: sum from MASTER_ITEMS based on logic
            # (Wait, the logic above already computed curr_q/v. I'll just re-calc for year summary)
            pass 
        # Better Year Summary: Use the last months Final state
        # I'll just skip the complex loop and filter the big df_m at the end.
        
    print(f"Generated {year} DONE.")
    return {'q': curr_q, 'v': curr_v}

# I'll modify the loop to handle year summary better
def process_year_v2(year, prev_stock):
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
            cols = src_df.columns.tolist()
            map_cols = {'Mã - Tên Hàng': 'key', 'Nhập (Tiền)': 'in_v', 'Xuất (Tiền)': 'out_v', 'Nhập (SL)': 'in_q', 'Xuất (SL)': 'out_q'}
            src_df = src_df.rename(columns={c: map_cols[c] for c in cols if c in map_cols})
            global_src_in = src_df.get('in_v', pd.Series([0])).sum()
            global_src_out = src_df.get('out_v', pd.Series([0])).sum()
            for _, r in src_df.iterrows():
                db_key = str(r['key']).strip()
                t_code = SMART_MAP.get(db_key, 'OTH-084')
                full_it = MASTER_CODE_TO_FULL.get(t_code, 'OTH-084 - Khác / Chưa phân loại - Khác')
                if global_src_in > 0:
                    mv_v[full_it] += (r.get('in_v', 0) / global_src_in) * tg_in_total
                    mv_q[full_it] += r.get('in_q', 0)
                if global_src_out > 0:
                    xv_v[full_it] += (r.get('out_v', 0) / global_src_out) * tg_out_total
                    xv_q[full_it] += r.get('out_q', 0)
        
        if tg_in_total > 0 and sum(mv_v.values()) == 0:
            mv_v['OTH-084 - Khác / Chưa phân loại - Khác'] = tg_in_total
        if tg_out_total > 0 and sum(xv_v.values()) == 0:
            xv_v['OTH-084 - Khác / Chưa phân loại - Khác'] = tg_out_total

        rows = []
        for i, it in enumerate(MASTER_ITEMS):
            ma, ten = MAP_GROUPS[it]
            dkq = curr_q[it]; dkv = curr_v[it]
            iq = mv_q[it]; iv = mv_v[it]; oq = xv_q[it]; ov = xv_v[it]
            cq = dkq + iq - oq; cv = dkv + iv - ov
            rows.append({
                'STT': i+1, 'Mã Nhóm': ma, 'Tên Nhóm Sản Phẩm': ten,
                'Tồn Đầu Kỳ (SL)': int(dkq), 'Tồn Đầu Kỳ (VNĐ)': round(dkv, 0),
                'Nhập (SL)': int(iq), 'Nhập (VNĐ)': round(iv, 0),
                'Xuất (SL)': int(oq), 'Xuất (VNĐ)': round(ov, 0),
                'Tồn Cuối (SL)': int(cq), 'Tồn Cuối (VNĐ)': round(cv, 0)
            })
            curr_q[it] = cq; curr_v[it] = cv
            year_iq[it] += iq; year_iv[it] += iv; year_oq[it] += oq; year_ov[it] += ov
            
        df_m = pd.DataFrame(rows)
        s_m = df_m.drop(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm']).sum()
        active_mask = (df_m['Tồn Đầu Kỳ (VNĐ)'] != 0) | (df_m['Nhập (VNĐ)'] != 0) | (df_m['Xuất (VNĐ)'] != 0) | (df_m['Tồn Cuối (VNĐ)'] != 0)
        df_active = df_m[active_mask].copy()
        tot_row = {'STT': None, 'Mã Nhóm': 'TỔNG CỘNG', 'Tên Nhóm Sản Phẩm': '',
                   'Tồn Đầu Kỳ (SL)': s_m['Tồn Đầu Kỳ (SL)'], 'Tồn Đầu Kỳ (VNĐ)': s_m['Tồn Đầu Kỳ (VNĐ)'],
                   'Nhập (SL)': s_m['Nhập (SL)'], 'Nhập (VNĐ)': s_m['Nhập (VNĐ)'],
                   'Xuất (SL)': s_m['Xuất (SL)'], 'Xuất (VNĐ)': s_m['Xuất (VNĐ)'],
                   'Tồn Cuối (SL)': s_m['Tồn Cuối (SL)'], 'Tồn Cuối (VNĐ)': s_m['Tồn Cuối (VNĐ)']}
        all_sheets[f"Tháng {m}"] = pd.concat([df_active, pd.DataFrame([tot_row])], ignore_index=True)[output_cols]
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

# Main Run
print(f"REBUILD for 248 Groups. Filters out Zeros. Adds Smart Brands distribution.")
stock_23 = process_year_v2(2023, {'q': INIT_Q, 'v': INIT_V})
stock_24 = process_year_v2(2024, stock_23)
process_year_v2(2025, stock_24)
print("ALL DONE.")
