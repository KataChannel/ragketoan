import pandas as pd
import os

path_source = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"

def explore_excel(path):
    print(f"--- Exploring {os.path.basename(path)} ---")
    xl = pd.ExcelFile(path)
    print("Sheets:", xl.sheet_names)
    for sheet in xl.sheet_names:
        print(f"\nSheet: {sheet}")
        df = pd.read_excel(path, sheet_name=sheet, nrows=20)
        print(df.to_string())

explore_excel(path_source)
