import pandas as pd
import numpy as np
import os

# Paths
ledger_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
tb_paths = [
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/BANG_CAN_DOI_PHAT_SINH_HHP_2023.xlsx",
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/TB_HHP_2023_CONSOLIDATED.xlsx"
]
output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

print("Loading ledger...")
df_ledger = pd.read_excel(ledger_path)

# 1. Opening Balances with Hierarchy
open_balances_raw = {} 

for path in tb_paths:
    if os.path.exists(path):
        df_tb = pd.read_excel(path)
        for _, row in df_tb.iterrows():
            try:
                acc_raw = row['TK']
                if pd.isna(acc_raw): continue
                acc = str(acc_raw).split('.')[0].strip()
                dr_bal = row['Dầu Nợ'] if 'Dầu Nợ' in row and pd.notna(row['Dầu Nợ']) else 0
                cr_bal = row['Đầu Có'] if 'Đầu Có' in row and pd.notna(row['Đầu Có']) else 0
                
                # We store net balance (Debit positive)
                net_bal = dr_bal - cr_bal
                if acc not in open_balances_raw or abs(net_bal) > abs(open_balances_raw[acc]):
                    open_balances_raw[acc] = net_bal
            except: pass

def get_balance(acc):
    # Try exact match
    if acc in open_balances_raw:
        return open_balances_raw[acc]
    # Try parents
    for i in range(len(acc)-1, 1, -1):
        parent = acc[:i]
        if parent in open_balances_raw:
            return open_balances_raw[parent]
    return 0

# 2. Get unique accounts
all_accs = pd.concat([df_ledger['dr'], df_ledger['cr']]).astype(str).unique()
all_accs = [a for a in all_accs if a != 'nan' and a != '']
all_accs.sort()

df_ledger = df_ledger.sort_values(by=['dt', 'sh'])

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    for acc in all_accs:
        print(f"Sheet: {acc}")
        mask_dr = df_ledger['dr'].astype(str) == acc
        mask_cr = df_ledger['cr'].astype(str) == acc
        df_acc = df_ledger[mask_dr | mask_cr].copy()
        
        if len(df_acc) == 0: continue
        
        # Side
        first_digit = acc[0]
        side = 'dr' if first_digit in ['1', '2', '6', '8'] else 'cr'
        
        # Opening
        ob_val = get_balance(acc)
        # If the account is credit-side, the raw net_bal (Dr-Cr) will be negative.
        # But in the sheet, the "Cuối kỳ" should be positive if it's on its natural side.
        # HUYVU balance seems to be absolute on natural side?
        # Let's check: 331 balance in HUYVU was 6,387,173,469 (Positive).
        # So: if side is 'cr', balance = Cr - Dr.
        current_bal = ob_val if side == 'dr' else -ob_val
        
        rows = []
        rows.append({
            'Ngày hạch toán': np.nan, 'Ngày chứng từ': np.nan, 'Số chứng từ': np.nan,
            'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'TK Đối ứng': np.nan,
            'Đầu kỳ': 0, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0,
            'Cuối kỳ': current_bal, 'Đối tượng': np.nan
        })
        
        for _, tx in df_acc.iterrows():
            amt = tx['amt']
            is_dr = str(tx['dr']) == acc
            dr_v = amt if is_dr else 0
            cr_v = 0 if is_dr else amt
            contra = tx['cr'] if is_dr else tx['dr']
            
            prev_bal = current_bal
            if side == 'dr':
                current_bal = prev_bal + dr_v - cr_v
            else:
                current_bal = prev_bal + cr_v - dr_v
                
            rows.append({
                'Ngày hạch toán': tx['dt'], 'Ngày chứng từ': tx['dt'], 'Số chứng từ': tx['sh'],
                'Diễn giải': tx['desc'], 'TK Đối ứng': contra,
                'Đầu kỳ': prev_bal, 'Phát sinh Nợ': dr_v, 'Phát sinh Có': cr_v,
                'Cuối kỳ': current_bal, 'Đối tượng': tx['obj']
            })
        
        df_sheet = pd.DataFrame(rows)
        df_sheet.to_excel(writer, sheet_name=acc[:31], index=False)

print("Finished.")
