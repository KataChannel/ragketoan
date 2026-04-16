import pandas as pd
path_source = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"
df = pd.read_excel(path_source)

def parse_date(d):
    if pd.isna(d): return d
    if isinstance(d, pd.Timestamp): return d
    s = str(d).strip()
    if '/' in s:
        if len(s) == 9 and s[2] == '/':
             return pd.to_datetime(s[:2] + '/' + s[3:5] + '/' + s[5:], dayfirst=True)
    return pd.to_datetime(s, errors='coerce')

df['dt_parsed'] = df['Unnamed: 0'].apply(parse_date)
bad_dates = df[df['dt_parsed'].dt.year != 2023]
print("Rows with year != 2023:")
print(bad_dates[['Unnamed: 0', 'dt_parsed']].head(20))
print(f"Total bad dates: {len(bad_dates)}")
