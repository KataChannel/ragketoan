import pandas as pd
path_source = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"
df = pd.read_excel(path_source)
df['dt_parsed'] = pd.to_datetime(df['Unnamed: 0'], errors='coerce')
# Handle the string ones too
mask_str = df['Unnamed: 0'].apply(lambda x: isinstance(x, str))
# (Simplified for now)
bad_dates = df[df['dt_parsed'].dt.year != 2023]
print("Bad date descriptions:")
print(bad_dates[['Unnamed: 0', 'Số dư đầu kỳ']].head(20))
