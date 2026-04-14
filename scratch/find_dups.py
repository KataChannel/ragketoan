import pandas as pd
vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023')

vtb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/sao kê VTB23.xls'
vtb_raw = pd.read_excel(vtb_path, sheet_name='SAO KÊ VTB ', header=None)
vcb_num = vcb_raw.iloc[:, [1, 3, 4, 6, 7]].dropna(how='all')
print("VCB Duplicates count:", vcb_num.duplicated().sum())
print("VCB Duplicates sum Thu:", pd.to_numeric(vcb_raw[vcb_num.duplicated()].iloc[:, 6], errors='coerce').sum())
print("VCB Duplicates sum Chi:", pd.to_numeric(vcb_raw[vcb_num.duplicated()].iloc[:, 7], errors='coerce').sum())

bidv_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ BIDV 2023 CHÍNH.xls'
bidv_raw = pd.read_excel(bidv_path, sheet_name='SAO KÊ', header=None)
bidv_num = bidv_raw.iloc[:, [1, 2, 3, 7, 8]].dropna(how='all')
print("BIDV Duplicates count:", bidv_num.duplicated().sum())

vtb_num = vtb_raw.iloc[:, [1, 2, 3, 5, 6]].dropna(how='all')
print("VTB Duplicates count:", vtb_num.duplicated().sum())
print("VTB Duplicates sum Thu:", pd.to_numeric(vtb_raw[vtb_num.duplicated()].iloc[:, 5], errors='coerce').sum())
print("VTB Duplicates sum Chi:", pd.to_numeric(vtb_raw[vtb_num.duplicated()].iloc[:, 6], errors='coerce').sum())
