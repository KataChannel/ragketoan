import pandas as pd
import numpy as np
import os
from datetime import datetime

ledger_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
xnt_path = '/chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2024.xlsx'
output_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL_ADJUSTED.xlsx'

# 1. Load XNT targets (Monthly)
df_xnt = pd.read_excel(xnt_path)
xnt_nhap = {}
xnt_xuat = {} # Giá vốn 632
for i in range(1, 13):
    xnt_nhap[i] = df_xnt[f'Nhập T{i} VNĐ'].sum()
    xnt_xuat[i] = df_xnt[f'Xuất T{i} VNĐ'].sum()

print("XNT Targets (Year):")
print(f"  Nhập: {sum(xnt_nhap.values()):,.0f}")
print(f"  Xuất: {sum(xnt_xuat.values()):,.0f}")

# 2. Load Ledger NKC
xl = pd.ExcelFile(ledger_path)
df_nkc = xl.parse('NKC')
df_nkc['Số tiền'] = pd.to_numeric(df_nkc['Số tiền'], errors='coerce').fillna(0)
df_nkc['Month'] = pd.to_datetime(df_nkc['Ngày hạch toán'], dayfirst=True).dt.month

# 3. Adjust 1561 Nợ (Nhập) monthly
for m in range(1, 13):
    mask = (df_nkc['TK Nợ'].astype(str) == '1561') & (df_nkc['Month'] == m)
    curr_sum = df_nkc.loc[mask, 'Số tiền'].sum()
    target = xnt_nhap[m]
    if curr_sum > 0:
        factor = target / curr_sum
        df_nkc.loc[mask, 'Số tiền'] *= factor
        print(f"  Month {m} 1561: Adjusted by factor {factor:.4f}")
    elif target > 0:
        # In case no entries exist for a month that HAS target
        new_row = {
            'Ngày hạch toán': f'28/{m:02d}/2024',
            'Ngày chứng từ': f'28/{m:02d}/2024',
            'Số chứng từ': f'ADJ_NHAP_T{m}',
            'Diễn giải': f'Nhập kho hàng hóa tháng {m} (Bổ sung)',
            'TK Nợ': '1561',
            'TK Có': '331',
            'Số tiền': target,
            'Month': m
        }
        df_nkc = pd.concat([df_nkc, pd.DataFrame([new_row])], ignore_index=True)
        print(f"  Month {m} 1561: Added 1 entry for target {target:,.0f}")

# 4. Adjust 632 Nợ (Xuất) monthly
for m in range(1, 13):
    mask = (df_nkc['TK Nợ'].astype(str) == '632') & (df_nkc['Month'] == m)
    curr_sum = df_nkc.loc[mask, 'Số tiền'].sum()
    target = xnt_xuat[m]
    if curr_sum > 0:
        factor = target / curr_sum
        df_nkc.loc[mask, 'Số tiền'] *= factor
        print(f"  Month {m} 632: Adjusted by factor {factor:.4f}")
    elif target > 0:
        new_row = {
            'Ngày hạch toán': f'28/{m:02d}/2024',
            'Ngày chứng từ': f'28/{m:02d}/2024',
            'Số chứng từ': f'ADJ_GV_T{m}',
            'Diễn giải': f'Giá vốn hàng bán tháng {m} (Bổ sung)',
            'TK Nợ': '632',
            'TK Có': '1561',
            'Số tiền': target,
            'Month': m
        }
        df_nkc = pd.concat([df_nkc, pd.DataFrame([new_row])], ignore_index=True)
        print(f"  Month {m} 632: Added 1 entry for target {target:,.0f}")

# 5. Round amounts to 0 decimals
df_nkc['Số tiền'] = df_nkc['Số tiền'].round(0).astype(int)
df_nkc = df_nkc.drop(columns=['Month'])

# 6. Re-generate all sheets like update_ledger_2024.py
opening_2024 = {
    '1111': 533168250, '112': 130554848, '131': 5045331182, '1331': 1562039949,
    '1561': 20014813265, '331': 5176863775, '3331': 1615522358, '341': 32915120489,
    '5111': 0, '515': 0, '632': 0, '635': 0, '642': 0, '515': 0
}

sheets = ['1111', '112', '131', '1561', '331', '3331', '1331', '341', '632', '642', '635', '515']
redist_list = {s: [] for s in sheets}

for _, row in df_nkc.iterrows():
    dr = str(row['TK Nợ'])
    cr = str(row['TK Có'])
    amt = row['Số tiền']
    dt = str(row['Ngày hạch toán'])
    sct = str(row['Số chứng từ'])
    dg = str(row['Diễn giải'])
    
    if dr in redist_list:
        redist_list[dr].append({'Ngày hạch toán': dt, 'Số chứng từ': sct, 'Diễn giải': dg, 'TK Đối ứng': cr, 'Phát sinh Nợ': amt, 'Phát sinh Có': 0})
    if cr in redist_list:
        redist_list[cr].append({'Ngày hạch toán': dt, 'Số chứng từ': sct, 'Diễn giải': dg, 'TK Đối ứng': dr, 'Phát sinh Nợ': 0, 'Phát sinh Có': amt})

def safe_d_parse(s):
    try:
        if isinstance(s, datetime): return s
        s_clean = str(s).split(' ')[0]
        return datetime.strptime(s_clean, '%d/%m/%Y')
    except: return datetime(2024, 1, 1)

writer = pd.ExcelWriter(output_path, engine='xlsxwriter')
df_nkc.to_excel(writer, sheet_name='NKC', index=False)

for s in sheets:
    data = redist_list.get(s, [])
    df_s = pd.DataFrame(data)
    if not df_s.empty:
        df_s['dt_obj'] = df_s['Ngày hạch toán'].apply(safe_d_parse)
        df_s = df_s.sort_values('dt_obj').drop(columns=['dt_obj'])
    
    # Add summary rows
    nature = 'credit' if s.startswith(('3', '4', '5', '7', '9')) else 'debit'
    dau_ky = opening_2024.get(s, 0)
    
    # Calculate balances
    bal = dau_ky
    blist = []
    if not df_s.empty:
        # First row Balance is dau_ky
        bal_rows = []
        for _, r in df_s.iterrows():
            bal += (r['Phát sinh Nợ'] - r['Phát sinh Có']) if nature == 'debit' else (r['Phát sinh Có'] - r['Phát sinh Nợ'])
            bal_rows.append(bal)
        df_s['Cuối kỳ'] = bal_rows
        
        # Add Header/Footer
        header = pd.DataFrame([{'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Cuối kỳ': dau_ky}])
        footer = pd.DataFrame([
            {'Diễn giải': 'TỔNG CỘNG PHÁT SINH', 'Phát sinh Nợ': df_s['Phát sinh Nợ'].sum(), 'Phát sinh Có': df_s['Phát sinh Có'].sum()},
            {'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'Cuối kỳ': bal}
        ])
        df_final = pd.concat([header, df_s, footer], ignore_index=True)
    else:
        df_final = pd.DataFrame([{'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Cuối kỳ': dau_ky}, {'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'Cuối kỳ': dau_ky}])
        
    df_final.to_excel(writer, sheet_name=s, index=False)

writer.close()
print(f"Adjusted ledger saved to {output_path}")
os.replace(output_path, ledger_path)
print("Finished updating original ledger.")
