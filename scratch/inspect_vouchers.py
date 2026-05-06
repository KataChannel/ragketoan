import pandas as pd
src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
df = pd.read_excel(src)

def fmt_acc(x):
    if pd.isna(x): return ""
    if isinstance(x, (int, float)): return str(int(x))
    return str(x).split('.')[0]

df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
df['TK Có'] = df['TK Có'].apply(fmt_acc)

purchase_rows = df[df['TK Có'].str.startswith('331')].head(10)
print("--- Purchase Rows (Có 331) ---")
print(purchase_rows)

if not purchase_rows.empty:
    first_voucher = purchase_rows.iloc[0]['Số chứng từ']
    print(f"\n--- Full Voucher {first_voucher} ---")
    print(df[df['Số chứng từ'] == first_voucher])
