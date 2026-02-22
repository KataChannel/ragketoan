# Tổng Hợp Kết Quả Nâng Cấp Hệ Thống Hạch Toán Chuẩn VAS

Tài liệu này tổng hợp toàn bộ các thay đổi về logic kế toán để đảm bảo hệ thống tuân thủ Đúng và Đủ theo Chuẩn mực Kế toán Việt Nam (VAS).

## 1. Vấn Đề Trước Khi Sửa Đổi
*   **Bơm khống doanh thu:** Toàn bộ các dòng Chiết khấu (Discount) bị hạch toán vào Có TK 511 (Doanh thu) bằng số dương, gây sai lệch báo cáo kết quả kinh doanh.
*   **Rác sổ Nhật ký:** Các dòng khuyến mãi 0 VNĐ vẫn được ghi sổ, làm tăng khối lượng dữ liệu thừa.
*   **Phân loại sai chi phí:** Chưa phân loại được các khoản Điện, Nước, Internet hay Công cụ dụng cụ.

## 2. Giải Pháp Đã Triển Khai (Refactor Logic)
*   **Nhận diện Chiết khấu (Regex):** Tự động phát hiện từ khóa "Chiết khấu", "CK" để hạch toán sang **TK 521** (Giảm trừ doanh thu) và đối ứng **TK 131**.
*   **Lọc dữ liệu 0đ:** Hệ thống tự động bỏ qua (skip) các dòng hàng có giá trị bằng 0 và không có thuế.
*   **Mở rộng bộ từ khóa Chi phí:** Phân loại đúng các tài khoản **642** (Chi phí quản lý), **153** (Công cụ dụng cụ), **156** (Hàng hóa).

---

## 3. Kết Quả Thực Tế (Ví dụ Hóa đơn 5256)
Sau khi áp dụng logic mới, đây là danh sách bút toán được sinh ra tự động:

### Nhóm 1: Doanh Thu Bán Hàng
| Diễn giải | Nợ | Có | Số tiền |
| :--- | :---: | :---: | :--- |
| Bán SN Nước Yến Sannest Lọ T | 131 | 511 | 3.412.500 |
| Bán SN Nước Yến Sannest Lon T | 131 | 511 | 7.830.000 |
| Bán CLM Sa tế tôm pet 90g | 131 | 511 | 4.320.000 |
| Bán CLM Dầu hào pet 820g | 131 | 511 | 3.834.000 |
| **Cộng Doanh thu (Gross)** | | | **19.396.500** |

### Nhóm 2: Giảm Trừ Doanh Thu
| Diễn giải | Nợ | Có | Số tiền |
| :--- | :---: | :---: | :--- |
| Chiết khấu: Chiết khấu 5% + 5%... | 521 | 131 | 1.124.250 |
| Chiết khấu: Chiết khấu 6,5% | 521 | 131 | 530.010 |
| **Cộng Chiết khấu** | | | **1.654.260** |

### Nhóm 3: Thuế GTGT & Thanh Toán
| Diễn giải | Nợ | Có | Số tiền |
| :--- | :---: | :---: | :--- |
| Thuế GTGT bán ra | 131 | 3331 | 1.419.379 |
| **TỔNG PHẢI THU (131)** | | | **19.161.619** |

---

## 4. Xác Nhận Tuân Thủ
✅ **Khớp số tổng:** Tổng Nợ/Có của TK 131 khớp hoàn toàn với giá trị thanh toán của hóa đơn.
✅ **Chuẩn VAS:** Tuân thủ Thông tư 200/TT-BTC về việc ghi nhận doanh thu thuần và giảm trừ doanh thu.
✅ **Hiệu suất:** Code sạch, không sinh bút toán thừa (0đ).

---
*Tài liệu được tạo tự động bởi Antigravity AI Assistant.*
