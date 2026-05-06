import pandas as pd
import os

vtb_file = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP/sao ke VTB T1.2024.xls"
vcb_file = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê VCB từ 01.01.24 đến 31.03.24.xls"

def inspect_vtb(path):
    print(f"\n--- Inspecting VTB: {path} ---")
    df = pd.read_excel(path, header=None)
    # Print rows 15 to 30 to see the table
    print(df.iloc[10:40, :].to_string())

def inspect_vcb(path):
    print(f"\n--- Inspecting VCB: {path} ---")
    df = pd.read_excel(path, header=None)
    # Print rows 10 to 30 to see the table
    print(df.iloc[10:30, :].to_string())

inspect_vtb(vtb_file)
inspect_vcb(vcb_file)
