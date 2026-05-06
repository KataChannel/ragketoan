import pandas as pd
src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'
try:
    xl = pd.ExcelFile(src)
    for sheet in xl.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(src, sheet_name=sheet)
        print(f"Columns: {df.columns.tolist()}")
        print(df.head(50))
except Exception as e:
    print(f"Error: {e}")
