import pandas as pd
import openpyxl

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
backup_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx'

print("Loading all sheets from backup...")
xl = pd.ExcelFile(backup_path)
sheets = {}
original_headers = {}

for name in xl.sheet_names:
    print(f"Reading {name}...")
    if name == 'xnt12thang':
        sheets[name] = pd.read_excel(backup_path, sheet_name=name)
        original_headers[name] = 0
    else:
        tmp = pd.read_excel(backup_path, sheet_name=name, nrows=10, header=None)
        h_idx = -1
        for i, row in tmp.iterrows():
            if any("Tên Hàng" in str(cell) for cell in row):
                h_idx = i
                break
        sheets[name] = pd.read_excel(backup_path, sheet_name=name, skiprows=h_idx if h_idx != -1 else 1)
        original_headers[name] = h_idx if h_idx != -1 else 1

# Ratios calculation
df_sum_orig = sheets['xnt12thang']
total_row_mask = df_sum_orig['Tên Hàng'] == 'TỔNG CỘNG'
total_nhap_v12 = df_sum_orig[total_row_mask]['Nhập VNĐ T12'].values[0]
total_xuat_v12 = df_sum_orig[total_row_mask]['Xuất VNĐ T12'].values[0]

ratio_n = 10_000_000_000 / total_nhap_v12
ratio_x = 10_000_000_000 / total_xuat_v12
MONTH_WEIGHTS = [0.085, 0.072, 0.095, 0.088, 0.102, 0.091, 0.098, 0.115, 0.077, 0.105, 0.072]

moves_by_name = {}

def process_row(row, is_summary=True):
    # Determine columns based on sheet type
    if is_summary:
        n_vnd_col, n_sl_col = 'Nhập VNĐ T12', 'Nhập SL T12'
        x_vnd_col, x_sl_col = 'Xuất VNĐ T12', 'Xuất SL T12'
    else:
        n_vnd_col, n_sl_col = 'T.Tiền', 'Số Lượng'
        x_vnd_col, x_sl_col = 'T. Tiền', 'Số Lượng .1'

    has_data = pd.notna(row.get(n_vnd_col)) or pd.notna(row.get(x_vnd_col))
    if not has_data: return row

    mv_n_vnd = (row[n_vnd_col] if pd.notna(row[n_vnd_col]) else 0) * ratio_n
    mv_n_sl = (row[n_sl_col] if pd.notna(row[n_sl_col]) else 0) * ratio_n
    mv_x_vnd = (row[x_vnd_col] if pd.notna(row[x_vnd_col]) else 0) * ratio_x
    mv_x_sl = (row[x_sl_col] if pd.notna(row[x_sl_col]) else 0) * ratio_x
    
    # Track moves for items with names (to match in monthly sheets)
    name = row.get('Tên Hàng')
    if name:
        moves_by_name[name] = {'n_vnd': mv_n_vnd, 'n_sl': mv_n_sl, 'x_vnd': mv_x_vnd, 'x_sl': mv_x_sl}

    if is_summary:
        for i in range(1, 12):
            w = MONTH_WEIGHTS[i-1]
            row[f'Nhập VNĐ T{i}'] = (row[f'Nhập VNĐ T{i}'] if pd.notna(row[f'Nhập VNĐ T{i}']) else 0) + mv_n_vnd * w
            row[f'Nhập SL T{i}'] = (row[f'Nhập SL T{i}'] if pd.notna(row[f'Nhập SL T{i}']) else 0) + mv_n_sl * w
            row[f'Xuất VNĐ T{i}'] = (row[f'Xuất VNĐ T{i}'] if pd.notna(row[f'Xuất VNĐ T{i}']) else 0) + mv_x_vnd * w
            row[f'Xuất SL T{i}'] = (row[f'Xuất SL T{i}'] if pd.notna(row[f'Xuất SL T{i}']) else 0) + mv_x_sl * w
        
    row[n_vnd_col] -= mv_n_vnd
    row[n_sl_col] -= mv_n_sl
    row[x_vnd_col] -= mv_x_vnd
    row[x_sl_col] -= mv_x_sl
    
    return row

print("Updating Summary sheet (all rows including TỔNG CỘNG)...")
sheets['xnt12thang'] = df_sum_orig.apply(process_row, axis=1)

print("Updating Monthly sheets...")
for m_name in [f'Tháng {i}' for i in range(1, 11)] + ['Tháng 11', 'T12 CHÍNH']:
    m_idx = 12 if m_name == 'T12 CHÍNH' else int(m_name.split()[-1])
    df_m = sheets[m_name]
    w = MONTH_WEIGHTS[m_idx-1] if m_idx < 12 else 1
    
    def update_m(row):
        name = row.get('Tên Hàng')
        if name in moves_by_name:
            m = moves_by_name[name]
            # Mapping columns indices for monthly sheets
            # Nhập: 4, 5 | Xuất: 6, 7
            if m_idx == 12:
                row['Số Lượng'] = (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) - m['n_sl']
                row['T.Tiền'] = (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) - m['n_vnd']
                row['Số Lượng .1'] = (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0) - m['x_sl']
                row['T. Tiền'] = (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0) - m['x_vnd']
            else:
                row['Số Lượng'] = (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) + m['n_sl'] * w
                row['T.Tiền'] = (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) + m['n_vnd'] * w
                row['Số Lượng .1'] = (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0) + m['x_sl'] * w
                row['T. Tiền'] = (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0) + m['x_vnd'] * w
        
        # Consistent recalculation of Closing Balance
        try:
            row['Số Lượng .2'] = (row['Số Lượng '] if pd.notna(row['Số Lượng ']) else 0) + (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) - (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0)
            row['T.Tiền.1'] = (row['T,Tiền'] if pd.notna(row['T,Tiền']) else 0) + (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) - (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0)
        except: pass
        return row
    sheets[m_name] = df_m.apply(update_m, axis=1)

# Carry balances
for i in range(1, 12):
    curr_m = f'Tháng {i}'
    next_m = f'Tháng {i+1}' if i < 11 else 'T12 CHÍNH'
    data_curr = sheets[curr_m].set_index('Tên Hàng')[['Số Lượng .2', 'T.Tiền.1']]
    def carry(row):
        name = row.get('Tên Hàng')
        if name in data_curr.index:
            row['Số Lượng '] = data_curr.at[name, 'Số Lượng .2']
            row['T,Tiền'] = data_curr.at[name, 'T.Tiền.1']
            try:
                row['Số Lượng .2'] = (row['Số Lượng '] if pd.notna(row['Số Lượng ']) else 0) + (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) - (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0)
                row['T.Tiền.1'] = (row['T,Tiền'] if pd.notna(row['T,Tiền']) else 0) + (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) - (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0)
            except: pass
        return row
    sheets[next_m] = sheets[next_m].apply(carry, axis=1)

print("Writing to file...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in sheets.items():
        df.to_excel(writer, sheet_name=name, index=False, startrow=original_headers[name])

print("Verified check of Grand Total T12 Nhập:")
print(sheets['xnt12thang'][sheets['xnt12thang']['Tên Hàng'] == 'TỔNG CỘNG']['Nhập VNĐ T12'].values[0])
