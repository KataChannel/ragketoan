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
        # Find header row containing 'Tên Hàng'
        # Read first 10 rows to find header
        tmp = pd.read_excel(backup_path, sheet_name=name, nrows=10, header=None)
        header_row_idx = -1
        for i, row in tmp.iterrows():
            if any("Tên Hàng" in str(cell) for cell in row):
                header_row_idx = i
                break
        
        if header_row_idx != -1:
            sheets[name] = pd.read_excel(backup_path, sheet_name=name, skiprows=header_row_idx)
            original_headers[name] = header_row_idx
        else:
            print(f"Warning: Could not find header for {name}")
            sheets[name] = pd.read_excel(backup_path, sheet_name=name)
            original_headers[name] = 0

# Logic constants
MOVE_NHAP = 10_000_000_000
MOVE_XUAT = 10_000_000_000
MONTH_WEIGHTS = [0.085, 0.072, 0.095, 0.088, 0.102, 0.091, 0.098, 0.115, 0.077, 0.105, 0.072]

# Summary processing
df_sum = sheets['xnt12thang']
total_row_mask = df_sum['Tên Hàng'] == 'TỔNG CỘNG'
total_row = df_sum[total_row_mask]
ratio_n = MOVE_NHAP / total_row['Nhập VNĐ T12'].values[0]
ratio_x = MOVE_XUAT / total_row['Xuất VNĐ T12'].values[0]

moves_by_name = {}

def process_summary(row):
    if pd.isna(row['Mã Hàng']): return row
    
    mv_n_vnd = (row['Nhập VNĐ T12'] if pd.notna(row['Nhập VNĐ T12']) else 0) * ratio_n
    mv_n_sl = (row['Nhập SL T12'] if pd.notna(row['Nhập SL T12']) else 0) * ratio_n
    mv_x_vnd = (row['Xuất VNĐ T12'] if pd.notna(row['Xuất VNĐ T12']) else 0) * ratio_x
    mv_x_sl = (row['Xuất SL T12'] if pd.notna(row['Xuất SL T12']) else 0) * ratio_x
    
    moves_by_name[row['Tên Hàng']] = {
        'n_vnd': mv_n_vnd, 'n_sl': mv_n_sl,
        'x_vnd': mv_x_vnd, 'x_sl': mv_x_sl
    }
    
    for i in range(1, 12):
        w = MONTH_WEIGHTS[i-1]
        row[f'Nhập VNĐ T{i}'] = (row[f'Nhập VNĐ T{i}'] if pd.notna(row[f'Nhập VNĐ T{i}']) else 0) + mv_n_vnd * w
        row[f'Nhập SL T{i}'] = (row[f'Nhập SL T{i}'] if pd.notna(row[f'Nhập SL T{i}']) else 0) + mv_n_sl * w
        row[f'Xuất VNĐ T{i}'] = (row[f'Xuất VNĐ T{i}'] if pd.notna(row[f'Xuất VNĐ T{i}']) else 0) + mv_x_vnd * w
        row[f'Xuất SL T{i}'] = (row[f'Xuất SL T{i}'] if pd.notna(row[f'Xuất SL T{i}']) else 0) + mv_x_sl * w
        
    row['Nhập VNĐ T12'] -= mv_n_vnd
    row['Nhập SL T12'] -= mv_n_sl
    row['Xuất VNĐ T12'] -= mv_x_vnd
    row['Xuất SL T12'] -= mv_x_sl
    
    return row

print("Updating Summary sheet...")
sheets['xnt12thang'] = df_sum.apply(process_summary, axis=1)

# Monthly sheets processing
month_names = [f'Tháng {i}' for i in range(1, 12)] + ['T12 CHÍNH']
m_map = {f'Tháng {i}': i for i in range(1, 12)}
m_map['T12 CHÍNH'] = 12

print("Updating Monthly sheets (Nhập/Xuất)...")
for m_name in month_names:
    m_idx = m_map[m_name]
    df_m = sheets[m_name]
    w = MONTH_WEIGHTS[m_idx-1] if m_idx < 12 else 1
    
    def update_m(row):
        name = row.get('Tên Hàng')
        if name and name in moves_by_name:
            m = moves_by_name[name]
            # Mapping columns safely
            col_n_sl, col_n_vnd = 'Số Lượng', 'T.Tiền'
            col_x_sl, col_x_vnd = 'Số Lượng .1', 'T. Tiền'
            
            if m_idx == 12:
                row[col_n_sl] = (row[col_n_sl] if pd.notna(row[col_n_sl]) else 0) - m['n_sl']
                row[col_n_vnd] = (row[col_n_vnd] if pd.notna(row[col_n_vnd]) else 0) - m['n_vnd']
                row[col_x_sl] = (row[col_x_sl] if pd.notna(row[col_x_sl]) else 0) - m['x_sl']
                row[col_x_vnd] = (row[col_x_vnd] if pd.notna(row[col_x_vnd]) else 0) - m['x_vnd']
            else:
                row[col_n_sl] = (row[col_n_sl] if pd.notna(row[col_n_sl]) else 0) + m['n_sl'] * w
                row[col_n_vnd] = (row[col_n_vnd] if pd.notna(row[col_n_vnd]) else 0) + m['n_vnd'] * w
                row[col_x_sl] = (row[col_x_sl] if pd.notna(row[col_x_sl]) else 0) + m['x_sl'] * w
                row[col_x_vnd] = (row[col_x_vnd] if pd.notna(row[col_x_vnd]) else 0) + m['x_vnd'] * w
        
        # Recalculate Tồn Cuối within the month
        try:
            row['Số Lượng .2'] = (row['Số Lượng '] if pd.notna(row['Số Lượng ']) else 0) + \
                                (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) - \
                                (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0)
            row['T.Tiền.1'] = (row['T,Tiền'] if pd.notna(row['T,Tiền']) else 0) + \
                             (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) - \
                             (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0)
        except: pass
        return row
    
    sheets[m_name] = df_m.apply(update_m, axis=1)

print("Carrying over balances across months...")
for i in range(1, 12):
    curr_m = f'Tháng {i}'
    next_m = f'Tháng {i+1}' if i < 11 else 'T12 CHÍNH'
    df_curr = sheets[curr_m]
    df_next = sheets[next_m]
    data_curr = df_curr[df_curr['Tên Hàng'].notna()].set_index('Tên Hàng')[['Số Lượng .2', 'T.Tiền.1']]
    
    def carry_over(row):
        name = row.get('Tên Hàng')
        if name and name in data_curr.index:
            row['Số Lượng '] = data_curr.at[name, 'Số Lượng .2']
            row['T,Tiền'] = data_curr.at[name, 'T.Tiền.1']
            try:
                row['Số Lượng .2'] = (row['Số Lượng '] if pd.notna(row['Số Lượng ']) else 0) + \
                                    (row['Số Lượng'] if pd.notna(row['Số Lượng']) else 0) - \
                                    (row['Số Lượng .1'] if pd.notna(row['Số Lượng .1']) else 0)
                row['T.Tiền.1'] = (row['T,Tiền'] if pd.notna(row['T,Tiền']) else 0) + \
                                 (row['T.Tiền'] if pd.notna(row['T.Tiền']) else 0) - \
                                 (row['T. Tiền'] if pd.notna(row['T. Tiền']) else 0)
            except: pass
        return row
    sheets[next_m] = df_next.apply(carry_over, axis=1)

print("Writing to file...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in sheets.items():
        start = original_headers[name]
        df.to_excel(writer, sheet_name=name, index=False, startrow=start)

print("All done.")
