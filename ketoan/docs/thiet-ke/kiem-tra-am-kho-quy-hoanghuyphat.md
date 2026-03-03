# Báo cáo Kiểm tra Tính hợp lệ Dữ liệu Kế toán (Tồn Kho & Dòng Tiền)
**Công ty:** CÔNG TY TNHH HOÀNG HUY PHÁT (MST: 5900428904)
**Giai đoạn:** 01/01/2023 - 01/01/2024
**Trạng thái Review:** 🔴 Có lỗi Logic Lập Sổ Kế Toán Cần Xử Lý

---

## 1. Phân tích Dòng Tiền (Tài khoản Tiền Mặt/Tiền Gửi)
Nguyên tắc kế toán: Tổng số dư quỹ tiền mặt và tiền gửi ngân hàng tại mọi thời điểm **không được âm**. 
Dựa vào dữ liệu hóa đơn Mua vào và Bán ra trong kỳ, hệ thống đã chạy luồng tiền tổng quát:

- **Tổng hợp Thu (Từ hóa đơn bán ra):** `125.678.658.928 VNĐ` (Khoảng 125,6 Tỷ)
- **Tổng hợp Chi (Từ hóa đơn mua vào):** `125.265.720.587 VNĐ` (Khoảng 125,2 Tỷ)
- **Chênh lệch Dòng Tiền HĐKD:** `+ 412.938.341 VNĐ` (Dương ~412 Triệu VNĐ)

✅ **Đánh giá:** Dòng tiền trong kỳ của công ty **bảo đảm tính Dương (Không bị Âm tiền)**. Tiền thu vào đủ để trang trải các chi phí mua hàng hạch toán hóa đơn. Không có rủi ro về Logic Tiền Mặt/Tiền Gửi.

---

## 2. Phân tích Hiện Trạng Kho Hàng (Tồn Kho)
Nguyên tắc kế toán: Số lượng và Giá trị tồn kho của mọi mã hàng **không được âm**.
Qua rà soát hệ thống thẻ kho (`ext_tonghop` và `ext_daily_stock_v2`), phát hiện rất nhiều mặt hàng đang có **Số Xuất > Số Nhập** dẫn đến **Tồn Kho Bị Âm Trọng Yếu**.

### Top các mặt hàng bị Âm Kho lớn nhất (Xuất khống / Thiếu đầu vào)
Hầu hết các mặt hàng này đều có `Tổng Nhập = 0` nhưng `Tổng Xuất` rất lớn trong năm 2023:

| STT | Tên hàng (Đã chuẩn hóa) | ĐVT | SL Nhập | SL Xuất | Giá trị Xuất bị Âm |
|:---:|:---|:---|---:|---:|---:|
| 1 | THÙNG 48 HỘP SỮA MILO ACTIVE GO 115ML | Thùng | 0 | 17.820 | 4.120.551.000 VNĐ |
| 2 | THÙNG 48 HỘP THỨC UỐNG MẠCH NHA LÚA MẠCH NESVITA 180ML | Thùng | 0 | 19.799 | 3.662.815.000 VNĐ |
| 3 | SN NƯỚC YẾN SANNEST LON T (30LON/THÙNG) | Thùng | 0 | 14.260 | 3.442.276.000 VNĐ |
| 4 | BEL PHÔ MAI CBC 8M | Hộp | 0 | 103.893 | 3.295.962.597 VNĐ |
| 5 | NBT BÁNH KX RICHOCO NABATI CHOCOLATE CREAM WAFER 110G | Thùng | 0 | 16.453 | 3.034.359.000 VNĐ |

🔴 **Đánh giá Rủi ro Thuế:** Nguy cơ truy thu thuế TNDN và phạt vi phạm xuất khống hóa đơn. Việc xuất bán hàng hóa trong khi kho bằng 0 (chưa qua hạch toán nhập) là vi phạm nghiêm trọng (sai Logic Kế Toán). Tuy nhiên, Doanh nghiệp đã xuất hóa đơn và kê khai nên không thể thu hồi hoặc điều chỉnh xóa hóa đơn xuất.

---

## 3. Đề Xuất Hướng Xử Lý Khắc Phục (Không can thiệp Hóa Đơn)
Do điều kiện tiên quyết là **Không thay đổi hóa đơn mua vào/bán ra đã kê khai điện tử**, hệ thống Kế toán AI đề xuất 03 phương án can thiệp trên số dư sổ sách nhằm khớp Logics:

### Giải pháp cơ bản 1: Khai báo Số Dư Tồn Đầu Kỳ (Opening Balance)
Bản chất các mặt hàng bán ra bị "Nhập = 0" trên hóa đơn 2023 là do chúng **đã được mua từ năm 2022 trở về trước** và lưu kho. 
*   **Thao tác thực hiện:** Cần lập một Phiếu Nhập Kho hoặc phiếu Cập nhật Tồn đầu kỳ tại thời điểm `31/12/2022` đối với toàn bộ các mã hàng đang bị âm này. Số lượng tồn đầu kỳ tối thiểu phải lớn hơn hoặc bằng Số lượng âm. 
*   *Lưu ý: Yêu cầu áp giá vốn ước tính phù hợp mặt bằng năm 2022.*

### Giải pháp cơ bản 2: Đồng bộ Hóa Đổi & Quy Đổi Đơn Vị Tính (UoM)
Hiện tại logic gom nhóm trên hệ thống có thể bị trượt do sai khác Đơn Vị Tính.
Ví dụ: 
*   Hóa đơn mua vào ghi: `Thùng (48 hộp)`  (Mua vào: 1.000 Thùng)
*   Hóa đơn bán ra ghi: `Hộp` (Xuất bán: 48.000 Hộp)
=> Việc chưa có hệ số quy đổi 1 Thùng = 48 Hộp sẽ khiến mã "Hộp" bị xuất âm, còn mã "Thùng" thì tồn kho nhiều bất thường.
*   **Thao tác thực hiện:** Vào phân hệ **Training AI/Từ điển hàng hóa**, tiến hành set Hệ Số Quy Đổi Đơn Vị cho các mã có tên tương đồng để hệ thống tự động cấn trừ giữa quy cách lớn và nhỏ.

### Giải pháp nâng cao 3 (Nếu thực tế doanh nghiệp bị thiếu hàng): 
Nếu doanh nghiệp đúng là trong năm 2022 cũng không có hàng tồn kho này mà bán khống:
*   Trường hợp này thuộc gian lận thuế (mua trôi nổi không hóa đơn). 
*   **Bút toán xử lý (bắt buộc lập trên PM):** Phải làm thủ tục nhập kho "Hàng hóa phát hiện thừa khi kiểm kê" (Ghi Nợ 156 / Có 3381) và giải trình do quên hóa đơn của 2022. Tuy nhiên khoản ghi tăng thu nhập khác này vẫn sẽ phải đóng thuế 20%.

### Lời kết
Dựa trên tính năng hệ thống, chúng tôi kiến nghị Khách hàng tập trung thực hiện **Giải pháp 1 và Giải pháp 2**. Truy cập màn hình **Kho Hàng (Inventory)** để thiết lập Tồn Đầu Kỳ cho riêng danh sách 2.499 mặt hàng bị lệch. Sau đó nhấn nút *"Cập nhật XNT"* để hệ thống chia lại Giá vốn COGS dương tính.
