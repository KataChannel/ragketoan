import pandas as pd
file_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê ngân hàng  Vay VCB năm  2024 gửi Cô Ngọc 04.06.25.xls"
xls = pd.ExcelFile(file_path)
print(f"Sheets: {xls.sheet_names}")
df0 = pd.read_excel(file_path, sheet_name=0, header=None)
print("\n--- Sheet 0 ---")
print(df0.iloc[10:20, :].to_string())
df1 = pd.read_excel(file_path, sheet_name=1, header=None)
print("\n--- Sheet 1 ---")
print(df1.iloc[10:20, :].to_string())
