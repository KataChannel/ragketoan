---
title: "Báo cáo Tổng hợp: So sánh Phương pháp RAG Thuần Code vs Hệ sinh thái n8n + Ollama + Qdrant"
date: "2026-02-22"
description: "Phân tích, đánh giá, so sánh ưu nhược điểm giữa việc tự code luồng RAG hoàn toàn bằng mã nguồn (Python/TypeScript) so với sử dụng công cụ low-code n8n kết hợp Ollama và Qdrant cho dự án RagKetoan. Đưa ra lựa chọn tối ưu."
---

# 1. Đặt vấn đề

Dự án Hệ thống Quản lý Hóa đơn Điện tử (RagKetoan) hiện đang tích hợp các dịch vụ AI để xử lý dữ liệu kế toán (truy vấn thông minh, chuẩn hóa tên vật tư xuất nhập tồn). Để thiết kế luồng Retrieval-Augmented Generation (RAG) hiệu quả nhất, chúng ta đứng trước hai lựa chọn kiến trúc chính:
- **Phương án 1 (Thuần Code):** Tự xây dựng RAG pipeline hoàn toàn bằng mã nguồn (Python với LlamaIndex/LangChain hoặc TypeScript với LangChain.js), sử dụng cơ sở dữ liệu vector tự quản lý (như pgvector trên PostgreSQL hiện tại).
- **Phương án 2 (Hệ sinh thái Low-code):** Sử dụng nền tảng tự động hóa workflow **n8n** để quản lý luồng dữ liệu, tích hợp với **Ollama** (chạy LLM local) và **Qdrant** (Vector Database chuyên dụng).

Tài liệu này sẽ phân tích chi tiết để tìm ra giải pháp phù hợp nhất với nguồn lực và định hướng của RagKetoan.

---

# 2. Phương án 1: RAG Thuần Code (Python/TypeScript + pgvector/Qdrant)

Xây dựng một service (ví dụ: FastAPI hoặc Next.js Route Handlers) chứa toàn bộ logic xử lý: từ việc nhận request, embedding (nhúng) dữ liệu, tìm kiếm vector, đến việc prompt ghép chuỗi và gọi LLM API.

**Ưu điểm:**
- ✅ **Kiểm soát tuyệt đối (Fine-grained Control):** Cho phép can thiệp sâu vào từng khâu thuật toán (ví dụ: custom chunking, re-ranking, hybrid search).
- ✅ **Tối ưu hiệu năng (Performance):** Không bị overhead (độ trễ) do phải truyền dữ liệu qua lại giữa các node trong một hệ thống workflow engine như n8n.
- ✅ **Quản lý phiên bản (Version Control):** Mọi thay đổi về logic RAG, prompt đều nằm trong Git, dễ dàng review code, CI/CD và rollback.
- ✅ **Dễ dàng tích hợp với codebase hiện tại:** Có thể tái sử dụng trực tiếp các models của Prisma nếu viết bằng TypeScript, giảm bớt sự chồng chéo về API.

**Nhược điểm:**
- ❌ **Tốc độ phát triển chậm:** Cần viết code cho mọi thao tác từ retry logic, error handling, kết nối cơ sở dữ liệu, đến xây dựng UI để test prompt.
- ❌ **Khó debug luồng AI:** Khi LLM trả về sai hoặc vector search không chính xác, việc dò log text thuần túy để biết sai ở khâu nào khá mất thời gian.
- ❌ **Đòi hỏi kỹ năng lập trình AI:** Đội ngũ cần nắm vững các thư viện như LangChain/LlamaIndex, duy trì cập nhật thư viện thường xuyên.

---

# 3. Phương án 2: Luồng RAG trên n8n + Ollama + Qdrant

Sử dụng giao diện kéo thả của n8n để nối các node: Webhook -> Đọc dữ liệu (Postgres) -> Qdrant (Search) -> Ollama (LLM) -> Tương tác hệ thống (lưu DB/gửi tin nhắn).

**Ưu điểm:**
- ✅ **Tốc độ triển khai cực nhanh (Rapid Prototyping):** Lắp ghép luồng RAG chỉ trong vài chục phút bằng các node có sẵn. Rất mạnh mẽ khi cần xây dựng nhanh tính năng "Chuẩn hóa tên mặt hàng" đang cấp bách.
- ✅ **Trực quan (Visual Debugging):** Giao diện của n8n cho phép nhìn thấy chính xác dữ liệu (JSON) đi vào và đi ra ở từng node (node embedding, node qdrant, node ollama). Dễ dàng tinh chỉnh Prompt ngay trên UI mà không cần sửa code và deploy lại.
- ✅ **Khả năng kết nối (Integrations):** n8n dễ dàng kết nối với hàng trăm dịch vụ bên ngoài (Telegram, Email, Google Sheets, Zalo...) để làm báo cáo, cảnh báo.
- ✅ **Ollama & Qdrant chuyên dụng:** Ollama quản lý model offline xuất sắc, Qdrant quản lý vector với hiệu năng cao hơn nhiều lần so với pgvector thông thường ở quy mô lớn.

**Nhược điểm:**
- ❌ **Version Control & Triển khai (CI/CD):** Các workflow của n8n lưu dưới dạng JSON trong DB, việc dùng Git để theo dõi sự thay đổi (diff) của workflow không trực quan bằng code thuần.
- ❌ **Khó thực hiện thuật toán phức tạp:** Các logic xử lý vòng lặp phức tạp, đệ quy, hay custom logic thuật toán Re-ranker rất khó ráp nối trên n8n so với viết vài dòng code Python.
- ❌ **Overhead tài nguyên:** Chạy thêm 1 container n8n yêu cầu tốn thêm RAM và có độ trễ nhỏ khi xử lý qua các node mạng.

---

# 4. Bảng So Sánh Tổng Hợp

| Tiêu chí | RAG Thuần Code (Python/TS) | n8n + Ollama + Qdrant |
| :--- | :--- | :--- |
| **Tốc độ triển khai tính năng** | Chậm (Yêu cầu setup nhiều, viết logic) | **Rất Nhanh (Kéo thả, cấu hình node là chạy)** |
| **Khả năng Debug, thử nghiệm Prompt** | Xem log console, khó theo dõi flow | **Rất tốt, xem trực tiếp dữ liệu thay đổi ở mỗi step** |
| **Bảo trì & Git Version Control** | **Xuất sắc (theo dõi từng dòng code diff)** | Kém (File JSON cồng kềnh, khó xem diff) |
| **Khả năng tùy chỉnh / Logic phức tạp** | **Vô hạn (Code được mọi kiểu thuật toán)** | Hạn chế (Bị gò bó bởi các node do n8n hỗ trợ) |
| **Hiệu năng & Tối ưu Resource** | **Tốt (Chỉ tốn resource khi chạy, nhẹ)** | Trung bình (n8n tốn RAM chạy nền) |
| **Phù hợp với dự án RagKetoan hiện tại**| Đích đến lâu dài để hệ thống ổn định | **Lựa chọn hoàn hảo trong giai đoạn hiện tại (Iterate nhanh)** |

---

# 5. Đánh Giá & Đề Xuất cho RagKetoan

Đối với dự án Hệ thống Quản lý Hóa đơn Điện tử hiện tại, tập trung vào bài toán **"RAG để chuẩn hóa Tên Mặt Hàng"** và **"Hỏi đáp thông minh về số liệu tài chính"**:

**KIẾN NGHỊ: Áp dụng phương pháp HYBRID (Kết hợp)**

Dự án RagKetoan nên **GIỮ LẠI hệ sinh thái n8n + Ollama + Qdrant** (đã có sẵn trong file `start.sh`) cho nhiệm vụ RAG, vì:

1. **Giai đoạn phát hiện nhu cầu (Prototyping Phase):** Bài toán map Tên Hàng Góc với Tên Hàng Chuẩn cần phải thử nghiệm các Prompt khác nhau liên tục để tìm ra Prompt tối ưu nhất cho Ollama. n8n cung cấp UI tuyệt vời để Business Analyst hoặc Kế toán cũng có thể hiểu và sửa Prompt mà không cần nhờ Coder.
2. **Qdrant thay thế PostgreSQL (pgvector):** Dữ liệu kế toán phình to liên tục theo từng tờ hóa đơn. Qdrant chuyên dụng cho Vector Search sẽ ổn định hơn và tránh làm nặng tải database chính (PostgreSQL) đang chạy cho Prisma.
3. **Tháo gỡ dần dần:** 
   - Biến n8n thành "API Gateway cho AI". Các hệ thống Next.js (Ketoan Frontend) chỉ cần gọi 1 HTTP Webhook tới n8n (chứa payload `tenGoc`), n8n sẽ thực hiện luồng RAG trên Qdrant + gọi Ollama, và trả về `tenChuan`. Frontend Next.js không cần quan tâm sự phức tạp nội tại.
   - Khi luồng RAG trong n8n đã được khẳng định độ chính xác 99% (Stable), đội ngũ hoàn toàn có thể export logic đó sang viết lại bằng **Thuần Code Python (FastAPI)** để tối ưu hóa hiệu năng và triển khai diện rộng với chi phí server thấp nhất.

**Tóm lại:** Dùng **n8n + Ollama + Qdrant** ở thời điểm hiện tại là lựa chọn khôn ngoan để "Đi Nhanh" - giúp dự án giải quyết nhanh bài toán Xuất Nhập Tồn sai lệch tên hàng, dễ dàng thử nghiệm và tinh chỉnh kết quả AI. Sau khi có một khung quy trình AI vững chắc, việc chuyển sang code thuần (nếu cần thiết) sẽ là bước đi sau này.
