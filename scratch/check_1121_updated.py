import pandas as pd
ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
df = pd.read_excel(ledger_path, sheet_name='1121')
print("Len 1121:", len(df))
print("First 5:")
print(df.head(5).to_string())
print("Last 5:")
print(df.tail(5).to_string())
