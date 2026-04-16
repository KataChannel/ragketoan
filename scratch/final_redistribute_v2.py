import pandas as pd
import openpyxl

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
backup_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx'

# Load ALL sheets into memory first to avoid read/write conflict
print("Reading all sheets...")
xl = pd.ExcelFile(backup_path) # Read from backup to be safe
all_sheets = {sheet_name: xl.parse(sheet_name) for sheet_name in xl.sheet_names}

df = all_sheets['xnt12thang']

# Find the total row (TỔNG CỘNG)
total_row_mask = df['Tên Hàng'] == 'TỔNG CỘNG'
if not total_row_mask.any():
    print("Warning: TỔNG CỘNG row not found. Using sum of columns.")
    total_nhap_vnd_t12 = df['Nhập VNĐ T12'].sum() / 2
    total_xuat_vnd_t12 = df['Xuất VNĐ T12'].sum() / 2
else:
    total_nhap_vnd_t12 = df[total_row_mask]['Nhập VNĐ T12'].values[0]
    total_xuat_vnd_t12 = df[total_row_mask]['Xuất VNĐ T12'].values[0]

print(f"Grand Total Nhập VNĐ T12: {total_nhap_vnd_t12:,.0f}")
print(f"Grand Total Xuất VNĐ T12: {total_xuat_vnd_t12:,.0f}")

# Amount to move
MOVE_NHAP = 10_000_000_000
MOVE_XUAT = 10_000_000_000 # Corrected from 10T because it exceeds total

ratio_n = MOVE_NHAP / total_nhap_vnd_t12
ratio_x = MOVE_XUAT / total_xuat_vnd_t12

print(f"Moving {MOVE_NHAP:,.0f} Nhập ({ratio_n:.2%})")
print(f"Moving {MOVE_XUAT:,.0f} Xuất ({ratio_x:.2%})")

# Transformation function
def redistribute(row):
    mv_n_vnd = row['Nhập VNĐ T12'] * ratio_n
    mv_n_sl = row['Nhập SL T12'] * ratio_n
    mv_x_vnd = row['Xuất VNĐ T12'] * ratio_x
    mv_x_sl = row['Xuất SL T12'] * ratio_x
    
    # Check for NaN and handle as 0
    if pd.isna(mv_n_vnd): mv_n_vnd = 0
    if pd.isna(mv_n_sl): mv_n_sl = 0
    if pd.isna(mv_x_vnd): mv_x_vnd = 0
    if pd.isna(mv_x_sl): mv_x_sl = 0
    
    for m in range(1, 12):
        col_n_vnd = f'Nhập VNĐ T{m}'
        col_n_sl = f'Nhập SL T{m}'
        col_x_vnd = f'Xuất VNĐ T{m}'
        col_x_sl = f'Xuất SL T{m}'
        
        row[col_n_vnd] = (row[col_n_vnd] if pd.notna(row[col_n_vnd]) else 0) + mv_n_vnd / 11
        row[col_n_sl] = (row[col_n_sl] if pd.notna(row[col_n_sl]) else 0) + mv_n_sl / 11
        row[col_x_vnd] = (row[col_x_vnd] if pd.notna(row[col_x_vnd]) else 0) + mv_x_vnd / 11
        row[col_x_sl] = (row[col_x_sl] if pd.notna(row[col_x_sl]) else 0) + mv_x_sl / 11
        
    row['Nhập VNĐ T12'] -= mv_n_vnd
    row['Nhập SL T12'] -= mv_n_sl
    row['Xuất VNĐ T12'] -= mv_x_vnd
    row['Xuất SL T12'] -= mv_x_sl
    
    return row

print("Processing redistribution...")
df_processed = df.apply(redistribute, axis=1)

# Update the dictionary
all_sheets['xnt12thang'] = df_processed

print("Writing to file...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for sheet_name, sheet_df in all_sheets.items():
        sheet_df.to_excel(writer, sheet_name=sheet_name, index=False)

print("\nSaved successfully.")
