# TỔNG HỢP CÁC VẤN ĐỀ CHỈNH SỬA SỐ LIỆU HUY VŨ 2023
*Giai đoạn từ: 02/04/2026 đến 05/04/2026*

Dưới đây là danh sách các hạng mục quan trọng đã được thực hiện điều chỉnh theo yêu cầu của người dùng để hoàn thiện bộ sổ sách kế toán của Huy Vũ năm 2023.

---

### 1. Xử lý triệt để sai lệch ngày tháng (Fiscal Year Integrity)
- **Vấn đề:** Các chứng từ đầu năm 2024 bị lẫn vào báo cáo năm 2023.
- **Nguyên nhân:** Chênh lệch múi giờ UTC/Local (giờ Việt Nam).
- **Giải pháp:** Cập nhật SQL query (DuckDB) sử dụng `timezone_aware` filtering và siết chặt khoảng ngày từ `01/01/2023` đến `31/12/2023`.

### 2. Hợp nhất hệ thống tài khoản (Account Consolidation)
- **Yêu cầu:** Gộp các tiểu khoản dư thừa để giữ sổ sách tinh gọn.
- **Thực hiện:** 
    - Gộp **1312** (Phải thu khách hàng chi tiết) → **131**.
    - Gộp **3411** (Vay ngắn hạn chi tiết) → **341** (Vay và nợ thuê tài chính).
- **Kết quả:** Đồng bộ lại NKC và xây dựng lại toàn bộ các Sheet Sổ chi tiết (SCT) tương ứng.

### 3. Tự động xử lý số dư Âm Quỹ và Âm Ngân hàng (Negative Balance Resolution)
- **Vấn đề:** Tồn quỹ tiền mặt (1111) và ngân hàng (112) bị âm tại một số thời điểm do chi vượt thu.
- **Giải pháp:** Sử dụng script `fix_negative_cash_bank_2023.py` để tự động chèn các bút toán điều chỉnh:
    - **Bù âm quỹ (1111):** Nợ 1111 / Có 341 (Bổ sung vốn cá nhân).
    - **Bù âm ngân hàng (112):** Nợ 112 / Có 1111 (Nộp tiền mặt vào tài khoản).
- **Người thực hiện/Đối tượng:** Mặc định là **Đặng Thị Xuân Hà**.

### 4. Chuẩn hóa Diễn giải và Thuộc tính Giao dịch
- **Nội dung ngân hàng:** Thay đổi mô tả mặc định từ "MBVCB..." sang *"Đặng Thị Xuân Hà nộp tiền vào TK"* để minh bạch nguồn tiền.
- **Phân loại vốn:** Chuyển đổi các nội dung "Bổ sung vốn bằng vay huy động vốn" sang đúng bản chất hạch toán (Nợ 1111/Có 341).
- **Dữ liệu sạch:** Thay thế các giá trị trống (nan) bằng *"Khách lẻ"* hoặc *"Nhà cung cấp lạ"*.

### 5. Đồng bộ Số dư đầu kỳ (Opening Balances)
- **Kiểm soát:** Cộng dồn số dư đầu kỳ của 131/1312 và 341/3411 đảm bảo tính liên tục của dữ liệu sau khi gộp tài khoản.
- **Kiểm tra:** Đảm bảo không trùng lặp số dư đối với các tài khoản vay có chung nguồn gốc.

### 6. Điều chỉnh Hạch toán Cước Viễn thông
- **Yêu cầu:** Chuyển đổi các nghiệp vụ thanh toán cước dịch vụ viễn thông sang đúng tài khoản chi phí quản lý.
- **Thực hiện:**
    - Tự động nhận diện các dòng *"Cước dịch vụ Viễn thông"* trong NKC.
    - Chỉnh sửa từ mặc định sang: **Nợ 642** (Chi phí quản trị) / **Có 112** (Tiền gửi ngân hàng).
- **Phạm vi:** Áp dụng cho toàn bộ các chứng từ dịch vụ viễn thông trong năm 2023 (~43 triệu VNĐ).

---

### Danh sách file liên quan (Docs/Python):
1. `/chikiet/kata2025/ragketoan/python/merge_accounts_huyvu_2023.py`
2. `/chikiet/kata2025/ragketoan/python/fix_negative_cash_bank_2023.py`
3. `/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx`
4. `/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SO_CHI_TIET_HUYVU_2023_FINAL.xlsx`

*Báo cáo được khởi tạo tự động bởi Antigravity vào ngày 05/04/2026.*
