import pandas as pd
ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(ledger_path, sheet_name='1121')
# The summary row is the last one now, and maybe the first one is Dư đầu kỳ
df = df.iloc[:-1] # drop tổng cộng
df = df[df['Diễn giải'] != 'Số dư đầu kỳ']

# Let's sum based on 'Số chứng từ' prefix to guess the bank
sum_bidv_dr = df[df['Số chứng từ'] == 'GD_BIDV']['Phát sinh Nợ'].sum()
sum_bidv_cr = df[df['Số chứng từ'] == 'GD_BIDV']['Phát sinh Có'].sum()

sum_vcb_dr = df[df['Số chứng từ'] == 'GD_VCB']['Phát sinh Nợ'].sum()
sum_vcb_cr = df[df['Số chứng từ'] == 'GD_VCB']['Phát sinh Có'].sum()

sum_vtb_dr = df[df['Số chứng từ'] == 'GD_VTB']['Phát sinh Nợ'].sum()
sum_vtb_cr = df[df['Số chứng từ'] == 'GD_VTB']['Phát sinh Có'].sum()

# Also sum those that might have real ref codes
# Let's just create a more robust way to track which bank contributed what
# We need to re-run the parse and count
import numpy as np

# 1. Parse BIDV
bidv_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ BIDV 2023 CHÍNH.xls'
bidv_raw = pd.read_excel(bidv_path, sheet_name='SAO KÊ', header=None)
h_idx = -1
for i in range(20):
    if any('NGÀY' in str(x).upper() for x in bidv_raw.iloc[i].dropna().values):
        h_idx = i
        break
bidv_df = bidv_raw.iloc[h_idx+1:].copy()
bidv_dr_2023 = 0
bidv_cr_2023 = 0
for idx, row in bidv_df.iterrows():
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date) or date.year != 2023: continue
    dr = pd.to_numeric(row[7], errors='coerce')
    cr = pd.to_numeric(row[8], errors='coerce')
    bidv_dr_2023 += dr if not pd.isna(dr) else 0
    bidv_cr_2023 += cr if not pd.isna(cr) else 0

print(f"BIDV 2023 DDr: {bidv_dr_2023:,.0f}, Cr: {bidv_cr_2023:,.0f}")

# 2. Parse VCB
vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023')
vcb_dr_2023 = 0
vcb_cr_2023 = 0
for idx, row in vcb_raw.iterrows():
    date_str = str(row.iloc[1]).strip()
    if date_str == 'Ngày hạch toán' or date_str == 'nan': continue
    if len(date_str) == 9 and date_str[5:9] == '2023':  # e.g. 03/012023 -> 03/01/2023
        date_str = date_str[:5] + '/' + date_str[5:]
    date = pd.to_datetime(date_str, format='%d/%m/%Y', errors='coerce')
    if pd.isna(date): date = pd.to_datetime(date_str, errors='coerce')
    if pd.isna(date) or date.year != 2023: continue
    dr = pd.to_numeric(row.iloc[6], errors='coerce')
    cr = pd.to_numeric(row.iloc[7], errors='coerce')
    vcb_dr_2023 += dr if not pd.isna(dr) else 0
    vcb_cr_2023 += cr if not pd.isna(cr) else 0

print(f"VCB 2023 DDr: {vcb_dr_2023:,.0f}, Cr: {vcb_cr_2023:,.0f}")

# 3. Parse VTB
vtb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/sao kê VTB23.xls'
vtb_raw = pd.read_excel(vtb_path, sheet_name='SAO KÊ VTB ', header=None)
h_idx = -1
for i in range(20):
    if any('NGÀY' in str(x).upper() for x in vtb_raw.iloc[i].dropna().values):
        h_idx = i
        break
vtb_df = vtb_raw.iloc[h_idx+2:].copy()
vtb_dr_2023 = 0
vtb_cr_2023 = 0
for idx, row in vtb_df.iterrows():
    date = pd.to_datetime(row[1], errors='coerce')
    if pd.isna(date) or date.year != 2023: continue
    dr = pd.to_numeric(row[5], errors='coerce')
    cr = pd.to_numeric(row[6], errors='coerce')
    vtb_dr_2023 += dr if not pd.isna(dr) else 0
    vtb_cr_2023 += cr if not pd.isna(cr) else 0

print(f"VTB 2023 DDr: {vtb_dr_2023:,.0f}, Cr: {vtb_cr_2023:,.0f}")

print(f"TOTAL 2023 Dr: {bidv_dr_2023 + vcb_dr_2023 + vtb_dr_2023:,.0f}")
print(f"TOTAL 2023 Cr: {bidv_cr_2023 + vcb_cr_2023 + vtb_cr_2023:,.0f}")
