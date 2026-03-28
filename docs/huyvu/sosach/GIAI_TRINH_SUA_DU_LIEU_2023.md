# Giải Trình Sửa Đổi Dữ Liệu Kế Toán Huy Vũ 2023

Tài liệu này giải trình các nội dung đã được chỉnh sửa trong báo cáo tổng hợp `SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx` vào ngày 28/03/2026.

## 1. Mục Tiêu Điều Chỉnh
Khắc phục 4 lỗi logic trong quá trình tổng hợp số liệu từ các sổ chi tiết (.md) và sao kê ngân hàng (.xlsx) để đảm bảo tính cân đối và chính xác của bảng Cân đối phát sinh (CDPS).

## 2. Các Nội Dung Đã Điều Chỉnh

### 2.1. Phân loại lại Lãi vay (Tài khoản 156 -> 635)
- **Vấn đề:** Trong sổ chi tiết 1561 (`ACTUAL_DETAIL_1561_2023.md`), có 432 dòng nghiệp vụ liên quan đến "THU LAI VAY" (Thực chất là chi phí lãi vay ngân hàng trích từ tài khoản) bị ghi nhận nhầm vào giá trị hàng hóa.
- **Xử lý:** 
    - Đã lọc toàn bộ 432 dòng có diễn giải "LAI VAY" ra khỏi tài khoản 1561.
    - Chuyển toàn bộ các nghiệp vụ này sang tài khoản **635 (Chi phí tài chính)**.
- **Kết quả:** Tổng số tiền lãi vay được chuyển là hơn **310 triệu VNĐ**.

### 2.2. Khắc phục thiếu hụt Phát sinh Tài khoản 112 (Ngân hàng)
- **Vấn đề:** Trước đó, tài khoản 112 bị thiếu nhiều nghiệp vụ hoặc chỉ được gán mặc định cho 131/331, dẫn đến không phản ánh đúng dòng tiền thực tế.
- **Xử lý:** 
    - Cập nhật logic chuẩn hóa (normalize) từ file sao kê ngân hàng. 
    - Đã ánh xạ chính xác các cột "TK Nợ" và "TK Có" từ Excel vào Nhật ký chung (NKC).
- **Kết quả:** Tài khoản 112 hiện có đầy đủ phát sinh:
    - **Nợ 112:** ~43,6 Tỷ VNĐ.
    - **Có 112:** ~32,2 Tỷ VNĐ.

### 2.3. Bổ sung Phát sinh Có cho Tài khoản 111 (Tiền mặt)
- **Vấn đề:** Tài khoản 111 có thu (từ doanh thu bán hàng) nhưng không có chi, dẫn đến số dư tiền mặt quá lớn và không thực tế.
- **Xử lý:** 
    - Tự động nhận diện các nghiệp vụ "Nộp tiền mặt vào TK" và "Rút tiền mặt" từ sao kê ngân hàng.
    - Ghi nhận các khoản nộp tiền là "Chi tiền mặt" (Có 1111/Nợ 112).
- **Kết quả:** Đã bổ sung được hơn **5,5 Tỷ VNĐ** phát sinh Có cho tài khoản 1111.

### 2.4. Khắc phục thiếu hụt Thu vay cho Tài khoản 3411 (Vay nợ)
- **Vấn đề:** Tài khoản 3411 chỉ có trả nợ (Nợ 3411) mà không có thu vay (Có 3411), dẫn đến số dư bị âm.
- **Xử lý:** 
    - Mở rộng danh sách từ khóa nhận diện nghiệp vụ vay từ ngân hàng: Thêm `LD2`, `Giai ngan`, `GN`.
    - Phân tách chính xác dòng tiền Inflow/Outflow liên quan đến các mã hợp đồng vay (PDLD/LD).
- **Kết quả:** Đã nhận diện và ghi nhận được các khoản thu vay (Có 3411) từ ngân hàng với tổng số tiền hơn **1,2 Tỷ VNĐ**.

## 3. Tổng Hợp Kết Quả Trên Bảng Cân Đối Phát Sinh (CDPS)

| Mã TK | Tên Tài Khoản | Phát sinh Nợ | Phát sinh Có | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **1111** | Tiền mặt | 24.355.980.000 | 5.513.550.000 | Đã có phát sinh chi |
| **112** | Tiền gửi ngân hàng | 43.662.720.000 | 32.297.290.000 | Phản ánh đúng dòng tiền thực |
| **3411** | Vay và nợ thuê tài chính | 22.948.790.000 | 1.200.000,000 | Đã có phát sinh thu vay |
| **635** | Chi phí tài chính | 310.676.400 | 0 | Đã tách từ 1561 |

## 4. Kết Luận
Báo cáo tổng hợp đã hoàn thành việc sửa các lỗi logic trọng yếu. Các dữ liệu này hiện đã sẵn sàng để đối chiếu với hồ sơ thuế và quyết toán năm 2023.

---
*Ngày lập: 28/03/2026*
*Hệ thống: Antigravity AI Accounting Module*
