1. Tổng Tiền Đầu Kỳ Năm 2023 : 20.528.682.383 (phân bổ cho tất cả sản phẩm một cách hợp lý,SỐ LƯỢNG là số NGUYÊN, dựa vào giá BÌNH QUÂN GIA QUYỀN của từng mặt hàng để phân bổ cho hợp lý, để báo cáo cho cơ quan thuế)
2. Mặt Hàng : Phân bổ theo DANH MỤC NHÓM SẢN PHẨM docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md làm Mã Hàng - Tên Hàng
3. Sử dụng hóa đơn, hóa đơn chi tiết từ database Công Ty Huy Vũ
4. Form báo cáo xuất nhập tồn theo các cột : STT - Mã Nhóm - Tên Nhóm Sản Phẩm - Tồn Đầu Kỳ (SL) - Tồn Đầu Kỳ (VNĐ) -   Nhập (SL) - Nhập (VNĐ) - Xuất (SL) - Xuất (VNĐ) - Tồn Cuối (SL) - Tồn Cuối (VNĐ)
5. Mỗi năm 1 file excel, Mỗi Sheet là số liệu của 1 tháng có hàng tổng ở dưới cùng, có thêm 1 sheet Hoadon (các cột : Tháng - Loại HD - Tình trạng (Mã) - Số lượng - Tổng giá tiền (VNĐ)), 1 sheet xnt12thang (có hàng tổng ở dưới cùng,1 cột tổng tồn đầu, 1 cột tổng nhập, 1 cột tổng xuất, 1 cột tổng tồn cuối,các cột nhập,xuất của từng tháng)
6. Nguồn Dữ Liệu postgresql://root:password@localhost:5432/ketoan?schema=public Công Ty Huy Vũ (5900363291)
7. Không có tình trạng ÂM số lượng, tiền.
KHÔNG THAM CHIẾU TỪ NGUỒN NÀO KHÁC ĐỂ TRÁNH LOÃNG DỮ LIỆU VÀ KHÔNG ĐÚNG LUỒNG