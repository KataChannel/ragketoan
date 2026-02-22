---
title: "Báo cáo Đánh giá và Đề xuất Kiến trúc Agentic AI Thuần Code cho Chuẩn hóa Mặt hàng"
date: "2026-02-22"
description: "Phân tích, đánh giá và đề xuất phương pháp xây dựng Agentic AI thuần túy bằng mã nguồn (không dùng n8n, Ollama, Qdrant) để chuẩn hóa tên mặt hàng, tích hợp cơ chế Human-in-the-Loop (Xác nhận của con người) vào hệ thống RagKetoan hiện tại."
---

# 1. Đặt vấn đề và Mục tiêu

Dự án Hệ thống Quản lý Hóa đơn Điện tử (RagKetoan) đang đối mặt với thách thức lớn trong việc thống kê chính xác Xuất Nhập Tồn (XNT) do biến thể tên mặt hàng phức tạp từ nhiều nhà cung cấp. 

**Mục tiêu mới:** Thay vì phụ thuộc vào các công cụ bên ngoài (n8n, Ollama, Qdrant), hệ thống cần một kiến trúc **Agentic AI thuần code** (được tích hợp trực tiếp vào codebase hiện tại) kết hợp với cơ chế **Human-in-the-Loop (HITL)**. Nghĩa là: Agent tự động nhận diện và đề xuất chuẩn hóa tên mặt hàng, nhưng với những trường hợp độ tin cậy thấp, nó sẽ dừng lại và yêu cầu Kế toán xác nhận trước khi lưu vào CSDL chuẩn (`ext_sanpham_dictionary`).

# 2. Đánh giá Khả thi Hệ thống Thuần Code

Việc loại bỏ n8n, Ollama, và Qdrant mang lại cả lợi thế và thách thức:

**Lợi thế:**
- **Kiến trúc đồng nhất (Monolithic/Tightly Coupled):** Toàn bộ logic nằm gọn trong Next.js/Node.js backend, dễ dàng deploy, không cần duy trì nhiều container phức tạp.
- **Tối ưu tài nguyên:** Tiết kiệm RAM và CPU đáng kể so với việc phải duy trì các tiến trình chạy nền nặng nề của n8n và Ollama (nếu host local).
- **Trải nghiệm người dùng (UX) liền mạch:** Có thể xây dựng ngay giao diện "Xác nhận AI" ngay trong màn hình Quản lý Hóa đơn/XNT của Kế toán một cách tự nhiên.

**Thách thức:**
- **Bắt buộc dùng Cloud LLM API (hoặc self-hosted LLM qua VLLM/llama.cpp):** Nếu không dùng Ollama, bắt buộc phải dùng API của OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet), hoặc Google (Gemini) để làm não bộ cho Agent. Điều này tốn chi phí theo token, nhưng độ thông minh vượt trội. Áp dụng cho bài toán NLP phức tạp tiếng Việt rất hiệu quả.
- **Cơ sở dữ liệu Vector (Vector DB):** Bỏ Qdrant, ta phải thay thế bằng `pgvector` ngay trên PostgreSQL hiện tại. Điều này đòi hỏi cấu hình extension `pgvector` và viết Prisma Raw SQL queries cho vector search (Cosine Similarity).

# 3. Đề xuất Kiến trúc Agentic AI + HITL

## 3.1. Các thành phần chính (Components)

1. **AI Brain (Cloud LLM):** Sử dụng OpenAI API / Gemini API để suy luận, đối chiếu ngữ nghĩa.
2. **Knowledge Base (pgvector):** Tận dụng PostgreSQL hiện tại, kích hoạt extension `vector`. Bổ sung trường `embedding` (vector type) vào bảng `ext_sanpham_dictionary` để lưu trữ vector biểu diễn tên chuẩn.
3. **Agent Logic (Node.js/Next.js API):** Viết logic orchestrator bằng LangChain.js hoặc thuần code (fetch API) để điều phối luồng xử lý.
4. **HITL Queue (Hàng đợi chờ xác nhận):** Bảng mới trong database (VD: `ext_mapping_queue`) lưu trữ các đề xuất của AI mà độ tin cậy không đạt ngưỡng 100%.
5. **UI Component (Frontend Next.js):** Màn hình "Duyệt chuẩn hóa thông minh" cho phép Kế toán xem: Tên gốc, Gợi ý của AI (Kèm % tự tin), và Nút Duyệt/Từ chối/Nhập tên khác.

## 3.2. Luồng xử lý (Agentic Workflow)

**Bước 1: Trigger Data Ingestion**
Khi có hóa đơn mới được tải về qua `syncTongHop()`:
- Lấy ra danh sách các `tenGoc` CHƯA có trong `ext_sanpham_dictionary`.

**Bước 2: Retrieval (Tìm kiếm ngữ nghĩa V1)**
- Gọi API Embedding (VD: `text-embedding-3-small` của OpenAI) biến `tenGoc` thành Vector.
- Truy vấn DB bằng `pgvector` (Toán tử `<=>` Cosine Distance) để lấy Top-5 Tên Chuẩn gần giống nhất từ `ext_sanpham_dictionary`.
- Nếu khoảng cách cosine quá xa (mặt hàng hoàn toàn mới), Agent chuyển sang trạng thái "Create New".

**Bước 3: Agent Reasoning (LLM Evaluation)**
- Geri Prompt cho LLM cùng với Top-5 kết quả.
- *Prompt Example:* "Tên trên hóa đơn là 'Xm pcb40 bao'. Các mã đang có: ['Xi măng PC40', 'Xi măng PCB40 bao', 'Cát xây tô']. Hãy chọn ra tên chuẩn nếu chắc chắn trên 90%, hoặc đề xuất mã mới, và trả về định dạng JSON: `{"status": "CONFIDENT_MATCH", "mapped_tenChuan": "Xi măng PCB40 bao", "confidence_score": 0.95}` hoặc `{"status": "UNCERTAIN", "reason": "Có nhiều loại xi măng", "suggested_names": [...]}`"

**Bước 4: Quyết định (Action Routing)**
- **Nếu `status == CONFIDENT_MATCH` (Độ tự tin > 95%):**
  Agent tự động cập nhật vào `ext_sanpham_dictionary` và các bảng XNT. (Auto-mapping).
- **Nếu `status == UNCERTAIN` hoặc (Độ tự tin < 95%):**
  Agent gởi bản ghi này vào bảng chờ `ext_mapping_queue`. Trạng thái: "Chờ con người xác nhận". Ngưng luồng cho item này. Không tự ý ghi đè XNT.

**Bước 5: Human-in-the-Loop (Kế toán can thiệp)**
- Trên Dashboard Kế toán, hiện thông báo: "Có 15 mặt hàng hóa đơn mới cần bạn xác nhận ánh xạ".
- Kế toán vào màn hình Queue, thấy danh sách: Cột Trái (Tên trên HĐ) - Cột Giữa (AI Gợi ý chọn A, B, C) - Cột Phải (Hành động).
- Kế toán click "Duyệt". Trigger API cập nhật `ext_sanpham_dictionary`. Lập tức Vector DB được cập nhật. AI trong tương lai sẽ "học" được luật này và sẽ Auto-map ở lần sau.

# 4. Những điều kiện Cần & Đủ để triển khai (Implementation Requirements)

Để hiện thực hóa kiến trúc này mà không cần động đến các file mã nguồn hiện tại, ta cần lên plan cho các phần sau:

1. **Hạ tầng DB (Prisma):** 
   - Bổ sung extension `CREATE EXTENSION IF NOT EXISTS vector;` trong migration.
   - Thêm cột `embedding Unsupported("vector(1536)")` (1536 chiều nếu dùng OpenAI) vào model `ext_sanpham_dictionary`.
   - Tạo model mới `ext_mapping_queue` để lưu các Task chờ Kế toán duyệt.
2. **API & Service (Backend):**
   - Viết class `RAGAgentService` chuyên gọi LLM API.
   - Viết các hàm Raw SQL cho Prisma để thực hiện query K-Nearest Neighbors (KNN).
3. **Chi phí hoạt động (Opex):**
   - Sự phụ thuộc vào API nhà cung cấp Cloud (OpenAI/Google). Tuy nhiên, chi phí sẽ rất rẻ do chỉ gọi LLM cho những mặt hàng "lạ" chưa được map. Tính năng Cache của `ext_sanpham_dictionary` giúp triệt tiêu 95% số lượng request trong dài hạn.

# 5. Kết luận 

Phương án **Agentic AI thuần code + HITL + pgvector** là sự lựa chọn hoàn hảo nhất cho một sản phẩm phần mềm Kế toán chuyên nghiệp (Enterprise-grade). 
Nó mang lại sự ổn định tuyệt đối (không lo các service như n8n bị crash), trải nghiệm người dùng tối đa (Kế toán không có cảm giác AI tự tiện sửa số liệu, họ làm chủ cuộc chơi với nút "Duyệt"), và khả năng "AI tự học" qua mỗi lần Kế toán xác nhận đúng sai.

*Tài liệu này không chứa bất kỳ thay đổi nào đối với codebase hiện hành của hệ thống.*
