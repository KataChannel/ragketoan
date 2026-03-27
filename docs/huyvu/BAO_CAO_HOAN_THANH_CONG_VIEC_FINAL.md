# BÁO CÁO HOÀN THÀNH XỬ LÝ DỮ LIỆU KẾ TOÁN HUY VŨ (2023 - 2026)

Chào bạn, tôi đã hoàn thành toàn bộ quy trình xử lý dữ liệu Xuất Nhập Tồn (XNT) cho công ty Huy Vũ theo yêu cầu. Dưới đây là tóm tắt các công việc đã thực hiện:

## 1. Dữ liệu Đầu vào & Chuẩn hóa
- **Số dư đầu kỳ 2023:** Đã nạp dữ liệu từ file BCTC 2022 (tổng cộng ~13.5 tỷ VNĐ) làm căn cứ khởi đầu.
- **Danh mục Nhóm Sản Phẩm:** Đã chuẩn hóa danh mục với 48 nhóm hàng chính (PC, Laptop, Máy in, Linh kiện...).
- **Xử lý Mã hàng:** Đã ánh xạ toàn bộ mã hàng từ hóa đơn vào các Nhóm Sản Phẩm tương ứng để tính toán XNT.

## 2. Kết quả Tính toán XNT (2023 - 2026)
Tôi đã tạo ra các file Excel báo cáo XNT chi tiết cho từng năm tại thư mục `docs/huyvu/`:
- [XNT_HuyVu_2023.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2023.xlsx)
- [XNT_HuyVu_2024.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2024.xlsx)
- [XNT_HuyVu_2025.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2025.xlsx)
- [XNT_HuyVu_2026.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2026.xlsx)

**Cấu trúc file Excel bao gồm:**
1. **Sheet Tháng 1 - Tháng 12:** Chi tiết XNT từng tháng với đầy đủ 13 cột yêu cầu (Giá vốn, Xuất theo giá vốn, Tồn cuối...).
2. **Sheet Hoadon:** Tổng hợp số lượng và giá trị hóa đơn mua vào/bán ra theo tháng.
3. **Sheet xnt12thang:** Bảng tổng hợp cả năm để đối chiếu nhanh.

## 3. Các điểm nổi bật trong xử lý logic
- **Giá vốn:** Sử dụng phương pháp Bình quân Gia quyền (Weighted Average) tính theo tháng: `(Tồn đầu VNĐ + Nhập VNĐ) / (Tồn đầu SL + Nhập SL)`.
- **Tồn cuối (VNĐ):** Được tính dựa trên giá vốn, đảm bảo tính nhất quán giữa dòng tiền và hàng hóa.
- **Phân bổ mã hàng:** Các mã hàng không rõ ràng được phân bổ vào các nhóm đại diện dựa trên từ khóa kỹ thuật (SSD, RAM, LCD...).

## 4. Báo cáo Đối chiếu (Checklist)
Tôi cũng đã tạo các báo cáo giải trình chênh lệch giữa dữ liệu XNT tính toán và dữ liệu BCTC:
- [Báo cáo Tổng kết Final](file:///chikiet/kata2025/ragketoan/docs/huyvu/BAO_CAO_TONG_KET_FINAL_2023_2026.md)
- [Kiểm tra chênh lệch (Excel)](file:///chikiet/kata2025/ragketoan/docs/huyvu/kiemtrachenhlech.xlsx)

Nếu bạn cần điều chỉnh bất kỳ tham số nào (ví dụ: thay đổi giá vốn ban đầu của một số mặt hàng), tôi có thể chạy lại script xử lý ngay lập tức.

Rất vui được hỗ trợ bạn!
