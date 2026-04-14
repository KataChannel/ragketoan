import pandas as pd
vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023')
for idx, row in vcb_raw.iterrows():
    val = str(row.iloc[1]).strip()
    if val != 'nan' and '2022' in val:
        print("Found 2022:", val)
