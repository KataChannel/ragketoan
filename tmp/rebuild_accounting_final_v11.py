import pandas as pd
import numpy as np
import os
import zipfile

# 1. Expanded Professional Accounting Names for OTH groups
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
    'W-CDMA': 'Thiết bị thu phát sóng băng tần rộng',
    '10105': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12100': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12400': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '128GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '256GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '64GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '32GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    'USB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
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

def create_full_data(year):
    df_src = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx')
    df = df_src[['maNhom', 'tenNhom']].copy()
    df = df[df['maNhom'].str.startswith(('PC', 'SRV', 'VP', 'OTH', 'ACC'), na=False)]
    df['tenNhom'] = df.apply(lambda x: get_accounting_name(x['tenNhom'], x['maNhom']), axis=1)
    
    np.random.seed(year)
    selected_indices = np.random.choice(df.index, size=126, replace=False)
    df_base = df.loc[selected_indices].sort_values('maNhom').copy()
    
    # Yearly values
    base_ton = 50000000 + (year - 2023) * 10000000
    df_base['Tồn Đầu Kỳ (VNĐ)'] = (base_ton * np.random.uniform(0.8, 1.2, size=len(df_base))).astype(int)
    df_base['Nhập (VNĐ)'] = (base_ton * 1.5 * np.random.uniform(0.7, 1.3, size=len(df_base))).astype(int)
    df_base['Xuất (VNĐ)'] = (df_base['Nhập (VNĐ)'] * 0.9 * np.random.uniform(0.8, 1.1, size=len(df_base))).astype(int)
    df_base['Cuối Kỳ (VNĐ)'] = df_base['Tồn Đầu Kỳ (VNĐ)'] + df_base['Nhập (VNĐ)'] - df_base['Xuất (VNĐ)']
    
    return df_base

# Main Script
output_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan'
os.makedirs(output_dir, exist_ok=True)

files = []
for yr in [2023, 2024, 2025]:
    df_yearly = create_full_data(yr)
    fname = f'XNT_HuyVu_{yr}_Final_Accounting_V11.xlsx'
    fpath = os.path.join(output_dir, fname)
    
    with pd.ExcelWriter(fpath, engine='openpyxl') as writer:
        # 1. Sheet Tổng hợp
        df_yearly.to_excel(writer, sheet_name='xnt12thang', index=False)
        
        # 2. Sheet từng tháng (1 -> 12)
        for month in range(1, 13):
            month_seed = yr * 100 + month
            np.random.seed(month_seed)
            
            df_month = df_yearly[['maNhom', 'tenNhom']].copy()
            # Distribute totals roughly across months
            df_month['Nhập tháng'] = (df_yearly['Nhập (VNĐ)'] / 12 * np.random.uniform(0.5, 1.5, size=len(df_month))).astype(int)
            df_month['Xuất tháng'] = (df_yearly['Xuất (VNĐ)'] / 12 * np.random.uniform(0.5, 1.5, size=len(df_month))).astype(int)
            df_month['Số lượng giao dịch'] = np.random.randint(1, 10, size=len(df_month))
            
            df_month.to_excel(writer, sheet_name=str(month), index=False)
            
    files.append(fpath)
    print(f'Generated {yr} with 12 months.')

# Zip
zip_path = os.path.join(output_dir, 'Bao_Cao_Accounting_Professional_Monthly_V11.zip')
with zipfile.ZipFile(zip_path, 'w') as zipf:
    for f in files:
        zipf.write(f, os.path.basename(f))

print(f'Done. ZIP: {zip_path}')
