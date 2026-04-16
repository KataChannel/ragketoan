import pandas as pd
import numpy as np
import os

# Paths
nkc_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/NKC_HHP_2023.xlsx"
standard_bank_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"
tb_paths = [
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/BANG_CAN_DOI_PHAT_SINH_HHP_2023.xlsx",
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/TB_HHP_2023_CONSOLIDATED.xlsx"
]
output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

print("Loading NKC and Standard Bank File...")
df_nkc = pd.read_excel(nkc_path)
df_standard = pd.read_excel(standard_bank_path)

# --- Re-apply Bank Update Logic ---
mask_old_bank = (df_nkc['dr'].astype(str).str.startswith('112')) | (df_nkc['cr'].astype(str).str.startswith('112'))
df_ledger = df_nkc[~mask_old_bank].copy()

def fix_row_date(val):
    if pd.isna(val): return val
    if isinstance(val, pd.Timestamp):
        if val.year == 3023: return val.replace(year=2023)
        if val.year == 2022: return val.replace(year=2023)
        return val
    s = str(val).strip()
    if len(s) == 9 and s[2] == '/':
        try: return pd.Timestamp(year=int(s[5:]), month=int(s[3:5]), day=int(s[:2]))
        except: pass
    try:
        dt = pd.to_datetime(s, dayfirst=True)
        if dt.year == 3023: return dt.replace(year=2023)
        if dt.year == 2022: return dt.replace(year=2023)
        return dt
    except: return pd.NaT

new_bank_rows = []
for _, row in df_standard.iterrows():
    dt_raw, sh, desc, contra, dr_amt, cr_amt = row['Unnamed: 0'], row['Unnamed: 1'], row['Số dư đầu kỳ'], row['Unnamed: 3'], row['Unnamed: 4'], row['Unnamed: 5']
    if pd.isna(dt_raw) and pd.isna(sh) and pd.isna(desc): continue
    dt = fix_row_date(dt_raw)
    bank_name = ''
    if pd.notna(desc):
        u = str(desc).upper()
        if 'BIDV' in u: bank_name = 'BIDV'
        elif 'VCB' in u: bank_name = 'VCB'
        elif 'VTB' in u or 'VIETTIN' in u: bank_name = 'VTB'
    def c_amt(v):
        if pd.isna(v) or v == '-': return 0
        try: return float(v)
        except: return 0
    d_a, c_a = c_amt(dr_amt), c_amt(cr_amt)
    try: c_v = str(int(float(contra))) if pd.notna(contra) else ''
    except: c_v = str(contra)
    if d_a > 0: new_bank_rows.append({'dt': dt, 'sh': sh, 'desc': desc, 'dr': '1121', 'cr': c_v, 'amt': d_a, 'obj': bank_name})
    if c_a > 0: new_bank_rows.append({'dt': dt, 'sh': sh, 'desc': desc, 'dr': c_v, 'cr': '1121', 'amt': c_a, 'obj': bank_name})

df_ledger = pd.concat([df_ledger, pd.DataFrame(new_bank_rows)], ignore_index=True)
df_ledger = df_ledger.sort_values(by=['dt', 'sh'])

# --- Opening Balances Logic ---
open_balances_raw = {} 
for path in tb_paths:
    if os.path.exists(path):
        df_tb = pd.read_excel(path).fillna(0)
        for _, row in df_tb.iterrows():
            try:
                acc = str(row['TK']).split('.')[0].strip()
                dr_b = row.get('Dầu Nợ', 0)
                cr_b = row.get('Đầu Có', 0)
                net_bal = dr_b - cr_b
                if acc not in open_balances_raw or abs(net_bal) > abs(open_balances_raw[acc]):
                    open_balances_raw[acc] = net_bal
            except: pass

def get_balance(acc):
    val = open_balances_raw.get(acc, 0)
    if val != 0: return val
    # Check hierarchy
    for i in range(len(acc)-1, 1, -1):
        p = acc[:i]
        p_val = open_balances_raw.get(p, 0)
        if p_val != 0: return p_val
    return 0

# --- Generate Sheets ---
all_accs = pd.concat([df_ledger['dr'], df_ledger['cr']]).astype(str).unique()
all_accs = sorted([a for a in all_accs if a != 'nan' and a != ''])

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    for acc in all_accs:
        mask = (df_ledger['dr'].astype(str) == acc) | (df_ledger['cr'].astype(str) == acc)
        df_acc = df_ledger[mask].copy()
        if len(df_acc) == 0: continue
        side = 'dr' if acc[0] in '1268' else 'cr'
        ob_val = get_balance(acc)
        current_bal = ob_val if side == 'dr' else -ob_val
        rows = [{'Ngày hạch toán': np.nan, 'Ngày chứng từ': np.nan, 'Số chứng từ': np.nan,
                 'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'TK Đối ứng': np.nan,
                 'Đầu kỳ': 0, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0,
                 'Cuối kỳ': current_bal, 'Đối tượng': np.nan}]
        for _, tx in df_acc.iterrows():
            amt, is_dr = tx['amt'], str(tx['dr']) == acc
            dr_v, cr_v = (amt, 0) if is_dr else (0, amt)
            contra = tx['cr'] if is_dr else tx['dr']
            prev_bal = current_bal
            if side == 'dr': current_bal = prev_bal + dr_v - cr_v
            else: current_bal = prev_bal + cr_v - dr_v
            rows.append({'Ngày hạch toán': tx['dt'], 'Ngày chứng từ': tx['dt'], 'Số chứng từ': tx['sh'],
                         'Diễn giải': tx['desc'], 'TK Đối ứng': contra,
                         'Đầu kỳ': prev_bal, 'Phát sinh Nợ': dr_v, 'Phát sinh Có': cr_v,
                         'Cuối kỳ': current_bal, 'Đối tượng': tx['obj']})
        pd.DataFrame(rows).to_excel(writer, sheet_name=acc[:31], index=False)
print("Updated multi-sheet ledger created.")
