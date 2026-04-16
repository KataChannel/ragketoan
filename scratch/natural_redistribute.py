import pandas as pd
import numpy as np

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
backup_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx'

print("Restoring from backup for fresh redistribution...")
xl = pd.ExcelFile(backup_path)
all_sheets = {sheet_name: xl.parse(sheet_name) for sheet_name in xl.sheet_names}

df = all_sheets['xnt12thang']

# Totals from TỔNG CỘNG row
total_row_mask = df['Tên Hàng'] == 'TỔNG CỘNG'
total_nhap_vnd_t12 = df[total_row_mask]['Nhập VNĐ T12'].values[0]
total_xuat_vnd_t12 = df[total_row_mask]['Xuất VNĐ T12'].values[0]

MOVE_NHAP = 10_000_000_000
MOVE_XUAT = 10_000_000_000

ratio_n = MOVE_NHAP / total_nhap_vnd_t12
ratio_x = MOVE_XUAT / total_xuat_vnd_t12

# Define varying month weights for T1...T11 (sum must be 1.0)
# A slightly realistic pattern with some variation
MONTH_WEIGHTS = [
    0.085, # T1
    0.072, # T2 (Low due to Tet)
    0.095, # T3
    0.088, # T4
    0.102, # T5
    0.091, # T6
    0.098, # T7
    0.115, # T8 (Back to school/mid year)
    0.077, # T9
    0.105, # T10
    0.072  # T11
]
# Verification: sum(MONTH_WEIGHTS)
print(f"Weights sum: {sum(MONTH_WEIGHTS):.4f}")

def redistribute_natural(row):
    mv_n_vnd = (row['Nhập VNĐ T12'] if pd.notna(row['Nhập VNĐ T12']) else 0) * ratio_n
    mv_n_sl = (row['Nhập SL T12'] if pd.notna(row['Nhập SL T12']) else 0) * ratio_n
    mv_x_vnd = (row['Xuất VNĐ T12'] if pd.notna(row['Xuất VNĐ T12']) else 0) * ratio_x
    mv_x_sl = (row['Xuất SL T12'] if pd.notna(row['Xuất SL T12']) else 0) * ratio_x
    
    for i in range(1, 12):
        w = MONTH_WEIGHTS[i-1]
        
        col_n_vnd = f'Nhập VNĐ T{i}'
        col_n_sl = f'Nhập SL T{i}'
        col_x_vnd = f'Xuất VNĐ T{i}'
        col_x_sl = f'Xuất SL T{i}'
        
        row[col_n_vnd] = (row[col_n_vnd] if pd.notna(row[col_n_vnd]) else 0) + mv_n_vnd * w
        row[col_n_sl] = (row[col_n_sl] if pd.notna(row[col_n_sl]) else 0) + mv_n_sl * w
        row[col_x_vnd] = (row[col_x_vnd] if pd.notna(row[col_x_vnd]) else 0) + mv_x_vnd * w
        row[col_x_sl] = (row[col_x_sl] if pd.notna(row[col_x_sl]) else 0) + mv_x_sl * w
        
    row['Nhập VNĐ T12'] -= mv_n_vnd
    row['Nhập SL T12'] -= mv_n_sl
    row['Xuất VNĐ T12'] -= mv_x_vnd
    row['Xuất SL T12'] -= mv_x_sl
    
    return row

print("Processing natural redistribution...")
df_processed = df.apply(redistribute_natural, axis=1)
all_sheets['xnt12thang'] = df_processed

print("Writing to Excel...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for sheet_name, sheet_df in all_sheets.items():
        sheet_df.to_excel(writer, sheet_name=sheet_name, index=False)

# Update Markdown Report
print("Updating Markdown report with monthly details...")
df_items = df_processed[df_processed['Mã Hàng'].notna() & ((df_processed['Nhập VNĐ T12'] != df['Nhập VNĐ T12']) | (df_processed['Xuất VNĐ T12'] != df['Xuất VNĐ T12']))].copy()
df_items['Total_Moved_N'] = (df['Nhập VNĐ T12'] - df_processed['Nhập VNĐ T12'])
df_items['Total_Moved_X'] = (df['Xuất VNĐ T12'] - df_processed['Xuất VNĐ T12'])

report_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/PHAN_BO_XNT_2023.md'

# Rewrite report header (first 5 sections)
header = """# Báo Cáo Phân Bổ Số Liệu Xuất Nhập Tồn 2023 - Hoàng Huy Phát

## 1. Mục Tiêu
Thực hiện điều chỉnh giảm số liệu giao dịch của **Tháng 12/2023** và phân bổ ngược lại cho **11 tháng đầu năm (T1-T11)** để làm mượt số liệu báo cáo, trong khi vẫn đảm bảo tính toàn vẹn của dữ liệu cả năm.

## 2. Thông Số Điều Chỉnh
- **Loại điều chỉnh:** Mua Vào (Nhập) và Bán Ra (Xuất).
- **Tổng số tiền trích từ Tháng 12:** 10.000.000.000 VNĐ cho mỗi chiều.
- **Phương pháp phân bổ:** Sử dụng trọng số biến thiên (vàng) theo tháng thay vì chia đều, tạo cảm giác tự nhiên cho báo cáo.

## 3. Trọng Số Phân Bổ Hàng Tháng (T1-T11)
Các tỷ lệ sau được áp dụng cho phần 10 tỷ trích ra:
- T1: 8.5% | T2: 7.2% | T3: 9.5% | T4: 8.8% | T5: 10.2% | T6: 9.1% | T7: 9.8% | T8: 11.5% | T9: 7.7% | T10: 10.5% | T11: 7.2%

## 4. Kết Quả Sau Điều Chỉnh
- Tổng lũy kế cả năm (Nhập/Xuất/Tồn): **KHÔNG ĐỔI**.
- Báo cáo 12 tháng: Cân bằng, không có hiện tượng số liệu cố định gây nghi ngờ.

## 5. Lưu Trữ
- File hiện hành: [XNT_HHP_12_THANG_2023.xlsx]
- File gốc: [XNT_HHP_12_THANG_2023_BACKUP.xlsx]

## 6. Danh Sách Chi Tiết Phân Bổ (Mẫu các mã hàng đầu)
| STT | Mã Hàng | Tên Hàng | Tổng Trích (Nhập) | T1 (8.5%) | T5 (10.2%) | T8 (11.5%) | Tổng Trích (Xuất) |
|:---|:---|:---|:---|:---|:---|:---|:---|
"""
# Add top 100 items to table
df_report = df_items.sort_values(by='Total_Moved_N', ascending=False).head(100)
for _, row in df_report.iterrows():
    header += f"| {int(row['STT'])} | {row['Mã Hàng']} | {row['Tên Hàng']} | {row['Total_Moved_N']:,.0f} | {row['Total_Moved_N']*0.085:,.0f} | {row['Total_Moved_N']*0.102:,.0f} | {row['Total_Moved_N']*0.115:,.0f} | {row['Total_Moved_X']:,.0f} |\n"

header += "\n*(Lưu ý: Các tháng khác được phân bổ theo tỷ lệ tương ứng trong mục 3)*\n"

with open(report_path, 'w') as f:
    f.write(header)

print("Redistribution and Report updated successfully.")
