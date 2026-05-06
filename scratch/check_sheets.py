import pandas as pd
file_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê ngân hàng  Vay VCB năm  2024 gửi Cô Ngọc 04.06.25.xls"
xls = pd.ExcelFile(file_path)
print(f"Sheets: {xls.sheet_names}")
for sheet in xls.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet, header=None)
    print(f"\n--- Sheet: {sheet} (First 20 rows) ---")
    print(df.head(20).to_string())
