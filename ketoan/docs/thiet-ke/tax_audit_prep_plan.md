# Kế hoạch Khẩn cấp 5 Ngày: Chuẩn bị Quyết toán Thuế

**Mục tiêu:** Hoàn thiện 100% hệ thống sổ sách kế toán, đối chiếu tồn kho và lập bộ báo cáo tài chính (BCTC) chuẩn phục vụ kiểm tra quyết toán thuế.

---

## 📅 Lịch trình Triển khai

### Ngày 1: Chuẩn hóa Hạch toán & Hệ thống Tài khoản (CoA)
*   **Nhiệm vụ:** Nâng cấp logic hạch toán từ "Keyword-based" sang "Intelligence-based" để đảm bảo 100% doanh thu và chi phí được phân loại đúng tài khoản (111, 112, 131, 331, 511, 632, 642...).
*   **Mục tiêu:** Sổ Nhật Ký Chung và Sổ Cái phải khớp 100% với dữ liệu hóa đơn.

### Ngày 2: Chốt số liệu Xuất Nhập Tồn & Kho
*   **Nhiệm vụ:** Kiểm tra và xử lý lỗi tồn kho âm. Đối chiếu giá trị kho giữa Sổ Tổng hợp và Sổ Chi tiết vật tư (152, 156).
*   **Mục tiêu:** Bảng tổng hợp XNT khớp với Sổ Cái tài khoản kho.

### Ngày 3: Hoàn thiện Sổ Chi Tiết & Công Nợ
*   **Nhiệm vụ:** Triển khai Sổ chi tiết khách hàng (131) và Sổ chi tiết người bán (331). Đối chiếu công nợ theo từng đối tượng.
*   **Mục tiêu:** Xuất được Sổ chi tiết cho bất kỳ mã khách hàng/nhà cung cấp nào khi thanh tra yêu cầu.

### Ngày 4: Lập Báo cáo Tài chính & Bảng Cân đối Phát sinh
*   **Nhiệm vụ:** Tự động kết chuyển cuối kỳ (Xác định kết quả kinh doanh). Lập Bảng cân đối số phát sinh, Bảng cân đối kế toán và Báo cáo Kết quả KD.
*   **Mục tiêu:** Có bộ chỉ số tài chính sơ bộ để kiểm tra tính hợp lý (Lợi nhuận, Thuế phải nộp).

### Ngày 5: Kiểm tra Chéo & Xuất Hồ sơ Quyết toán
*   **Nhiệm vụ:** Chạy Agent AI kiểm tra tính nhất quán giữa các sổ (Cross-check). Xuất toàn bộ dữ liệu ra Excel theo mẫu quy định của cơ quan thuế.
*   **Mục tiêu:** Sẵn sàng file mềm và bản in phục vụ đoàn kiểm tra.

---

## 🛠️ Công cụ Thực hiện
- **RAG Agent:** Dùng để tự động phân loại các mặt hàng/dịch vụ phức tạp vào đúng nhóm chi phí.
- **Auto-Accountant:** Service tự động hóa các bút toán kết chuyển tháng/quý.
- **Export Engine:** Công cụ xuất báo cáo hàng loạt.

---
> [!IMPORTANT]
> Đây là giai đoạn "Chiến dịch 120 giờ". Mọi tính năng phụ sẽ được tạm hoãn để ưu tiên tính chính xác và đầy đủ của sổ sách quyết toán.
