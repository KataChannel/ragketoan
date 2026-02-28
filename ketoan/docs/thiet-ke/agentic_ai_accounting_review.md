# Báo cáo Đánh giá Dự án & Tiềm năng ứng dụng Agentic AI trong Kế toán

Dựa trên việc kiểm tra toàn bộ mã nguồn của dự án (mô hình dữ liệu Prisma, các service xử lý lõi như `tonghop.service.ts`, `so-ke-toan.service.ts`, và giao diện `tonghopso/page.tsx`), dưới đây là báo cáo tổng hợp về khả năng áp dụng Agentic AI.

## 1. Hiện trạng dự án
Dự án đã có nền tảng rất tốt để phát triển lên hệ thống kế toán thông minh:
- **Dữ liệu thô:** Đã đồng bộ thành công hóa đơn điện tử từ API Thuế vào database (`ext_listhoadon`, `ext_detailhoadon`).
- **Xử lý tồn kho:** Có hệ thống chốt số dư hàng ngày (`ext_daily_stock_v2`) và chuẩn hóa mặt hàng (`ext_tonghop`).
- **AI cơ bản:** Đã triển khai RAG (Retrieval-Augmented Generation) kết hợp Human-in-the-Loop (HITL) để ánh xạ tên hàng hóa hóa đơn sang danh mục chuẩn.
- **Sổ sách:** Đang ở mức độ "tự động hạch toán sơ bộ" dựa trên từ khóa (keywords) để lên Sổ Nhật ký chung và Sổ Cái.

---

## 2. Tiềm năng áp dụng Agentic AI (Khả thi & Hiệu quả cao)

Việc áp dụng **Agentic AI** (Các Agent AI có khả năng lập luận, sử dụng công cụ và thực hiện tác vụ tự chủ) hoàn toàn có thể giúp dự án đạt được các mục tiêu đã đề ra.

### A. Tối ưu hóa Điều chỉnh Xuất Nhập Tồn (XNT)
Thay vì chỉ tính toán số học, Agent AI có thể:
1.  **Phát hiện bất thường (Anomaly Detection):** Tự động quét lịch sử giao dịch để tìm ra các lỗi như: tồn kho âm, giá nhập/xuất biến động bất thường, hoặc đơn vị tính không nhất quán.
2.  **Đề xuất điều chỉnh (Adjustment Reasoning):** Khi phát hiện sai lệch thực tế, Agent có thể truy tìm nguyên nhân (ví dụ: "Hóa đơn mua hàng ngày X bị trùng" hoặc "Quên chưa nhập hóa đơn bán hàng cho đối tác Y") và yêu cầu kế toán duyệt bút toán điều chỉnh.
3.  **Duyệt thông minh (Smart Reconcile):** Tự động khớp mã hàng với độ chính xác tuyệt đối, giảm thiểu sai sót do nhập liệu thủ công hoặc tên hàng sai khác.

### B. Lên tất cả loại sổ kế toán
Hiện tại hệ thống dùng `keyword-based mapping` (cố định). Agentic AI có thể nâng tầm bằng cách:
1.  **Hạch toán tự động theo bối cảnh:** Agent phân tích tên hàng, nội dung hóa đơn và đặc điểm đối tác để chọn tài khoản (TK Nợ/TK Có) chính xác theo Thông tư 200/133 (ví dụ: phân biệt 6421 - Chi phí bán hàng và 6422 - Chi phí quản lý).
2.  **Xử lý giao dịch phức tạp:** Các nghiệp vụ như hàng bán trả lại, chiết khấu thương mại, hay phân bổ chi phí trả trước (242) Agent có thể tự động tính toán và tạo bút toán đa dòng.
3.  **Tự động tạo Sổ Chi Tiết:** Hoàn thiện các loại sổ mà hệ thống đang thiếu (Sổ chi tiết khách hàng, sổ chi tiết vật tư) bằng cách gom nhóm dữ liệu thông minh.

### C. Lập Báo cáo Tài Chính (BCTC)
Đây là bước đột phá nhất của Agentic AI:
1.  **Báo cáo thông minh:** Không chỉ trả về bảng số liệu (Bảng Cân đối kế toán, Kết quả KD, Lưu chuyển tiền tệ), Agent có thể viết lời giải thích (Thuyết minh BCTC) dựa trên biến động dữ liệu.
2.  **Kiểm soát chéo (Audit Agent):** Tự đóng vai trò là kiểm toán viên nội bộ để kiểm tra tính cân đối của các báo cáo trước khi trình kế toán trưởng.
3.  **Dự báo tài chính:** Dựa trên dữ liệu sổ sách, Agent có thể đưa ra dự báo dòng tiền và cảnh báo rủi ro thuế.

---

## 3. Lộ trình triển khai Agentic AI

| Giai đoạn | Tính năng | Mô tả tác vụ của Agent |
| :-- | :-- | :-- |
| **Giai đoạn 1** | **Smart Accounting Agent** | Thay thế bộ lọc từ khóa bằng LLM để hạch toán toàn bộ hóa đơn vào Sổ Nhật Ký Chung theo chuẩn kế toán Việt Nam. |
| **Giai đoạn 2** | **Inventory Audit Agent** | Tự động phát hiện lỗi tồn kho âm, sai lệch đơn giá và tạo phiếu "Điều chỉnh XNT" chờ duyệt (HITL). |
| **Giai đoạn 3** | **Financial Reporting Agent** | Tự động tổng hợp số liệu từ các sổ đã hạch toán để lên bộ BCTC đầy đủ và viết Thuyết minh báo cáo. |
| **Giai đoạn 4** | **AI Assistant (Voice/Chat)** | Giao tiếp bằng ngôn ngữ tự nhiên: "Cho tôi biết nợ của công ty A", "Tại sao tồn kho mã B bị âm?", "Lập báo cáo thuế quý 3". |

---

## 4. Kết luận
Dự án của bạn **hoàn toàn có thể** tích hợp Agentic AI để trở thành một hệ thống kế toán tự động hóa hoàn chỉnh. 

**Lợi ích lớn nhất:** Tiết kiệm 80-90% thời gian nhập liệu và kiểm tra lỗi của kế toán viên, đồng thời đảm bảo tính chính xác và tuân thủ các quy định hiện hành thông qua cơ chế reasoning của AI kết hợp sự phê duyệt của con người (Human-in-the-Loop).

Dự án hiện đã có `rag-agent.service.ts`, đây là viên gạch đầu tiên. Bước tiếp theo nên là mở rộng Agent này để đọc được `Sơ đồ tài khoản` và thực hiện hạch toán nghiệp vụ.
