# Báo cáo Tiến độ Triển khai: Agentic AI Thuần Code + HITL

**Mục tiêu:** Xây dựng hệ thống Agentic AI (Sử dụng Cloud LLM + Vector Database trên PostgreSQL) kết hợp cơ chế Xác nhận của con người (Human-in-the-Loop) để chuẩn hóa tên mặt hàng, giúp tính toán xuất nhập tồn chính xác.
**Nhánh Git:** `dev5`
**Tiến độ Tổng thể:** ⏳ **100% (Hoàn Thành)**

---

## 📋 [Giai đoạn 1] Cấu trúc Cơ sở Dữ liệu & Prisma (Hoàn thành)
- [x] 1. Thêm extension `vector` vào PostgreSQL.
- [x] 2. Bổ sung trường `embedding` (type vector) vào bảng `ext_sanpham_dictionary`.
- [x] 3. Tạo Schema mới cho bảng `ext_mapping_queue` (Lưu thông tin các item chờ Kế toán duyệt).
- [x] 4. Chạy Prisma Generate và DB Push (hoặc Migrate) để cập nhật Schema xuống Database.

## 🧠 [Giai đoạn 2] AI Service & Database Logic (Hoàn thành)
- [x] 1. Cài đặt các thư viện cần thiết: `@langchain/openai` hoặc thư viện SDK của LLM Provider (ví dụ: Google Generative AI / OpenAI). (Không cần cài, dùng fetch thuần).
- [x] 2. Viết service kết nối với Cloud LLM (OpenAI / Gemini) để tạo `Embedding` và thực hiện `Reasoning` từ Prompt.
- [x] 3. Viết Raw SQL Query trên Prisma để thực hiện Cosine Similarity Search (KNN) với `pgvector`.
- [x] 4. Tạo Logic `RAGAgentService`: Nhận `tenGoc` -> Vectorize -> Search -> Gọi LLM -> Phân loại `CONFIDENT_MATCH` hay `UNCERTAIN`.

## ⚙️ [Giai đoạn 3] Tích hợp Luồng Đồng bộ (Sync Pipeline) (Hoàn thành)
- [x] 1. Chỉnh sửa hàm `syncTongHop` trong `tonghop.service.ts`.
- [x] 2. Lấy ra những mặt hàng chưa có mã chuẩn. Đẩy chúng qua `RAGAgentService`.
- [x] 3. Nếu độ tự tin >= 95%, tự động lưu vào `ext_sanpham_dictionary` và áp dụng.
- [x] 4. Nếu độ tự tin < 95%, lưu vào `ext_mapping_queue` với trạng thái `PENDING`.

## 🌐 [Giai đoạn 4] Xây dựng API (Hoàn thành)
- [x] 1. Tạo API Endpoint (GET) `api/ai-mapping-queue` để lấy danh sách mặt hàng đang chờ phê duyệt.
- [x] 2. Tạo API Endpoint (POST) `api/ai-mapping-queue/approve` để nhân viên Kế toán thực hiện thao tác duyệt (Approve) hoặc từ chối, cập nhật lên `ext_sanpham_dictionary`.

## 🖥️ [Giai đoạn 5] Giao diện Người dùng (HITL UI) (Hoàn thành)
- [x] 1. Thêm Menu "Duyệt Mặt Hàng (AI)" vào thanh Sidebar.
- [x] 2. Tạo trang `app/ai-mapping/page.tsx` hiển thị danh sách hàng đợi (Queue).
- [x] 3. Giao diện Cột: Tên Hóa Đơn (Tên Gốc), Đề xuất của AI (Option A, B), và Actions (Duyệt/Thêm Mã Mới).
- [x] 4. Code logic gọi API từ UI để hoàn tất chu trình xét duyệt.

## 🚀 [Giai đoạn 6] Kiểm tra và Bàn giao (Hoàn thành)
- [x] 1. Review lại toàn bộ kiến trúc để đảm bảo tính năng đồng bộ XNT hoạt động trơn tru.
- [x] 2. Verify hiệu năng của AI Mapping và Vector Storage.
- [x] 3. Hoàn tất báo cáo và lưu lại trên nhánh `dev5`.

---
*Báo cáo này sẽ được tự động cập nhật tự động trong suốt quá trình AGENT triển khai mã nguồn.*
