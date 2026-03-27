# Yêu Cầu Tổng Hợp Dữ Liệu XNT - Huy Vũ 2026

Dưới đây là các thông số đầu vào và yêu cầu nghiệp vụ để chạy báo cáo Xuất-Nhập-Tồn (XNT) cho năm 2026.

---

## 🏗️ 1. Thông Số Đầu Vào (Input Parameters)

- **Công ty:** CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ CÔNG NGHỆ HUY VŨ
- **MST:** `5900363291`
- **Năm báo cáo:** `2026`
- **Tồn Đầu Kỳ Năm 2026 (Chuyển tiếp từ 2025):** `36,468,593,764` VNĐ

---

## 🎯 2. Mục Tiêu Khớp Số (Target Matching)

Dữ liệu XNT năm 2026 cần được xây dựng dựa trên:
1.  **Hóa đơn Bán ra:** Khớp với Tờ khai thuế GTGT năm 2026.
2.  **Hóa đơn Mua vào:** Chỉ lấy các hóa đơn hàng hóa, linh kiện. Loại bỏ các hóa đơn dịch vụ không liên quan đến kho (Phí ngân hàng, Chuyển tiền, Lãi vay).
3.  **Phương pháp tính giá:** Bình quân gia quyền cuối kỳ (theo tháng/năm).

---

## 🛠️ 3. Quy Tắc Xử Lý (Processing Rules)

### 3.1. Lọc Trạng Thái Hóa Đơn
- Chỉ lấy các hóa đơn có trạng thái (`tthai`): **1, 2, 4, 5**. (Đã phát hành, Thay thế, Điều chỉnh).
- Loại bỏ trạng thái **6** (Hóa đơn bị hủy/thay thế).

### 3.2. Chuyển Đổi Múi Giờ (Timezone ICT)
- Toàn bộ thời gian lập hóa đơn (`tdlap`) phải được chuyển về múi giờ Việt Nam (**Asia/Ho_Chi_Minh**) trước khi phân bổ vào các tháng.

### 3.3. Phân Nhóm Hàng Hóa
- Sử dụng danh mục nhóm sản phẩm tại: `docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md`.
- Các mặt hàng không có trong danh mục sẽ được đưa vào nhóm `OTH-GEN` (Hàng hóa khác).
- Các mặt hàng thuộc nhóm `SKIP` (Dịch vụ, Ăn uống cá nhân) sẽ bị loại bỏ khỏi tính toán XNT.

---

## 📂 4. Sản Phẩm Đầu Ra (Output)

1.  **Báo cáo giải trình:** `BAO_CAO_GIAI_TRINH_KHOP_SO_2026.md`
2.  **File Excel Chi Tiết:** `XNT_HuyVu_2026.xlsx` (Nằm trong `docs/huyvu/`)
3.  **Dữ liệu chuẩn:** Lưu trữ tại `docs/huyvu/dulieuchuan/`
