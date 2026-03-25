---
name: accounting_xnt_logic
description: Hướng dẫn xử lý logic dữ liệu Kế Toán & rà soát dữ liệu XNT (Xuất Nhập Tồn), đảm bảo các nguyên tắc hạch toán và Báo cáo thuế.
---

# Xử lý Logic Kế Toán và Báo Cáo XNT (Xuất Nhập Tồn)

Skill này cung cấp các nguyên tắc cốt lõi khi làm việc với báo cáo XNT và đối soát Thuế, tránh các lỗi làm lệch số liệu so với **Báo Cáo Thuế** thực tế.

## 1. Giá trị Hóa đơn: Chọn Cột Dữ Liệu Theo Chuẩn Báo Cáo
- **Doanh thu và Chi phí Báo cáo thuế luôn là giá trị chưa thuế.**
- Khi cấu hình các báo cáo kê khai, hoặc tổng hợp hóa đơn (`Hoadon` sheet), bắt buộc phải sử dụng trường `tgtcthue` (Tổng giá trị chưa thuế) thay vì `tgtttbso` (Tổng giá trị thanh toán bằng số - đã bao gồm VAT). Việc dùng trường có thuế sẽ làm số liệu bị đội lên và gây chênh lệch rất lớn so với "Số Đúng Bán" / "Số Đúng Mua".

## 2. Lưu Ý Về Bộ Lọc Hóa Đơn Lỗi/Loại Trừ (Exclusion List)
- Số hóa đơn (SHĐ) rất dễ bị trùng lặp giữa hóa đơn đầu vào (`muavao`) (do xuất từ hàng ngàn nhà cung cấp khác nhau) và hóa đơn đầu ra (`banra`).
- Khi lập danh sách loại trừ các hóa đơn bị sai sót (Ví dụ: `exclusion_2023`), **phải đi kèm ràng buộc cụ thể loại hóa đơn (`loaihd == 'banra'` hoặc `loaihd == 'muavao'`)**.
- Nếu chỉ bắt điều kiện `(yyyymm, shdon) in exclusion_2023`, script sẽ vô hiệu hóa nhầm hóa đơn đầu vào hợp lệ, làm triệt tiêu số dư nhập kho và phá vỡ cấu trúc tổng thể.

## 3. Anti-Negative Guard (Chống Tồn Kho Âm) và Bảo Toàn Doanh Thu
Trong các hệ thống phân bổ hoặc sinh báo cáo XNT tự động qua từng tháng:
- Nếu số lượng xuất kho (`xuat_sl`) vượt quá số lượng hàng hóa có sẵn (`avail_sl`), có thể buộc giới hạn `x_sl = avail_sl` (hoặc tính Tồn Cuối (`ck_sl`) bị chặn về 0) để không làm âm kho.
- Tuy nhiên **tuyệt đối KHÔNG gán đè giá trị tiền xuất (`x_tien = avail_tien`)** nếu báo cáo này đang đo lường Doanh thu. Việc chặn giá trị xuất ở mức Giá vốn sẽ triệt tiêu hoàn toàn tỷ suất Lãi/Lỗ, phá vỡ toàn bộ Tổng Doanh Thu bán ra. 
- => Phương án hợp lý là cứ cho dồn tồn kho tiền bị âm (sau đó reset Tồn cuối về 0 để chuyển qua tháng sau) nhưng phải giữ nguyên vẹn giá bán `x_tien` của tháng đó.

## 4. Phân Loại Hàng Hóa Nằm Ngoài Tồn Kho (SKIP Items)
- Các hóa đơn có chứa Phí Ngân hàng, Bảo hiểm, Dịch vụ viễn thông, Thức ăn/Đồ uống... là các giao dịch ngoài hệ sinh thái quản lý hàng hóa vật tư CNTT.  
- Khi trích xuất hóa đơn vào bảng kê, các hóa đơn mà **toàn bộ Mặt hàng (Chi tiết) đều thuộc dạng SKIP** cũng cần phải bị loại bỏ để đảm bảo Tổng Nhập khớp hoàn toàn với những mặt hàng đã đưa vào Tờ Khai Thuế.
