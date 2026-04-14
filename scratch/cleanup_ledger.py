import pandas as pd
import os

file_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
output_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023_CLEANED.xlsx'

xls = pd.ExcelFile(file_path)
writer = pd.ExcelWriter(output_path, engine='openpyxl')

for sheet in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet)
    
    # Identify voucher column
    col = next((c for c in df.columns if c in ['Số chứng từ', 'sh']), None)
    desc_col = next((c for c in df.columns if c in ['Diễn giải', 'desc']), None)
    date_col = next((c for c in df.columns if c in ['Ngày hạch toán', 'dt']), None)
    
    if col:
        # Filter rules:
        # 1. Remove rows where voucher is PK_FIX or PK_BANK or PK_ADJ
        # These are the artificial cases introduced to balance the ledger.
        mask_to_remove = df[col].astype(str).str.contains('PK_FIX|PK_BANK|PK_ADJ', na=False)
        
        # 2. Also remove any row with 'TỔNG CỘNG' or 'SỐ DƯ' that is likely stale now.
        # Most of these files have a 'TỔNG CỘNG' row at the very end.
        if desc_col:
            mask_to_remove |= df[desc_col].astype(str).str.contains('TỔNG CỘNG', case=False, na=False)
            
        cleaned_df = df[~mask_to_remove]
        cleaned_df.to_excel(writer, sheet_name=sheet, index=False)
    else:
        df.to_excel(writer, sheet_name=sheet, index=False)

writer.close()
print(f"Cleaned file saved to {output_path}")
