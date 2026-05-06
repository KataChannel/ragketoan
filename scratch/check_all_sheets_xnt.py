import pandas as pd

file_path = '/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025.xlsx'
xl = pd.ExcelFile(file_path)
print("Sheets:", xl.sheet_names)

for sheet in xl.sheet_names:
    df = xl.parse(sheet)
    print(f"\nSheet: {sheet}")
    print("Columns:", df.columns.tolist())
    
    # Try to find totals in this sheet
    for col in df.columns:
        if 'VNĐ' in str(col) or 'Giá' in str(col) or 'Tiền' in str(col):
            try:
                s = pd.to_numeric(df[col], errors='coerce').sum()
                print(f"  {col} sum: {s:,.0f}")
            except:
                pass
