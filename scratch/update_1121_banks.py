import pandas as pd
import numpy as np

ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
bidv_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ BIDV 2023 CHÍNH.xls'
vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vtb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/sao kê VTB23.xls'

# ============ 1. Parse BIDV ============
bidv_raw = pd.read_excel(bidv_path, sheet_name='SAO KÊ', header=None)
bidv_data = []
for i in range(9, len(bidv_raw)):
    row = bidv_raw.iloc[i]
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date): continue
    ref = str(row[2]) if not pd.isna(row[2]) else 'GD_BIDV'
    desc = str(row[3]) if not pd.isna(row[3]) else ''
    tk = str(row[5]).strip() if not pd.isna(row[5]) else ''
    dr = pd.to_numeric(row[7], errors='coerce')
    cr = pd.to_numeric(row[8], errors='coerce')
    bidv_data.append({
        'date': date.normalize(), 'ref': ref, 'desc': desc, 'tk': tk,
        'dr': dr if not pd.isna(dr) else 0,
        'cr': cr if not pd.isna(cr) else 0,
        'bank': 'BIDV'
    })
print(f"BIDV: {len(bidv_data)} rows, Dr={sum(r['dr'] for r in bidv_data):,.0f}, Cr={sum(r['cr'] for r in bidv_data):,.0f}")

# ============ 2. Parse VCB ============
vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023', header=None)
# Data rows: 5 to second-to-last (last row is the SUM row)
vcb_data = []
for i in range(5, len(vcb_raw) - 1):
    row = vcb_raw.iloc[i]
    date_str = str(row[1]).strip()
    if date_str in ('nan', 'None', 'NaT', 'Ngày hạch toán'): continue

    # Fix: "03/012023" → "03/01/2023"
    if '/' in date_str and len(date_str) >= 9:
        parts = date_str.split('/')
        if len(parts) == 2 and len(parts[1]) >= 6:
            date_str = parts[0] + '/' + parts[1][:2] + '/' + parts[1][2:]

    date = pd.to_datetime(date_str, format='%d/%m/%Y', errors='coerce')
    if pd.isna(date):
        date = pd.to_datetime(date_str, errors='coerce')
    if pd.isna(date): continue

    # Fix year 3023 → 2023
    if date.year == 3023:
        date = date.replace(year=2023)

    ref = str(row[3]) if not pd.isna(row[3]) else 'GD_VCB'
    desc = str(row[4]) if not pd.isna(row[4]) else ''
    tk = str(row[5]).strip() if not pd.isna(row[5]) else ''
    if tk == 'nan': tk = ''
    dr = pd.to_numeric(row[6], errors='coerce')
    cr = pd.to_numeric(row[7], errors='coerce')
    vcb_data.append({
        'date': date.normalize(), 'ref': ref, 'desc': desc, 'tk': tk,
        'dr': dr if not pd.isna(dr) else 0,
        'cr': cr if not pd.isna(cr) else 0,
        'bank': 'VCB'
    })
print(f"VCB:  {len(vcb_data)} rows, Dr={sum(r['dr'] for r in vcb_data):,.0f}, Cr={sum(r['cr'] for r in vcb_data):,.0f}")

# ============ 3. Parse VTB ============
vtb_raw = pd.read_excel(vtb_path, sheet_name='SAO KÊ VTB ', header=None)
vtb_data = []
for i in range(13, len(vtb_raw)):
    row = vtb_raw.iloc[i]
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date): continue
    ref = str(row[2]) if not pd.isna(row[2]) else 'GD_VTB'
    desc = str(row[3]) if not pd.isna(row[3]) else ''
    tk = str(row[4]).strip() if not pd.isna(row[4]) else ''
    if tk == 'nan': tk = ''
    dr = pd.to_numeric(row[5], errors='coerce')
    cr = pd.to_numeric(row[6], errors='coerce')
    vtb_data.append({
        'date': date.normalize(), 'ref': ref, 'desc': desc, 'tk': tk,
        'dr': dr if not pd.isna(dr) else 0,
        'cr': cr if not pd.isna(cr) else 0,
        'bank': 'VTB'
    })
print(f"VTB:  {len(vtb_data)} rows, Dr={sum(r['dr'] for r in vtb_data):,.0f}, Cr={sum(r['cr'] for r in vtb_data):,.0f}")

# ============ Merge & Sort ============
all_tx = bidv_data + vcb_data + vtb_data
df_tx = pd.DataFrame(all_tx)
df_tx = df_tx.sort_values(by=['date', 'bank']).reset_index(drop=True)

total_dr = df_tx['dr'].sum()
total_cr = df_tx['cr'].sum()
print(f"\nTỔNG: {len(df_tx)} rows, Dr={total_dr:,.0f}, Cr={total_cr:,.0f}")

# ============ Build 1121 sheet ============
opening_bal = 37628290  # known opening balance
rows_1121 = [{
    'Ngày hạch toán': pd.Timestamp('2023-01-01'),
    'Số chứng từ': '0',
    'Diễn giải': 'Số dư đầu kỳ',
    'TK Đối ứng': '',
    'Đầu kỳ': opening_bal,
    'Phát sinh Nợ': 0,
    'Phát sinh Có': 0,
    'Cuối kỳ': opening_bal
}]

cur_bal = opening_bal
for _, row in df_tx.iterrows():
    cur_bal = cur_bal + row['dr'] - row['cr']
    rows_1121.append({
        'Ngày hạch toán': row['date'],
        'Số chứng từ': row['ref'],
        'Diễn giải': row['desc'],
        'TK Đối ứng': row['tk'],
        'Đầu kỳ': 0,
        'Phát sinh Nợ': row['dr'],
        'Phát sinh Có': row['cr'],
        'Cuối kỳ': cur_bal
    })

# Add TỔNG CỘNG
rows_1121.append({
    'Ngày hạch toán': 'TỔNG CỘNG',
    'Số chứng từ': '',
    'Diễn giải': '',
    'TK Đối ứng': '',
    'Đầu kỳ': opening_bal,
    'Phát sinh Nợ': total_dr,
    'Phát sinh Có': total_cr,
    'Cuối kỳ': cur_bal
})

df_1121 = pd.DataFrame(rows_1121)

# ============ Build NKC ============
ledgers = pd.read_excel(ledger_path, sheet_name=None)
nkc = ledgers.get('NKC')
# Remove all old 1121 entries
nkc_clean = nkc[~((nkc['dr'].astype(str).str.startswith('112')) | (nkc['cr'].astype(str).str.startswith('112')))].copy()

new_nkc = []
for _, row in df_tx.iterrows():
    if row['dr'] > 0:
        new_nkc.append({
            'dt': row['date'], 'sh': row['ref'], 'desc': row['desc'],
            'dr': '1121', 'cr': row['tk'] if row['tk'] else '331',
            'amt': row['dr'], 'obj': row['bank']
        })
    if row['cr'] > 0:
        new_nkc.append({
            'dt': row['date'], 'sh': row['ref'], 'desc': row['desc'],
            'dr': row['tk'] if row['tk'] else '331', 'cr': '1121',
            'amt': row['cr'], 'obj': row['bank']
        })

nkc_final = pd.concat([nkc_clean, pd.DataFrame(new_nkc)], ignore_index=True)
nkc_final['dt'] = pd.to_datetime(nkc_final['dt'], errors='coerce')
nkc_final = nkc_final.sort_values(by=['dt', 'sh']).reset_index(drop=True)

# ============ Write all sheets ============
with pd.ExcelWriter(ledger_path, engine='openpyxl', mode='w') as writer:
    for sheet_name, df_sheet in ledgers.items():
        if sheet_name == '1121':
            df_1121.to_excel(writer, sheet_name='1121', index=False)
        elif sheet_name == 'NKC':
            nkc_final.to_excel(writer, sheet_name='NKC', index=False)
        else:
            # Remove existing TỔNG CỘNG row if present, then re-add
            last_val = str(df_sheet.iloc[-1, 0]).upper() if len(df_sheet) > 0 else ''
            if 'TỔNG CỘNG' in last_val:
                df_sheet = df_sheet.iloc[:-1]
            
            summary = {}
            for col in df_sheet.columns:
                if df_sheet[col].dtype.kind in 'bifc' and col not in ('Cuối kỳ', 'Đầu kỳ'):
                    summary[col] = df_sheet[col].sum()
                else:
                    summary[col] = np.nan
            summary[df_sheet.columns[0]] = 'TỔNG CỘNG'
            if 'Cuối kỳ' in df_sheet.columns:
                summary['Cuối kỳ'] = df_sheet['Cuối kỳ'].iloc[-1] if len(df_sheet) > 0 else 0
            if 'Đầu kỳ' in df_sheet.columns:
                summary['Đầu kỳ'] = df_sheet['Đầu kỳ'].iloc[0] if len(df_sheet) > 0 else 0

            df_out = pd.concat([df_sheet, pd.DataFrame([summary])], ignore_index=True)
            df_out.to_excel(writer, sheet_name=sheet_name, index=False)

print(f"\n✅ Đã cập nhật SO_CHI_TIET_HHP_2023.xlsx")
print(f"   1121: {len(df_1121)} rows (incl header + tổng)")
print(f"   Tổng Nợ: {total_dr:,.0f}")
print(f"   Tổng Có: {total_cr:,.0f}")
print(f"   Số dư cuối: {cur_bal:,.0f}")
