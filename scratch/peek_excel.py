import pandas as pd
import os

path_target = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
path_source = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"

def peek_excel(path):
    print(f"--- Peeking {os.path.basename(path)} ---")
    try:
        df = pd.read_excel(path, nrows=5)
        print("Columns:", df.columns.tolist())
        print("Data sample:")
        print(df.head())
    except Exception as e:
        print(f"Error reading {path}: {e}")

peek_excel(path_target)
peek_excel(path_source)
