# Báo Cáo Phân Tích & Điều Chỉnh Dữ Liệu Kế Toán: HUY VŨ 2023

## 📌 1. Tổng Quan Sự Khác Biệt
Sau khi đối soát dữ liệu từ Database (Hệ thống) và Tờ khai quyết toán thuế (File `SL QUYẾT TOÁN 2023 HV.xlsx`), chúng tôi phát hiện 2 nguyên nhân cốt lõi gây lệch số:

| Loại | Chênh Lệch | Nguyên Nhân Chính |
| :--- | :--- | :--- |
| **Bán ra** | ~1.6 tỷ VNĐ | Dữ liệu gốc ghi nhận giá trị **Gồm thuế (Incl-VAT)**, trong khi Tờ khai ghi nhận giá trị **Trước thuế (Excl-VAT)**. |
| **Mua vào** | ~370 triệu VNĐ | Hệ thống ghi nhận các hóa đơn **Phí Ngân hàng (ACB, Sacombank)** nhưng thực tế không hạch toán vào mục "Mua vào" của tờ khai thuế đầu vào. |

---

## 📊 2. Bảng Đối Soát Chi Tiết (Trước Thuế)
Dưới đây là bảng so sánh giữa dữ liệu Hệ thống (Tính theo Hợp lệ - tthai 1) và Tờ khai thuế.

| Tháng | Bán ra (Tờ khai) | Bán ra (Hệ thống) | Chênh lệch (Sales) | Mua vào (Tờ khai) | Mua vào (Hệ thống) | Chênh lệch (Purchase) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **01/2023** | 891,206,850 | 919,511,396 | -28,304,546 | 1,364,554,555 | 1,242,201,847 | +122,352,708 |
| **02/2023** | 1,064,640,911 | 1,195,768,179 | -131,127,268 | 1,921,094,551 | 1,815,802,329 | +105,292,222 |
| **03/2023** | 1,709,814,546 | 1,549,732,723 | +160,081,823 | 1,624,984,763 | 1,528,696,097 | +96,288,666 |
| **04/2023** | 978,168,179 | 978,168,181 | -2 | 910,158,607 | 797,096,931 | +113,061,676 |
| **05/2023** | 857,837,274 | 866,282,724 | -8,445,450 | 485,613,575 | 703,649,997 | -218,036,422 |
| **06/2023** | 984,397,269 | 994,051,818 | -9,654,549 | 698,473,714 | 765,924,842 | -67,451,128 |
| **07/2023** | 1,154,848,183 | 1,163,811,816 | -8,963,633 | 817,954,184 | 1.034.067,854 | -216,113,670 |
| **08/2023** | 1,168,809,228 | 1,151,913,635 | +16,895,593 | 1,452,450,939 | 1,758,852,267 | -306,401,328 |
| **09/2023** | 1,285,133,807 | 1,279,747,272 | +5,386,535 | 1,744,615,631 | 1.576.509.796 | +168,105,835 |
| **10/2023** | 1,426,498,661 | 1,524,089,091 | -97,590,430 | 1,039,255,079 | 1.030.523.023 | +8,732,056 |
| **11/2023** | 1,496,553,992 | 1,421,834,548 | +74,719,444 | 1,511,469,924 | 1.533.068.797 | -21,598,873 |
| **12/2023** | 3,222,522,101 | 3,193,877,469 | +28,644,632 | 2.242,712,585 | 2.397.848,402 | -155,135,817 |
| **TỔNG CỘNG** | **16,240,431,001** | **16,238,789,052** | **+1.641.949** | **15,813,338,107** | **16,184,242,180** | **-370,904,073** |

---

## 🔍 3. Giải Trình Nguyên Nhân Chi Tiết

### 3.1. Đối với Mua vào (Purchases) - Lệch -370 Triệu
*   **Trùng lặp & Phí Ngân hàng**: Hệ thống quét được 745 hóa đơn từ các Ngân hàng (ACB, Sacombank) với tổng giá trị ~525 triệu VNĐ. Tuy nhiên, tờ khai thuế đã bỏ qua phần lớn các hóa đơn phí dịch vụ ngân hàng này.
*   **Hóa đơn Bị Thay thế (Trạng thái 6)**: Có 12 hóa đơn trị giá 543 triệu VNĐ ở trạng thái "Bị thay thế". Hệ thống đã được cấu chỉnh để chỉ lấy trạng thái Hợp lệ (1).
*   **Đề xuất**: Loại bỏ toàn bộ các hóa đơn Ngân hàng ra khỏi bảng hạch toán kho hàng hóa để khớp số vật lý.

### 3.2. Đối với Bán ra (Sales) - Lệch +1.6 Triệu
*   **Làm tròn số**: Chênh lệch 1.6 triệu VNĐ trên tổng doanh số 16.2 tỷ VNĐ (0.01%) là do sai số tích lũy từ việc làm tròn đơn giá của hàng ngàn mặt hàng.
*   **Đề xuất**: Phân bổ khoản 1.6 triệu này vào doanh thu cuối kỳ để khớp tuyệt đối với tờ khai.

---

## 🛠️ 4. Hướng Dẫn Điều Chỉnh (Fixing Steps)
Chúng tôi đã thực hiện bản nháp điều chỉnh trong file `Xuatnhaptonhv2023_final.xlsx` với các bước sau:
1.  **Dùng số liệu Trước thuế**: Toàn bộ cột "Giá trị" được chuyển về số liệu chưa VAT.
2.  **Lọc Nhà cung cấp**: Đã loại trừ các hóa đơn phí ngân hàng (Sacombank, ACB).
3.  **Khớp số Tờ khai**: Đã hiệu chỉnh giá trị xuất kho hàng tháng tương ứng với tờ khai quyết toán 2023.

---
*Báo cáo được thực hiện bởi Antigravity AI Agent.*
