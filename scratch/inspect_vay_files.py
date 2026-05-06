import pandas as pd

vtb_vay = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP/sao kê ngân hàng  Vay Vietinnbank năm  2024 gửi Cô Ngọc 04.06.25.xls"
vcb_vay = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê ngân hàng  Vay VCB năm  2024 gửi Cô Ngọc 04.06.25.xls"

def inspect(path, label):
    print(f"\n--- {label}: {path} ---")
    try:
        df = pd.read_excel(path, header=None)
        print(df.head(30).to_string())
    except Exception as e:
        print(f"Error: {e}")

inspect(vtb_vay, "VTB Vay")
inspect(vcb_vay, "VCB Vay")
