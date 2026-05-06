import pandas as pd
src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
df = pd.read_excel(src)

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

# Check existing buy (Có 331) and pay (Nợ 331) for these 8
summary = []
for s in suppliers:
    buys = df[(df['TK Có'] == '331') & (df['Đối tượng'] == s)]['Số tiền'].sum()
    pays = df[(df['TK Nợ'] == '331') & (df['Đối tượng'] == s)]['Số tiền'].sum()
    summary.append({'Đối tượng': s, 'Tổng Mua (Có 331)': buys, 'Tổng Trả (Nợ 331)': pays})

summary_df = pd.DataFrame(summary)
print(summary_df)

print("\n--- Rows with TK 331 but other suppliers ---")
other_buys = df[(df['TK Có'] == '331') & (~df['Đối tượng'].isin(suppliers))]['Số tiền'].sum()
other_pays = df[(df['TK Nợ'] == '331') & (~df['Đối tượng'].isin(suppliers))]['Số tiền'].sum()
print(f"Others: Mua {other_buys:,.0f}, Trả {other_pays:,.0f}")
