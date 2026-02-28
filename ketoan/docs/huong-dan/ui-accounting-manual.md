# Hướng dẫn Sử dụng Giao diện Tổng hợp Số liệu & Quyết toán Thuế

Tài liệu này hướng dẫn chi tiết cách sử dụng các tính năng trong phân hệ **Tổng hợp số** (`/tonghopso`), được thiết kế để chuẩn bị hồ sơ quyết toán thuế một cách chuyên nghiệp và tự động.

---

## 1. Dashboard (Bảng điều khiển)
Đây là màn hình đầu tiên khi đăng nhập, cung cấp cái nhìn tổng quan:
- **Biểu đồ doanh thu - chi phí:** Theo dõi dòng tiền theo tháng/quý.
- **Top mặt hàng bán chạy:** Giám sát hiệu quả kinh doanh.
- **Tình trạng chuẩn bị Audit:** Hiển thị phần trăm hoàn thiện sổ sách so với mục tiêu.

## 2. Đồng bộ Hóa đơn (`/tonghop`)
Phân hệ nạp dữ liệu đầu vào từ hóa đơn điện tử (XML/PDF) hoặc Portal Tổng cục Thuế.
- **Nút Đồng bộ (Sync):** AI sẽ tự động đọc, tách dòng và chuẩn hóa tên hàng.
- **Phân loại (Mapping):** Tại đây, bạn có thể kiểm tra xem AI đã gán đúng mã hàng và tài khoản kế toán chưa.

## 3. Bộ lọc Tổng thể (Global Filters)
Nằm ở phía trên cùng của trang, bộ lọc này áp dụng cho **tất cả các tab báo cáo**.
- **Chọn Công ty:** Lựa chọn đơn vị cần xem số liệu (Trong trường hợp quản lý nhiều mã số thuế).
- **Khoảng thời gian (Từ ngày - Đến ngày):** Quy định kỳ báo cáo (Ví dụ: 01/01/2025 - 31/12/2025 để quyết toán năm).
- **Nút Làm mới (Refresh):** Nhấn để AI tính toán lại toàn bộ bút toán khi có dữ liệu hóa đơn mới phát sinh.
- **Nút Xuất Excel:** Xuất báo cáo đang chọn ra file định dạng Excel để in ấn.

---

## 2. Chi tiết các Tab Tính năng

### 📑 Sổ Nhật Ký Chung
**Mục tiêu:** Hiển thị tất cả các nghiệp vụ kinh tế phát sinh trong kỳ theo trình tự thời gian.
- **Cấu trúc:** Mã hóa đơn, Ngày tháng, Diễn giải, Tài khoản Nợ/Có, Số tiền.
- **Tính năng đặc biệt:** 
    - Tự động hạch toán doanh thu và thuế từ hóa đơn.
    - **Tự động sinh bút toán giá vốn (632/156)** cho mỗi hóa đơn bán ra giúp kiểm soát lãi gộp ngay lập tức.

### 📗 Sổ Cái
**Mục tiêu:** Xem chi tiết biến động của từng tài khoản kế toán cụ thể.
- **Cách dùng:** Chọn mã tài khoản (ví dụ: 111, 112, 131, 331...) từ danh sách thả xuống.
- **Hiển thị:** Các bút toán đối ứng, số dư đầu kỳ, phát sinh trong kỳ và số dư cuối kỳ của tài khoản đó.

### 📊 Bảng Cân Đối Phát Sinh
**Mục tiêu:** Kiểm tra tổng thể tính cân đối của toàn bộ hệ thống tài khoản.
- **Kiểm tra nhanh:** Tổng phát sinh Nợ phải luôn bằng Tổng phát sinh Có. Nếu lệch, AI sẽ đánh dấu màu đỏ để cảnh báo.

### 🔎 Sổ Chi Tiết Đối Tượng
**Mục tiêu:** Quản lý công nợ khách hàng (131) và nhà cung cấp (331) chi tiết đến từng người.
- **Cách dùng:** 
    1. Chọn tài khoản cần xem (131 hoặc 331).
    2. Nhập tên hoặc mã đối tác vào ô tìm kiếm.
- **Hiển thị:** Lịch sử mua/bán và tình trạng nợ đọng hiện tại của đối tác đó.

### 📈 Báo cáo Kết quả Kinh doanh (P&L)
**Mục tiêu:** Xem doanh thu, giá vốn, chi phí quản lý và lợi nhuận thực tế.
- **Chỉ tiêu:** Hiển thị đầy đủ các mã số theo mẫu B02-DNN (Doanh thu nội bộ, Giá vốn hàng bán, Chi phí quản lý doanh nghiệp, Lợi nhuận thuần...).
- **Đơn vị tính:** Đồng Việt Nam.

### ⚖️ Bảng Cân Đối Kế Toán
**Mục tiêu:** Báo cáo tình hình tài sản và nguồn vốn tại một thời điểm.
- **Phân loại:** Tài sản (Tiền, Phải thu, Tồn kho, TSCĐ) và Nguồn vốn (Nợ phải trả, Vốn chủ sở hữu).
- **Tính cân đối:** Tổng Tài sản phải luôn bằng Tổng Nguồn vốn.

---

## 3. Hệ thống Giám sát & AI Audit (Tính năng độc quyền)

### 🚨 Cảnh báo Kho (Âm kho)
Hiển thị danh sách các mặt hàng bị xuất bán nhiều hơn số lượng hiện có trong kho.
- **Cột Số lượng âm:** Hiển thị số lượng cần bổ sung hóa đơn đầu vào để hợp thức hóa.
- **Gợi ý AI:** Đề xuất các mặt hàng cần nhập thêm hoặc kiểm tra lại đơn vị tính.

### 🛡️ AI Audit (Rà soát Rủi ro)
Đây là "trợ lý ảo" chuyên rà soát các lỗi mà đoàn thanh tra thuế thường tập trung soi:
- **Mức độ Lỗi (Màu đỏ):** Các sai phạm nghiêm trọng (Âm quỹ tiền mặt, HĐ > 20tr trả tiền mặt...).
- **Mức độ Cảnh báo (Màu vàng):** Các nghi vấn (Thuế suất bát thường, trùng số hóa đơn, thiếu đối tượng công nợ).
- **Hướng xử lý:** Với mỗi cảnh báo, AI cung cấp nút **"Xử lý ngay"** để hướng dẫn bạn cách điều chỉnh chứng từ hợp lệ.

---

---

## 5. Trợ lý Kế toán AI (Chatbot)
Nằm ở góc phải màn hình hoặc tab **"AI Chatbot"**.
- **Hỗ trợ truy vấn tự nhiên:** Bạn có thể hỏi *"Tháng 2 tôi bán được bao nhiêu?"* hoặc *"Tại sao tài khoản 111 lại bị âm?"*.
- **Giải đáp thông tư/nghị định:** AI được nạp sẵn dữ liệu về Thông tư 133, 200 và các quy định thuế mới nhất để giải đáp thắc mắc của bạn ngay lập tức.

## 6. Quy trình Đề xuất cho Quyết toán Thuế
1. **Bước 1:** Cập nhật dữ liệu từ tab **Đồng bộ hóa đơn**.
2. **Bước 2:** Vào tab **Cảnh báo Kho**, xử lý hết các mã hàng bị âm.
3. **Bước 3:** Vào tab **AI Audit**, kiểm tra và khắc phục các lỗi màu đỏ/vàng.
4. **Bước 4:** Kiểm tra tính cân đối tại **Bảng Cân Đối Phát Sinh**.
5. **Bước 5:** Xuất Excel toàn bộ sổ sách để bàn giao hồ sơ.
