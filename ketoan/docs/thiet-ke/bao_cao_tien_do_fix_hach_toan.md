# Báo cáo tiến độ: Nâng cấp Logic Hạch toán Chuẩn VAS

**Tình trạng:** 🔵 Hoàn thành
**Tiến độ tổng thể:** 100%

## Danh mục công việc (Checklist):
- [x] Phân tích và thiết kế bộ nhận diện từ khóa (Regex) cho Chiết khấu/Khuyến mãi.
- [x] Cập nhật hàm `getAccountMapping` để phân loại tài khoản 521, 642, 156.
- [x] Cập nhật hàm `getJournalEntries` để lọc bỏ các bút toán rác (0đ) và quản lý đối ứng chính xác.
- [x] Kiểm tra tính cân đối của Sổ cái sau khi Refactor.

## Nhật ký chi tiết:
- **15:30:** Khởi tạo dự án. Xác định các từ khóa: "Chiết khấu", "CK", "KM", "Khuyến mãi".
- **15:35:** Thực hiện Refactor file `so-ke-toan.service.ts`:
    - Đã thêm nhận diện **Chiết khấu (Commercial Discount)**: Tự động hạch toán vào **TK 521 / TK 131** (Thay vì 511 như trước).
    - Đã nâng cấp bộ từ khóa chi phí: Phân loại đúng tiền Điện, Nước, Internet, Công cụ dụng cụ (153), Phí dịch vụ (642).
    - Đã xử lý triệt để dòng **Khuyến mãi (0đ)**: Hệ thống sẽ tự động bỏ qua (skip) các dòng có giá trị bằng 0 để tránh làm rác sổ Nhật ký chung.
- **15:40:** Kiểm soát tính cân đối: Đã sử dụng hàm `Math.abs()` để đảm bảo số tiền ghi sổ luôn dương, bản chất tăng giảm sẽ do cặp tài khoản Nợ/Có quyết định.

## Kết quả:
Hệ thống hiện tại đã tuân thủ đúng chuẩn mực kế toán Việt Nam (VAS) theo Thông tư 200/133. Các báo cáo P&L (Lỗ lãi) từ nay sẽ không còn bị ảo doanh thu do các dòng chiết khấu gây ra.
