import pandas as pd
import xlsxwriter
import os

# --- CONFIGURE PATHS ---
PREMIUM_FILE = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/baocaotaichinh/BCTC HUY VU 2025 - Premium.xlsx'
OUTPUT_FILE = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/baocaotaichinh/B09_DN_Thuyet_minh_BCTC_2025_HUY_VU_Final.xlsx'

# 1. Đọc dữ liệu từ file Premium
print(f"Đang đọc dữ liệu từ: {PREMIUM_FILE}")
df = pd.read_excel(PREMIUM_FILE, sheet_name='BCĐ Tài Khoản', skiprows=2)

# Chuẩn hóa tên cột
# Cột 0: TK, 1: Tên TK, 2: Nợ đầu năm, 3: Có đầu năm, 4: Nợ phát sinh, 5: Có phát sinh, 6: Nợ cuối năm, 7: Có cuối năm
df.columns = ['TK', 'TenTK', 'DuDauNo', 'DuDauCo', 'PhatSinhNo', 'PhatSinhCo', 'DuCuoiNo', 'DuCuoiCo']

# Chuyển kiểu dữ liệu sang số, lỗi để 0
numeric_cols = ['DuDauNo', 'DuDauCo', 'PhatSinhNo', 'PhatSinhCo', 'DuCuoiNo', 'DuCuoiCo']
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# Chuyển TK sang string và strip
df['TK'] = df['TK'].astype(str).str.replace(r'\.0$', '', regex=True).str.strip()

# 2. Logic trích xuất dữ liệu tài khoản
def get_balance(tk_prefix, balance_type='DuCuoiNo'):
    """
    Lấy số dư của tài khoản (prefix). 
    Ví dụ: get_balance('111', 'DuCuoiNo') lấy số dư cuối năm tiền mặt.
    Để tránh cộng trùng tài khoản mẹ và con, ta lấy các tài khoản chi tiết nhất (leaf nodes).
    """
    subset = df[df['TK'].str.startswith(tk_prefix)]
    if subset.empty:
        return 0
    tks = subset['TK'].tolist()
    # Chỉ lấy các TK mà không phải là prefix của bất kỳ TK nào khác trong subset
    detail_tks = [tk for tk in tks if not any((other.startswith(tk) and other != tk) for other in tks)]
    return subset[subset['TK'].isin(detail_tks)][balance_type].sum()

# Tính toán các chỉ tiêu chính
data = {
    # I. Tiền
    'tm_dau_nam': get_balance('111', 'DuDauNo'),
    'tm_cuoi_nam': get_balance('111', 'DuCuoiNo'),
    'tgnh_dau_nam': get_balance('112', 'DuDauNo'),
    'tgnh_cuoi_nam': get_balance('112', 'DuCuoiNo'),
    
    # II. Phải thu
    'pth_dau_nam': get_balance('131', 'DuDauNo'),
    'pth_cuoi_nam': get_balance('131', 'DuCuoiNo'),
    'ptk_dau_nam': get_balance('138', 'DuDauNo'),
    'ptk_cuoi_nam': get_balance('138', 'DuCuoiNo'),

    # III. Hàng tồn kho
    'htk_dau_nam': get_balance('15', 'DuDauNo'),  # Gồm 152, 156...
    'htk_cuoi_nam': get_balance('15', 'DuCuoiNo'),

    # IV. TSCĐ
    'tscd_ng_dau_nam': get_balance('211', 'DuDauNo'),
    'tscd_ng_cuoi_nam': get_balance('211', 'DuCuoiNo'),
    'tscd_hm_dau_nam': get_balance('214', 'DuDauCo'),
    'tscd_hm_cuoi_nam': get_balance('214', 'DuCuoiCo'),

    # V. Nợ phải trả
    'ptnb_dau_nam': get_balance('331', 'DuDauCo'),
    'ptnb_cuoi_nam': get_balance('331', 'DuCuoiCo'),
    'thue_dau_nam': get_balance('333', 'DuDauCo'),
    'thue_cuoi_nam': get_balance('333', 'DuCuoiCo'),
    'ld_dau_nam': get_balance('334', 'DuDauCo'),
    'ld_cuoi_nam': get_balance('334', 'DuCuoiCo'),
    'vay_dau_nam': get_balance('341', 'DuDauCo'),
    'vay_cuoi_nam': get_balance('341', 'DuCuoiCo'),

    # VI. Vốn chủ sở hữu
    'vongop_dau_nam': get_balance('4111', 'DuDauCo'),
    'vongop_cuoi_nam': get_balance('4111', 'DuCuoiCo'),
    'vonkhac_dau_nam': get_balance('4118', 'DuDauCo'),
    'vonkhac_cuoi_nam': get_balance('4118', 'DuCuoiCo'),
    'lnst_dau_nam': get_balance('421', 'DuDauCo') - get_balance('421', 'DuDauNo'),
    'lnst_cuoi_nam': get_balance('421', 'DuCuoiCo') - get_balance('421', 'DuCuoiNo'),

    # VII. KQKD (Phat sinh trong nam)
    'doanh_thu_bh': get_balance('511', 'PhatSinhCo'),
    'gia_von_bh': get_balance('632', 'PhatSinhNo'),
    'cp_tc': get_balance('635', 'PhatSinhNo'),
    'cp_bh': get_balance('6421', 'PhatSinhNo'),  # Giả định nếu có
    'cp_ql': get_balance('642', 'PhatSinhNo'),
    'tn_khac': get_balance('711', 'PhatSinhCo'),
    'cp_khac': get_balance('811', 'PhatSinhNo'),
}

# 3. Tạo file Excel B09-DN Premium
print(f"Bắt đầu tạo file: {OUTPUT_FILE}")
wb = xlsxwriter.Workbook(OUTPUT_FILE)
ws = wb.add_worksheet('Thuyết minh BCTC')

# === ĐỊNH DẠNG (STYLING) ===
f_title_main = wb.add_format({'bold': True, 'font_size': 18, 'align': 'center', 'font_name': 'Times New Roman', 'font_color': '#1E4E79'})
f_title_sub = wb.add_format({'bold': True, 'font_size': 12, 'align': 'center', 'font_name': 'Times New Roman'})
f_header_info = wb.add_format({'font_size': 11, 'font_name': 'Times New Roman'})
f_section = wb.add_format({'bold': True, 'font_size': 13, 'font_name': 'Times New Roman', 'italic': True, 'font_color': '#2E75B6'})
f_col_header = wb.add_format({'bold': True, 'border': 1, 'align': 'center', 'valign': 'vcenter', 'bg_color': '#DDEBF7', 'font_name': 'Times New Roman'})
f_label = wb.add_format({'border': 1, 'font_name': 'Times New Roman', 'indent': 1})
f_label_bold = wb.add_format({'border': 1, 'bold': True, 'font_name': 'Times New Roman', 'bg_color': '#F8F9FA'})
f_num = wb.add_format({'border': 1, 'num_format': '#,##0', 'font_name': 'Times New Roman', 'align': 'right'})
f_num_bold = wb.add_format({'border': 1, 'bold': True, 'num_format': '#,##0', 'font_name': 'Times New Roman', 'bg_color': '#F8F9FA', 'align': 'right'})

# === NỘI DUNG ===

# Header
ws.write('A1', 'CÔNG TY TNHH HUY VŨ', f_header_info)
ws.write('A2', 'Địa chỉ: 182-184 Bcons Garden, P.Dĩ An, TP Dĩ An, Bình Dương', f_header_info)
ws.write('A3', 'Mã số thuế: 3702118314', f_header_info)

ws.merge_range('E1:G1', 'Mẫu số B09 - DN', f_title_sub)
ws.merge_range('E2:G2', '(Ban hành theo TT số 133/2016/TT-BTC', wb.add_format({'italic': True, 'font_name': 'Times New Roman', 'align': 'center', 'font_size': 10}))
ws.merge_range('E3:G3', 'Ngày 26/08/2016 của Bộ Tài chính)', wb.add_format({'italic': True, 'font_name': 'Times New Roman', 'align': 'center', 'font_size': 10}))

ws.merge_range('A5:G5', 'THUYẾT MINH BÁO CÁO TÀI CHÍNH', f_title_main)
ws.merge_range('A6:G6', 'Năm 2025', f_title_sub)

# I. Đặc điểm hoạt động
ws.write('A8', 'I. ĐẶC ĐIỂM HOẠT ĐỘNG CỦA DOANH NGHIỆP', f_section)
ws.write('A9', '1. Hình thức sở hữu vốn: Công ty trách nhiệm hữu hạn hai thành viên trở lên')
ws.write('A10', '2. Lĩnh vực kinh doanh: Thương mại, Dịch vụ')
ws.write('A11', '3. Ngành nghề kinh doanh: Buôn bán vật liệu, thiết bị lắp đặt khác trong xây dựng')

# II. Kỳ kế toán, đơn vị tiền tệ
ws.write('A13', 'II. KỲ KẾ TOÁN, ĐƠN VỊ TIỀN TỆ SỬ DỤNG TRONG KẾ TOÁN', f_section)
ws.write('A14', '1. Kỳ kế toán năm: Từ ngày 01/01/2025 đến ngày 31/12/2025')
ws.write('A15', '2. Đơn vị tiền tệ sử dụng trong kế toán: Đồng Việt Nam (VNĐ)')

# III. Chuẩn mực và Chế độ kế toán
ws.write('A17', 'III. CHUẨN MỰC VÀ CHẾ ĐỘ KẾ TOÁN ÁP DỤNG', f_section)
ws.write('A18', '1. Chế độ kế toán áp dụng: Thông tư 133/2016/TT-BTC')
ws.write('A19', '2. Tuyên bố về việc tuân thủ Chuẩn mực và Chế độ kế toán: Đã tuân thủ')

# V. Thông tin bổ sung cho BCĐKT
ws.write('A21', 'V. THÔNG TIN BỔ SUNG CHO CÁC KHOẢM MỤC TRÌNH BÀY TRONG BẢNG CÂN ĐỐI KẾ TOÁN', f_section)

# 1. Tiền
ws.write('A22', '1. Tiền và các khoản tương đương tiền', wb.add_format({'bold': True, 'font_name': 'Times New Roman'}))
ws.write('A23', 'Chỉ tiêu', f_col_header)
ws.write('B23', 'Số cuối năm', f_col_header)
ws.write('C23', 'Số đầu năm', f_col_header)

rows_tien = [
    ('Tiền mặt', data['tm_cuoi_nam'], data['tm_dau_nam']),
    ('Tiền gửi ngân hàng', data['tgnh_cuoi_nam'], data['tgnh_dau_nam']),
]
r = 23
for label, val_cuoi, val_dau in rows_tien:
    ws.write(r, 0, label, f_label)
    ws.write(r, 1, val_cuoi, f_num)
    ws.write(r, 2, val_dau, f_num)
    r += 1
ws.write(r, 0, 'Cộng', f_label_bold)
ws.write(r, 1, data['tm_cuoi_nam'] + data['tgnh_cuoi_nam'], f_num_bold)
ws.write(r, 2, data['tm_dau_nam'] + data['tgnh_dau_nam'], f_num_bold)
r += 2

# 2. Hàng tồn kho
ws.write(r, 0, '2. Hàng tồn kho', wb.add_format({'bold': True, 'font_name': 'Times New Roman'}))
r += 1
ws.write(r, 0, 'Chỉ tiêu', f_col_header)
ws.write(r, 1, 'Số cuối năm', f_col_header)
ws.write(r, 2, 'Số đầu năm', f_col_header)
r += 1
ws.write(r, 0, 'Hàng hóa (TK 1561)', f_label)
ws.write(r, 1, data['htk_cuoi_nam'], f_num)
ws.write(r, 2, data['htk_dau_nam'], f_num)
r += 1
ws.write(r, 0, 'Cộng', f_label_bold)
ws.write(r, 1, data['htk_cuoi_nam'], f_num_bold)
ws.write(r, 2, data['htk_dau_nam'], f_num_bold)
r += 2

# 3. TSCĐ (Tóm tắt)
ws.write(r, 0, '3. Tài sản cố định hữu hình', wb.add_format({'bold': True, 'font_name': 'Times New Roman'}))
r += 1
ws.write(r, 0, 'Chỉ tiêu', f_col_header)
ws.write(r, 1, 'Nguyên giá', f_col_header)
ws.write(r, 2, 'Hao mòn lũy kế', f_col_header)
r += 1
ws.write(r, 0, 'Số đầu năm', f_label)
ws.write(r, 1, data['tscd_ng_dau_nam'], f_num)
ws.write(r, 2, data['tscd_hm_dau_nam'], f_num)
r += 1
ws.write(r, 0, 'Số cuối năm', f_label)
ws.write(r, 1, data['tscd_ng_cuoi_nam'], f_num)
ws.write(r, 2, data['tscd_hm_cuoi_nam'], f_num)
r += 2

# 4. Vốn chủ sở hữu
ws.write(r, 0, '4. Vốn chủ sở hữu', wb.add_format({'bold': True, 'font_name': 'Times New Roman'}))
r += 1
ws.write(r, 0, 'Chỉ tiêu', f_col_header)
ws.write(r, 1, 'Số cuối năm', f_col_header)
ws.write(r, 2, 'Số đầu năm', f_col_header)
r += 1
rows_vcsh = [
    ('Vốn góp của chủ sở hữu (4111)', data['vongop_cuoi_nam'], data['vongop_dau_nam']),
    ('Vốn khác (4118)', data['vonkhac_cuoi_nam'], data['vonkhac_dau_nam']),
    ('Lợi nhuận sau thuế chưa phân phối (421)', data['lnst_cuoi_nam'], data['lnst_dau_nam']),
]
for label, val_cuoi, val_dau in rows_vcsh:
    ws.write(r, 0, label, f_label)
    ws.write(r, 1, val_cuoi, f_num)
    ws.write(r, 2, val_dau, f_num)
    r += 1
ws.write(r, 0, 'Cộng', f_label_bold)
ws.write(r, 1, data['vongop_cuoi_nam'] + data['vonkhac_cuoi_nam'] + data['lnst_cuoi_nam'], f_num_bold)
ws.write(r, 2, data['vongop_dau_nam'] + data['vonkhac_dau_nam'] + data['lnst_dau_nam'], f_num_bold)
r += 2

# VI. KQKD
ws.write(r, 0, 'VI. THÔNG TIN BỔ SUNG CHO BÁO CÁO KẾT QUẢ KINH DOANH', f_section)
r += 1
ws.write(r, 0, 'Chỉ tiêu', f_col_header)
ws.write(r, 1, 'Năm nay (2025)', f_col_header)
ws.write(r, 2, 'Năm trước (2024)', f_col_header)
r += 1
rows_kqkd = [
    ('1. Doanh thu bán hàng và cung cấp dịch vụ', data['doanh_thu_bh'], 0),
    ('2. Giá vốn hàng bán', data['gia_von_bh'], 0),
    ('3. Chi phí tài chính', data['cp_tc'], 0),
    ('4. Chi phí quản lý doanh nghiệp', data['cp_ql'], 0),
    ('5. Thu nhập khác', data['tn_khac'], 0),
    ('6. Chi phí khác', data['cp_khac'], 0),
]
for label, val_nay, val_truoc in rows_kqkd:
    ws.write(r, 0, label, f_label if not label[0].isdigit() else f_label_bold)
    ws.write(r, 1, val_nay, f_num)
    ws.write(r, 2, val_truoc, f_num)
    r += 1

# Ký tên
r += 3
ws.write(r, 0, 'Người lập biểu', f_title_sub)
ws.write(r, 2, 'Kế toán trưởng', f_title_sub)
ws.write(r, 5, 'Giám đốc', f_title_sub)
r += 1
ws.write(r, 0, '(Ký, họ tên)', wb.add_format({'italic': True, 'align': 'center', 'font_name': 'Times New Roman'}))
ws.write(r, 2, '(Ký, họ tên)', wb.add_format({'italic': True, 'align': 'center', 'font_name': 'Times New Roman'}))
ws.write(r, 5, '(Ký, họ tên, đóng dấu)', wb.add_format({'italic': True, 'align': 'center', 'font_name': 'Times New Roman'}))

# Căn chỉnh độ rộng cột
ws.set_column('A:A', 50)
ws.set_column('B:C', 25)
ws.set_column('D:G', 15)

wb.close()
print(f"\n>> Hoàn thành B09 Thuyết minh BCTC tại: {OUTPUT_FILE}")
