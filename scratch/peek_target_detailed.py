import pandas as pd
path_target = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
df = pd.read_excel(path_target, nrows=20)
print(df.to_string())
