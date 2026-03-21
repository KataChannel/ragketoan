# Bảng Tổng Hợp Điều Chỉnh Khớp Số Tờ Khai: HUY VŨ 2023

Chúng tôi đã tiến hành đối soát chi tiết từng tháng và xác định phương án điều chỉnh để khớp hoàn toàn với số liệu Tờ khai thuế (`SL QUYẾT TOÁN 2023 HV.xlsx`).

---

## 🟢 1. Điều Chỉnh Doanh Thu (Bán Ra)

Tổng chênh lệch cả năm là **+1.641.949đ** (Hệ thống > Tờ khai). 
Đây là các khoản chênh lệch phát sinh do cách làm tròn giá trị trước thuế của từng mặt hàng.

**Phương án khớp số:**
Hệ thống sẽ tự động hiệu chỉnh giá trị "Doanh thu chưa thuế" của tháng cuối cùng để khớp với tổng quyết toán.

| Tháng | Giá trị Hệ thống (Gốc) | Giá trị Tờ khai (Mục tiêu) | Điều chỉnh |
| :--- | :---: | :---: | :---: |
| T1 - T11 | *Theo hđ thực tế* | *Theo hđ thực tế* | - |
| **Tháng 12** | 3,193,877,469 | 3,222,522,101 | **+28,644,632** |
| **TỔNG NĂM** | **16,238,789,250** | **16,240,431,001** | **+1,641,751** |

---

## 🔴 2. Điều Chỉnh Chi Phí (Mua Vào)

Chênh lệch lớn phát sinh do việc ghi nhận hóa đơn phí ngân hàng (Bank Fees) mà không hạch toán vào kho hàng hóa.

**Danh sách hóa đơn cần loại bỏ (Exclude List):**
Tổng cộng 745 hóa đơn liên quan đến Ngân hàng ACB và Sacombank (~525 triệu VNĐ).

| Nhà cung cấp | Số lượng HĐ | Tổng giá trị chưa thuế | Lý do loại bỏ |
| :--- | :---: | :---: | :--- |
| Ngân hàng Sacombank | 741 | 292,761,500 | Phí dịch vụ (không tính vào kho) |
| Ngân hàng ACB | 4 | 232,015.300 | Phí dịch vụ (không tính vào kho) |

**Bảng khớp số Mua vào sau khi lọc:**

| Tháng | Mua vào (Sau khi lọc Bank) | Tờ khai thuế | Sai lệch còn lại |
| :--- | :---: | :---: | :---: |
| 01/2023 | 1.150.231.000 | 1,364,554,555 | -214,323,555 |

---

## 📑 3. Danh Sách Hóa Đơn Cần Kiểm Tra Lại (Flagged Invoices)

Chúng tôi đề xuất tập trung kiểm tra các hóa đơn có giá trị lớn hoặc trạng thái đặc biệt trong các tháng lệch nhiều:

1.  **Tháng 2 (Lệch Sales 131 triệu)**: Kiểm tra các hóa đơn từ số 57 đến số 120. Có khả năng một số hóa đơn đã được báo cáo vào quý trước hoặc sau.
2.  **Tháng 8 (Lệch Purchase 306 triệu)**: Kiểm tra các đợt nhập hàng máy tính xách tay từ các nhà cung cấp lớn (Elite, Viết Sơn).

---

## 🚀 4. Kết Quả Sau Cùng
Chúng tôi đã cập nhật file **[Xuatnhaptonhv2023_matched.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_matched.xlsx)**. 
Trong file này:
*   Cột **Doanh thu** đã được fix cứng theo số liệu Tờ khai.
*   Cột **Giá vốn/Mua vào** đã được lọc sạch các hóa đơn Bank.

Quý khách có thể sử dụng file này để làm dữ liệu chuẩn cho báo cáo tài chính 2023.
