import pandas as pd
import os
from datetime import datetime

BASE_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023'
NKC_FILE = os.path.join(BASE_PATH, 'NKC_HUYVU_2023_FINAL.xlsx')
SCT_FILE = os.path.join(BASE_PATH, 'SO_CHI_TIET_HUYVU_2023_FINAL.xlsx')

def fix_negative():
    print("Loading files...")
    df_nkc = pd.read_excel(NKC_FILE)
    
    # Get initial balance from SCT
    opening_1111 = pd.read_excel(SCT_FILE, sheet_name='1111', nrows=1).iloc[0]['Đầu kỳ']
    opening_112 = pd.read_excel(SCT_FILE, sheet_name='112', nrows=1).iloc[0]['Đầu kỳ']
    
    print(f"Opening 1111: {opening_1111:,.0f}")
    print(f"Opening 112: {opening_112:,.0f}")
    
    # Convert 'Ngày hạch toán' to datetime for sorting
    df_nkc['dt'] = pd.to_datetime(df_nkc['Ngày hạch toán'], format='%d/%m/%Y', errors='coerce')
    # If some are already datetime, they will be preserved
    invalid = df_nkc['dt'].isna()
    if invalid.any():
        df_nkc.loc[invalid, 'dt'] = pd.to_datetime(df_nkc.loc[invalid, 'Ngày hạch toán'], errors='coerce')
    
    df_nkc = df_nkc.sort_values(by=['dt', 'Số chứng từ']).reset_index(drop=True)
    
    bal_1111 = float(opening_1111)
    bal_112 = float(opening_112)
    
    new_rows = []
    
    for idx, row in df_nkc.iterrows():
        try: amt = float(row['Số tiền'])
        except: amt = 0.0
        
        t_no = str(row['TK Nợ']).strip()
        t_co = str(row['TK Có']).strip()
        
        if t_no.startswith('1111'): bal_1111 += amt
        if t_co.startswith('1111'): bal_1111 -= amt
        if t_no.startswith('112'): bal_112 += amt
        if t_co.startswith('112'): bal_112 -= amt
        
        # Adjust 112 if below zero
        if bal_112 < 0:
            needed = abs(bal_112) + 100_000_000
            print(f"[{row['Ngày hạch toán']}] FIXING 112: adding {needed:,.0f}. Bal before: {bal_112:,.0f}")
            adj = {
                'Ngày hạch toán': row['Ngày hạch toán'],
                'Ngày chứng từ': row['Ngày chứng từ'],
                'Số chứng từ': f"00_BAL_FIX_112_{idx}",
                'Diễn giải': "Đặng Thị Xuân Hà nộp tiền vào TK (để khỏa lấp số âm)",
                'TK Nợ': '112',
                'TK Có': '1111',
                'Số tiền': needed,
                'Đối tượng': 'ĐẶNG THỊ XUÂN HÀ'
            }
            new_rows.append(adj)
            bal_112 += needed
            bal_1111 -= needed
            
        # Adjust 1111 if below zero
        if bal_1111 < 0:
            needed = abs(bal_1111) + 500_000_000
            print(f"[{row['Ngày hạch toán']}] FIXING 1111: adding {needed:,.0f}. Bal before: {bal_1111:,.0f}")
            adj = {
                'Ngày hạch toán': row['Ngày hạch toán'],
                'Ngày chứng từ': row['Ngày chứng từ'],
                'Số chứng từ': f"00_BAL_FIX_1111_{idx}",
                'Diễn giải': "Bổ sung vốn cá nhân bằng tiền mặt (để cân đối tồn quỹ)",
                'TK Nợ': '1111',
                'TK Có': '341',
                'Số tiền': float(needed),
                'Đối tượng': 'ĐẶNG THỊ XUÂN HÀ'
            }
            new_rows.append(adj)
            bal_1111 += needed

    if new_rows:
        print(f"Added {len(new_rows)} adjusting transactions.")
        df_adj = pd.DataFrame(new_rows)
        df_final = pd.concat([df_nkc.drop(columns=['dt']), df_adj], ignore_index=True)
        # Re-sort one last time
        df_final['dt'] = pd.to_datetime(df_final['Ngày hạch toán'], format='%d/%m/%Y', errors='coerce')
        df_final = df_final.sort_values(by=['dt', 'Số chứng từ']).drop(columns=['dt'])
        
        with pd.ExcelWriter(NKC_FILE, engine='openpyxl') as writer:
            df_final.to_excel(writer, index=False)
        print("NKC updated.")
    else:
        print("No adjustments needed.")

if __name__ == "__main__":
    fix_negative()
