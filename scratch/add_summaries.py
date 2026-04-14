import pandas as pd
import numpy as np

ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'

ledgers = pd.read_excel(ledger_path, sheet_name=None)
new_ledgers = {}

for sheet_name, df_sheet in ledgers.items():
    if len(df_sheet) == 0:
        new_ledgers[sheet_name] = df_sheet
        continue
    
    # Check if a summary row already exists
    last_row = df_sheet.iloc[-1].astype(str).str.upper()
    if 'TỔNG CỘNG' in last_row.values:
        # Already has summary
        new_ledgers[sheet_name] = df_sheet
        continue

    summary_row = {}
    for col in df_sheet.columns:
        if df_sheet[col].dtype.kind in 'bifc' and col != 'Cuối kỳ' and col != 'Đầu kỳ':
            # It's a numeric column. We sum it.
            summary_row[col] = df_sheet[col].sum()
        else:
            summary_row[col] = np.nan
    
    # Put 'TỔNG CỘNG' in the first column
    summary_row[df_sheet.columns[0]] = 'TỔNG CỘNG'
    
    # If there are 'Cuối kỳ' or 'Đầu kỳ' columns, they shouldn't just be summed up. 
    # Usually 'Cuối kỳ' is the value of the last row.
    if 'Cuối kỳ' in df_sheet.columns:
        summary_row['Cuối kỳ'] = df_sheet['Cuối kỳ'].iloc[-1]
    if 'Đầu kỳ' in df_sheet.columns:
        summary_row['Đầu kỳ'] = df_sheet['Đầu kỳ'].iloc[0]
        
    df_new = pd.concat([df_sheet, pd.DataFrame([summary_row])], ignore_index=True)
    new_ledgers[sheet_name] = df_new

with pd.ExcelWriter(ledger_path, engine='openpyxl', mode='w') as writer:
    for sheet_name, df_sheet in new_ledgers.items():
        df_sheet.to_excel(writer, sheet_name=sheet_name, index=False)

print("Added total rows to each sheet.")
