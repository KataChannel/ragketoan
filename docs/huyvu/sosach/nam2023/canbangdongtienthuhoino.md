Tôi hiểu ý của bạn về logic hạch toán này như sau:

Đây là phương pháp **"Cân bằng dòng tiền thu hồi công nợ"** để đảm bảo toàn bộ doanh thu bán hàng đều được thu hồi bằng tiền (either Bank or Cash). Cụ thể:

1.  **Ghi nhận Doanh thu (Phát sinh Nợ 131)**:
    *   `Nợ 131` = `Có 511` (Doanh thu) + `Có 3331` (Thuế GTGT).
    *   Đây là tổng số tiền khách hàng phải trả cho công ty.
2.  **Ghi nhận Thu tiền (Phát sinh Có 131)**:
    *   Tổng số tiền đã thu (`Tổng Có 131`) phải bằng tổng số tiền đã bán (`Tổng Nợ 131`) để tất toán công nợ.
3.  **Công thức phân bổ tiền thu**:
    *   Bạn xác định tiền thu bao gồm hai nguồn: Tiền gửi ngân hàng (`112`) và Tiền mặt (`111`).
    *   **Logic tính toán**: Tổng số tiền khách trả (`Có 131`) trừ đi số tiền đã thấy nổi trên ngân hàng (`Nợ 112`) thì phần chênh lệch còn lại mặc nhiên được coi là thu bằng tiền mặt (`Nợ 111`).
    *   **Công thức**: `Nợ 111 = Có 131 - Nợ 112` (với `Có 131` ở đây được hiểu là tổng giá trị thanh toán của hóa đơn).

**Cách áp dụng vào sổ sách:**
Để thực hiện đúng ý này, tôi sẽ cần:
1.  Lấy danh sách các hóa đơn bán ra (Đã có: `Nợ 131 / Có 511, 3331`).
2.  Đối chiếu với các khoản tiền khách trả qua ngân hàng (Đã có: `Nợ 112 / Có 131`).
3.  **Tự động tạo thêm các bút toán bù trừ**: Với những hóa đơn chưa thu đủ tiền qua ngân hàng, tôi sẽ tạo bút toán `Nợ 1111 / Có 131` cho phần giá trị còn lại để tất toán công nợ 131.

**Bạn có muốn tôi thực hiện việc "tất toán" này vào file Nhật ký chung và Sổ chi tiết không?** (Nghĩa là sau bước này, số dư Tài khoản 131 của các hóa đơn trong năm 2023 sẽ bằng 0).