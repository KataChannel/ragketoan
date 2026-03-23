# Báo Cáo Hoàn Thành Tổng Hợp Xuất Nhập Tồn - Công Ty Huy Vũ

Dựa trên yêu cầu chi tiết tại [yeucau.md](file:///chikiet/kata2025/ragketoan/docs/huyvu/yeucau.md) và danh mục tại [DANH_MUC_NHOM_SAN_PHAM.md](file:///chikiet/kata2025/ragketoan/docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md), hệ thống đã hoàn tất việc xử lý và xuất các báo cáo tương ứng.

## 1. Thông Tin Tổng Quan
- **Đơn vị báo cáo**: Công Ty Huy Vũ (MST: 5900363291)
- **Nguồn dữ liệu**: Database PostgreSQL `ketoan` (Bảng `ext_listhoadon`, `ext_detailhoadon`)
- **Phân loại**: 145 Nhóm sản phẩm theo danh mục hyper-granular.
- **Tổng Tồn Đầu Kỳ (01/01/2023)**: **20,528,682,383 VNĐ**

## 2. Phương Pháp Phân Bổ Tồn Đầu Kỳ
Theo yêu cầu mới nhất, việc phân bổ đã đảm bảo:
- **Số lượng (SL)**: Là số NGUYÊN (Integer).
- **Giá trị (VNĐ)**: Dựa trên **Giá Bình Quân Gia Quyền** của từng mặt hàng trong năm 2023 để tính toán giá trị tồn kho đầu kỳ một cách hợp lý nhất.
- **Ưu tiên**: Đảm bảo đủ tồn kho để bao phủ các đợt xuất bán trong năm (không để xảy ra tình trạng âm kho).
- **Điều chỉnh**: Tổng tiền được khớp chính xác 100% với con số 20,528,682,383 VNĐ bằng cách điều chỉnh phần dư lẻ vào nhóm hàng hóa chung (OTH-GEN).

## 3. Danh Sách Tệp Tin Kết Quả
Các báo cáo đã được tạo tại thư mục `docs/huyvu/`:

| Tên File | Nội dung |
| :--- | :--- |
| [XNT_HuyVu_2023.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2023.xlsx) | Báo cáo XNT năm 2023 |
| [XNT_HuyVu_2024.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2024.xlsx) | Báo cáo XNT năm 2024 |
| [XNT_HuyVu_2025.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2025.xlsx) | Báo cáo XNT năm 2025 |
| [XNT_HuyVu_2026.xlsx](file:///chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2026.xlsx) | Báo cáo XNT năm 2026 |
| [DANH_SACH_MA_HANG.csv](file:///chikiet/kata2025/ragketoan/docs/huyvu/DANH_SACH_MA_HANG.csv) | Danh sách 145 mã nhóm và tên nhóm sản phẩm |

## 4. Cấu Trúc Mỗi File Excel
Mỗi file Excel bao gồm:
- **Sheet Tháng 1 - 12**: Báo cáo XNT chi tiết từng tháng.
- **Sheet Hoadon**: Thống kê số lượng và tổng tiền hóa đơn mua vào/bán ra theo tháng.
- **Sheet xnt12thang**: Bảng tổng hợp diễn biến luồng tiền của 145 nhóm hàng.

Logic xử lý nằm trong file [build_xnt_final.py](file:///chikiet/kata2025/ragketoan/build_xnt_final.py).
---
**Ghi chú**: Đã loại trừ chênh lệch 2023 theo [BAO_CAO_GIAI_TRINH_KHOP_SO_2023.md](file:///chikiet/kata2025/ragketoan/docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2023.md).
