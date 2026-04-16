import pandas as pd
import numpy as np

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
backup_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx'

print("Loading data from backup...")
xl = pd.ExcelFile(backup_path)
sheets = {}
original_headers = {}

numeric_cols_m = ['Số Lượng ', 'T,Tiền', 'Số Lượng', 'T.Tiền', 'Số Lượng .1', 'T. Tiền', 'Số Lượng .2', 'T.Tiền.1']

for name in xl.sheet_names:
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
        df = pd.read_excel(backup_path, sheet_name=name, skiprows=h_idx if h_idx != -1 else 1)
        # Ensure numeric columns are floats to avoid type errors
        for col in numeric_cols_m:
            if col in df.columns: df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(float)
        sheets[name] = df
        original_headers[name] = h_idx if h_idx != -1 else 1

df_sum = sheets['xnt12thang']
sum_numeric = [c for c in df_sum.columns if 'Nhập' in c or 'Xuất' in c or 'Tồn' in c]
for c in sum_numeric: df_sum[c] = pd.to_numeric(df_sum[c], errors='coerce').fillna(0).astype(float)

total_row = df_sum[df_sum['Tên Hàng'] == 'TỔNG CỘNG']
ratio_n = 10_000_000_000 / total_row['Nhập VNĐ T12'].values[0]
ratio_x = 10_000_000_000 / total_row['Xuất VNĐ T12'].values[0]

MONTH_WEIGHTS = [0.085, 0.072, 0.095, 0.088, 0.102, 0.091, 0.098, 0.115, 0.077, 0.105, 0.072]

item_targets = {}
for _, row in df_sum[df_sum['Mã Hàng'].notna()].iterrows():
    item_targets[row['Tên Hàng']] = {
        'n_vnd': row['Nhập VNĐ T12'] * ratio_n, 'n_sl': row['Nhập SL T12'] * ratio_n,
        'x_vnd': row['Xuất VNĐ T12'] * ratio_x, 'x_sl': row['Xuất SL T12'] * ratio_x
    }

print("Running Hyper-Safe Redistribution...")
updated_vals = {name: {} for name in xl.sheet_names}

for item_name, target in item_targets.items():
    cur_td_sl = 0.0; cur_td_vnd = 0.0
    dist_n_vnd = 0; dist_n_sl = 0; dist_x_vnd = 0; dist_x_sl = 0
    
    for i in range(1, 12):
        m_name = f'Tháng {i}'
        m_df = sheets[m_name]
        m_row_mask = m_df['Tên Hàng'] == item_name
        if not m_row_mask.any(): continue
        
        orig_row = m_df[m_row_mask].iloc[0]
        if i == 1:
            cur_td_sl = orig_row['Số Lượng ']; cur_td_vnd = orig_row['T,Tiền']
        
        cur_td_sl = max(0.0, cur_td_sl); cur_td_vnd = max(0.0, cur_td_vnd)
        w = MONTH_WEIGHTS[i-1]
        t_n_vnd = target['n_vnd'] * w; t_n_sl = target['n_sl'] * w
        t_x_vnd = target['x_vnd'] * w; t_x_sl = target['x_sl'] * w
        
        base_n_sl = orig_row['Số Lượng'] + t_n_sl
        base_n_vnd = orig_row['T.Tiền'] + t_n_vnd
        
        limit_x_sl = max(0.0, (cur_td_sl + base_n_sl - orig_row['Số Lượng .1']) * 0.999)
        limit_x_vnd = max(0.0, (cur_td_vnd + base_n_vnd - orig_row['T. Tiền']) * 0.999)
        
        ratio = 1.0
        if t_x_sl > 0: ratio = min(ratio, limit_x_sl / t_x_sl)
        if t_x_vnd > 0: ratio = min(ratio, limit_x_vnd / t_x_vnd)
        
        s_x_sl = t_x_sl * ratio; s_x_vnd = t_x_vnd * ratio
        f_x_sl = orig_row['Số Lượng .1'] + s_x_sl
        f_x_vnd = orig_row['T. Tiền'] + s_x_vnd
        
        updated_vals[m_name][item_name] = {
            'td_sl': cur_td_sl, 'td_vnd': cur_td_vnd,
            'n_sl': base_n_sl, 'n_vnd': base_n_vnd,
            'x_sl': f_x_sl, 'x_vnd': f_x_vnd
        }
        cur_td_sl = cur_td_sl + base_n_sl - f_x_sl
        cur_td_vnd = cur_td_vnd + base_n_vnd - f_x_vnd
        dist_n_sl += t_n_sl; dist_n_vnd += t_n_vnd
        dist_x_sl += s_x_sl; dist_x_vnd += s_x_vnd

    m12_name = 'T12 CHÍNH'
    m12_mask = sheets[m12_name]['Tên Hàng'] == item_name
    if m12_mask.any():
        orig12 = sheets[m12_name][m12_mask].iloc[0]
        updated_vals[m12_name][item_name] = {
            'td_sl': max(0.0, cur_td_sl), 'td_vnd': max(0.0, cur_td_vnd),
            'n_sl': orig12['Số Lượng'] - dist_n_sl, 'n_vnd': orig12['T.Tiền'] - dist_n_vnd,
            'x_sl': orig12['Số Lượng .1'] - dist_x_sl, 'x_vnd': orig12['T. Tiền'] - dist_x_vnd
        }
    item_targets[item_name].update({'act_n_vnd': dist_n_vnd, 'act_n_sl': dist_n_sl, 'act_x_vnd': dist_x_vnd, 'act_x_sl': dist_x_sl})

print("Saving changes...")
for m_name in [f'Tháng {i}' for i in range(1, 12)] + ['T12 CHÍNH']:
    df = sheets[m_name]
    for idx, row in df.iterrows():
        name = row['Tên Hàng']
        if name in updated_vals[m_name]:
            u = updated_vals[m_name][name]
            df.at[idx, 'Số Lượng '] = u['td_sl']; df.at[idx, 'T,Tiền'] = u['td_vnd']
            df.at[idx, 'Số Lượng'] = u['n_sl'] ; df.at[idx, 'T.Tiền'] = u['n_vnd']
            df.at[idx, 'Số Lượng .1'] = u['x_sl']; df.at[idx, 'T. Tiền'] = u['x_vnd']
            df.at[idx, 'Số Lượng .2'] = max(0.0, u['td_sl'] + u['n_sl'] - u['x_sl'])
            df.at[idx, 'T.Tiền.1'] = max(0.0, u['td_vnd'] + u['n_vnd'] - u['x_vnd'])
    
    total_idx = df[df['Tên Hàng'].isna() | (df['Tên Hàng'] == 'TỔNG CỘNG')].index
    if not total_idx.empty:
        for c in numeric_cols_m: df.at[total_idx[0], c] = df[df['Tên Hàng'].notna() & (df['Tên Hàng'] != 'TỔNG CỘNG')][c].sum()

for idx, row in sheets['xnt12thang'].iterrows():
    name = row['Tên Hàng']
    if name in item_targets:
        t = item_targets[name]
        for i in range(1, 12):
            w = MONTH_WEIGHTS[i-1]
            sheets['xnt12thang'].at[idx, f'Nhập VNĐ T{i}'] += t['act_n_vnd'] * w
            sheets['xnt12thang'].at[idx, f'Nhập SL T{i}'] += t['act_n_sl'] * w
            sheets['xnt12thang'].at[idx, f'Xuất VNĐ T{i}'] += t['act_x_vnd'] * w
            sheets['xnt12thang'].at[idx, f'Xuất SL T{i}'] += t['act_x_sl'] * w
        sheets['xnt12thang'].at[idx, 'Nhập VNĐ T12'] -= t['act_n_vnd']
        sheets['xnt12thang'].at[idx, 'Xuất VNĐ T12'] -= t['act_x_vnd']

t_mask = sheets['xnt12thang']['Tên Hàng'] == 'TỔNG CỘNG'
if t_mask.any():
    for c in sum_numeric: sheets['xnt12thang'].loc[t_mask, c] = sheets['xnt12thang'].loc[sheets['xnt12thang']['Mã Hàng'].notna(), c].sum()

with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in sheets.items():
        df.to_excel(writer, sheet_name=name, index=False, startrow=original_headers[name])
print("Final Complete.")
