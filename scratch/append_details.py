import pandas as pd

df = pd.read_excel('/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx', sheet_name='xnt12thang')
df_backup = pd.read_excel('/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx', sheet_name='xnt12thang')

# Calculate moved amounts
df['Moved_Nhap'] = df_backup['Nhập VNĐ T12'] - df['Nhập VNĐ T12']
df['Moved_Xuat'] = df_backup['Xuất VNĐ T12'] - df['Xuất VNĐ T12']
df['Monthly_Nhap'] = df['Moved_Nhap'] / 11
df['Monthly_Xuat'] = df['Moved_Xuat'] / 11

# Filter for relevant items (with movement > 0)
# and skip any total row (already in main doc)
df_items = df[df['Mã Hàng'].notna() & ((df['Moved_Nhap'] > 0) | (df['Moved_Xuat'] > 0))].copy()

# Sort by impact
df_items = df_items.sort_values(by=['Moved_Nhap', 'Moved_Xuat'], ascending=False)

markdown_appendix = "\n\n## 6. Danh Sách Chi Tiết Phân Bổ\n"
markdown_appendix += "Dưới đây là danh sách các mặt hàng có số liệu được phân bổ lại. Mỗi tháng (T1-T11) sẽ được cộng thêm số tiền tương ứng ghi ở cột 'Cộng thêm mỗi tháng'.\n\n"
markdown_appendix += "| STT | Mã Hàng | Tên Hàng | Tổng Nhập Trích Ra | Cộng Thêm (Nhập)/Tháng | Tổng Xuất Trích Ra | Cộng Thêm (Xuất)/Tháng |\n"
markdown_appendix += "|:---|:---|:---|:---|:---|:---|:---|\n"

for _, row in df_items.iterrows():
    line = f"| {int(row['STT'])} | {row['Mã Hàng']} | {row['Tên Hàng']} | {row['Moved_Nhap']:,.0f} | {row['Monthly_Nhap']:,.0f} | {row['Moved_Xuat']:,.0f} | {row['Monthly_Xuat']:,.0f} |\n"
    markdown_appendix += line

# Append to the file
with open('/chikiet/kata2025/ragketoan/docs/xulysolieu/PHAN_BO_XNT_2023.md', 'a') as f:
    f.write(markdown_appendix)

print("Appendix added successfully.")
