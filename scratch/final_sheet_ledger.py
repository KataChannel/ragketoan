import pandas as pd
import numpy as np
import os
from openpyxl import Workbook

# Paths
ledger_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
tb_paths = [
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/BANG_CAN_DOI_PHAT_SINH_HHP_2023.xlsx",
    "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/TB_HHP_2023_CONSOLIDATED.xlsx"
]
output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

print("Loading ledger...")
df_ledger = pd.read_excel(ledger_path)
print(f"Ledger rows: {len(df_ledger)}")

# 1. Opening Balances
open_balances = {} # {acc: {'side': 'dr'/'cr', 'bal': value}}

for path in tb_paths:
    if os.path.exists(path):
        print(f"Loading TB from {path}...")
        df_tb = pd.read_excel(path)
        for _, row in df_tb.iterrows():
            try:
                acc_raw = row['TK']
                if pd.isna(acc_raw): continue
                # Handle floats and ints
                if isinstance(acc_raw, float):
                    acc = str(int(acc_raw))
                else:
                    acc = str(acc_raw).split('.')[0].strip()
                
                dr_bal = row['Dầu Nợ'] if 'Dầu Nợ' in row and pd.notna(row['Dầu Nợ']) else 0
                cr_bal = row['Đầu Có'] if 'Đầu Có' in row and pd.notna(row['Đầu Có']) else 0
                
                first_digit = acc[0]
                if first_digit in ['1', '2', '6', '8']:
                    side = 'dr'
                    bal = dr_bal - cr_bal
                else:
                    side = 'cr'
                    bal = cr_bal - dr_bal
                
                # Update if already exists (sum or use consolidated?)
                # Actually, consolidated files usually have higher resolution.
                # I'll just overwrite or keep the max?
                # For simplicity, if it's there, trust it.
                if acc not in open_balances or abs(bal) > abs(open_balances[acc]['bal']):
                    open_balances[acc] = {'side': side, 'bal': bal}
            except Exception as e:
                print(f"Error processing TB row: {e}")

# 2. Identify all accounts in ledger
dr_accs = df_ledger['dr'].astype(str).unique()
cr_accs = df_ledger['cr'].astype(str).unique()
all_accs = list(set(dr_accs) | set(cr_accs))
all_accs = [a for a in all_accs if a != 'nan' and a != '']
all_accs.sort()

print(f"Accounts to create sheets for: {len(all_accs)}")

# 3. Create Excel with multiple sheets
# Sort the whole ledger first to ensure transaction order
df_ledger = df_ledger.sort_values(by=['dt', 'sh'])

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    # First sheet: Consolidated ledger (NKC) - though user didn't explicitly ask, it's good practice
    # and ensures they can always see the raw data.
    # Actually, user said "Chi tiết các tài khoản đâu?", let's just do what they want.
    
    for acc in all_accs:
        print(f"Generating sheet for {acc}...")
        mask_dr = df_ledger['dr'].astype(str) == acc
        mask_cr = df_ledger['cr'].astype(str) == acc
        df_acc = df_ledger[mask_dr | mask_cr].copy()
        
        if len(df_acc) == 0: continue
        
        # Determine side
        first_digit = acc[0]
        side = 'dr' if first_digit in ['1', '2', '6', '8'] else 'cr'
        
        # Opening balance
        ob_info = open_balances.get(acc, {'side': side, 'bal': 0})
        current_bal = ob_info['bal']
        
        rows = []
        # Row 0: SỐ DƯ ĐẦU KỲ
        rows.append({
            'Ngày hạch toán': np.nan,
            'Ngày chứng từ': np.nan,
            'Số chứng từ': np.nan,
            'Diễn giải': 'SỐ DƯ ĐẦU KỲ',
            'TK Đối ứng': np.nan,
            'Đầu kỳ': 0,
            'Phát sinh Nợ': 0,
            'Phát sinh Có': 0,
            'Cuối kỳ': current_bal,
            'Đối tượng': np.nan
        })
        
        for _, tx in df_acc.iterrows():
            amt = tx['amt']
            is_dr = str(tx['dr']) == acc
            
            dr_val = amt if is_dr else 0
            cr_val = 0 if is_dr else amt
            contra = tx['cr'] if is_dr else tx['dr']
            
            prev_bal = current_bal
            if side == 'dr':
                current_bal = prev_bal + dr_val - cr_val
            else:
                current_bal = prev_bal + cr_val - dr_val
                
            rows.append({
                'Ngày hạch toán': tx['dt'],
                'Ngày chứng từ': tx['dt'],
                'Số chứng từ': tx['sh'],
                'Diễn giải': tx['desc'],
                'TK Đối ứng': contra,
                'Đầu kỳ': prev_bal,
                'Phát sinh Nợ': dr_val,
                'Phát sinh Có': cr_val,
                'Cuối kỳ': current_bal,
                'Đối tượng': tx['obj']
            })
            
        df_result = pd.DataFrame(rows)
        # Sheet name limit 31 chars
        sn = acc[:31]
        df_result.to_excel(writer, sheet_name=sn, index=False)

print("Process finished.")
