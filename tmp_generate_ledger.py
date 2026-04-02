import pandas as pd
import os

# Paths
nkc_path = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/sosach/NKC_HUYVU_FULL_2023_V2.xlsx'
output_dir = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023'
output_file = os.path.join(output_dir, 'SO_CHI_TIET_TAI_KHOAN_2023.xlsx')

# Ensure output directory exists (already does, but just in case)
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Read NKC
print(f"Reading {nkc_path}...")
df_nkc = pd.read_excel(nkc_path)

# Columns mapping
# ['Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng']

# Get list of accounts
accounts = set(df_nkc['TK Nợ'].dropna().unique()) | set(df_nkc['TK Có'].dropna().unique())
accounts = sorted([str(acc) for acc in accounts])

print(f"Generating ledgers for {len(accounts)} accounts...")

# Using ExcelWriter for multiple sheets
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    for acc in accounts:
        # Transactions where acc is Debit
        debit_rows = df_nkc[df_nkc['TK Nợ'].astype(str) == acc].copy()
        debit_rows['PS Nợ'] = debit_rows['Số tiền']
        debit_rows['PS Có'] = 0
        debit_rows['TK đối ứng'] = debit_rows['TK Có']
        
        # Transactions where acc is Credit
        credit_rows = df_nkc[df_nkc['TK Có'].astype(str) == acc].copy()
        credit_rows['PS Nợ'] = 0
        credit_rows['PS Có'] = credit_rows['Số tiền']
        credit_rows['TK đối ứng'] = credit_rows['TK Nợ']
        
        # Combine
        combined = pd.concat([debit_rows, credit_rows]).sort_values(by=['Ngày hạch toán', 'Số chứng từ'])
        
        # Final columns for sheet
        final_sheet = combined[['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK đối ứng', 'PS Nợ', 'PS Có', 'Đối tượng']]
        
        # Excel sheet name limit is 31 chars
        sheet_name = str(acc)[:31]
        final_sheet.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f" - Created sheet: {sheet_name}")

print(f"Successfully saved to {output_file}")
