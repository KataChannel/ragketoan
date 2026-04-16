import pandas as pd
import os

path_target = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

def check_accounts(path):
    print(f"--- Checking accounts in {os.path.basename(path)} ---")
    df = pd.read_excel(path)
    if 'sh' in df.columns:
        print("Account (sh) value counts:")
        print(df['sh'].astype(str).str[:3].value_counts().head(20))
    else:
        print("Column 'sh' not found.")

check_accounts(path_target)
