# 📋 BÁO CÁO TỔNG HỢP TIẾN ĐỘ DỰ ÁN HUY VŨ (2023 - 2026)
> Ngày cập nhật: 12/02/2025

Chúng tôi đã hoàn tất việc xử lý dữ liệu Xuất-Nhập-Tồn (XNT) và khớp số liệu Tờ khai thuế cho Công ty Huy Vũ trong giai đoạn 4 năm (2023-2026). Dưới đây là hiện trạng và hướng dẫn truy xuất dữ liệu.

---

## 🏗️ 1. Hiện Trạng Dữ Liệu XNT (Kho)

Số liệu tồn đầu kỳ đã được chốt và chuyển tiếp qua các năm như sau:

| Năm | Tồn Đầu Kỳ (VNĐ) | Trạng Thái | File Báo Cáo Giải Trình (Gốc) |
| :--- | :---: | :---: | :--- |
| **2023** | 20,528,682,383 | ✅ Hoàn thành | `docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2023.md` |
| **2024** | 19,999,094,250 | ✅ Hoàn thành | `docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2024.md` |
| **2025** | 31,017,722,278 | ✅ Hoàn thành | `docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2025.md` |
| **2026** | 36,468,593,764 | ✅ Hoàn thành | `docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2026.md` |

---

## 📊 2. Thống Kê Tổng Quát (Giao Dịch 2023-2026)

Dữ liệu được tổng hợp từ 4,829 hóa đơn Bán ra và 5,058 hóa đơn Mua vào:

| Chỉ số | Tổng cộng (4 Năm) |
| :--- | :--- |
| **Doanh thu bán ra (Chưa thuế)** | **55,815,037,483** VNĐ |
| **Chi phí mua vào (Chưa thuế)** | **61,673,384,675** VNĐ |
| **Số lượng giao dịch (Bán/Mua)** | 4,829 / 5,058 |
| **Chênh lệch Lợi nhuận gộp** | -5,858,347,192 VNĐ |

---

## 📁 3. Danh Sách File Sản Phẩm (Dành cho Tải về)

Các file đã được phân loại và lưu trữ tại thư mục `docs/huyvu/`:

### 📑 Báo Cáo XNT & Quyết Toán (Excel)
1.  **Tổng hợp 4 năm:** `docs/huyvu/tong_hop_xnt_2023_2026.xlsx` (11.96 MB) - Chứa toàn bộ chi tiết mã hàng, nhập, xuất, tồn qua 4 năm.
2.  **Dữ liệu 2023 chuẩn:** `docs/huyvu/dulieuchuan/XNT_HuyVu_2023_GOC_ME.xlsx`
3.  **Dữ liệu 2024 chuẩn:** `docs/huyvu/dulieuchuan/XNT_HuyVu_2024_GOC_ME.xlsx`
4.  **Dữ liệu 2025 chuẩn:** `docs/huyvu/dulieuchuan/XNT_HuyVu_2025_GOC_ME.xlsx`
5.  **Bảng Cân Đối Tài Khoản 2025:** `docs/huyvu/baocaotaichinh/BCĐ TK 2025 HV.xlsx`

### 📦 Gói Dữ Liệu Nén (Archive)
*   `docs/huyvu/Final_Dulieuchuan_HuyVu.zip`: Chứa toàn bộ các file báo cáo Markdown và Excel đã chốt số.

---

## 🛠️ 4. Lưu Ý Kỹ Thuật

1.  **Múi giờ:** Toàn bộ hóa đơn được xử lý theo múi giờ **Asia/Ho_Chi_Minh** (ICT).
2.  **Lọc Bank:** Các hóa đơn phí ngân hàng (Sacombank, ACB) đã được loại bỏ khỏi kho để không làm lệch số lượng hàng hóa.
3.  **Mã hàng:** Sử dụng danh mục tại `docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md` để phân loại.

---

> [!TIP]
> **Hướng dẫn:** Bạn có thể mở file `docs/huyvu/tong_hop_xnt_2023_2026.xlsx` để xem bảng Pivot-Table phân tích mã hàng theo nhóm cho toàn bộ giai đoạn.
