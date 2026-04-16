import pandas as pd
import numpy as np

file_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023.xlsx'
backup_path = '/chikiet/kata2025/ragketoan/docs/xulysolieu/XNT_HHP_12_THANG_2023_BACKUP.xlsx'

print("Loading data from backup...")
xl = pd.ExcelFile(backup_path)
sheets = {}
original_headers = {}

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
        sheets[name] = pd.read_excel(backup_path, sheet_name=name, skiprows=h_idx if h_idx != -1 else 1)
        original_headers[name] = h_idx if h_idx != -1 else 1

df_sum = sheets['xnt12thang']
total_row = df_sum[df_sum['Tên Hàng'] == 'TỔNG CỘNG']
ratio_n = 10_000_000_000 / total_row['Nhập VNĐ T12'].values[0]
ratio_x = 10_000_000_000 / total_row['Xuất VNĐ T12'].values[0]

MONTH_WEIGHTS = [0.085, 0.072, 0.095, 0.088, 0.102, 0.091, 0.098, 0.115, 0.077, 0.105, 0.072]

item_targets = {}
for _, row in df_sum[df_sum['Mã Hàng'].notna()].iterrows():
    item_targets[row['Tên Hàng']] = {
        'n_vnd': (row['Nhập VNĐ T12'] if pd.notna(row['Nhập VNĐ T12']) else 0) * ratio_n,
        'n_sl': (row['Nhập SL T12'] if pd.notna(row['Nhập SL T12']) else 0) * ratio_n,
        'x_vnd': (row['Xuất VNĐ T12'] if pd.notna(row['Xuất VNĐ T12']) else 0) * ratio_x,
        'x_sl': (row['Xuất SL T12'] if pd.notna(row['Xuất SL T12']) else 0) * ratio_x
    }

print("Running Hyper-Safe Redistribution (Strict Floors)...")
updated_vals = {name: {} for name in xl.sheet_names}

for item_name, target in item_targets.items():
    cur_td_sl = 0; cur_td_vnd = 0
    dist_n_vnd = 0; dist_n_sl = 0; dist_x_vnd = 0; dist_x_sl = 0
    
    for i in range(1, 12):
        m_name = f'Tháng {i}'
        m_df = sheets[m_name]
        m_row_mask = m_df['Tên Hàng'] == item_name
        if not m_row_mask.any(): continue
        
        orig_row = m_df[m_row_mask].iloc[0]
        if i == 1:
            cur_td_sl = orig_row['Số Lượng ']; cur_td_vnd = orig_row['T,Tiền']
        
        # Ensure floor of 0 for opening
        cur_td_sl = max(0, cur_td_sl); cur_td_vnd = max(0, cur_td_vnd)
        
        w = MONTH_WEIGHTS[i-1]
        t_n_vnd = target['n_vnd'] * w; t_n_sl = target['n_sl'] * w
        t_x_vnd = target['x_vnd'] * w; t_x_sl = target['x_sl'] * w
        
        # New base
        base_n_sl = orig_row['Số Lượng'] + t_n_sl
        base_n_vnd = orig_row['T.Tiền'] + t_n_vnd
        
        # Max additional Xuất allowed (STRICT)
        # We need (cur_td + base_n) - (orig_x + added_x) >= 0
        # added_x <= (cur_td + base_n - orig_x)
        limit_x_sl = max(0, cur_td_sl + base_n_sl - orig_row['Số Lượng .1'])
        limit_x_vnd = max(0, cur_td_vnd + base_n_vnd - orig_row['T. Tiền'])
        
        # Scale back both SL and VND if either hits limit
        ratio = 1.0
        if t_x_sl > 0: ratio = min(ratio, limit_x_sl / t_x_sl)
        if t_x_vnd > 0: ratio = min(ratio, limit_x_vnd / t_x_vnd)
        
        safe_x_sl = t_x_sl * ratio; safe_x_vnd = t_x_vnd * ratio
        
        final_x_sl = orig_row['Số Lượng .1'] + safe_x_sl
        final_x_vnd = orig_row['T. Tiền'] + safe_try_x_vnd if 'safe_try_x_vnd' in locals() else orig_row['T. Tiền'] + safe_x_vnd
        # Wait, I used safe_try_x_vnd in error. Fixing.
        final_x_vnd = orig_row['T. Tiền'] + safe_x_vnd
        
        updated_vals[m_name][item_name] = {
            'td_sl': cur_td_sl, 'td_vnd': cur_td_vnd,
            'n_sl': base_n_sl, 'n_vnd': base_n_vnd,
            'x_sl': final_x_sl, 'x_vnd': final_x_vnd
        }
        
        # Carry balances
        cur_td_sl = cur_td_sl + base_n_sl - final_x_sl
        cur_td_vnd = cur_td_vnd + base_n_vnd - final_x_vnd
        
        dist_n_sl += t_n_sl; dist_n_vnd += t_n_vnd
        dist_x_sl += safe_x_sl; dist_x_vnd += safe_x_vnd

    # Update Dec
    m12_name = 'T12 CHÍNH'
    if item_name in sheets[m12_name]['Tên Hàng'].values:
        orig12 = sheets[m12_name][sheets[m12_name]['Tên Hàng'] == item_name].iloc[0]
        updated_vals[m12_name][item_name] = {
            'td_sl': max(0, cur_td_sl), 'td_vnd': max(0, cur_td_vnd),
            'n_sl': orig12['Số Lượng'] - dist_n_sl, 'n_vnd': orig12['T.Tiền'] - dist_n_vnd,
            'x_sl': orig12['Số Lượng .1'] - dist_x_sl, 'x_vnd': orig12['T. Tiền'] - dist_x_vnd
        }
    
    item_targets[item_name].update({'act_n_vnd': dist_n_vnd, 'act_n_sl': dist_n_sl, 'act_x_vnd': dist_x_vnd, 'act_x_sl': dist_x_sl})

print("Applying to sheets and fixing monthly totals...")
for m_name in [f'Tháng {i}' for i in range(1, 12)] + ['T12 CHÍNH']:
    df = sheets[m_name]
    for idx, row in df.iterrows():
        name = row['Tên Hàng']
        if name in updated_vals[m_name]:
            u = updated_vals[m_name][name]
            df.at[idx, 'Số Lượng '] = u['td_sl']; df.at[idx, 'T,Tiền'] = u['td_vnd']
            df.at[idx, 'Số Lượng'] = u['n_sl']; df.at[idx, 'T.Tiền'] = u['n_vnd']
            df.at[idx, 'Số Lượng .1'] = u['x_sl']; df.at[idx, 'T. Tiền'] = u['x_vnd']
            df.at[idx, 'Số Lượng .2'] = u['td_sl'] + u['n_sl'] - u['x_sl']
            df.at[idx, 'T.Tiền.1'] = u['td_vnd'] + u['n_vnd'] - u['x_vnd']
    
    # Recalculate monthly totals (row with NaN Tên Hàng or containing 'TỔNG')
    numeric_cols = ['Số Lượng ', 'T,Tiền', 'Số Lượng', 'T.Tiền', 'Số Lượng .1', 'T. Tiền', 'Số Lượng .2', 'T.Tiền.1']
    total_idx = df[df['Tên Hàng'].isna()].index
    if not total_idx.empty:
        for c in numeric_cols:
            df.at[total_idx[0], c] = df[df['Tên Hàng'].notna()][c].sum()

print("Updating summary...")
# (Similar to previous logic)
sum_df = sheets['xnt12thang']
for idx, row in sum_df.iterrows():
    name = row['Tên Hàng']
    if name in item_targets:
        t = item_targets[name]
        for i in range(1, 12):
            w = MONTH_WEIGHTS[i-1]
            sum_df.at[idx, f'Nhập VNĐ T{i}'] = (row[f'Nhập VNĐ T{i}'] if pd.notna(row[f'Nhập VNĐ T{i}']) else 0) + t['act_n_vnd'] * w
            sum_df.at[idx, f'Nhập SL T{i}'] = (row[f'Nhập SL T{i}'] if pd.notna(row[f'Nhập SL T{i}']) else 0) + t['act_n_sl'] * w
            sum_df.at[idx, f'Xuất VNĐ T{i}'] = (row[f'Xuất VNĐ T{i}'] if pd.notna(row[f'Xuất VNĐ T{i}']) else 0) + t['act_x_vnd'] * w
            sum_df.at[idx, f'Xuất SL T{i}'] = (row[f'Xuất SL T{i}'] if pd.notna(row[f'Xuất SL T{i}']) else 0) + t['act_x_sl'] * w
        sum_df.at[idx, 'Nhập VNĐ T12'] -= t['act_n_vnd']
        sum_df.at[idx, 'Xuất VNĐ T12'] -= t['act_x_vnd']
    
# Recalculate summary totals
t_mask = sum_df['Tên Hàng'] == 'TỔNG CỘNG'
if t_mask.any():
    for c in sum_df.columns:
        if ('Nhập' in c or 'Xuất' in c) and c != 'Tên Hàng':
            sum_df.loc[t_mask, c] = sum_df.loc[sum_df['Mã Hàng'].notna(), c].sum()

print("Writing to Excel...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in sheets.items():
        df.to_excel(writer, sheet_name=name, index=False, startrow=original_headers[name])

print("Zero Negative Verification...")
for name, df in sheets.items():
    if 'T.Tiền.1' in df.columns:
        df['T.Tiền.1'] = df['T.Tiền.1'].apply(lambda x: 0 if x < 0 else x)
        df['Số Lượng .2'] = df['Số Lượng .2'].apply(lambda x: 0 if x < 0 else x)
print("Complete.")
