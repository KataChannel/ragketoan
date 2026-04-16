import pandas as pd
import numpy as np

# Files
ledger_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
tb_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/BANG_CAN_DOI_PHAT_SINH_HHP_2023.xlsx"
output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

print("Loading data...")
df_ledger = pd.read_excel(ledger_path)
df_tb = pd.read_excel(tb_path)

# 1. Prepare Opening Balances
# Map each account to its side and balance
# Debit side accounts: starts with 1, 2, 6, 8
# Credit side accounts: starts with 3, 4, 5, 7, 9
open_balances = {} # {acc: {'side': 'dr'/'cr', 'bal': value}}

for _, row in df_tb.iterrows():
    acc = str(row['TK']).strip()
    dr_bal = row['Dầu Nợ'] if pd.notna(row['Dầu Nợ']) else 0
    cr_bal = row['Đầu Có'] if pd.notna(row['Đầu Có']) else 0
    
    first_digit = acc[0]
    if first_digit in ['1', '2', '6', '8']:
        side = 'dr'
        bal = dr_bal - cr_bal
    else:
        side = 'cr'
        bal = cr_bal - dr_bal
    
    open_balances[acc] = {'side': side, 'bal': bal}

# 2. Get unique accounts from ledger
all_accs = pd.concat([df_ledger['dr'], df_ledger['cr']]).astype(str).unique()
all_accs = [a for a in all_accs if a != 'nan' and a != '']

print(f"Total unique accounts: {len(all_accs)}")

# 3. Process each account
writer = pd.ExcelWriter(output_path, engine='openpyxl')

# Add a summary or just start with accounts? Reference had account sheets.
# I'll also add a "Consolidated" sheet just in case, or maybe not if not requested.
# The user wants "Chi tiết các tài khoản" as sheets.

# Filter unique sorted accounts
all_accs.sort()

for acc in all_accs:
    print(f"Processing Account: {acc}")
    
    # Filter rows
    mask_dr = df_ledger['dr'].astype(str) == acc
    mask_cr = df_ledger['cr'].astype(str) == acc
    df_acc = df_ledger[mask_dr | mask_cr].copy()
    
    if len(df_acc) == 0:
        continue
    
    # Prepare transformation
    rows = []
    
    # Opening balance
    ob_data = open_balances.get(acc, {'side': 'dr' if acc[0] in ['1','2','6','8'] else 'cr', 'bal': 0})
    current_bal = ob_data['bal']
    side = ob_data['side']
    
    # Row 0: Opening Balance
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
    
    # Transactions
    # Need to sort by date
    df_acc = df_acc.sort_values(by=['dt', 'sh'])
    
    for _, tx in df_acc.iterrows():
        dr_val = tx['amt'] if str(tx['dr']) == acc else 0
        cr_val = tx['amt'] if str(tx['cr']) == acc else 0
        contra = tx['cr'] if str(tx['dr']) == acc else tx['dr']
        
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
    
    df_sheet = pd.DataFrame(rows)
    # Ensure sheet name is unique and < 31 chars
    sheet_name = acc[:31]
    df_sheet.to_excel(writer, sheet_name=sheet_name, index=False)

# Add the consolidated ledger as the first sheet if wanted?
# The user said "Các sheet ... như sổ [HUYVU]". HUYVU had account sheets.
# I'll add the original consolidated as 'NKC' (Nhật ký chung) or similar if requested, 
# but user specifically asked for detail sheets.

writer.close()
print("Multi-sheet ledger created.")
