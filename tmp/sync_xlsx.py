
import pandas as pd
import openpyxl

file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx'
target_in = 15813338107
target_out = 16170531001

# Load all months to find current total
xl = pd.ExcelFile(file_path)
sheets = {}
total_in = 0
total_out = 0

for m in range(1, 13):
    sheet_name = f'Tháng {m}'
    df = pd.read_excel(xl, sheet_name=sheet_name)
    sheets[sheet_name] = df
    row_total = df[df['Mã - Tên Hàng'] == 'TỔNG CỘNG']
    if not row_total.empty:
        total_in += row_total['Nhập (Tiền)'].values[0]
        total_out += row_total['Xuất (Tiền)'].values[0]

diff_in = target_in - total_in
diff_out = target_out - total_out

print(f"Diff In: {diff_in}, Diff Out: {diff_out}")

# Apply difference to the last non-total row of Tháng 12
df_12 = sheets['Tháng 12']
last_item_idx = df_12[df_12['Mã - Tên Hàng'] != 'TỔNG CỘNG'].index[-1]
total_idx = df_12[df_12['Mã - Tên Hàng'] == 'TỔNG CỘNG'].index[0]

# Adjustment for In
df_12.at[last_item_idx, 'Nhập (Tiền)'] += diff_in
df_12.at[total_idx, 'Nhập (Tiền)'] += diff_in

# Adjustment for Out
df_12.at[last_item_idx, 'Xuất (Tiền)'] += diff_out
df_12.at[total_idx, 'Xuất (Tiền)'] += diff_out

# Recalculate Cuối Kỳ (Tiền) for December
df_12.at[last_item_idx, 'Cuối Kỳ (Tiền)'] = df_12.at[last_item_idx, 'Đầu Kỳ (Tiền)'] + df_12.at[last_item_idx, 'Nhập (Tiền)'] - df_12.at[last_item_idx, 'Xuất (Tiền)']
df_12.at[total_idx, 'Cuối Kỳ (Tiền)'] = df_12.at[total_idx, 'Đầu Kỳ (Tiền)'] + df_12.at[total_idx, 'Nhập (Tiền)'] - df_12.at[total_idx, 'Xuất (Tiền)']

# Replace sheets in memory and save all
xl_all = pd.ExcelFile(file_path)
all_sheets = {}
for name in xl_all.sheet_names:
    if name in sheets:
        all_sheets[name] = sheets[name]
    else:
        all_sheets[name] = pd.read_excel(xl_all, sheet_name=name)

with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in all_sheets.items():
        df.to_excel(writer, sheet_name=name, index=False)

print("Synchronized totals.")
