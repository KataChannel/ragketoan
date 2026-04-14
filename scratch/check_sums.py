import pandas as pd
import numpy as np

vcb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ VCB 2023 HHP.xlsx'
vtb_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/sao kê VTB23.xls'
bidv_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/SAO KÊ BIDV 2023 CHÍNH.xls'

# Raw SUM
sum_dr = 0
sum_cr = 0

bidv_raw = pd.read_excel(bidv_path, sheet_name='SAO KÊ', header=None)
bidv_dr = pd.to_numeric(bidv_raw[7], errors='coerce').sum()
bidv_cr = pd.to_numeric(bidv_raw[8], errors='coerce').sum()
print(f"BIDV RAW Sum Dr: {bidv_dr:,.0f}, Cr: {bidv_cr:,.0f}")

vcb_raw = pd.read_excel(vcb_path, sheet_name='SAO KÊ VCB 2023', header=None)
vcb_dr = pd.to_numeric(vcb_raw[6], errors='coerce').sum()
vcb_cr = pd.to_numeric(vcb_raw[7], errors='coerce').sum()
print(f"VCB RAW Sum Dr: {vcb_dr:,.0f}, Cr: {vcb_cr:,.0f}")

vtb_raw = pd.read_excel(vtb_path, sheet_name='SAO KÊ VTB ', header=None)
vtb_dr = pd.to_numeric(vtb_raw[5], errors='coerce').sum()
vtb_cr = pd.to_numeric(vtb_raw[6], errors='coerce').sum()
print(f"VTB RAW Sum Dr: {vtb_dr:,.0f}, Cr: {vtb_cr:,.0f}")

total_raw_dr = bidv_dr + vcb_dr + vtb_dr
total_raw_cr = bidv_cr + vcb_cr + vtb_cr
print(f"TOTAL RAW -> Dr: {total_raw_dr:,.0f}, Cr: {total_raw_cr:,.0f}")

# Check 1121 inside Ledger
ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(ledger_path, sheet_name='1121')
# The summary row is the last one now
ledger_dr = df['Phát sinh Nợ'].iloc[:-1].sum()
ledger_cr = df['Phát sinh Có'].iloc[:-1].sum()
print(f"LEDGER 2023 ONLY -> Dr: {ledger_dr:,.0f}, Cr: {ledger_cr:,.0f}")
