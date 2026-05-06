import pandas as pd
import os

vtb_file = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP/sao ke VTB T1.2024.xls"

def inspect_vtb_header(path):
    print(f"\n--- Inspecting VTB: {path} ---")
    df = pd.read_excel(path, header=None)
    # Find a row that contains "Ngày" or "Date" or "Giao dịch"
    for i, row in df.iterrows():
        row_str = " ".join(str(x) for x in row.values)
        if "Ngày" in row_str and "Giao dịch" in row_str:
            print(f"Potential header at row {i}:")
            print(row.to_list())
            print(f"Data row {i+1}:")
            print(df.iloc[i+1].to_list())
            break

inspect_vtb_header(vtb_file)
