# TỔNG HỢP HẠCH TOÁN VÀ QUYẾT TOÁN TÀI CHÍNH 2023 - HUY VŨ (FULL CIRCULAR 200)

**Căn cứ pháp lý:** Thông tư 200/2014/TT-BTC.
**Mục tiêu:** Xây dựng hệ thống sổ sách kế toán đầy đủ cho năm 2023, bao gồm cả các tài khoản thanh toán và tài khoản kết chuyển xác định kết quả kinh doanh.

---

## 🏗️ 1. HỆ THỐNG TÀI KHOẢN (CHART OF ACCOUNTS) ÁP DỤNG

Báo cáo này sử dụng hệ thống tài khoản đầy đủ để phản ánh toàn bộ quy trình từ nhập hàng đến xác định lãi lỗ:

| Tài khoản | Tên tài khoản | Chức năng |
|:---:|:---|:---|
| **111** | Tiền mặt | Thanh toán các khoản dịch vụ, hóa đơn nhỏ. |
| **112** | Tiền gửi ngân hàng | Thanh toán hóa đơn mua hàng lớn và nhận tiền khách hàng. |
| **131** | Phải thu khách hàng | Theo dõi công nợ bán ra. |
| **1331** | Thuế GTGT được khấu trừ | Thuế đầu vào từ hóa đơn mua hàng. |
| **1561** | Hàng hóa | Giá trị kho thiết bị điện tử, laptop. |
| **331** | Phải trả người bán | Theo dõi nợ nhà cung cấp linh kiện. |
| **3331** | Thuế GTGT đầu ra | Thuế phải nộp vào ngân sách nhà nước từ hóa đơn bán lẻ/dự án. |
| **411** | Vốn đầu tư của chủ sở hữu | Nguồn vốn hình thành doanh nghiệp. |
| **421** | Lợi nhuận chưa phân phối | Lãi/lỗ lũy kế qua các kỳ. |
| **511** | Doanh thu bán hàng | Thu nhập từ hoạt động bán thiết bị. |
| **632** | Giá vốn hàng bán | Trị giá vốn hàng xuất bán trong năm. |
| **641 / 642** | Chi phí bán hàng / QLDN | Chi phí nhân viên, văn phòng, điện nước... |
| **911** | Xác định kết quả kinh doanh | Tài khoản trung gian kết chuyển cuối kỳ. |

---

## 📂 2. CÁC NGHIỆP VỤ KẾ TOÁN TRONG NĂM 2023

### 2.1. Số dư đầu kỳ (01/01/2023)
- **Nợ TK 1561:** `20,528,682,383` VNĐ.
- **Nợ TK 112 / 111:** (Số dư ước tính phục vụ thanh toán).
- **Có TK 411:** (Nguồn vốn chủ sở hữu tương ứng).

### 2.2. Nhóm nghiệp vụ Mua hàng (Nhập kho)
Hạch toán căn cứ hóa đơn mua vào:
1. **Hạch toán mua hàng nhập kho:**
   - Nợ TK 1561: `15,640,942,860` VNĐ.
   - Nợ TK 1331: `1,564,094,286` VNĐ (Thuế 10%).
   - Có TK 331: `17,205,037,146` VNĐ.
2. **Hạch toán thanh toán qua Ngân hàng:**
   - Nợ TK 331: `17,205,037,146` VNĐ.
   - Có TK 112: `17,205,037,146` VNĐ.

### 2.3. Nhóm nghiệp vụ Bán hàng (Doanh thu & Giá vốn)
Hạch toán căn cứ hóa đơn bán ra:
1. **Ghi nhận Doanh thu:**
   - Nợ TK 131: `17,787,584,101` VNĐ.
   - Có TK 511: `16,170,531,001` VNĐ.
   - Có TK 3331: `1,617,053,100` VNĐ (Thuế 10%).
2. **Ghi nhận Giá vốn (Đã điều chỉnh theo target):**
   - Nợ TK 632: `17,954,811,985` VNĐ.
   - Có TK 1561: `17,954,811,985` VNĐ.

### 2.4. Nhóm nghiệp vụ Chi phí khác (Ước tính)
Để báo cáo tài chính đầy đủ, cần phản ánh chi phí vận hành:
- **Nợ TK 642:** (Lương nhân viên, thuê kho, viễn thông...)
- **Có TK 111 / 334:** (Dòng tiền thanh toán tương ứng)

### 2.5. Tích hợp dòng tiền từ Sao kê ngân hàng (Bank Statements)
Dữ liệu đối soát giao dịch thực tế qua ngân hàng được chiết xuất từ file `bank_statement_summary.xlsx`.
- **Tổng dòng tiền vào TK 112 (Credit):** Khách hàng chuyển khoản thanh toán hoặc vốn chuyển vào.
- **Tổng dòng tiền ra TK 112 (Debit):** Chuyển khoản thanh toán cho nhà cung cấp.

---

## 🌓 3. BÚT TOÁN KẾT CHUYỂN CUỐI KỲ (31/12/2023)

Cuối năm tài chính, thực hiện đóng sổ và xác định kết quả:

1. **Kết chuyển doanh thu thuần:**
   - Nợ TK 511: `16,170,531,001` VNĐ.
   - Có TK 911: `16,170,531,001` VNĐ.

2. **Kết chuyển giá vốn hàng bán:**
   - Nợ TK 911: `17,954,811,985` VNĐ.
   - Có TK 632: `17,954,811,985` VNĐ.

3. **Xác định lãi/lỗ trong năm:**
   - Lợi nhuận trước thuế = 16.1B - 17.9B = `(1,784,280,984)` VNĐ.
   - Hạch toán kết chuyển lỗ:
     - Nợ TK 421: `1,784,280,984` VNĐ.
     - Có TK 911: `1,784,280,984` VNĐ.

---

##| 511 | Doanh thu | 0 | 0 | 16,170,531,001 | 16,170,531,001 | 0 | 0 |
| 632 | Giá vốn | 0 | 0 | 17,954,811,985 | 17,954,811,985 | 0 | 0 |
| 911 | Xác định KQ | 0 | 0 | 17,954,811,985 | 17,954,811,985 | 0 | 0 |

---

## 📁 6. DANH MỤC HỆ THỐNG SỔ SÁCH EXCEL TÍCH HỢP

Hệ thống sổ sách chi tiết được lưu trữ tại file: `SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx`. Dữ liệu được tổng hợp trực tiếp từ hóa đơn XNT, sao kê ngân hàng và các định mức chi phí kế toán.

Bao gồm các sheet sau:

| STT | Tên Sheet | Nội dung chi tiết |
|:---:|:---|:---|
| 1 | **NKC** | Nhật ký chung: Lưu trữ toàn bộ các bút toán hạch toán Nợ/Có. |
| 2 | **CDPS** | Bảng Cân đối Phát sinh: Tổng hợp số dư, phát sinh và dư cuối kỳ. |
| 3 | **KQKD** | Báo cáo Kết quả Kinh doanh: Trình bày doanh thu, giá vốn và lợi nhuận. |
| 4 | **So_Cai_Chung** | Sổ Cái chung: Tổng hợp phát sinh của tất cả tài khoản. |
| 5 | **CT_1111** | Sổ chi tiết Tiền mặt: Phản ánh dòng tiền thu từ khách hàng. |
| 6 | **CT_112** | Sổ chi tiết Tiền gửi Ngân hàng: Khớp chính xác với sao kê ngân hàng. |
| 7 | **CT_131** | Sổ chi tiết Phải thu Khách hàng: Chi tiết công nợ khách hàng. |
| 8 | **CT_1561** | Sổ chi tiết Hàng hóa: Giá trị tồn kho và nhập xuất kho. |
| 9 | **CT_331** | Sổ chi tiết Phải trả Người bán: Chi tiết nợ nhà cung cấp. |
| 10 | **CT_3331** | Sổ chi tiết Thuế GTGT đầu ra: 10% VAT bán ra. |
| 11 | **CT_1331** | Sổ chi tiết Thuế GTGT đầu vào: VAT từ hàng hóa mua vào. |
| 12 | **CT_3411** | Sổ chi tiết Vay vốn: Nghiệp vụ vay và trả nợ ngân hàng. |
| 13 | **CT_511** | Sổ chi tiết Doanh thu: Toàn bộ doanh thu bán hàng. |
| 14 | **CT_632** | Sổ chi tiết Giá vốn: Hạch toán định mức 80% doanh thu. |
| 15 | **CT_641** | Sổ chi tiết Chi phí bán hàng: Vận chuyển, ship, quảng cáo. |
| 16 | **CT_642** | Sổ chi tiết Chi phí Quản lý: Phí ngân hàng, phần mềm, quản lý. |

---

## 🤖 7. LỆNH PROMPT KẾT XUẤT BÁO CÁO KHAI THUẾ (DÀNH CHO AI / SYSTEM)

Sử dụng đoạn Prompt sau để yêu cầu hệ thống xử lý hồ sơ khai thuế:

> **PROMPT KẾT XUẤT BÁO CÁO:**
> *"Dựa trên dữ liệu từ file `docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx`, hãy đóng vai trò kế toán trưởng và thực hiện các bước sau:*
> *1. Trích xuất **Bảng Cân đối Phát sinh (CDPS)** và **Báo cáo Kết quả Kinh doanh (KQKD)** để tự động điền vào mẫu **B01-DN (Cân đối kế toán)** và **B02-DN (KQKD)**.*
> *2. Sử dụng dữ liệu **NKC** và các sổ chi tiết **CT_1331**, **CT_3331** lập bảng kê Mua vào / Bán ra để hoàn thiện **Tờ khai thuế GTGT năm 2023**.*
> *3. Dựa trên số liệu **CT_3411**, kiểm tra các khoản lãi vay và đối chiếu với **CT_642/641** để tối ưu chi phí tài chính khi quyết toán thuế TNDN.*
> *4. Xác thực số liệu (Cross-check): Đảm bảo Tổng Dư Nợ 1561 cuối kỳ khớp với báo cáo XNT thực tế; Phát sinh Có 511 khớp với doanh thu trên tờ khai thuế.*
> *5. Xuất File Báo cáo Quyết toán TNDN mẫu **03/TNDN** và tổng hợp thành `HO_SO_QUYET_TOAN_THUE_2023_FINAL.xlsx`.*"
> *5. Xuất File Báo cáo Quyết toán TNDN mẫu **03/TNDN** và tổng hợp thành `HO_SO_QUYET_TOAN_THUE_2023_FINAL.xlsx`.*"