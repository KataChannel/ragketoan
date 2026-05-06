import pandas as pd
src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
df = pd.read_excel(src)

def fmt_acc(x):
    if pd.isna(x): return ""
    if isinstance(x, (int, float)): return str(int(x))
    return str(x).split('.')[0]

df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
df['TK Có'] = df['TK Có'].apply(fmt_acc)

suppliers = [
    "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG",
    "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG",
    "Công ty TNHH Phân phối Synnex FPT",
    "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN",
    "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q",
    "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ",
    "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ",
    "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT"
]

summary = []
for s in suppliers:
    buys = df[(df['TK Có'].str.startswith('331')) & (df['Đối tượng'] == s)]['Số tiền'].sum()
    pays = df[(df['TK Nợ'].str.startswith('331')) & (df['Đối tượng'] == s)]['Số tiền'].sum()
    summary.append({'Đối tượng': s, 'Tổng Mua (Có 331)': buys, 'Tổng Trả (Nợ 331)': pays})

summary_df = pd.DataFrame(summary)
print(summary_df.to_string())
