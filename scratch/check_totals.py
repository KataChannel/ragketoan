import pandas as pd
from datetime import datetime

df = pd.read_excel('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx', header=None)
df = df.iloc[1:-1]

def clean_dt(dt):
    try:
        d = pd.to_datetime(dt, dayfirst=True, errors='coerce')
        if pd.isna(d) and isinstance(dt, str) and '/' in dt:
            p = dt.split('/')
            if len(p[1]) == 6:
                return datetime(int(p[1][2:]), int(p[1][:2]), int(p[0]))
        return d
    except:
        return pd.NaT

df[0] = df[0].apply(clean_dt)
df[4] = pd.to_numeric(df[4], errors='coerce').fillna(0)
df[5] = pd.to_numeric(df[5], errors='coerce').fillna(0)

mask_2023 = df[0].dt.year == 2023
print(f"Sum Dr 2023: {df[mask_2023][4].sum():,.0f}")
print(f"Sum Cr 2023: {df[mask_2023][5].sum():,.0f}")

mask_invalid = df[0].isna()
if mask_invalid.any():
    print(f"Sum Dr Invalid Date: {df[mask_invalid][4].sum():,.0f}")
    print(f"Sum Cr Invalid Date: {df[mask_invalid][5].sum():,.0f}")

mask_2022 = df[0].dt.year == 2022
if mask_2022.any():
    print(f"Sum Dr 2022: {df[mask_2022][4].sum():,.0f}")
    print(f"Sum Cr 2022: {df[mask_2022][5].sum():,.0f}")
