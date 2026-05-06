import pandas as pd

file_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025_ADJUSTED.xlsx"

# Check "xnt12thang" sheet
df = pd.read_excel(file_path, sheet_name="xnt12thang")
print("Groups with negative Tồn Cuối Năm in xnt12thang:")
print(df[df['Tồn Cuối Năm'] < -1][['Mã Nhóm', 'Tồn Cuối Năm']])

# Check a monthly sheet, e.g., Tháng 12
df_m12 = pd.read_excel(file_path, sheet_name="Tháng 12")
print("\nGroups with negative Tồn Cuối (SL) in Tháng 12:")
print(df_m12[df_m12['Tồn Cuối (SL)'] < 0][['Mã Nhóm', 'Tồn Cuối (SL)']])

print("\nGroups with zero SL but non-zero Value in Tháng 12:")
print(df_m12[(df_m12['Tồn Cuối (SL)'] == 0) & (df_m12['Tồn Cuối (VNĐ)'].abs() > 1)][['Mã Nhóm', 'Tồn Cuối (VNĐ)']])
