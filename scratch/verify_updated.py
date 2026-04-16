import pandas as pd
path_updated = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023_UPDATED.xlsx"
df = pd.read_excel(path_updated)
# Filter for bank rows
bank_rows = df[(df['dr'].astype(str).str.startswith('112')) | (df['cr'].astype(str).str.startswith('112'))]
print("New bank rows sample:")
print(bank_rows.head(20).to_string())
print(f"Total bank rows: {len(bank_rows)}")
