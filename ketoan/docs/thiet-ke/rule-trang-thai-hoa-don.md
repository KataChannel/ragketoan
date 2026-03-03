# Bộ Quy Tắc (Rules) Xử Lý Trạng Thái Hóa Đơn Điện Tử (GDT)
**Tài liệu tham khảo:** Nghị định 123/2020/NĐ-CP và Thông tư 78/2021/TT-BTC
**Áp dụng cho:** Quá trình Ghi nhận doanh thu/chi phí, Lên Sổ kế toán (Nhật ký chung) và Tính toán Xuất Nhập Tồn (XNT) Kho.

---

## 1. Bảng Mã Trạng Thái Hóa Đơn (`tthai`)

| Mã Trạng Thái (`tthai`) | Ý Nghĩa / Tên Gọi | Mức độ hiệu lực Tài Chính |
| :---: | :--- | :--- |
| **`1`** | **Hóa đơn Mới / Gốc** | 🟢 Có giá trị ghi sổ bình thường |
| **`2`** | **Hóa đơn Thay thế** | 🟢 Có giá trị ghi sổ (Thay cho hóa đơn số 3) |
| **`3`** | **Hóa đơn Bị thay thế** | 🔴 **KHÔNG có giá trị** (Đã bị hủy bỏ) |
| **`4`** | **Hóa đơn Điều chỉnh** | 🟡 Có giá trị (Biến động Tăng/Giảm) |
| **`5`** | **Hóa đơn Bị điều chỉnh** | 🟢 Có giá trị (Gốc ban đầu) |
| **`6`** | **Hóa đơn Hủy / Bỏ sót** | 🔴 **KHÔNG có giá trị** (Đã bị tiêu hủy) |

---

## 2. Logic Áp Dụng Khi Kế Toán Lên Sổ Sách & Tính Kho (XNT)

Để hệ thống Kế toán AI tự động đồng bộ mà không làm lệch Số dư tài khoản, Cân đối kế toán và Tồn kho chữ T (XNT), hệ thống **BẮT BUỘC** áp dụng các rules (quy tắc) sau trên dữ liệu từ API Tổng cục Thuế đổ về:

### 🔴 Quy tắc LOẠI BỎ (Ignore) - Trạng thái `3` và `6`
Bất cứ hóa đơn nào mang trạng thái `3` (Bị thay thế) hoặc `6` (Bị hủy) thì hệ thống phải **Loại bỏ toàn bộ chi tiết hàng hóa** thuộc hóa đơn đó ra khỏi các phép tính toán (Bao gồm việc không cộng tiền vào Quỹ, không đẩy dữ liệu vào Báo cáo Thuế, và không tính khối lượng Nhập/Xuất vào kho hàng).
*   **Lý do:** Những hóa đơn này đã không còn hiệu lực pháp lý do đã bị ghi đè hoặc loại bỏ trên Cơ quan Thuế. Việc ghi nhận sẽ gây ra tình trạng xuất đôi (Double-spend) hoặc công nợ ảo.

### 🟢 Quy tắc GHI NHẬN CHÍNH (Record) - Trạng thái `1` và `2`
Hệ thống **Ghi nhận 100%** giá trị, số lượng, tiền thuế của hai loại hóa đơn này.
*   **`tthai = 1` (Mới):** Hạch toán bình thường (Nợ/Có) vào bảng kế toán và cộng/trừ vào kho XNT lập tức.
*   **`tthai = 2` (Thay thế):** Đây chính là hóa đơn sinh ra để thế chỗ cho hóa đơn mang trạng thái `3` đã bị loại bỏ ở trên. Hệ thống hạch toán nhập/xuất kho và doanh thu bằng toàn bộ số liệu của hóa đơn `2` này.

### 🟡 Quy tắc ĐIỀU CHỈNH KÉP (Adjust) - Trạng thái `4` và `5`
Đây là bộ đôi hóa đơn đi kèm với nhau. Hóa đơn `5` (Bị điều chỉnh) là hóa đơn gốc ban đầu, hóa đơn `4` (Điều chỉnh) là hóa đơn phát sinh sau để cộng thêm hoặc trừ bớt.
*   **Xử lý trạng thái `5`:** Ghi nhận toàn bộ giá trị ban đầu vào Sổ sách và Kho như bình thường (Giống trạng thái 1).
*   **Xử lý trạng thái `4`:** Hệ thống phải đọc kỹ cờ (flag) của hóa đơn điều chỉnh là **Điều chỉnh Tăng** hay **Điều chỉnh Giảm**.
    *   **Điều chỉnh Tăng:** Cộng dồn thêm Số lượng/Thành tiền/Tiền thuế vào Số dư Sổ sách và Số dư Kho của mặt hàng được chỉ định. (Nợ/Có bình thường).
    *   **Điều chỉnh Giảm:** Phải tính theo giá trị Âm, tức là hạch toán lùi lại Số lượng/Thành tiền/Tiền thuế vào Số dư Sổ sách (Ghi Nợ/Có số âm hoặc hạch toán ngược lại bút toán ban đầu). Cập nhật giảm Nhập/Xuất Kho XNT tương ứng.

---

## 3. Mã Giả (Pseudo-code) Dành Cho Logic Truy Vấn SQL
Khi tính toán báo cáo Xuất nhập tồn và Tổng hợp số, lập trình viên/hệ thống sử dụng luồng điều kiện (WHERE clause) như sau:

```sql
-- Khi truy vấn tính Tổng Doanh Thu / Khối lượng Nhập - Xuất Kho
SELECT SUM(sluong) as TongSoLuong, SUM(thtien) as TongTien
FROM ext_tonghop
WHERE 
    -- 1. LOẠI BỎ HƯ TRẠNG THÁI (3, 6)
    tthai NOT IN ('3', '6') 
    
    -- 2. Tùy chọn: Xử lý hóa đơn điều chỉnh (Thường hệ thống thuế của GDT 
    -- đã lưu dữ liệu điều chỉnh giảm dưới dạng số âm vào trường tongTien, 
    -- nên có thể SUM trực tiếp tthai = 4 mà không cần phân rẽ nhánh Tăng/Giảm)
    -- ...
    AND congtyId = 'XXX'
```

🔥 **Kết luận:** File Rule này được dùng làm tham chiếu để xây dựng thuật toán Backend API (trong `tonghop.service.ts` hoặc `inventory.service.ts`), đảm bảo các báo cáo xuất ra không bị dội số liệu rác từ các hóa đơn đã đánh dấu Hủy/Bị Thay Thế.
