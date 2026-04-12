import pandas as pd
import os

xlsx_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'

xl = pd.ExcelFile(xlsx_path)

print("--- Hoadon Sheet ---")
df_hd = xl.parse('Hoadon')
print(df_hd)

print("\n--- Tháng 1 Sheet (First 5 rows and sums) ---")
df_m1 = xl.parse('Tháng 1')
print(df_m1[['Mã Hàng', 'Tên Hàng', 'Nhập (VNĐ)', 'Xuất Theo Giá Vốn', 'Tồn Cuối (VNĐ)']].head())
print("\nSums in Tháng 1:")
print(f"Total Nhập (VNĐ): {df_m1['Nhập (VNĐ)'].sum():,.0f}")
print(f"Total Xuất Theo Giá Vốn: {df_m1['Xuất Theo Giá Vốn'].sum():,.0f}")

print("\n--- xnt12thang Sheet (Summary Row) ---")
df_12m = xl.parse('xnt12thang')
last_row = df_12m.iloc[-1]
print(last_row[['Mã Nhóm', 'Tôn Đầu Kỳ (VNĐ)', 'Tổng Tiền Nhập VNĐ', 'Tổng Tiền Giá Vốn VNĐ', 'Tồn Cuối (VNĐ)']])
