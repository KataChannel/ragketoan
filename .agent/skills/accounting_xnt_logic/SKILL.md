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
## 5. Quy Tắc Phân Loại Hạch Toán Theo Diễn Giải (Mapping Rules)
Khi hạch toán các giao dịch ngân hàng theo "Mua hàng" hoặc "Chi phí", cần tuân thủ các từ khóa diễn giải sau đây để gán tài khoản chính xác (Đặc biệt áp dụng cho Huy Vũ 2024):

### Tài Khoản 635 (Chi phí tài chính)
Dành cho các khoản phí ngân hàng trực tiếp, lãi vay và các dịch vụ vận tải đặc thù theo hợp đồng:
*   **Từ khóa chính:** `TP CK`, `TRICH LAI`, `THU PHI`, `PHI T03`, `Dịch vụ ngân hàng`, `SMS Banking`, `THU LAI`.
*   **Dịch vụ bảo lãnh:** `Bao lanh`, `Phat Hanh Bao lanh`.
*   **Vay vốn:** `Tien vay`, `Trich thu 1 phan Tien vay`.
*   **Vận đơn đặc thù:** `Đường bộ Vận đơn số` (NB: Nhất Tín).

### Tài Khoản 341 (Chi trả vay huy động vốn)
Áp dụng cho các nghiệp vụ thanh toán nội bộ hoặc tạm ứng thực chất là trả nợ vay:
*   **Từ khóa chính:** `Chi tạm ứng`, `Đối trừ nội bộ`, `Chi từ tạm ứng`.
*   **Hạch toán:** Ghi Nợ TK 341 / Có TK 111. Diễn giải mới: `Chi trả vay huy động vốn`.

### Tài Khoản 642 (Chi phí quản lý doanh nghiệp)
Dành cho các dịch vụ tiện ích, viễn thông, nhiên liệu và phí cầu đường thường xuyên:
*   **Viễn thông/IT:** `Viễn thông`, `Cước dịch vụ`, `Cước điện thoại`, `Công nghệ thông tin`, `viễn thông trả sau`.
*   **Nhà cung cấp viễn thông:** `Tập đoàn Công nghiệp - Viễn thông Quân đội` (Viettel), `VNPT`, `MOBIFONE`.
*   **Nhiên liệu:** `Xăng RON95`, `Dầu DO`.
*   **Phí cầu đường:** `Cước đường bộ xe` (NB: VETC).
*   **Giao dịch đặc thù:** `Thu phi chuyen tien ngoai he thong` (ACB).

*Lưu ý:* Khi script xử lý, thứ tự ưu tiên các quy tắc này là quan trọng. Các quy tắc chi tiết hơn (nhữ tên nhà cung cấp hoặc dịch vụ cụ thể) nên được kiểm tra sau các quy tắc chung nếu có sự chồng lấn.

## 6. Quy Tắc Điều Chỉnh Số Liệu Tránh Số Âm (Zero-Negative Adjustment Rule)
Khi thực hiện điều chỉnh (Adjustment) số liệu để khớp với số dư mục tiêu (Target), tuyệt đối không được ghi số âm vào các cột Phát sinh Nợ hoặc Phát sinh Có. 

### Nguyên tắc xử lý "Phân bổ giảm" (Distribution):
- **Nếu Chênh lệch (Gap) < 0:** Tức là số liệu hiện tại đang cao hơn mục tiêu. Thay vì tạo một dòng điều chỉnh âm, phải thực hiện "phân bổ giảm" bằng cách trừ trực tiếp vào các dòng phát sinh dương hiện có trong sổ của chính tài khoản đó.
- **Thứ tự ưu tiên:** Nên trừ từ các dòng phát sinh muộn nhất (cuối năm) ngược lên trên cho đến khi đủ số lượng cần giảm.
- **Kiểm soát:** Đảm bảo sau khi trừ, giá trị tại dòng đó không bị âm (min = 0). Nếu dòng đó không đủ để trừ hết, tiếp tục trừ sang dòng phía trên.
- **Mục tiêu:** Tổng cộng cột (Total) sau khi điều chỉnh phải khớp chính xác với Target và tất cả các dòng đều là số dương hoặc bằng 0.

## 7. Quy Tắc Phân Bổ Điều Chỉnh Thực Tế (Realistic Distribution Rule)
Đối với các tài khoản có tần suất giao dịch cao và số dư tiền mặt lớn (như TK 1111 - Tiền mặt), thay vì sử dụng một dòng điều chỉnh tổng quát "DC_KS" vào cuối năm, nên thực hiện phân bổ thành nhiều bút toán nhỏ lẻ rải rác trong suốt kỳ kế toán.

### Nội dung thực hiện:
- **Ngẫu nhiên hóa (Randomization):** Chia nhỏ số tiền cần điều chỉnh thành nhiều bút toán với giá trị khác nhau (không trùng số) để mô phỏng các giao dịch thực tế (như thu tiền khách hàng lẻ, nộp tiền vào quỹ,...).
- **Diễn giải nghiệp vụ:** Sử dụng các nội dung giao dịch thực tế thay vì từ khóa "Điều chỉnh". Ví dụ (Theo chuẩn Huy Vũ 2024):
    - *Thu bán lẻ hàng hóa (Đối ứng TK 131)* - Gộp chung toàn bộ các khoản thu nợ và bán lẻ, tuyệt đối không dùng TK 5111.
    - *Vay huy động vốn (Đối ứng TK 341)*
    - *Chi trả vay huy động vốn (Đối ứng TK 341)*
- **Phân bổ thời gian:** Rải đều các bút toán này vào các ngày làm việc trong năm (ưu tiên các ngày có ít phát sinh hoặc theo quy trình kinh doanh).
- **Tính đối ứng:** Luôn đảm bảo cập nhật đồng bộ sang cả hai sổ (Sổ Nợ và Sổ Có) để giữ nguyên tắc cân bằng kế toán (Double-entry).
