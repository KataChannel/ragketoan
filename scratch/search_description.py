import pandas as pd
import os

file1 = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê ngân hàng  Vay VCB năm  2024 gửi Cô Ngọc 04.06.25.xls"
file2 = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP/sao kê ngân hàng  Vay Vietinnbank năm  2024 gửi Cô Ngọc 04.06.25.xls"

for f in [file1, file2]:
    if os.path.exists(f):
        print(f"\n--- Checking file: {f} ---")
        df = pd.read_excel(f, header=None)
        # Search for the string in all columns
        mask = df.apply(lambda row: row.astype(str).str.contains("VCC-Thu luân chuyển quỹ từ CTV").any(), axis=1)
        if mask.any():
            print(f"Found match in {f}:")
            print(df[mask].to_string())
        else:
            print("Not found in this file.")
