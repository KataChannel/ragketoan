import pandas as pd
import os
from openpyxl import load_workbook
from openpyxl.utils.dataframe import dataframe_to_rows
import numpy as np

# Path configurations
BASE_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023'
NKC_FILE = os.path.join(BASE_PATH, 'NKC_HUYVU_2023_FINAL.xlsx')
SCT_FILE = os.path.join(BASE_PATH, 'SO_CHI_TIET_HUYVU_2023_FINAL.xlsx')

# Backup
os.system(f"cp '{NKC_FILE}' '{NKC_FILE}.bak'")
os.system(f"cp '{SCT_FILE}' '{SCT_FILE}.bak'")

def merge_accounts():
    print("Loading NKC...")
    df_nkc = pd.read_excel(NKC_FILE)
    
    print("Merging accounts in NKC...")
    # TK Nợ mapping
    df_nkc['TK Nợ'] = df_nkc['TK Nợ'].astype(str).replace({'1312': '131', '3411': '341'})
    # TK Có mapping
    df_nkc['TK Có'] = df_nkc['TK Có'].astype(str).replace({'1312': '131', '3411': '341'})
    
    # Save updated NKC
    with pd.ExcelWriter(NKC_FILE, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, index=False)
    print(f"NKC updated and saved to {NKC_FILE}")
    
    # Rebuilding SCT
    print("Loading SCT for opening balances...")
    sct_xls = pd.ExcelFile(SCT_FILE)
    sheet_names = sct_xls.sheet_names
    
    # We will rebuild the SO_CHI_TIET_HUYVU_2023_FINAL.xlsx
    # Accounts to remove/merge
    to_merge = {
        '1312': '131',
        '3411': '341'
    }
    
    # Get current sheet order and opening balances
    all_accounts = [s for s in sheet_names if s not in ['1312', '3411']]
    
    opening_balances = {}
    for sheet in sheet_names:
        df = pd.read_excel(SCT_FILE, sheet_name=sheet, nrows=1)
        if not df.empty:
            opening_balances[sheet] = df.loc[0, 'Đầu kỳ']
        else:
            opening_balances[sheet] = 0

    # Combine opening balances for merged accounts
    # Since we found 341 and 3411 had the same opening 33B, we should check if they are DUPLICATES or if only one should remain.
    # Usually 341 is the summary of 3411. If we merge 3411 into 341, the opening remains the same as 341's master.
    # 131 opening + 1312 opening
    new_openings = opening_balances.copy()
    new_openings['131'] = opening_balances.get('131', 0) + opening_balances.get('1312', 0)
    # For 341/3411, based on earlier observation they were identical, let's just take the max or the one from 341.
    new_openings['341'] = opening_balances.get('341', 0) 
    
    print("Rebuilding SCT sheets...")
    with pd.ExcelWriter(SCT_FILE, engine='openpyxl') as writer:
        for acc in all_accounts:
            print(f"Processing account {acc}...")
            # Extract transactions from Updated NKC
            mask = (df_nkc['TK Nợ'] == str(acc)) | (df_nkc['TK Có'] == str(acc))
            df_trans = df_nkc[mask].copy()
            
            # Map back to SCT format
            # Columns: ['Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Đầu kỳ', 'Phát sinh Nợ', 'Phát sinh Có', 'Cuối kỳ', 'Đối tượng']
            
            # Reconstruct the SCT format
            rows = []
            prev_bal = new_openings.get(acc, 0)
            
            # Sort by date properly
            df_trans['dt_sort'] = pd.to_datetime(df_trans['Ngày hạch toán'], format='%d/%m/%Y', errors='coerce')
            invalid = df_trans['dt_sort'].isna()
            if invalid.any():
                df_trans.loc[invalid, 'dt_sort'] = pd.to_datetime(df_trans.loc[invalid, 'Ngày hạch toán'], errors='coerce')
            
            df_trans = df_trans.sort_values(by=['dt_sort', 'Số chứng từ'])
            df_trans = df_trans.drop(columns=['dt_sort'])
            
            for _, row in df_trans.iterrows():
                ps_no = row.get('Số tiền', 0) if row['TK Nợ'] == str(acc) else 0
                ps_co = row.get('Số tiền', 0) if row['TK Có'] == str(acc) else 0
                tk_du = row['TK Có'] if row['TK Nợ'] == str(acc) else row['TK Nợ']
                
                # Update current balance based on account nature
                # Asset/Expense (1, 2, 6, 8? No, 6 and 8 are costs): 1, 2, 6, 8 -> Debit increase
                # Liability/Revenue (3, 4, 5, 7): 3, 4, 5, 7 -> Credit increase
                # Actually, 131 is 1, 341 is 3.
                
                current_bal = prev_bal
                if str(acc).startswith(('1', '2', '6', '8')):
                    current_bal += ps_no - ps_co
                else:
                    current_bal += ps_co - ps_no
                
                rows.append({
                    'Ngày hạch toán': row['Ngày hạch toán'],
                    'Ngày chứng từ': row['Ngày chứng từ'],
                    'Số chứng từ': row.get('Số chứng từ', ''),
                    'Diễn giải': row['Diễn giải'],
                    'TK Đối ứng': tk_du,
                    'Đầu kỳ': prev_bal,
                    'Phát sinh Nợ': ps_no,
                    'Phát sinh Có': ps_co,
                    'Cuối kỳ': current_bal,
                    'Đối tượng': row.get('Đối tượng', '')
                })
                prev_bal = current_bal
                
            df_sct = pd.DataFrame(rows)
            # If no transactions, just show opening
            if df_sct.empty:
                df_sct = pd.DataFrame([{
                    'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '', 
                    'Diễn giải': 'Số dư đầu kỳ', 'TK Đối ứng': '', 
                    'Đầu kỳ': new_openings.get(acc, 0), 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 
                    'Cuối kỳ': new_openings.get(acc, 0), 'Đối tượng': ''
                }])
            
            df_sct.to_excel(writer, sheet_name=acc, index=False)
            
    print(f"SCT rebuilt and saved to {SCT_FILE}")

if __name__ == "__main__":
    merge_accounts()
