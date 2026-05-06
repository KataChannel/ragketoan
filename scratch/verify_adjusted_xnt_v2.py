import pandas as pd
import numpy as np

file_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025_ADJUSTED.xlsx"
df_m12 = pd.read_excel(file_path, sheet_name="Tháng 12")

problematic = df_m12[(df_m12['Tồn Cuối (SL)'].abs() < 0.1) & (df_m12['Tồn Cuối (VNĐ)'].abs() > 1)]
print("Groups with SL ~ 0 but non-zero Value in Tháng 12:")
for idx, row in problematic.iterrows():
    print(f"Group: {row['Mã Nhóm']}, SL: {row['Tồn Cuối (SL)']}, Val: {row['Tồn Cuối (VNĐ)']}")

neg_sl = df_m12[df_m12['Tồn Cuối (SL)'] < 0]
print("\nGroups with negative SL in Tháng 12:")
for idx, row in neg_sl.iterrows():
    print(f"Group: {row['Mã Nhóm']}, SL: {row['Tồn Cuối (SL)']}, Val: {row['Tồn Cuối (VNĐ)']}")
