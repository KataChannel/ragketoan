import pandas as pd
import numpy as np
import os
import zipfile

# Professional Accounting Names - Same as before
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

def create_grouped_with_total_df(df_base, seed):
    np.random.seed(seed)
    df = df_base.copy()
    
    n = len(df)
    df['Tồn Đầu Kỳ (SL)'] = np.random.randint(5, 50, size=n)
    df['Nhập (SL)'] = np.random.randint(10, 100, size=n)
    df['Xuất (SL)'] = np.random.randint(10, 100, size=n)
    df['Xuất (SL)'] = df[['Xuất (SL)', 'Tồn Đầu Kỳ (SL)', 'Nhập (SL)']].apply(
        lambda x: min(x.iloc[0], x.iloc[1]+x.iloc[2]-2), axis=1
    )
    
    avg_price = 1200000 + np.random.randint(-200000, 1500000, size=n)
    df['Tồn Đầu Kỳ (VNĐ)'] = df['Tồn Đầu Kỳ (SL)'] * avg_price
    df['Nhập (VNĐ)'] = df['Nhập (SL)'] * avg_price
    df['Xuất (VNĐ)'] = df['Xuất (SL)'] * avg_price
    
    df = df.rename(columns={'maNhom': 'Mã Nhóm', 'tenNhom': 'Tên Nhóm Sản Phẩm'})
    
    # GROUP BY
    sum_cols = ['Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)']
    df_grouped = df.groupby('Tên Nhóm Sản Phẩm', as_index=False).agg({
        'Mã Nhóm': 'first',
        **{c: 'sum' for c in sum_cols}
    })
    
    df_grouped['Tồn Cuối (SL)'] = df_grouped['Tồn Đầu Kỳ (SL)'] + df_grouped['Nhập (SL)'] - df_grouped['Xuất (SL)']
    df_grouped['Tồn Cuối (VNĐ)'] = df_grouped['Tồn Đầu Kỳ (VNĐ)'] + df_grouped['Nhập (VNĐ)'] - df_grouped['Xuất (VNĐ)']
    
    df_grouped = df_grouped.sort_values('Mã Nhóm').reset_index(drop=True)
    df_grouped['STT'] = df_grouped.index + 1
    
    final_cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 
            'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 
            'Nhập (SL)', 'Nhập (VNĐ)', 
            'Xuất (SL)', 'Xuất (VNĐ)', 
            'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
    
    res = df_grouped[final_cols].copy()
    
    # ADD TOTAL ROW
    numeric_only = res.iloc[:, 3:] # From Tồn Đầu Kỳ (SL) onwards
    total_row = numeric_only.sum().to_dict()
    total_row['STT'] = ''
    total_row['Mã Nhóm'] = ''
    total_row['Tên Nhóm Sản Phẩm'] = 'TỔNG CỘNG'
    
    res = pd.concat([res, pd.DataFrame([total_row])], ignore_index=True)
    
    return res

# Execution
output_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan'
os.makedirs(output_dir, exist_ok=True)

df_src = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx')
df_full = df_src[['maNhom', 'tenNhom']].copy()
df_full = df_full[df_full['maNhom'].str.startswith(('PC', 'SRV', 'VP', 'OTH', 'ACC'), na=False)]
df_full['tenNhom'] = df_full.apply(lambda x: get_accounting_name(x['tenNhom'], x['maNhom']), axis=1)

files = []
for yr in [2023, 2024, 2025]:
    fname = f'XNT_HuyVu_{yr}_Final_Total_Row.xlsx'
    fpath = os.path.join(output_dir, fname)
    writer = pd.ExcelWriter(fpath, engine='openpyxl')
    
    # Yearly
    df_yr = create_grouped_with_total_df(df_full, yr)
    df_yr.to_excel(writer, sheet_name='xnt12thang', index=False)
    
    # Monthly
    for m in range(1, 13):
        df_m = create_grouped_with_total_df(df_full, yr * 100 + m)
        df_m.to_excel(writer, sheet_name=str(m), index=False)
    
    writer.close()
    files.append(fpath)
    print(f"Report saved: {fname}")

# Zip it
zip_path = os.path.join(output_dir, 'Bao_Cao_Complete_With_Total_V14.zip')
with zipfile.ZipFile(zip_path, 'w') as zipf:
    for f in files:
        zipf.write(f, os.path.basename(f))

print(f"DONE. ZIP: {zip_path}")
