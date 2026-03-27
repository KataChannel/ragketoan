import pandas as pd
import xlsxwriter

# 1. Đọc dữ liệu từ file Premium
premium_file = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/baocaotaichinh/BCTC HUY VU 2025 - Premium.xlsx'
df = pd.read_excel(premium_file, sheet_name='BCĐ Tài Khoản', skiprows=2)

# Xác định lại tên cột dựa trên quan sát
# Cột 0: Số hiệu TK, 1: Tên TK, 2: Nợ đầu năm, 3: Có đầu năm, 4: Nợ phát sinh, 5: Có phát sinh, 6: Nợ cuối năm, 7: Có cuối năm
# do pandas đọc có thể bị lệch tên cột, ta lấy theo index
df.columns = ['TK', 'TenTK', 'DuDauNo', 'DuDauCo', 'PhatSinhNo', 'PhatSinhCo', 'DuCuoiNo', 'DuCuoiCo']

# Chuyển kiểu dữ liệu sang số, lỗi để NaN, sau đó fill bằng 0
for col in ['DuDauNo', 'DuDauCo', 'PhatSinhNo', 'PhatSinhCo', 'DuCuoiNo', 'DuCuoiCo']:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# 2. Xử lý logic gộp dữ liệu
def get_val(tk_prefix, col_name='DuCuoiNo'):
    # Lấy giá trị của tài khoản bắt đầu bằng tk_prefix (vd: 111, 112)
    # Lấy các TK chi tiết (con) để tránh cộng trùng nếu có cả TK tổng
    # Trong file này 111 là tổng, 1111 là con. Ta chỉ lấy những bản ghi có TK dài nhất hoặc lọc TK tổng.
    # Đơn giản nhất: Lấy các TK có độ dài 4 (nếu có) hoặc lọc riêng
    # Tuy nhiên trong file này, các TK 111, 112, 131... đang có giá trị riêng biệt
    # Ta sẽ tổng hợp theo tiền tố
    subset = df[df['TK'].astype(str).str.startswith(tk_prefix)]
    # Nếu có TK 3 chữ số và 4 chữ số, việc sum() sẽ bị double.
    # Ta chỉ lấy TK chi tiết nhất.
    # Cách tốt nhất là lọc các TK không có TK con nào bắt đầu bằng nó.
    tks = subset['TK'].astype(str).tolist()
    detail_tks = [tk for tk in tks if not any(other.startswith(tk) and other != tk for other in tks)]
    return subset[subset['TK'].astype(str).isin(detail_tks)][col_name].sum()

# Trích xuất các số liệu chính
data_tm = {
    'tien': get_val('111', 'DuCuoiNo') + get_val('112', 'DuCuoiNo'),
    'phai_thu_kh': get_val('131', 'DuCuoiNo'),
    'thue_gtgt_kd': get_val('133', 'DuCuoiNo'),
    'hang_ton_kho': get_val('1561', 'DuCuoiNo'),
    'tscd_nguyen_gia': get_val('211', 'DuCuoiNo'),
    'tscd_hao_mon': get_val('214', 'DuCuoiCo'),
    'phai_tra_nb': get_val('331', 'DuCuoiCo'),
    'thue_phai_nop': get_val('333', 'DuCuoiCo'),
    'phai_tra_ld': get_val('334', 'DuCuoiCo'),
    'vay_no': get_val('341', 'DuCuoiCo'),
    'von_gop': get_val('4111', 'DuCuoiCo') + get_val('4118', 'DuCuoiCo'),
    'lnst_chua_pp': get_val('421', 'DuCuoiCo') - get_val('421', 'DuCuoiNo'), # Lỗ thì âm
    'doanh_thu': get_val('511', 'PhatSinhCo'),
    'gia_von': get_val('632', 'PhatSinhNo'),
    'chi_phi_ql': get_val('642', 'PhatSinhNo'),
    'thu_nhap_khac': get_val('711', 'PhatSinhCo'),
    'chi_phi_khac': get_val('811', 'PhatSinhNo'),
}

# 3. Tạo file Excel Thuyết Minh (B09-DN)
output_file = '/mnt/chikiet/kata2025/ragketoan/docs/huyvu/baocaotaichinh/B09_THUYET_MINH_BCTC_2025_HUY_VU.xlsx'
wb = xlsxwriter.Workbook(output_file)
ws = wb.add_worksheet('Thuyết minh BCTC')

# Định dạng
bold = wb.add_format({'bold': True, 'font_name': 'Times New Roman', 'font_size': 11})
bold_center = wb.add_format({'bold': True, 'align': 'center', 'font_name': 'Times New Roman', 'font_size': 12})
italic = wb.add_format({'italic': True, 'font_name': 'Times New Roman', 'font_size': 11})
header = wb.add_format({'bold': True, 'border': 1, 'align': 'center', 'valign': 'vcenter', 'bg_color': '#D9EAD3'})
cell = wb.add_format({'border': 1, 'font_name': 'Times New Roman'})
num_cell = wb.add_format({'border': 1, 'num_format': '#,##0', 'font_name': 'Times New Roman'})

# Tiêu đề
ws.write('A1', 'CÔNG TY TNHH HUY VŨ', bold)
ws.write('A2', 'Mã số thuế: 3702118314', bold)
ws.write('E1', 'Mẫu số B09 - DN', bold_center)
ws.write('E2', '(Ban hành theo TT số 133/2016/TT-BTC', italic)
ws.write('E3', 'Ngày 26/08/2016 của Bộ Tài chính)', italic)

ws.merge_range('A5:F5', 'THUYẾT MINH BÁO CÁO TÀI CHÍNH', wb.add_format({'bold': True, 'font_size': 16, 'align': 'center'}))
ws.merge_range('A6:F6', 'Năm 2025', bold_center)

# I. Đặc điểm hoạt động
ws.write('A8', 'I. ĐẶC ĐIỂM HOẠT ĐỘNG CỦA DOANH NGHIỆP', bold)
ws.write('A9', '1. Hình thức sở hữu vốn: Công ty trách nhiệm hữu hạn hai thành viên trở lên')
ws.write('A10', '2. Lĩnh vực kinh doanh: Thương mại, Dịch vụ')
ws.write('A11', '3. Ngành nghề kinh doanh: Buôn bán vật liệu, thiết bị lắp đặt khác trong xây dựng')

# II. Kỳ kế toán, đơn vị tiền tệ
ws.write('A13', 'II. KỲ KẾ TOÁN, ĐƠN VỊ TIỀN TỆ SỬ DỤNG TRONG KẾ TOÁN', bold)
ws.write('A14', '1. Kỳ kế toán năm: Từ ngày 01/01/2025 đến ngày 31/12/2025')
ws.write('A15', '2. Đơn vị tiền tệ sử dụng trong kế toán: Đồng Việt Nam (VNĐ)')

# IV. Thông tin bổ sung (Trích một số mục quan trọng)
ws.write('A17', 'IV. THÔNG TIN BỔ SUNG CHO CÁC KHOẢM MỤC TRÌNH BÀY TRONG BẢNG CÂN ĐỐI KẾ TOÁN', bold)

# Bảng Tiền
ws.write('A18', '1. Tiền và các khoản tương đương tiền', bold)
ws.write('A19', 'Chỉ tiêu', header)
ws.write('B19', 'Số cuối năm', header)
ws.write('C19', 'Số đầu năm', header)

ws.write('A20', 'Tiền mặt', cell)
ws.write('B20', get_val('111', 'DuCuoiNo'), num_cell)
ws.write('C20', get_val('111', 'DuDauNo'), num_cell)

ws.write('A21', 'Tiền gửi ngân hàng', cell)
ws.write('B21', get_val('112', 'DuCuoiNo'), num_cell)
ws.write('C21', get_val('112', 'DuDauNo'), num_cell)

ws.write('A22', 'Cộng', bold)
ws.write('B22', data_tm['tien'], num_cell)

# Bảng Hàng tồn kho
ws.write('A24', '2. Hàng tồn kho', bold)
ws.write('A25', 'Chỉ tiêu', header)
ws.write('B25', 'Số cuối năm', header)
ws.write('C25', 'Số đầu năm', header)
ws.write('A26', 'Hàng hóa (1561)', cell)
ws.write('B26', data_tm['hang_ton_kho'], num_cell)
ws.write('C26', get_val('1561', 'DuDauNo'), num_cell)

# Nguồn vốn
ws.write('A28', '3. Vốn chủ sở hữu', bold)
ws.write('A29', 'Chỉ tiêu', header)
ws.write('B29', 'Số cuối năm', header)
ws.write('C29', 'Số đầu năm', header)
ws.write('A30', 'Vốn góp của chủ sở hữu (4111)', cell)
ws.write('B30', get_val('4111', 'DuCuoiCo') + get_val('4118', 'DuCuoiCo'), num_cell)
ws.write('C30', get_val('4111', 'DuDauCo'), num_cell)
ws.write('A31', 'Lợi nhuận sau thuế chưa phân phối (421)', cell)
ws.write('B31', data_tm['lnst_chua_pp'], num_cell)
ws.write('C31', get_val('421', 'DuDauCo') - get_val('421', 'DuDauNo'), num_cell)

# V. Thông tin bổ sung cho KQKD
ws.write('A33', 'V. THÔNG TIN BỔ SUNG CHO CÁ C KHOẢM MỤC TRÌNH BÀY TRONG BÁO CÁO KẾT QUẢ KINH DOANH', bold)
ws.write('A34', '1. Doanh thu bán hàng và cung cấp dịch vụ', bold)
ws.write('A35', 'Chỉ tiêu', header)
ws.write('B35', 'Năm nay', header)
ws.write('A36', 'Doanh thu bán hàng hóa', cell)
ws.write('B36', data_tm['doanh_thu'], num_cell)

ws.write('A38', '2. Giá vốn hàng bán', bold)
ws.write('A39', 'Chỉ tiêu', header)
ws.write('B39', 'Năm nay', header)
ws.write('A40', 'Giá vốn hàng hóa đã bán', cell)
ws.write('B40', data_tm['gia_von'], num_cell)

ws.write('A42', '3. Chi phí quản lý doanh nghiệp', bold)
ws.write('A43', 'Chỉ tiêu', header)
ws.write('B43', 'Năm nay', header)
ws.write('A44', 'Chi phí quản lý', cell)
ws.write('B44', data_tm['chi_phi_ql'], num_cell)

ws.set_column('A:A', 40)
ws.set_column('B:C', 20)

wb.close()
print(f"Hoàn thành: {output_file}")
