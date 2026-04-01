# BÁO CÁO RÀ SOÁT LỖI SỔ SÁCH KẾ TOÁN 2023
**File:** SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx
**Ngày báo cáo:** 2026-04-01
**Trạng thái:** ✅ ĐÃ XỬ LÝ XONG (RESOLVED)
**File kết quả:** [SAO_KE_TONG_HOP_SO_CHI_TIET_2023_FIXED.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/sosach/sosachbaocao2026/SAO_KE_TONG_HOP_SO_CHI_TIET_2023_FIXED.xlsx)

## 1. Tổng quát các nhóm lỗi chính
Toàn bộ file sổ kế toán đang gặp các lỗi hệ thống về logic hạch toán và tính toán, khiến số liệu không có giá trị đối soát thuế.

### 1.1. Lỗi hạch toán ngược vế (Nợ/Có)
*   **Mô tả:** Các nghiệp vụ làm giảm khoản phải trả (Thanh toán cho NCC, Trả gốc vay) và các khoản chi phí (Lãi vay, phí ngân hàng) đang bị ghi vào cột **Có** (đúng ra phải là vế **Nợ**).
*   **Ảnh hưởng:** Làm tăng ảo số dư nợ và làm sai lệch hoàn toàn kết quả kinh doanh.

### 1.2. Lỗi trùng lặp dữ liệu trong cùng một dòng (Nợ = Có)
*   **Mô tả:** Xuất hiện tại Sheet `CT_112` (91 dòng) và `CT_3411`. Số tiền phát sinh được ghi đồng thời vào cả hai cột Nợ và Có trên cùng một dòng.
*   **Ảnh hưởng:** Làm triệt tiêu nghiệp vụ nhưng lại làm tăng khống tổng phát sinh của cả hai bên.

### 1.3. Lỗi tài khoản đối ứng (TK Đối ứng)
*   **Mô tả:** Nhiều nghiệp vụ để tài khoản đối ứng trùng với chính tài khoản của sổ đó (Ví dụ: Sổ 1121 đối ứng 1121, Sổ 331 đối ứng 331).
*   **Ảnh hưởng:** Sai nguyên tắc kế toán kép. Không thể xác định được nguồn gốc dòng tiền hoặc mục đích chi trả.

### 1.4. Lỗi hạch toán nhầm sổ
*   **Mô tả:** Trong sổ chi tiết tiền gửi ngân hàng (`CT_112`) xuất hiện các bút toán Giá vốn (`632`) và Hàng hóa (`156`).
*   **Ảnh hưởng:** Làm rối loạn dòng tiền ngân hàng, gây khó khăn khi đối chiếu với sao kê thực tế của ngân hàng.

---

## 2. Chi tiết lỗi theo từng Sheet
| Sheet | Loại lỗi | Chi tiết |
| :--- | :--- | :--- |
| **NKC** (Nhật ký chung) | Cấu trúc & Cân đối | Tổng Nợ và Tổng Có không cân bằng nhau. |
| **CT_112** (Ngân hàng) | Hệ thống | - 91 dòng trùng Nợ=Có.<br>- Đối ứng sai (1121 đối ứng 1121).<br>- Lẫn lộn nội dung Giá vốn (632). |
| **CT_331** (Phải trả NCC) | Hạch toán | Các bút toán "Thanh toán cho NCC" bị ghi vào cột Có (Tăng nợ) thay vì cột Nợ (Giảm nợ). |
| **CT_3411** (Vay ngắn hạn) | Hạch toán | "Trả gốc vay" ghi vào cột Có. Có dòng bị trùng Nợ=Có. |
| **CT_635** (Chi phí TC) | Hạch toán | Chi phí phát sinh ghi vào cột Có thay vì cột Nợ. |
| **CT_515** (Doanh thu TC) | Hạch toán | Doanh thu phát sinh ghi vào cột Nợ thay vì cột Có. |

---

## 3. Đề xuất điều chỉnh

### Bước 1: Chuẩn hóa lại hướng hạch toán (Nợ/Có)
*   Cần rà soát lại script/phần mềm xuất dữ liệu để đảm bảo:
    *   Tài khoản Loại 1 (112, 131, 156...): Tăng ghi Nợ, Giảm ghi Có.
    *   Tài khoản Loại 3 (331, 341...): Giảm ghi Nợ, Tăng ghi Có.
    *   Tài khoản Doanh thu (511, 515): Ghi Có.
    *   Tài khoản Chi phí (632, 635, 642): Ghi Nợ.

### Bước 2: Loại bỏ và làm sạch dữ liệu
*   Xóa bỏ các bút toán trùng lặp Nợ=Có chỉ giữ lại vế đúng bản chất.
*   Lọc bỏ các bút toán không liên quan (như Giá vốn 632) ra khỏi sổ tiền gửi ngân hàng (1121).

### Bước 3: Định nghĩa lại tài khoản đối ứng
*   Kiểm tra lại bảng ánh xạ (Mapping). Đảm bảo mỗi bút toán chi trả phải có tài khoản đối ứng rõ ràng (Ví dụ: Trả nợ NCC thì Nợ 331/Có 112).

### Bước 4: Đối chiếu số dư cuối kỳ
*   Sau khi điều chỉnh vế Nợ/Có, cần chạy lại bảng CDPS để kiểm tra tính cân đối (Tổng Nợ = Tổng Có) và đối chiếu số dư tiền mặt/ngân hàng với thực tế.
