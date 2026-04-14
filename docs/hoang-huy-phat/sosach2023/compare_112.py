import pandas as pd

# 1. Load SCT data
df_sct_full = pd.read_excel('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx', sheet_name='1121')
df_sct = df_sct_full[(df_sct_full['Diễn giải'] != 'SỐ DƯ ĐẦU KỲ') & (df_sct_full['Diễn giải'] != 'TỔNG CỘNG')].copy()
df_sct['TK Đối ứng'] = df_sct['TK Đối ứng'].astype(str).str.replace('.0', '', regex=False).str[:3]
s_sct = df_sct.groupby('TK Đối ứng').agg({'Phát sinh Nợ': 'sum', 'Phát sinh Có': 'sum'}).reset_index()

# 2. Load Raw Bank data
df_raw_full = pd.read_excel('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/TONG_HOP_3_NGAN_HANG_2023.xlsx')
df_raw = df_raw_full.dropna(subset=['PS Nợ', 'PS Có'], how='all').copy()
df_raw['TK Đối ứng'] = df_raw['TK Đối ứng'].astype(str).str.replace('.0', '', regex=False).str.strip().str[:3]
s_raw = df_raw.groupby('TK Đối ứng').agg({'PS Nợ': 'sum', 'PS Có': 'sum'}).reset_index()

# 3. Merge and Compare
merged = pd.merge(s_sct, s_raw, on='TK Đối ứng', how='outer', suffixes=('_SCT', '_Raw')).fillna(0)
merged['Diff Nợ'] = merged['Phát sinh Nợ'] - merged['PS Nợ']
merged['Diff Có'] = merged['Phát sinh Có'] - merged['PS Có']

# 4. Print Table
print('| TK | Nợ (SCT) | Nợ (Raw) | Chênh lệch Nợ | Có (SCT) | Có (Raw) | Chênh lệch Có |')
print('| :--- | ---: | ---: | ---: | ---: | ---: | ---: |')
for r in merged.itertuples():
    print(f'| {r[1]} | {r[2]:,.0f} | {r[4]:,.0f} | {r[6]:,.0f} | {r[3]:,.0f} | {r[5]:,.0f} | {r[7]:,.0f} |')
