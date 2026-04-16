import pandas as pd
import numpy as np

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
output_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_ADJUSTED.xlsx'

# Load the summary sheet
df = pd.read_excel(file_path, sheet_name='xnt12thang')

# Define amounts to move (10 Billion VNĐ for both, assuming typo in 10T)
AMOUNT_MOVE_NHAP = 10_000_000_000
AMOUNT_MOVE_XUAT = 10_000_000_000

# Calculate totals for T12
total_nhap_vnd_t12 = df['Nhập VNĐ T12'].sum()
total_xuat_vnd_t12 = df['Xuất VNĐ T12'].sum()

print(f"Total Nhập VNĐ T12: {total_nhap_vnd_t12:,.0f}")
print(f"Total Xuất VNĐ T12: {total_xuat_vnd_t12:,.0f}")

# Calculate ratios
ratio_nhap = AMOUNT_MOVE_NHAP / total_nhap_vnd_t12 if total_nhap_vnd_t12 != 0 else 0
ratio_xuat = AMOUNT_MOVE_XUAT / total_xuat_vnd_t12 if total_xuat_vnd_t12 != 0 else 0

print(f"Ratio Nhập: {ratio_nhap:.4f}")
print(f"Ratio Xuất: {ratio_xuat:.4f}")

# Perform redistribution for each row
for i in range(1, 12):
    # Nhập
    moved_nhap_vnd = df['Nhập VNĐ T12'] * ratio_nhap
    moved_nhap_sl = df['Nhập SL T12'] * ratio_nhap
    
    df[f'Nhập VNĐ T{i}'] = df[f'Nhập VNĐ T{i}'] + (moved_nhap_vnd / 11)
    df[f'Nhập SL T{i}'] = df[f'Nhập SL T{i}'] + (moved_nhap_sl / 11)
    
    # Xuất
    moved_xuat_vnd = df['Xuất VNĐ T12'] * ratio_xuat
    moved_xuat_sl = df['Xuất SL T12'] * ratio_xuat
    
    df[f'Xuất VNĐ T{i}'] = df[f'Xuất VNĐ T{i}'] + (moved_xuat_vnd / 11)
    df[f'Xuất SL T{i}'] = df[f'Xuất SL T{i}'] + (moved_xuat_sl / 11)

# Subtract from T12
df['Nhập VNĐ T12'] = df['Nhập VNĐ T12'] - (df['Nhập VNĐ T12'] * ratio_nhap)
df['Nhập SL T12'] = df['Nhập SL T12'] - (df['Nhập SL T12'] * ratio_nhap)

df['Xuất VNĐ T12'] = df['Xuất VNĐ T12'] - (df['Xuất VNĐ T12'] * ratio_xuat)
df['Xuất SL T12'] = df['Xuất SL T12'] - (df['Xuất SL T12'] * ratio_xuat)

# Recalculate Tổng columns (though they should be unchanged, it's safer)
df['Tổng Nhập SL'] = sum(df[f'Nhập SL T{i}'] for i in range(1, 13))
df['Tổng Nhập VNĐ'] = sum(df[f'Nhập VNĐ T{i}'] for i in range(1, 13))
df['Tổng Xuất SL'] = sum(df[f'Xuất SL T{i}'] for i in range(1, 13))
df['Tổng Xuất VNĐ'] = sum(df[f'Xuất VNĐ T{i}'] for i in range(1, 13))

# Tồn Cuối SL = Tồn Đầu SL + Tổng Nhập SL - Tổng Xuất SL
df['Tồn Cuối SL'] = df['Tồn Đầu SL'] + df['Tổng Nhập SL'] - df['Tổng Xuất SL']
# Tồn Cuối VNĐ = Tồn Đầu VNĐ + Tổng Nhập VNĐ - Tổng Xuất VNĐ (Note: This depends on valuation method, but preserving sum is what user asked)
df['Tồn Cuối VNĐ'] = df['Tồn Đầu VNĐ'] + df['Tổng Nhập VNĐ'] - df['Tổng Xuất VNĐ']

# Final check of totals
print(f"New Total Nhập VNĐ T12: {df['Nhập VNĐ T12'].sum():,.0f}")
print(f"New Total Xuất VNĐ T12: {df['Xuất VNĐ T12'].sum():,.0f}")
print(f"New Total Year Nhập VNĐ: {df['Tổng Nhập VNĐ'].sum():,.0f}")
print(f"New Total Year Xuất VNĐ: {df['Tổng Xuất VNĐ'].sum():,.0f}")

# Save back to Excel
# Since I want to preserve the other sheets, I'll use pd.ExcelWriter
with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    # Save adjusted summary
    df.to_excel(writer, sheet_name='xnt12thang', index=False)
    
    # Copy other sheets as is (though ideally they should be updated too, but let's see if xnt12thang is enough)
    # Actually, if the user sees the summary is fixed, they might want the month sheets too.
    # But month sheets have different format. Let's just do summary for now.
    
    # Wait, if I use ExcelWriter I need to load all sheets first.
    xl = pd.ExcelFile(file_path)
    for sheet in xl.sheet_names:
        if sheet != 'xnt12thang':
            other_df = pd.read_excel(file_path, sheet_name=sheet)
            other_df.to_excel(writer, sheet_name=sheet, index=False)
