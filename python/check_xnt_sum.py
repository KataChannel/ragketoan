import pandas as pd
import os

file_path = "/chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2023.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

# Try to read the Excel file
try:
    # Check sheet names
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names: {xl.sheet_names}")
    
    for sheet in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet)
        print(f"\n--- Sheet: {sheet} ---")
        print(df.head())
        
        # Look for columns related to "Nhập"
        import_cols = [c for c in df.columns if 'nhập' in str(c).lower() or 'import' in str(c).lower()]
        print(f"Import columns: {import_cols}")
        
        for col in import_cols:
            try:
                total = df[col].sum()
                print(f"Sum of {col}: {total:,.0f}")
            except Exception as e:
                print(f"Could not sum {col}: {e}")

except Exception as e:
    print(f"Error reading Excel: {e}")
