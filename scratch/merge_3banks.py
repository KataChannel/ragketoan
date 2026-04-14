import pandas as pd
import numpy as np

bidv_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ BIDV 2023 CHÍNH.xls'
vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vtb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/sao kê VTB23.xls'
out_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/TONG_HOP_3_NGAN_HANG_2023.xlsx'

# ============ 1. Parse BIDV ============
bidv_raw = pd.read_excel(bidv_path, sheet_name='SAO KÊ', header=None)
h_idx = -1
for i in range(20):
    if any('NGÀY' in str(x).upper() for x in bidv_raw.iloc[i].dropna().values):
        h_idx = i
        break

# Row after header: first row is "SỐ DƯ ĐK"
bidv_df = bidv_raw.iloc[h_idx+1:].copy()
# Cols: 0=STT, 1=NGÀY, 2=SỐ PHIẾU, 3=DIỄN GIẢI, 4=TK 112, 5=TK ĐỐI ỨNG, 6=ĐẦU KỲ, 7=PS NỢ, 8=PS CÓ, 9=DƯ CKY
bidv_data = []
for idx, row in bidv_df.iterrows():
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date): continue
    ref = str(row[2]) if not pd.isna(row[2]) else ''
    desc = str(row[3]) if not pd.isna(row[3]) else ''
    tk = str(row[5]).strip() if not pd.isna(row[5]) else ''
    dr = pd.to_numeric(row[7], errors='coerce')
    cr = pd.to_numeric(row[8], errors='coerce')
    bal = pd.to_numeric(row[9], errors='coerce')
    bidv_data.append({
        'Ngày': date, 'Số phiếu': ref, 'Diễn giải': desc,
        'TK Đối ứng': tk,
        'PS Nợ': dr if not pd.isna(dr) else 0,
        'PS Có': cr if not pd.isna(cr) else 0,
        'Số dư': bal if not pd.isna(bal) else np.nan,
        'Ngân hàng': 'BIDV'
    })

# ============ 2. Parse VCB ============
vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023')
# Cols: 0=info, 1=Ngày hạch toán, 2=Ngày chứng từ, 3=Số chứng từ, 4=Diễn giải, 5=TK đối ứng, 6=Thu, 7=Chi, 8=Tồn
vcb_data = []
for idx, row in vcb_raw.iterrows():
    date_str = str(row.iloc[1]).strip()
    if date_str in ('Ngày hạch toán', 'nan'): continue
    if len(date_str) == 9 and date_str[5:9] == '2023':
        date_str = date_str[:5] + '/' + date_str[5:]
    date = pd.to_datetime(date_str, format='%d/%m/%Y', errors='coerce')
    if pd.isna(date): date = pd.to_datetime(date_str, errors='coerce')
    if pd.isna(date): continue
    ref = str(row.iloc[3]) if not pd.isna(row.iloc[3]) else ''
    desc = str(row.iloc[4]) if not pd.isna(row.iloc[4]) else ''
    tk = str(row.iloc[5]).strip() if not pd.isna(row.iloc[5]) else ''
    if tk == 'nan': tk = ''
    dr = pd.to_numeric(row.iloc[6], errors='coerce')
    cr = pd.to_numeric(row.iloc[7], errors='coerce')
    bal = pd.to_numeric(row.iloc[8], errors='coerce')
    vcb_data.append({
        'Ngày': date, 'Số phiếu': ref, 'Diễn giải': desc,
        'TK Đối ứng': tk,
        'PS Nợ': dr if not pd.isna(dr) else 0,
        'PS Có': cr if not pd.isna(cr) else 0,
        'Số dư': bal if not pd.isna(bal) else np.nan,
        'Ngân hàng': 'VCB'
    })

# ============ 3. Parse VTB ============
vtb_raw = pd.read_excel(vtb_path, sheet_name='SAO KÊ VTB ', header=None)
h_idx = -1
for i in range(20):
    if any('NGÀY' in str(x).upper() for x in vtb_raw.iloc[i].dropna().values):
        h_idx = i
        break
vtb_df = vtb_raw.iloc[h_idx+2:].copy()
# Cols: 0=STT, 1=NGÀY, 2=SỐ PHIẾU, 3=DIỄN GIẢI, 4=TK ĐỐI ỨNG, 5=PS NỢ, 6=PS CÓ, 7=DƯ CK
vtb_data = []
for idx, row in vtb_df.iterrows():
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date): continue
    ref = str(row[2]) if not pd.isna(row[2]) else ''
    desc = str(row[3]) if not pd.isna(row[3]) else ''
    tk = str(row[4]).strip() if not pd.isna(row[4]) else ''
    if tk == 'nan': tk = ''
    dr = pd.to_numeric(row[5], errors='coerce')
    cr = pd.to_numeric(row[6], errors='coerce')
    bal = pd.to_numeric(row[7], errors='coerce')
    vtb_data.append({
        'Ngày': date, 'Số phiếu': ref, 'Diễn giải': desc,
        'TK Đối ứng': tk,
        'PS Nợ': dr if not pd.isna(dr) else 0,
        'PS Có': cr if not pd.isna(cr) else 0,
        'Số dư': bal if not pd.isna(bal) else np.nan,
        'Ngân hàng': 'VTB'
    })

# ============ Merge ============
all_data = bidv_data + vcb_data + vtb_data
df = pd.DataFrame(all_data)
df['Ngày'] = pd.to_datetime(df['Ngày']).dt.normalize()
df = df.sort_values(by=['Ngày', 'Ngân hàng']).reset_index(drop=True)

# Print stats
print(f"BIDV: {len(bidv_data)} rows")
print(f"VCB:  {len(vcb_data)} rows")
print(f"VTB:  {len(vtb_data)} rows")
print(f"TOTAL: {len(df)} rows")

# Filter only 2023
df_2023 = df[(df['Ngày'] >= '2023-01-01') & (df['Ngày'] <= '2023-12-31')].copy()
df_not2023 = df[(df['Ngày'] < '2023-01-01') | (df['Ngày'] > '2023-12-31')]
print(f"\n2023 only: {len(df_2023)} rows")
print(f"Non-2023:  {len(df_not2023)} rows")

# Print per-bank sums
for bank in ['BIDV', 'VCB', 'VTB']:
    sub = df_2023[df_2023['Ngân hàng'] == bank]
    print(f"  {bank} 2023: Dr={sub['PS Nợ'].sum():,.0f}, Có={sub['PS Có'].sum():,.0f}")

total_dr = df_2023['PS Nợ'].sum()
total_cr = df_2023['PS Có'].sum()
print(f"\n  TỔNG 2023: Nợ={total_dr:,.0f}, Có={total_cr:,.0f}")

# Add STT column
df_2023 = df_2023.reset_index(drop=True)
df_2023.insert(0, 'STT', range(1, len(df_2023) + 1))

# Add summary row
summary = {
    'STT': '',
    'Ngày': 'TỔNG CỘNG',
    'Số phiếu': '',
    'Diễn giải': '',
    'TK Đối ứng': '',
    'PS Nợ': total_dr,
    'PS Có': total_cr,
    'Số dư': '',
    'Ngân hàng': ''
}
df_out = pd.concat([df_2023, pd.DataFrame([summary])], ignore_index=True)

# Write
with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
    df_out.to_excel(writer, sheet_name='TỔNG HỢP 3 NH', index=False)

print(f"\nSaved to: {out_path}")
