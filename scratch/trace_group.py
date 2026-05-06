import pandas as pd

file_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025_ADJUSTED.xlsx"

group = "LCD-LG-24"
print(f"Tracing {group}:")
for m in range(1, 13):
    df = pd.read_excel(file_path, sheet_name=f"Tháng {m}")
    row = df[df['Mã Nhóm'] == group].iloc[0]
    print(f"Tháng {m}: TĐ_SL: {row['Tồn Đầu (SL)']}, TĐ_Val: {row['Tồn Đầu (VNĐ)']}, Nhập_SL: {row['Nhập (SL)']}, Nhập_Val: {row['Nhập (VNĐ)']}, Xuất_SL: {row['Xuất (SL)']}, Xuất_Val: {row['Xuất (VNĐ)']}, Tế_SL: {row['Tồn Cuối (SL)']}, Tế_Val: {row['Tồn Cuối (VNĐ)']}")
