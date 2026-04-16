import pandas as pd
path_source = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"
df = pd.read_excel(path_source)
print("Source dates sample:")
print(df['Unnamed: 0'].unique()[:50])
