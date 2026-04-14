import pandas as pd

ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(ledger_path, sheet_name='1121')
df = df.iloc[:-1] # drop tổng cộng
df = df[df['Diễn giải'] != 'Số dư đầu kỳ']

# Find sum of transactions that are internal transfers (transfer from own account to another)
# For example, look for "1121" or "HHP" or "Hoàng Huy Phát" in description
internal_keywords = ['chuyển tiền tài khoản', 'huy phát', 'hhp', 'hoang huy phat', 'sang tk', 'từ tk', 'nh nnt', 'từ gd']
internal_mask = df['Diễn giải'].str.lower().str.contains('|'.join(internal_keywords), na=False)

internal_dr = df[internal_mask]['Phát sinh Nợ'].sum()
internal_cr = df[internal_mask]['Phát sinh Có'].sum()

print("Internal Dr:", internal_dr)
print("Internal Cr:", internal_cr)
