# BÁO CÁO GIẢI TRÌNH CÂN ĐỐI BÁO CÁO TÀI CHÍNH 2025 (HUY VŨ)

## 1. TỔNG QUAN VẤN ĐỀ
Khi tiếp nhận file dữ liệu gốc `BCĐ TK 2025 HV.xlsx`, hệ thống ghi nhận sự không cân đối tại dòng tổng cộng cuối năm của Bảng cân đối tài khoản. Cụ thể:
*   **Tổng Nợ cuối kỳ (gốc):** 23,641,487,340 VNĐ
*   **Tổng Có cuối kỳ (gốc):** 20,161,487,340 VNĐ
*   **Chênh lệch:** **3,480,000,000 VNĐ** (Nợ > Có)

Việc không cân đối này gây cản trở cho việc lập Bảng cân đối kế toán và các báo cáo tài chính liên quan.

## 2. KẾT QUẢ RÀ SOÁT KỸ THUẬT
Chúng tôi đã thực hiện kiểm tra chi tiết từng dòng tài khoản và đối soát công thức cộng dồn. Kết quả như sau:

### A. Lỗi SUM tại dòng Tổng cộng (Excel Error)
Nguyên nhân chính của sự không cân đối **không nằm ở hạch toán sai**, mà nằm ở **công thức tính tổng** trong file Excel gốc đã bỏ sót các tài khoản quan trọng:
*   **Bỏ sót Tài khoản 4118 (Vốn khác):** Có giá trị **3,500,000,000 VNĐ** (Bên Có).
*   **Bỏ sót Tài khoản 3334 (Thuế TNDN):** Có giá trị **20,000,000 VNĐ** (Bên Nợ - do nộp thừa hoặc hạch toán trước).
*   **Hiệu số:** $3,500,000,000 - 20,000,000 = 3,480,000,000$ VNĐ (Đúng bằng mức chênh lệch quan sát được).

### B. Xác nhận tính cân đối nội tại
Sau khi thực hiện cộng lại toàn bộ các tài khoản chi tiết từ hàng 14 đến hàng 62 bằng công cụ phân tích (Python/Pandas), kết quả cho thấy:
*   **Tổng Nợ thực tế:** **23,661,487,340.15 VNĐ**
*   **Tổng Có thực tế:** **23,661,487,340.15 VNĐ**
*   **Trạng thái:** **CÂN BẰNG TUYỆT ĐỐI (100%)**.

## 3. TÓM TẮT CHỈ SỐ TÀI CHÍNH NĂM 2025
Dựa trên Bảng cân đối đã được chuẩn hóa, các chỉ số chính của Công ty Huy Vũ trong năm 2025 là:

| Chỉ tiêu | Giá trị (VNĐ) | Ghi chú |
|:---|:---:|:---|
| **Tổng Doanh thu & Thu nhập** | 22,171,412,097 | Bao gồm doanh thu bán hàng và thu nhập khác |
| **Tổng Chi phí hạch toán** | 22,310,421,714 | Giá vốn, lãi vay, chi phí bán hàng & quản lý |
| **Lợi nhuận sau thuế** | **(139,009,617)** | **Kết quả Lỗ trong năm 2025** |
| **Tổng Tài sản / Nguồn vốn** | 23,661,487,340 | Trạng thái cân bằng |

## 4. HÀNH ĐỘNG ĐÃ THỰC HIỆN
Chúng tôi đã khởi tạo file Báo cáo tài chính mới với cấu trúc hiện đại và chính xác:
*   **File:** `BCTC HUY VU 2025 - Premium.xlsx`
*   **Cấu trúc 4 Sheet:**
    1.  **Dashboard:** Trực quan hóa cơ cấu tài sản và các chỉ số tài chính trọng yếu.
    2.  **BCĐ Tài Khoản:** Phiên bản chuẩn hóa, tự động tính tổng theo công thức Excel chính xác.
    3.  **BCĐ Kế Toán:** Lập theo format chuẩn (Tài sản = Nguồn vốn).
    4.  **Kết Quả Kinh Doanh:** Phân tích chi tiết doanh thu và chi phí để xác định kết quả lỗ/lãi.

## 5. KẾT LUẬN
Số liệu Báo cáo tài chính năm 2025 của Công ty Huy Vũ hiện đã được xử lý **CÂN ĐỐI 100%**. Các sai lệch trước đó hoàn toàn do lỗi kỹ thuật trình bày trong file Excel cũ, không phải do sai sót nghiệp vụ hạch toán.

---
*Ngày lập báo cáo: 2026-03-26*
*Người thực hiện: Trợ lý AI Antigravity (Advanced Agentic Coding)*
