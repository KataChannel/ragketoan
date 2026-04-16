import pandas as pd
import openpyxl

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
output_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'

# Load the summary sheet
df = pd.read_excel(file_path, sheet_name='xnt12thang')

# Find the total row (TỔNG CỘNG)
total_row_mask = df['Tên Hàng'] == 'TỔNG CỘNG'
if not total_row_mask.any():
    # Fallback to sum of items if no total row found
    total_nhap_vnd_t12 = df['Nhập VNĐ T12'].sum() / 2 # assuming double counting
    total_xuat_vnd_t12 = df['Xuất VNĐ T12'].sum() / 2
else:
    total_nhap_vnd_t12 = df[total_row_mask]['Nhập VNĐ T12'].values[0]
    total_xuat_vnd_t12 = df[total_row_mask]['Xuất VNĐ T12'].values[0]

print(f"Grand Total Nhập VNĐ T12: {total_nhap_vnd_t12:,.0f}")
print(f"Grand Total Xuất VNĐ T12: {total_xuat_vnd_t12:,.0f}")

# Amount to move
MOVE_NHAP = 10_000_000_000
MOVE_XUAT = 10_000_000_000 # Assuming 10T is a typo for 10B

# Calculate distribution ratios
ratio_n = MOVE_NHAP / total_nhap_vnd_t12
ratio_x = MOVE_XUAT / total_xuat_vnd_t12

print(f"Moving {MOVE_NHAP:,.0f} Nhập ({ratio_n:.2%})")
print(f"Moving {MOVE_XUAT:,.0f} Xuất ({ratio_x:.2%})")

# Columns to update
months1_11 = [f'T{i}' for i in range(1, 12)]

# Transformation function for each row
def redistribute(row):
    # Nhập
    mv_n_vnd = row['Nhập VNĐ T12'] * ratio_n
    mv_n_sl = row['Nhập SL T12'] * ratio_n
    
    # Xuất
    mv_x_vnd = row['Xuất VNĐ T12'] * ratio_x
    mv_x_sl = row['Xuất SL T12'] * ratio_x
    
    # Distribute to T1..T11
    for m in range(1, 12):
        row[f'Nhập VNĐ T{m}'] += mv_n_vnd / 11
        row[f'Nhập SL T{m}'] += mv_n_sl / 11
        row[f'Xuất VNĐ T{m}'] += mv_x_vnd / 11
        row[f'Xuất SL T{m}'] += mv_x_sl / 11
        
    # Subtract from T12
    row['Nhập VNĐ T12'] -= mv_n_vnd
    row['Nhập SL T12'] -= mv_n_sl
    row['Xuất VNĐ T12'] -= mv_x_vnd
    row['Xuất SL T12'] -= mv_x_sl
    
    return row

# Apply redistribution to all rows (preserving subtotals relationships)
df = df.apply(redistribute, axis=1)

# Final recalculation for verification
print("\nVerification (TỔNG CỘNG row):")
new_total = df[df['Tên Hàng'] == 'TỔNG CỘNG']
if not new_total.empty:
    print(f"New Nhập T12: {new_total['Nhập VNĐ T12'].values[0]:,.0f}")
    print(f"New Total Year Nhập: {new_total['Tổng Nhập VNĐ'].values[0]:,.0f}")

# Save preserving other sheets
xl = pd.ExcelFile(file_path)
sheet_names = xl.sheet_names

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    for sheet in sheet_names:
        if sheet == 'xnt12thang':
            df.to_excel(writer, sheet_name=sheet, index=False)
        else:
            other_df = pd.read_excel(file_path, sheet_name=sheet)
            other_df.to_excel(writer, sheet_name=sheet, index=False)

print("\nSaved successfully.")
