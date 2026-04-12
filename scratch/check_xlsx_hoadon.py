import pandas as pd
import os

xlsx_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'

xl = pd.ExcelFile(xlsx_path)
if 'Hoadon' in xl.sheet_names:
    df = xl.parse('Hoadon')
    print(df)
else:
    print("Hoadon sheet not found")
