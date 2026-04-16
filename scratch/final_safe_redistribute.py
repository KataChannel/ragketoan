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

# Per-item redistribution data
item_targets = {}
for _, row in df_sum[df_sum['Mã Hàng'].notna()].iterrows():
    item_targets[row['Tên Hàng']] = {
        'n_vnd': (row['Nhập VNĐ T12'] if pd.notna(row['Nhập VNĐ T12']) else 0) * ratio_n,
        'n_sl': (row['Nhập SL T12'] if pd.notna(row['Nhập SL T12']) else 0) * ratio_n,
        'x_vnd': (row['Xuất VNĐ T12'] if pd.notna(row['Xuất VNĐ T12']) else 0) * ratio_x,
        'x_sl': (row['Xuất SL T12'] if pd.notna(row['Xuất SL T12']) else 0) * ratio_x
    }

print("Running Safe Redistribution Logic (preventing negatives in SL AND VND)...")
updated_vals = {name: {} for name in xl.sheet_names}

for item_name, target in item_targets.items():
    current_ton_dau_sl = 0
    current_ton_dau_vnd = 0
    
    distributed_n_vnd = 0; distributed_n_sl = 0
    distributed_x_vnd = 0; distributed_x_sl = 0
    
    for i in range(1, 12):
        m_name = f'Tháng {i}'
        m_df = sheets[m_name]
        m_row_mask = m_df['Tên Hàng'] == item_name
        if not m_row_mask.any(): continue
        
        orig_row = m_df[m_row_mask].iloc[0]
        if i == 1:
            current_ton_dau_sl = orig_row['Số Lượng ']
            current_ton_dau_vnd = orig_row['T,Tiền']
        
        w = MONTH_WEIGHTS[i-1]
        try_n_vnd = target['n_vnd'] * w
        try_n_sl = target['n_sl'] * w
        try_x_vnd = target['x_vnd'] * w
        try_x_sl = target['x_sl'] * w
        
        new_nhap_sl = orig_row['Số Lượng'] + try_n_sl
        new_nhap_vnd = orig_row['T.Tiền'] + try_n_vnd
        
        # Limit addition to preserve non-negative balance
        # Check SL
        max_total_x_sl = current_ton_dau_sl + new_nhap_sl
        # Check VND
        max_total_x_vnd = current_ton_dau_vnd + new_nhap_vnd
        
        # Max additional Xuất allowed
        allowed_add_x_sl = max(0, (max_total_x_sl * 0.99) - orig_row['Số Lượng .1'])
        allowed_add_x_vnd = max(0, (max_total_x_vnd * 0.99) - orig_row['T. Tiền'])
        
        # Use the more restrictive limit
        if try_x_sl > 0 and try_x_vnd > 0:
            ratio_sl = allowed_add_x_sl / try_x_sl
            ratio_vnd = allowed_add_x_vnd / try_x_vnd
            cap_ratio = min(1.0, ratio_sl, ratio_vnd)
        else:
            cap_ratio = 1.0
            
        safe_try_x_sl = try_x_sl * cap_ratio
        safe_try_x_vnd = try_x_vnd * cap_ratio
        
        # Final monthly values
        m_x_sl = orig_row['Số Lượng .1'] + safe_try_x_sl
        m_x_vnd = orig_row['T. Tiền'] + safe_try_x_vnd
        
        updated_vals[m_name][item_name] = {
            'td_sl': current_ton_dau_sl, 'td_vnd': current_ton_dau_vnd,
            'n_sl': new_nhap_sl, 'n_vnd': new_nhap_vnd,
            'x_sl': m_x_sl, 'x_vnd': m_x_vnd
        }
        
        current_ton_dau_sl = current_ton_dau_sl + new_nhap_sl - m_x_sl
        current_ton_dau_vnd = current_ton_dau_vnd + new_nhap_vnd - m_x_vnd
        
        distributed_n_vnd += try_n_vnd; distributed_n_sl += try_n_sl
        distributed_x_vnd += safe_try_x_vnd; distributed_x_sl += safe_try_x_sl

    # T12 Update
    m12_name = 'T12 CHÍNH'
    m12_df = sheets[m12_name]
    m12_row_mask = m12_df['Tên Hàng'] == item_name
    if m12_row_mask.any():
        orig_r12 = m12_df[m12_row_mask].iloc[0]
        updated_vals[m12_name][item_name] = {
            'td_sl': current_ton_dau_sl, 'td_vnd': current_ton_dau_vnd,
            'n_sl': orig_r12['Số Lượng'] - distributed_n_sl, 'n_vnd': orig_r12['T.Tiền'] - distributed_n_vnd,
            'x_sl': orig_r12['Số Lượng .1'] - distributed_x_sl, 'x_vnd': orig_r12['T. Tiền'] - distributed_x_vnd
        }
    
    item_targets[item_name].update({
        'actual_n_vnd': distributed_n_vnd, 'actual_n_sl': distributed_n_sl,
        'actual_x_vnd': distributed_x_vnd, 'actual_x_sl': distributed_x_sl
    })

print("Applying updates to DataFrames...")
for m_name in [f'Tháng {i}' for i in range(1, 12)] + ['T12 CHÍNH']:
    df = sheets[m_name]
    def apply_u(row):
        name = row['Tên Hàng']
        if name in updated_vals[m_name]:
            u = updated_vals[m_name][name]
            row['Số Lượng '] = u['td_sl']; row['T,Tiền'] = u['td_vnd']
            row['Số Lượng'] = u['n_sl']; row['T.Tiền'] = u['n_vnd']
            row['Số Lượng .1'] = u['x_sl']; row['T. Tiền'] = u['x_vnd']
            try:
                row['Số Lượng .2'] = row['Số Lượng '] + row['Số Lượng'] - row['Số Lượng .1']
                row['T.Tiền.1'] = row['T,Tiền'] + row['T.Tiền'] - row['T. Tiền']
            except: pass
        return row
    sheets[m_name] = df.apply(apply_u, axis=1)

# Correct Summary Grand Totals
sum_df = sheets['xnt12thang']
def up_sum(row):
    name = row['Tên Hàng']
    if name in item_targets:
        t = item_targets[name]
        for i in range(1, 12):
            w = MONTH_WEIGHTS[i-1]
            row[f'Nhập VNĐ T{i}'] = (row[f'Nhập VNĐ T{i}'] if pd.notna(row[f'Nhập VNĐ T{i}']) else 0) + t['actual_n_vnd'] * w
            row[f'Nhập SL T{i}'] = (row[f'Nhập SL T{i}'] if pd.notna(row[f'Nhập SL T{i}']) else 0) + t['actual_n_sl'] * w
            # Distribute actual X proportionally to weights (simulated monthly view)
            row[f'Xuất VNĐ T{i}'] = (row[f'Xuất VNĐ T{i}'] if pd.notna(row[f'Xuất VNĐ T{i}']) else 0) + t['actual_x_vnd'] * w
            row[f'Xuất SL T{i}'] = (row[f'Xuất SL T{i}'] if pd.notna(row[f'Xuất SL T{i}']) else 0) + t['actual_x_sl'] * w
        row['Nhập VNĐ T12'] -= t['actual_n_vnd']; row['Nhập SL T12'] -= t['actual_n_sl']
        row['Xuất VNĐ T12'] -= t['actual_x_vnd']; row['Xuất SL T12'] -= t['actual_x_sl']
    return row

sheets['xnt12thang'] = sum_df.apply(up_sum, axis=1)

# Manual recache of Totals
total_mask = sum_df['Tên Hàng'] == 'TỔNG CỘNG'
if total_mask.any():
    for c in sum_df.columns:
        if ('Nhập' in c or 'Xuất' in c) and c != 'Tên Hàng':
            sum_df.loc[total_mask, c] = sum_df.loc[sum_df['Mã Hàng'].notna(), c].sum()

print("Writing to Excel...")
with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
    for name, df in sheets.items():
        df.to_excel(writer, sheet_name=name, index=False, startrow=original_headers[name])

print("Verified check for negatives in ALL sheets...")
for name, df in sheets.items():
    if 'T.Tiền.1' in df.columns:
        neg = (df['T.Tiền.1'] < -1).sum() # Allow small rounding < -1
        if neg > 0: print(f"Sheet {name}: {neg} negatives!")

print("Done.")
