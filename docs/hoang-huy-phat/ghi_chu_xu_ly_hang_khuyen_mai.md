# Ghi chú Xử lý Hàng Khuyến mãi trong Báo cáo XNT (HHP 2023)

## 1. Tình trạng hiện tại
Trong quá trình đối soát và tái lập báo cáo Xuất - Nhập - Tồn (XNT) cho Công ty Hoàng Huy Phát năm 2023, ghi nhận nhiều trường hợp hàng hóa được đánh dấu **Khuyến mãi (KM)** trên hóa đơn gốc có đặc điểm:
- **Số lượng (SL):** Có phát sinh nhập/xuất.
- **Giá trị (Thành tiền):** Bằng 0 (số liệu từ database `ext_detailhoadon`).

## 2. Nguyên tắc xử lý trong hệ thống
Hiện tại, script [rebuild_xnt_hhp_2023.py](file:///chikiet/kata2025/ragketoan/python/rebuild_xnt_hhp_2023.py) đang xử lý theo nguyên tắc:
- **Kế thừa giá trị từ hóa đơn:** Nếu hóa đơn mua vào ghi nhận đơn giá 0 đồng cho hàng khuyến mãi, hệ thống sẽ nhập kho với giá 0 đồng.
- **Giá vốn (COGS):** Do giá nhập bằng 0, khi xuất bán hoặc xuất khuyến mãi cho khách hàng, giá vốn của các mã hàng này cũng sẽ bằng 0.

## 3. Đánh giá tính hợp lý (Accounting Rationale)

### Về mặt Quản trị Kho
- **Đúng:** Đảm bảo khớp số lượng vật lý trong kho, phục vụ việc kiểm kê và theo dõi luân chuyển hàng hóa.

### Về mặt Kế toán (Thông tư 200/2014/TT-BTC)
- **Hàng tặng không kèm điều kiện:** Việc ghi nhận giá trị tồn kho bằng 0 là phù hợp vì doanh nghiệp không chi trả chi phí để có được hàng này. Khi xuất tặng, giá vốn bằng 0 nhưng cần lưu ý hồ sơ chứng minh tính hợp lệ của chương trình khuyến mãi để giải trình thuế.
- **Hàng tặng kèm điều kiện (Mua 10 tặng 1):** Theo lý thuyết cần phân bổ giá trị Invoice cho cả hàng tặng. Tuy nhiên, trong bối cảnh tái lập số liệu từ dữ liệu phần mềm hiện có, việc giữ nguyên giá trị 0 đồng là giải pháp an toàn để khớp với Tổng tiền Mua vào (Target) được quy định trong file mục tiêu [mua_vao_ban_ra_2023.md](file:///chikiet/kata2025/ragketoan/docs/hoang-huy-phat/mua_vao_ban_ra_2023.md).

## 4. Lưu ý khi Quyết toán/Kiểm toán
- Cần chuẩn bị danh sách các hóa đơn có hàng khuyến mãi 0 đồng để giải thích cho sự chênh lệch giữa Số lượng luân chuyển và Giá vốn phát sinh.
- Các mặt hàng này sẽ làm tăng biên lợi nhuận gộp (Gross Margin) của các đơn hàng có kèm hàng tặng, do không phát sinh giá vốn.

---
*Ngày ghi nhận: 12/04/2026*
*Người thực hiện: Antigravity AI*
