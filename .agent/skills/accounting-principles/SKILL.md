---
name: accounting-principles
description: Use when [implementing accounting logic, generating financial reports, or reconciling data] to ensure compliance with Vietnamese Accounting Law 2015 and VAS 01.
category: professional-standards
triggers: VAS 01, Luật Kế toán 2015, nguyên tắc kế toán, accrual basis, matching principle, prudence
---

# 7 Nguyên tắc Kế toán Cơ bản (VAS 01 & Luật Kế toán 2015)

Skill này cung cấp các nguyên tắc nền tảng của kế toán Việt Nam, bắt buộc phải tuân thủ khi xây dựng logic xử lý dữ liệu, báo cáo tài chính và đối soát trong dự án `ragketoan`.

## 1. Nguyên tắc cơ sở dồn tích (Accrual basis)
- **Ghi nhận:** Mọi nghiệp vụ kinh tế liên quan đến tài sản, nợ phải trả, vốn chủ sở hữu, doanh thu, chi phí phải được ghi nhận vào sổ kế toán ngay tại thời điểm phát sinh.
- **Không phụ thuộc:** Việc ghi nhận không phụ thuộc vào thời điểm thực tế thu tiền hoặc chi tiền.
- **Ví dụ:** Doanh thu được ghi nhận khi hàng hóa/dịch vụ đã chuyển giao rủi ro và lợi ích, dù tiền chưa thu.

## 2. Nguyên tắc hoạt động liên tục (Going concern)
- **Cơ sở lập báo cáo:** Báo cáo tài chính phải được lập trên cơ sở giả định doanh nghiệp đang và sẽ tiếp tục hoạt động kinh doanh bình thường trong tương lai gần (thường ít nhất 12 tháng).
- **Trường hợp ngoại lệ:** Nếu không còn giả định này, phải lập báo cáo trên cơ sở khác và giải trình rõ ràng.

## 3. Nguyên tắc giá gốc (Historical cost)
- **Ghi nhận ban đầu:** Tài sản và nợ phải trả được ghi nhận ban đầu theo giá gốc (giá mua, giá sản xuất hoặc giá trị hợp lý tại thời điểm giao dịch).
- **Điều chỉnh:** Có thể điều chỉnh theo giá trị hợp lý sau này nếu có quy định cụ thể và giá thị trường biến động đáng tin cậy.

## 4. Nguyên tắc phù hợp (Matching principle)
- **Đối sánh:** Ghi nhận doanh thu và chi phí phải phù hợp về mặt thời gian và nội dung. 
- **Quy tắc:** Khi ghi nhận một khoản doanh thu, phải ghi nhận khoản chi phí tương ứng đã phát sinh để tạo ra doanh thu đó.

## 5. Nguyên tắc nhất quán (Consistency)
- **Áp dụng:** Các chính sách và phương pháp kế toán đã chọn phải được áp dụng nhất quán trong suốt kỳ kế toán năm.
- **Thay đổi:** Nếu thay đổi, phải giải trình lý do và ảnh hưởng trong báo cáo tài chính.

## 6. Nguyên tắc thận trọng (Prudence / Conservatism)
- **Phán đoán:** Cân nhắc kỹ lưỡng trong điều kiện không chắc chắn.
- **Quy tắc vàng:** 
  - Không thổi phồng tài sản/doanh thu.
  - Lập dự phòng kịp thời cho tổn thất có thể xảy ra.
  - Không lập dự phòng quá mức.
  - Không ghi nhận chi phí chưa chắc chắn.

## 7. Nguyên tắc trọng yếu (Materiality)
- **Định nghĩa:** Thông tin là trọng yếu nếu sự thiếu sót/sai sót có thể ảnh hưởng đến quyết định của người sử dụng báo cáo.
- **Thực thi:** Tập trung vào các thông tin quan trọng, tránh chi tiết không cần thiết làm loãng thông tin chính.

---

# Các Quy tắc Bổ sung Quan trọng (Quy tắc Kế toán Việt Nam)

- **Khách quan và Trung thực (Objectivity & Reliability):** Phản ánh đúng bản chất kinh tế (Substance over form), không bị chi phối bởi hình thức pháp lý.
- **Đầy đủ và Kịp thời (Completeness & Timeliness):** Thu thập, phản ánh đầy đủ, đúng thực tế và đúng kỳ kế toán.
- **Ghi sổ kép (Double-entry):** Mọi nghiệp vụ phải được ghi nhận vào ít nhất hai tài khoản (Nợ và Có), đảm bảo **Tổng Nợ = Tổng Có**.

## Hướng dẫn Ứng dụng trong Phát triển Dự án
Khi thực hiện các tác vụ code trong dự án `ragketoan`, agent cần tuân thủ các chỉ dẫn sau:

1. **Khi xây dựng Script đối soát (Reconciliation):** 
   - Kiểm tra nguyên tắc Ghi sổ kép tại mỗi bước chuyển đổi dữ liệu.
   - Khi phát hiện sai lệch, phải phân tích xem nó vi phạm nguyên tắc nào (ví dụ: sai kỳ kế toán - vi phạm Cơ sở dồn tích).

2. **Khi lập Báo cáo (Reporting):**
   - Đảm bảo Doanh thu hạch toán đúng kỳ mà hàng hóa đã chuyển giao (Cơ sở dồn tích và Phù hợp).
   - Kiểm tra tính Nhất quán của phương pháp tính giá xuất kho (FIFO, Giá bình quân...) nếu dự án có xử lý XNT.

3. **Khi chuẩn hóa Dữ liệu (Data Normalization):**
   - Luôn ưu tiên Phản ánh đúng bản chất giao dịch thay vì chỉ nhìn vào mã chứng từ.
   - Ghi chú rõ ràng trong mã nguồn khi có các bút toán điều chỉnh dựa trên sự Thận trọng hoặc Trọng yếu.
