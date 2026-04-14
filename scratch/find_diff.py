import pandas as pd
diff = 187689248334 - 184594781025
print(f"Dr Difference: {diff:,.0f}")

cr_diff = 185510628845 - 184590424094
print(f"Cr Difference: {cr_diff:,.0f}")

p = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(p, sheet_name='1121')
df = df.iloc[:-1] # ignore tong cong

# Let's find rows with this exact amount
print(df[df['Phát sinh Nợ'] == diff])

# Let's see if there are 2024 dates or something parsed as 2023?
# Or maybe the dates were like 01/01/2023 and some transactions were excluded by the user?
# Wait, user might have used TONG_HOP file. 
print("Is the difference equal to the sum of a specific month?")
df['month'] = pd.to_datetime(df['Ngày hạch toán']).dt.month
print(df.groupby('month')['Phát sinh Nợ'].sum())
