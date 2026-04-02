# Cấu trúc file Sổ chi tiết tài khoản 2023

Tài liệu này mô tả cấu trúc của file Excel Sổ chi tiết tài khoản năm 2023 (file mẫu và file đã điều chỉnh).

## 1. Thông tin chung
- **Định dạng file**: Microsoft Excel (.xlsx)
- **Cấu trúc tổng quát**: Mỗi tài khoản kế toán được trình bày trong một Sheet riêng biệt.

## 2. Danh sách các Sheet (Tài khoản)
File bao gồm các Sheet tương ứng với hệ thống tài khoản kế toán đã sử dụng:
- **1111**: Tiền mặt tại quỹ
- **112**: Tiền gửi ngân hàng
- **131**: Phải thu của khách hàng
- **1331**: Thuế GTGT được khấu trừ của hàng hóa, dịch vụ
- **1561**: Giá mua hàng hóa
- **331**: Phải trả cho người bán
- **3331**: Thuế GTGT phải nộp (đầu ra)
- **3411**: Các khoản vay ngân hàng
- **5111**: Doanh thu bán hàng hóa
- **515**: Doanh thu hoạt động tài chính (Lãi tiền gửi)
- **632**: Giá vốn hàng bán
- **635**: Chi phí tài chính (Lãi vay, phí ngân hàng)
- **642**: Chi phí quản lý doanh nghiệp

## 3. Cấu trúc các cột dữ liệu
Mỗi Sheet có cấu trúc cột cố định như sau:

| Tên cột | Mô tả | Chi tiết |
| :--- | :--- | :--- |
| **Ngày hạch toán** | Ngày ghi sổ kế toán | Định dạng: dd/mm/yyyy |
| **Số chứng từ** | Số hiệu chứng từ gốc | Ví dụ: GBC (Báo có), GBN (Báo nợ), PXK (Xuất kho)... |
| **Diễn giải** | Nội dung chi tiết nghiệp vụ | Mô tả ngắn gọn sự việc phát sinh |
| **TK đối ứng** | Tài khoản đối ứng trong định khoản | Ví dụ: Nếu sheet là 112, TK đối ứng có thể là 131, 515... |
| **PS Nợ** | Số tiền phát sinh bên Nợ | Giá trị số (VNĐ) |
| **PS Có** | Số tiền phát sinh bên Có | Giá trị số (VNĐ) |
| **Đối tượng** | Tên khách hàng hoặc nhà cung cấp | Thông tin đối tượng liên quan đến nghiệp vụ |

## 4. Lưu ý quan trọng
- Dữ liệu trong Sổ chi tiết được liên kết trực tiếp từ file **Nhật ký chung (NKC)**.
- Mỗi chứng từ trong NKC khi lên sổ chi tiết sẽ tạo ra **2 dòng** (một dòng cho tài khoản Nợ và một dòng cho tài khoản Có) nằm tại 2 sheet khác nhau.
