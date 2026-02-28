# Hướng dẫn Sử dụng Chi tiết Hệ thống AI Kế Toán & Quyết Toán Thuế

Tài liệu này cung cấp hướng dẫn vận hành chi tiết cho từng phân hệ trong ứng dụng. Hệ thống được thiết kế để tự động hóa tối đa quy trình từ khi nhận hóa đơn đến khi lên báo cáo tài chính và rà soát rủi ro thuế.

---

## 🧭 Cấu trúc Route & Phân hệ
- `/`: **Dashboard** - Tổng quan tình hình tài chính và tiến độ quyết toán.
- `/hoadon`: **Quản lý Hóa đơn** - Đồng bộ từ Tổng cục Thuế, lưu trữ và lọc hóa đơn.
- `/tonghopso`: **Sổ sách Kế toán** - Nhật ký chung, Sổ cái, BCTC và AI Audit.
- `/xuatnhapton`: **Kho hàng (Inventory)** - Quản lý nhập/xuất và tính giá vốn bình quân.
- `/ai-mapping`: **Duyệt AI (HITL)** - Phê duyệt kết quả ánh xạ mặt hàng do AI xử lý.
- `/training`: **Huấn luyện AI** - Chuẩn hóa danh mục mặt hàng tự động.
- `/thongke`: **Phân tích** - Biểu đồ thống kê doanh thu, chi phí.

---

## 🚀 1. Dashboard (Trang chủ)
Màn hình trung tâm giúp giám sát nhanh sức khỏe doanh nghiệp.
- **Thao tác:**
    1. Xem biểu đồ doanh thu theo thời gian để nhận diện mùa vụ kinh doanh.
    2. Kiểm tra **"Tình trạng chuẩn bị Audit"** để biết cần hoàn thiện bao nhiêu % hồ sơ.
    3. Nhấn **"Vào ứng dụng"** để đi đến phân hệ Hóa đơn - nơi bắt đầu quy trình.

---

## 📥 2. Quản lý Hóa đơn (`/hoadon`)
Cổng nạp dữ liệu chính cho toàn bộ hệ thống.

### � Đồng bộ hóa đơn từ API Thuế
Nền tảng này kết nối trực tiếp với cổng `hoadondientu.gdt.gov.vn`.
- **Các bước thực hiện:**
    1. Nhấn nút **"Đồng bộ"** (Biểu tượng mũi tên ngược nhau).
    2. Chọn **Loại hóa đơn** (Bán ra/Mua vào).
    3. Chọn **Khoảng thời gian** cần lấy dữ liệu.
    4. Tích vào **"Đồng bộ chi tiết"** nếu muốn lấy cả danh sách từng mặt hàng (Khuyên dùng).
    5. Nhấn **"Bắt đầu đồng bộ"** và theo dõi thanh tiến trình Real-time.

### ⚙️ Cấu hình API & Công ty
Để đồng bộ thành công, bạn cần cấu hình Bearer Token.
- **Thao tác:**
    1. Nhấn **"Cài đặt API"** (Biểu tượng bánh răng).
    2. Chọn **Công ty** cần cấu hình.
    3. Dán **Bearer Token** lấy từ trình duyệt khi đăng nhập trang Thuế Điện Tử.
    4. Nhấn **"Lưu cấu hình"**. Chú ý: Token có thời hạn, nếu đồng bộ lỗi 401, hãy cập nhật lại Token mới.

---

## 🧠 3. Chuẩn hóa & Huấn luyện AI (`/training` & `/ai-mapping`)
Tính năng "trí tuệ" giúp gộp nhiều tên hàng ghi sai lệch về cùng một mã chuẩn.

### 🎓 Huấn luyện AI (`/training`)
Sử dụng khi bạn có quá nhiều mặt hàng tên tương tự nhau (Ví dụ: "Thép phi 10", "T.Phi 10", "HP Phi 10").
- **Thao tác:**
    1. Nhập **API Key** (Ollama hoặc Gemini) và chọn số lượng mặt hàng cần quét.
    2. Nhấn **"Chạy Training Tự Động"**. AI sẽ tìm các nhóm tương đồng.
    3. Xem các **"Gợi ý"** ở bên dưới. Nếu đúng, nhấn **"Áp dụng ngay"** hoặc **"Áp dụng tất cả"**.
    4. Nhấn **"Lưu & Đồng bộ bảng kê"** để cập nhật kết quả vào sổ kho.

### 🛡️ Duyệt Mặt hàng AI (`/ai-mapping`)
Dành cho các mặt hàng mới mà AI chưa đủ độ tự tin để tự động gán mã.
- **Thao tác:**
    1. Theo dõi danh sách các mặt hàng **"PENDING"**.
    2. Xem **"AI Đề xuất"** và lý do AI chọn mã đó.
    3. Nếu đúng: Nhấn **"Duyệt Gợi Ý"**.
    4. Nếu sai: Nhập tay vào ô **"Tùy chỉnh mã/tên chuẩn"** rồi nhấn **"Lưu Tùy Chỉnh"**.

---

## 📦 4. Quản lý Kho (`/xuatnhapton`)
Tự động chuyển đổi hóa đơn thành phiếu Nhập/Xuất kho.

### � Tính toán Giá vốn & XNT
- **Thao tác:**
    1. Nhấn **"Đồng bộ"** để quét toàn bộ hóa đơn vừa tải về vào bảng kho.
    2. Nhấn **"Cập nhật XNT"** (Màu vàng): AI sẽ tính toán lại giá vốn theo phương pháp **Bình quân gia quyền**.
    3. Kiểm tra các mặt hàng bị **"Âm"** để bổ sung hóa đơn đầu vào kịp thời.
    4. Xuất báo cáo: Có 3 loại báo cáo (Tháng, Năm, Tổng hợp) hỗ trợ định dạng Excel in ấn.

---

## ⚖️ 5. Tổng Hợp Sổ Kế Toán & Audit (`/tonghopso`)
Giai đoạn cuối cùng để chuẩn bị hồ sơ lưu trữ.

### 📔 Sổ Nhật Ký & Sổ Cái
- **Thao tác:**
    1. Nhấn **"Cập nhật dữ liệu sổ"**: Hệ thống sẽ quét toàn bộ hóa đơn và kho để sinh ra các bút toán Nợ/Có tự động.
    2. Chọn tài khoản (111, 112, 131...) tại tab **Sổ Cái** để kiểm tra tính đúng đắn của dòng tiền và công nợ.

### 🛡️ AI Audit (Phát hiện sai sót Thuế)
Tính năng then chốt trước khi nộp báo cáo.
- **Thao tác:**
    1. Chuyển sang tab **"AI Audit"**.
    2. Xem các cảnh báo:
        - **Màu Đỏ:** Lỗi bắt buộc phải sửa (Ví dụ: Thanh toán tiền mặt > 20tr).
        - **Màu Vàng:** Rủi ro giải trình (Ví dụ: Hóa đơn trùng lặp, giá vốn cao bất thường).
    3. Nhấn **"Xem giao dịch"** để truy vết lại hóa đơn gốc bị lỗi.

---

## 📅 6. Quy trình 05 Bước "Quyết toán trong 1h"
Hướng dẫn nhanh cho kỳ quyết toán:
1.  **Bước 1 (Hóa đơn):** Đồng bộ toàn bộ hóa đơn Mua vào/Bán ra của cả năm.
2.  **Bước 2 (Chuẩn hóa):** Vào **Training AI** để dọn dẹp các tên hàng rác, gộp về mã chuẩn.
3.  **Bước 3 (Kho hàng):** Nhấn **Cập nhật XNT** để hệ thống tính giá vốn tự động.
4.  **Bước 4 (Sổ sách):** Nhấn **Cập nhật dữ liệu sổ** để lên Báo cáo tài chính.
5.  **Bước 5 (Audit):** Kiểm soát lỗi bằng **AI Audit** và **Xuất Excel** lưu trữ/in ấn.
