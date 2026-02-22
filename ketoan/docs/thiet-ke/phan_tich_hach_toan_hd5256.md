# Phân Tích Kịch Bản Hạch Toán - Hóa Đơn Bán Ra

Dựa trên dữ liệu hóa đơn số **5256** (Ký hiệu: `C23THP`) và logic của hàm `getAccountMapping()` (trong hệ thống Kế Toán của bạn tại file `app/services/so-ke-toan.service.ts`), đây là văn bản mô tả chính xác cách hệ thống sẽ lên sổ bút toán cho từng mặt hàng và tiền thuế. 

## 1. Thông Tin Hóa Đơn (Đầu Vào)
- Loại: `Hóa đơn bán ra`
- Số HĐ: `5256`
- Tiền hàng (Trước thuế): `17.742.240 đ`
- Thuế VAT: `1.419.379 đ`
- Tổng thanh toán: `19.161.619 đ`
- Chi tiết: Có 8 mặt hàng (bao gồm 4 mặt hàng mua hữu hình, 2 dòng giảm giá "Chiết khấu..." và 2 dòng tặng kèm KM giá 0đ).

---

## 2. Cách Hệ Thống Hạch Toán Bút Toán Doanh Thu

Vì thuộc tính `loaihd: 'banra'` nên API đang được gán cố định cho mọi dòng hàng thuộc hóa đơn này là:
* **Nợ TK 131** (Phải thu khách hàng)
* **Có TK 511** (Doanh thu bán hàng và cung cấp dịch vụ)

**Chi tiết các bút toán doanh thu (Tính theo từng Line Item):**

Hệ thống sẽ dùng vòng lặp `for-loop` quét qua 8 dòng hàng hóa trong giao diện và sinh ra 8 record ghi sổ độc lập:

1. **Bán Hàng:** Nợ 131 / Có 511 | `3.412.500 đ` *(SN Nước Yến Sannest Lọ T)* 
2. **Bán Hàng:** Nợ 131 / Có 511 | `7.830.000 đ` *(SN Nước Yến Sannest Lon T)* 
3. **Chiết Khấu:** Nợ 131 / Có 511 | `1.124.250 đ` *(Dòng: Chiết khấu 5% + 5%...)* --- ⚠️ *Lưu ý (Phần 4)*
4. **Bán Hàng:** Nợ 131 / Có 511 | `4.320.000 đ` *(CLM Sa tế tôm pet 90g)* 
5. **Bán Hàng:** Nợ 131 / Có 511 | `3.834.000 đ` *(CLM Dầu hào pet 820g)* 
6. **Chiết Khấu:** Nợ 131 / Có 511 | `530.010 đ` *(Dòng: Chiết khấu 6.5%)* --- ⚠️ *Lưu ý (Phần 4)*
7. **Khuyến Mãi:** Nợ 131 / Có 511 | `0 đ` *(CLM KM Sa tế tôm)* --- ⚠️ *Lưu ý (Phần 4)*
8. **Khuyến Mãi:** Nợ 131 / Có 511 | `0 đ` *(CLM KM Dầu hào)* --- ⚠️ *Lưu ý (Phần 4)*

*(Tổng phần Có TK 511 ở đây phải khớp đúng với `= 17.742.240 đ` (nếu các khoản Chiết khấu bị trừ ra khỏi Database gốc, nhưng hiện code đang đẩy Nợ Có Doanh thu cho số dương).*

---

## 3. Cách Hệ Thống Hạch Toán Bút Toán Thuế GTGT

Hệ thống sẽ rà soát cả 8 dòng: Hệ thống bắt điều kiện `if (tthue > 0)`. Dòng nào chịu thuế, nó sẽ tự động tẽ ra thêm 1 bút toán Phải Thu / Phải nộp thuế bán hàng song song với nghiệp vụ trên:
* **Nợ TK 131** (Phải thu khách hàng)
* **Có TK 3331** (Thuế GTGT Hàng Bán Ra)
Số tiền tổng cộng sẽ gom lại đủ `1.419.379 đ`.

---

## 4. Đặc Điểm Bất Cập Của Logic HIỆN TẠI (Code Lỗi Nghiệp Vụ)

Dù máy đọc được và phân bổ đúng tổng tiền hóa đơn, nhưng với **Chuẩn mực Kế Toán Việt Nam (VAS)**, luồng code hiện tại tại `services/so-ke-toan.service.ts` đang có 3 góc "Hard-Code" bộc lộ điểm yếu khi lập Bảng cân đối:

### Vấn Đề 1: Dòng Hàng Chiết Khấu / Giảm Giá 
Hiện tại các Text như **"Chiết khấu 6,5%"**, Code vẫn tự động ép kiểu Doanh Thu `Nợ 131 / Có 511`.
* **Sửa lại:** Đáng lẽ cần hàm Split (Regex) nhận diện từ khóa "Chiết khấu" để chuyển luồng bút toán sang **Nợ TK 521 (Các Khoản Giảm Trừ Doanh Thu) / Có TK 131**. Đặc biệt Tiền của dòng chiết khấu thường phải mang dấu `(âm)` để khi đối soát đối ứng thì Nợ Có của hóa đơn mới cân xứng.

### Vấn Đề 2: Dòng Khuyến Mãi Bằng 0đ (Hàng tặng không thu tiền) 
Hai dòng số 7 và 8 có tiền bằng `0đ`. Vòng lặp `for-loop` vẫn vui vẻ thêm vào CSDL 2 dòng `Nợ 131 / Có 511` với số tiền `0` (Zero). Về ý nghĩa tài chính thì không sai, nhưng trong các phần mềm ERP tiêu chuẩn, bút toán giá trị không lớn hơn 0 sẽ bị cắt bỏ `if(item.thtien > 0)` để làm "**sạch Sổ Nhật Ký Chung**", tiết kiệm dung lượng Postgres Database.

### Vấn Đề 3: Bỏ Sót Nghiệp Vụ Giá Vốn (Chi Phí Sản Xuất / Cầm Kho)
Với chức năng Bán Ra, việc đẩy vào bút toán `Doanh thu + Thuế` là mới chỉ lên 50% chặng đường. Sổ cái Kế toán đang bị thiếu hoàn toàn Vòng Xoay Hàng Tồn Kho (Giá Vốn Bán Hàng).
Về lâu dài, hàm `getJournalEntries` phải tích hợp thêm thuật toán quét thẻ Kho để sản sinh ra cặp đôi song sinh:
* **Nợ TK 632** (Giá Vốn Hàng Bán)
* **Có TK 156** (Hàng Hóa Tồn Kho)

👉 **Tổng Quan:** Bản chất cấu trúc hóa đơn trên không hề bất thường, nhưng mã nguồn cần phải được Refactor (nâng cấp Regex Tài khoản Kế Toán) thì mới lên đủ các Sổ Cái tự động chính xác cho các Doanh nghiệp mà không cần kế toán viên phải làm "Lại" bảng cân đối bằng tay.
