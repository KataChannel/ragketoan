import pandas as pd
import os

path_ref = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SO_CHI_TIET_HUYVU_2023_FINAL.xlsx"

def explore_reference(path):
    print(f"--- Exploring Reference File: {os.path.basename(path)} ---")
    xl = pd.ExcelFile(path)
    print("Sheet names:", xl.sheet_names[:10], "... (Total:", len(xl.sheet_names), ")")
    
    # Check the contents of a few sheets
    for sheet in xl.sheet_names[:3]:
        print(f"\n--- Sheet: {sheet} ---")
        df = pd.read_excel(path, sheet_name=sheet, nrows=5)
        print("Columns:", df.columns.tolist())
        print(df.head())

explore_reference(path_ref)
