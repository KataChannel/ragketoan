import pandas as pd

ACCOUNTING_MAPPING = {
    '100': 'Vật tư & Phụ kiện Văn phòng hỗ trợ',
    'BỘ MÁY': 'Thiết bị đầu cuối & Trạm làm việc (Workstation)',
    'Bộ máy': 'Thiết bị đầu cuối & Trạm làm việc (Workstation)',
    'C270': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'C310': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'B525': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'VIDEO': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'COM': 'Cước dịch vụ Viễn thông & Truyền dẫn dữ liệu',
    'CPN': 'Phí chuyển phát nhanh & Giao nhận Logistics',
    'GSM': 'Cước dịch vụ di động & Sim data',
    'SMS': 'Dịch vụ tin nhắn thông báo (SMS Brandname)',
    'PHI': 'Lệ phí & Thu phí dịch vụ liên quan',
    'THU': 'Chi phí thu hộ & Dịch vụ hỗ trợ',
    'HDMI': 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa',
    'VGA': 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa',
    'DVI': 'Cáp chuyển đổi tín hiệu màn hình cao cấp',
    'TP-LINK': 'Thiết bị mạng & Router Mesh chuyên dụng',
    'TENDA': 'Thiết bị mạng nội bộ Tenda chính hãng',
    'W-CDMA': 'Thiết bị thu phát sóng băng tần rông',
    '10105': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12100': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12400': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '128GB': 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND',
    '256GB': 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND',
    '64GB': 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND',
    '32GB': 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND',
    'USB': 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND',
    'USB-C': 'Cáp & Bộ chuyển đổi USB Type-C thế hệ mới',
    '400': 'Vật tư & Phụ kiện cơ điện bảo trì',
    '750': 'Vật tư & Phụ kiện cơ điện bảo trì',
    'A120': 'Hệ thống lưu trữ mảng NAS chuyên dụng',
    'A130': 'Hệ thống lưu trữ mảng NAS chuyên dụng',
    'A150': 'Hệ thống lưu trữ mảng NAS chuyên dụng',
    'A4000': 'Card đồ họa Rời & Xử lý hình ảnh chuyên sâu',
    'A600': 'Card đồ họa Rời & Xử lý hình ảnh chuyên sâu',
    'AP1113-20A': 'Access Point & WiFi công nghiệp công suất lớn',
    'AP1115-20B': 'Access Point & WiFi công nghiệp công suất lớn',
    'BLTT': 'Biên lai tự in & Ấn chỉ thuế bảo mật',
    'Chiết khấu': 'Chiết khấu thương mại & Giảm giá đặc biệt',
    'Drum máy': 'Linh kiện vật tư Máy In & Photo (Drum)',
    'Gạt máy': 'Linh kiện vật tư Máy In & Photo (Blade)',
    'Ru lô': 'Linh kiện vật tư Máy In & Photo (Roller)',
    'H110': 'Bo mạch chủ (Mainboard) lắp ráp PC phổ thông',
    'H510M': 'Bo mạch chủ (Mainboard) thế hệ mới',
    'H370': 'Bo mạch chủ (Mainboard) hiệu năng cao',
    'Hàng khuyến': 'Hàng hóa phục vụ Khuyến mại & Sự kiện',
    'Hàng tặng': 'Hàng hóa tặng kèm & Hỗ trợ đại lý',
    'INTEL': 'Linh kiện vi xử lý Intel chính hãng',
    'KINGSTON': 'Linh kiện bộ nhớ Kingston chính hãng',
    'PNY': 'Linh kiện phần cứng thương hiệu PNY',
    'SANTAK': 'Thiết bị Bộ lưu điện (UPS) Santak',
    'ZKTECO': 'Thiết bị kiểm soát ra vào & Máy chấm công',
    'Máy đếm': 'Máy đếm tiền & Thiết bị kiểm định tài chính',
    'KXTS500': 'Hệ thống điện thoại PABX & Máy lẻ nội bộ',
    'LS500WHE': 'Máy chiếu & Thiết bị trình chiếu kỹ thuật số',
    'RJ45': 'Hạt mạng & Đầu nối viễn thông chuẩn RJ45',
    'TAI': 'Tai nghe đàm thoại (Headset) chuẩn Call Center',
    '000': 'Vật tư kỹ thuật khác chưa phân loại',
    'None': 'Vật tư kỹ thuật khác chưa phân loại',
    'Khác': 'Sản phẩm vật tư phụ trợ văn phòng'
}

def get_accounting_name(original_name, group_code):
    if 'OTH' not in group_code:
        return original_name
    if ' - ' in original_name:
        tag = original_name.split(' - ')[-1].strip()
        if tag in ACCOUNTING_MAPPING:
            return ACCOUNTING_MAPPING[tag]
    return "Nhóm vật tư & Thiết bị kỹ thuật tổng hợp"

df_src = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx')
df = df_src[['maNhom', 'tenNhom']].copy()
df = df[df['maNhom'].str.startswith(('PC', 'SRV', 'VP', 'OTH', 'ACC'), na=False)]
df['tenNhom'] = df.apply(lambda x: get_accounting_name(x['tenNhom'], x['maNhom']), axis=1)

# Group to get unique names
df_summary = df.groupby('tenNhom', as_index=False).agg({'maNhom': 'first'})
df_summary = df_summary.sort_values('maNhom').reset_index(drop=True)
df_summary.columns = ['Tên Nhóm Sản Phẩm', 'Mã Nhóm Đại Diện']

# Write Markdown
md_path = '/chikiet/kata2025/ragketoan/docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md'
with open(md_path, 'w') as f:
    f.write("# DANH MỤC NHÓM SẢN PHẨM (KẾ TOÁN)\n\n")
    f.write("Dưới đây là danh mục các nhóm sản phẩm sau khi đã được phân rã chuyên sâu và gộp nhóm theo nghiệp vụ kế toán chuyên nghiệp.\n\n")
    f.write(df_summary[['Mã Nhóm Đại Diện', 'Tên Nhóm Sản Phẩm']].to_markdown(index=False))

print(f"File markdown created: {md_path}")
