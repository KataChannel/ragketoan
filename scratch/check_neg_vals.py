import pandas as pd

file_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025_ADJUSTED.xlsx"
df_m12 = pd.read_excel(file_path, sheet_name="Tháng 12")

groups = ["PRN-BRO-HL", "SSD-128-256"]
print("Details for negative value groups in Tháng 12:")
for g in groups:
    row = df_m12[df_m12['Mã Nhóm'] == g].iloc[0]
    print(f"Group: {g}, SL: {row['Tồn Cuối (SL)']}, Val: {row['Tồn Cuối (VNĐ)']}")
