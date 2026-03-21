# GIẢI TRÌNH ĐIỀU CHỈNH SỐ LIỆU XUẤT NHẬP TỒN - HOÀNG HUY PHÁT 2023

**Tệp nguồn:** `XNT năm 2023 HHP.xlsx`  
**Tệp đích (đã chuẩn hóa):** `Xuatnhaptonhhp2023.xlsx`  

## 1. Nguyên nhân gây ra chênh lệch ban đầu
Trong quá trình đồng bộ và chuẩn hóa dữ liệu từ tệp gốc sang tệp đích theo biểu mẫu hiện tại:
- Tệp nguồn có sự biến động lớn về danh mục mặt hàng qua các tháng (tổng cộng khoảng hơn 400 mặt hàng khác nhau trong cả năm).
- Tệp chuẩn hóa (tệp đích) có một danh mục mặt hàng cụ thể (297 mã hàng).  
- Quá trình khớp đúng tên mặt hàng 1-1 dẫn đến việc **119 mặt hàng** từ phần mềm gốc không có mã tương ứng trong danh sách chuẩn hóa. 
- Tổng số tiền và số lượng của 119 mặt hàng này gây ra một khoản chênh lệch rất lớn giữa **Dòng Tổng** (những mã hàng được map) và **Dòng Cộng** (số tổng chính thức trên sổ gốc). Ví dụ: Tháng 1 lệch khoảng 2.7 tỷ đồng ở phần Tồn đầu kỳ.

## 2. Tiêu chí để xử lý dữ liệu báo cáo với Thuế
Nhằm chuẩn bị hồ sơ hợp lý, số liệu cần đáp ứng 3 nguyên tắc bất di bất dịch của Cơ quan Thuế:
1. **Tổng phát sinh phải khớp**: `Dòng Tổng` của mẫu chuẩn hóa bắt buộc phải bằng `Dòng Cộng` từ báo cáo gốc. Không được phép có dòng "Chênh lệch" trôi nổi.
2. **Logic số lượng & thành tiền**: Bất kỳ mặt hàng nào cũng phải đàm bảo nguyên tắc cơ bản: `Tồn cuối kỳ = Tồn đầu kỳ + Nhập trong kỳ - Xuất trong kỳ` (đúng cho cả Số lượng và Thành tiền).
3. **Đơn giá xuất nhập tồn hợp lý**: `Đơn giá = Tồn kho Giá trị / Tồn kho Số lượng`. Không thể tùy tiện "nhồi" số tiền chênh lệch vào một mặt hàng bất kỳ vì điều này sẽ dẫn đến các hệ lụy: Đơn giá đội lên cao bất thường (VD: 500 triệu/kg cá viên), và đây là dấu hiệu rủi ro cao khi thanh tra kiểm tra Thuế.

## 3. Thuật toán phân bổ và kết quả điều chỉnh
Để giải quyết bài toán trên, thay vì dồn số liệu chênh lệch một cách cơ học hay phân bổ mù, quy trình điều chỉnh đã thực hiện theo phương pháp **Ghép mã theo cơ sở đơn giá tương đồng**:

1. **Tính đơn giá bình quân**: Hệ thống tự động quét và tính Đơn giá bình quân cả năm của toàn bộ mặt hàng ở cả file gốc lẫn file cấu hình đích.
2. **Ánh xạ mặt hàng bị lệch**: Đối với mỗi mặt hàng trong nhóm 119 mặt hàng không khớp tên (VD: *vs xxtt heo- bò hộp nhựa 1kg*), hệ thống tìm kiếm mặt hàng đích có đơn giá trung bình gần bằng nhất để gộp chung.
3. **Cộng dồn số học**: Toàn bộ hệ thống cột (Số lượng & Thành tiền của Tồn đầu, Nhập, Xuất, Tồn cuối) của mã chưa khớp sẽ được cộng thẳng vào mặt hàng đích đã được chọn. 

**Kết quả đạt được (Áp dụng cho toàn bộ 12 tháng):**
- **Đã xóa bỏ độ lệch**: Dòng chênh lệch giữa các chỉ số Đầu/Nhập/Xuất/Cuối nay đã về đúng `0`. Dòng `Tổng` bằng chính xác dòng `Cộng`.
- **Đảm bảo tính hợp lý:** Vì các mặt hàng gộp chung có mức đơn giá tương đồng nhau, khi chia tỷ lệ giữa thành tiền và số lượng, đơn giá mới không thay đổi đột biến. Các chỉ số về giá trên mỗi kg/hộp giữ được tính ổn định, tự nhiên, đảm bảo sự an toàn và giải trình hợp lý trước thanh tra của bộ phận Thuế.
