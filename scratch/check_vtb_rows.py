import pandas as pd
df = pd.read_excel("/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP/sao ke VTB T1.2024.xls", header=None)
print(df.iloc[15:25].to_string())
