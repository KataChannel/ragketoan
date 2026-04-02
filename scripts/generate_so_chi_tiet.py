import pandas as pd
import os

def generate_so_chi_tiet():
    nkc_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    output_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SO_CHI_TIET_HUYVU_2023_FINAL.xlsx'
    
    print(f"Loading {nkc_path}...")
    nkc_df = pd.read_excel(nkc_path)
    
    # Ensure relevant columns are strings
    nkc_df['TK Nợ'] = nkc_df['TK Nợ'].astype(str)
    nkc_df['TK Có'] = nkc_df['TK Có'].astype(str)
    
    # List to store all ledger entries
    ledger_entries = []
    
    for idx, row in nkc_df.iterrows():
        # Entry for Debit account
        ledger_entries.append({
            'Tài khoản': row['TK Nợ'],
            'Ngày hạch toán': row['Ngày hạch toán'],
            'Số chứng từ': row['Số chứng từ'],
            'Diễn giải': row['Diễn giải'],
            'TK đối ứng': row['TK Có'],
            'PS Nợ': row['Số tiền'],
            'PS Có': 0,
            'Đối tượng': row['Đối tượng']
        })
        # Entry for Credit account
        ledger_entries.append({
            'Tài khoản': row['TK Có'],
            'Ngày hạch toán': row['Ngày hạch toán'],
            'Số chứng từ': row['Số chứng từ'],
            'Diễn giải': row['Diễn giải'],
            'TK đối ứng': row['TK Nợ'],
            'PS Nợ': 0,
            'PS Có': row['Số tiền'],
            'Đối tượng': row['Đối tượng']
        })
        
    all_ledger_df = pd.DataFrame(ledger_entries)
    
    # Normalize Date to datetime objects for sorting
    all_ledger_df['Ngày date'] = pd.to_datetime(all_ledger_df['Ngày hạch toán'], dayfirst=True, errors='coerce')
    all_ledger_df = all_ledger_df.sort_values(['Tài khoản', 'Ngày date'])
    
    # List of unique accounts to create sheets
    accounts = sorted(all_ledger_df['Tài khoản'].unique())
    
    print(f"Creating sheets for {len(accounts)} accounts...")
    
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        for acc in accounts:
            # Filter rows for this account
            acc_df = all_ledger_df[all_ledger_df['Tài khoản'] == acc].copy()
            # Select and order required columns
            acc_df = acc_df[['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK đối ứng', 'PS Nợ', 'PS Có', 'Đối tượng']]
            # Write to sheet (sheet names can't exceed 31 chars)
            sheet_name = acc[:31]
            acc_df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    print(f"✅ Finished! Sổ chi tiết saved to {output_path}")

if __name__ == "__main__":
    generate_so_chi_tiet()
