# TỔNG HỢP VẤN ĐỀ CẦN ĐIỀU CHỈNH - CÔNG TY HOÀNG HUY PHÁT (2023)

Dựa trên việc rà soát file `SỐ ĐC.xlsx` (Số đối chiếu/điều chỉnh) và so sánh với chỉ tiêu mục tiêu tại `1.yeucauhhp.md` cũng như logic hệ thống tại `produce_final_hhp_2023.py`, dưới đây là tổng hợp các vấn đề cần điều chỉnh để hoàn thiện sổ sách năm 2023.

## 1. PHÂN TÍCH CHÊNH LỆCH CHỈ TIÊU TÀI CHÍNH (TARGET VS. ACTUAL)

| Tài khoản | Số dư Đầu kỳ (OB) | Số dư Mục tiêu (Target) | Chênh lệch cần xử lý | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **1111** (Tiền mặt) | 616.993.656 | 292.377.476 | **- 324.616.180** | Cần rải bút toán Chi tiền mặt trả NCC/Cá nhân |
| **112** (Tiền gửi) | 37.628.290 | 87.014.561 | **+ 49.386.271** | Điều chỉnh theo sao kê và phí ngân hàng |
| **131** (Phải thu KH) | 108.374.327 | 610.548.304 | **+ 502.173.977** | Bổ sung các khoản phải thu từ hóa đơn bán ra |
| **331** (Phải trả NCC) | 4.668.735.402 | 15.761.265.757 | **+ 11.092.530.355** | Khớp với biến động nhập kho 1561 |
| **1561** (Hàng tồn kho) | 15.447.634.554 | 15.761.265.756 | **+ 313.631.202** | Khớp theo báo cáo XNT 2023 Premium |
| **341** (Vay vốn) | 27.120.076.996 | 27.116.010.280 | **- 4.066.716** | Điều chỉnh giảm dư nợ vay qua chi phí lãi |

## 2. CÁC VẤN ĐỀ CẦN ĐIỀU CHỈNH CHI TIẾT

### 2.1. Logic Phân bổ Tiền mặt (TK 1111)
- **Vấn đề:** Số dư tiền mặt đầu kỳ đang cao hơn mục tiêu.
- **Biện pháp:** Thực hiện rải các bút toán phiếu chi (PC) theo **Trọng số Doanh thu (Seasonality Weight)** của từng tháng.
- **Nguyên tắc:** Không dồn cục vào cuối năm; tháng nào có doanh số mua vào/bán ra cao thì tỷ trọng điều chỉnh cao hơn (tuân thủ **RULE 1: Real-World Distribution**).

### 2.2. Đối soát Ngân hàng & Vay vốn (TK 112 & 341)
- **Vấn đề:** Chênh lệch giữa sao kê thực tế và sổ sách kế toán do các khoản phí dịch vụ và lãi vay chưa hạch toán đủ.
- **Biện pháp:** 
  - Khớp lại toàn bộ các giao dịch từ file `SAO_KE_TONG_HOP_HHP_2023.xlsx`.
  - Hạch toán bổ sung các bút toán **Phí dịch vụ ngân hàng** (Nợ 642 / Có 112) hoặc **Lãi tiền vay** (Nợ 635 / Có 112).
  - Đảm bảo diễn giải theo chuẩn **RULE 2**: "Trả nợ gốc vay ngân hàng" hoặc "Giải ngân tiền vay...".

### 2.3. Hàng tồn kho & Giá vốn (TK 1561 & 632)
- **Vấn đề:** Giá vốn năm 2023 xác định mục tiêu là **109.513.781.529 VNĐ**.
- **Biện pháp:** 
  - Cần kiểm tra lại file `XNT_HoangHuyPhat_2023.xlsx` sheet `xnt12thang`.
  - Thực hiện bút toán kết chuyển giá vốn: `Nợ 632 / Có 1561` vào ngày 31/12/2023.
  - Lưu ý: Không để xảy ra tình trạng **ÂM số lượng hoặc ÂM giá trị** tại bất kỳ thời điểm nào trong năm.

### 2.4. Khấu trừ Thuế GTGT (TK 1331)
- **Vấn đề:** Mục tiêu thuế GTGT còn được khấu trừ cuối kỳ là **5.637.319.415 VNĐ**.
- **Biện pháp:** Rà soát lại danh sách hóa đơn mua vào (`loaihd = 'muavao'`) và trạng thái hóa đơn `tthai IN (1, 2, 4, 5)` trong database.

## 3. KẾ HOẠCH THỰC HIỆN ĐIỀU CHỈNH

1. **Cập nhật Logic Python:** Sử dụng script `produce_final_hhp_2023.py` để tự động hóa việc rải các bút toán điều chỉnh.
2. **Kiểm tra Đối tượng (Object):** Đảm bảo các bút toán điều chỉnh 131/331 phải gắn với đúng đối tượng (mã khách hàng/NCC) hoặc "Đối tượng bán lẻ" để không làm sai lệch sổ chi tiết công nợ.
3. **Xuất báo cáo cuối cùng:** 
   - Xuất file `NKC_HHP_2023.xlsx` (Nhật ký chung).
   - Xuất file `SO_CHI_TIET_HHP_2023.xlsx` (Sổ chi tiết) với định dạng **In đậm (Bold)** cho dòng tổng cộng theo **RULE 5**.

---
*Báo cáo được tổng hợp bởi Antigravity.*
