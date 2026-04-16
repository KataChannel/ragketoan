import pandas as pd
from datetime import datetime

df = pd.read_excel('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx', header=None)
df = df.iloc[1:-1]

invalid_rows = []
for i, r in df.iterrows():
    dt = r[0]
    try:
        d = pd.to_datetime(dt, dayfirst=True, errors='raise')
    except:
        invalid_rows.append(r)

if invalid_rows:
    df_inv = pd.DataFrame(invalid_rows)
    print(df_inv[[0, 1, 2, 4, 5]].to_string())
else:
    print("No invalid dates found with raise.")
