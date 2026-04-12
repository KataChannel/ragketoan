import pandas as pd
import os

xlsx_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'

xl = pd.ExcelFile(xlsx_path)
df = xl.parse('Tháng 1')
df['Nhập (VNĐ)'] = pd.to_numeric(df['Nhập (VNĐ)'], errors='coerce').fillna(0)
print(df[df['Nhập (VNĐ)'] > 0][['Mã Hàng', 'Tên Hàng', 'Nhập (VNĐ)']])
