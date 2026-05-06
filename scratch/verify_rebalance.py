import pandas as pd

src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
df = pd.read_excel(src)

def fmt_acc(x):
    if pd.isna(x): return ""
    if isinstance(x, (int, float)): return str(int(x))
    return str(x).split('.')[0]

df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
df['TK Có'] = df['TK Có'].apply(fmt_acc)

TARGETS = {
    "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG": {"start": 326472500, "end": 436912740},
    "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG": {"start": 638745241, "end": 396245780},
    "Công ty TNHH Phân phối Synnex FPT": {"start": 236879120, "end": 596080295},
    "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN": {"start": 1823753260, "end": 945621340},
    "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q": {"start": 126532140, "end": 326457632},
    "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ": {"start": 973654272, "end": 863487320},
    "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ": {"start": 1632594212, "end": 1065246321},
    "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT": {"start": 628542724, "end": 546812347}
}

summary = []
for s, bal in TARGETS.items():
    buys = df[(df['TK Có'].str.startswith('331')) & (df['Đối tượng'] == s)]['Số tiền'].sum()
    pays = df[(df['TK Nợ'].str.startswith('331')) & (df['Đối tượng'] == s)]['Số tiền'].sum()
    calculated_end = bal['start'] + buys - pays
    summary.append({
        'Đối tượng': s, 
        'Start': bal['start'],
        'Buy': buys,
        'Pay': pays,
        'Calc End': calculated_end,
        'Target End': bal['end'],
        'Diff': calculated_end - bal['end']
    })

summary_df = pd.DataFrame(summary)
print(summary_df.to_string())

other_buys = df[(df['TK Có'].str.startswith('331')) & (~df['Đối tượng'].isin(TARGETS))]
other_pays = df[(df['TK Nợ'].str.startswith('331')) & (~df['Đối tượng'].isin(TARGETS))]
print(f"\nOthers check: Buys {other_buys['Số tiền'].sum():,.0f}, Pays {other_pays['Số tiền'].sum():,.0f}")
print(f"Others Net: {other_buys['Số tiền'].sum() - other_pays['Số tiền'].sum()}")
