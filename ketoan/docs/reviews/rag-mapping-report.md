---
title: "Báo cáo Đánh giá và Đề xuất Phương pháp RAG cho Chuẩn hóa Tên Mặt Hàng"
date: "2026-02-22"
description: "Phân tích dự án RagKetoan, đánh giá nghiệp vụ Xuất Nhập Tồn (XNT) hiện tại và đề xuất giải pháp chuẩn hóa tên, ánh xạ tên gốc với tên chuẩn bằng RAG+LLM."
---

# 1. Tổng quan Dự án & Cấu trúc Dữ liệu

Dự án Hệ thống Quản lý Hóa đơn Điện tử (RagKetoan) được xây dựng trên công nghệ Next.js, Prisma, PostgreSQL và tích hợp dịch vụ AI (n8n, Ollama, Qdrant).
**Luồng xử lý dữ liệu hiện tại:**
1. Hóa đơn điện tử được đồng bộ từ Cơ quan Thuế qua các bản phụ (`ext_listhoadon`, `ext_detailhoadon`).
2. Dữ liệu được đưa vào một bảng denormalized `ext_tonghop` để tiện truy xuất và theo dõi, cùng lúc bảng `ext_daily_stock_v2` lưu snapshot số dư để phục vụ chốt thẻ kho.
3. Bảng `ext_sanpham_dictionary` cho phép ánh xạ 1-1 giữa Tên Gốc (`tenGoc`) từ hóa đơn sang Tên Chuẩn (`tenChuan`) mang tính nhất quán cho các logic Báo cáo XNT (Xuất theo Bán Ra, Nhập theo Mua Vào).

# 2. Phân tích Cơ chế XNT & Chuẩn hóa Hiện tại 

**Sự bất cập trong quy trình mapping hiện hành:**
Bên trong `app/services/tonghop.service.ts`, đang sử dụng hàm rule-based `chuanHoaTenHang(ten)`:
*Bản chất:* Chuyển chuỗi tiếng Việt thành không dấu, viết hoa toàn bộ và rút gọn khoảng trắng dưa thừa (Ví dụ: "Giấy A4 70gsm " -> "GIAY A4 70GSM").
*Hạn chế cốt lõi:*
1. **Sự đa dạng về thói quen lập hóa đơn:** Các nhà cung cấp khác nhau cung cấp cùng một loại hàng nhưng có thể diễn đạt sai lệch rất lớn (VD: "Xi măng PC40", "X/M Thăng long PC40", "XM PCB 40 Bao"). Việc loại bỏ dấu hay viết hoa (Rule-based) hoàn toàn thất bại.
2. **Gãy thẻ dồn:** Khi dữ liệu nhóm theo `tenHangChuan` bị phân tán thành quá nhiều dòng khác biệt (dù cùng 1 loại sản phẩm), việc đối soát Tổng Nhập, Tổng Xuất, và Tồn Cuối Kỳ sẽ sai lệch nghiêm trọng. Quản lý kho sẽ bị lệch.
3. **Thao tác thủ công:** Kế toán phải theo dõi các bảng tính xuất kho và tốn hàng chục giờ mỗi tháng để tự xác nhận rằng "Mặt hàng A" = "Mặt hàng B".

# 3. Đánh giá Khả năng Cải thiện bằng RAG (Retrieval-Augmented Generation)

Áp dụng phương pháp AI-First (kết hợp Tìm kiếm ngữ nghĩa + Sinh mô tả từ AI) là giải pháp triệt để nhất để tự động hóa khâu chuẩn hóa tên mặt hàng.

**Khả thi trong System Architecture hiện tại:**
- Sẵn sàng nền tảng Vector DB: Qdrant Server (trong biến số môi trường).
- Sẵn sàng LLM Inference (Ollama) và RAG API Gateway (Python FastAPI).
- Việc ánh xạ mặt hàng hoàn toàn phù hợp với tính năng Embedding Search và Prompt Engineering của LLM. LLM vượt trội hơn Regex truyền thống trong việc nhận diện các biến thể ngôn ngữ tự nhiên. 

# 4. Đề xuất Phương pháp RAG Đồng bộ Tên Mặt Hàng

Dưới đây là thiết kế kiến trúc và luồng dữ liệu (Data Pipeline) khi áp dụng AI đễ chuẩn hóa tên cho bài toán XNT:

### Bước 1: Khởi tạo Storage Vector (Ingestion Phase)
- Bảng danh mục Chuẩn (`tenChuan`) từ kế toán sẽ được đưa qua mô hình Embedding (ví dụ BGE-m3, hay Nomic-Embed) biến đổi thành Vector.
- Nạp khối Vector này vào Cơ sở dữ liệu Qdrant collection với payload (metadata): `{"maHang": "SP001", "tenChuan": "Xi Măng PC40", "dvt": "Bao"}`.

### Bước 2: Trigger Quá trình Nhận diện tự động
Trong quá trình fetch và đồng bộ của `syncTongHop()` từ hóa đơn mới về `ext_tonghop`:
1. Nếu item lấy ra có `tenGoc` được tìm thấy sẵn trong `ext_sanpham_dictionary`, gắn trực tiếp `tenChuan` (Cache logic).
2. Tới các item *chưa có trong database dictionary* -> Gom nhóm lại thành mảng Batch (Ví dụ: 20 tên mặt hàng) và đẩy sang API Agent của ta (ví dụ `/api/rag/standardize-item`).

### Bước 3: Thuật toán Retrieval & Sinh Text bằng RAG
Từng tên mặt hàng gốc chưa có chuẩn mực của batch trên sẽ chạy qua Pipeline AI:
1. **Tìm kiếm (Retrieval):** Convert "tên gốc" thành Vector -> Truy vấn Qdrant để lấy Top-3 các mặt hàng chuẩn trong quá khứ có ngữ nghĩa gần giống nhất với "tên gốc".
2. **Suy Luận (Generation):** Nạp qua Inference Model của Ollama với Prompt có cấu trúc nghiêm ngặt (ví dụ Llama-3-8b-instruct):
   >*Ngữ cảnh:* Bạn là chuyên gia Kế toán Vật tư. Bạn nhận được tên vật tư gốc ghi trên hóa đơn là `{tenGoc}` và ĐVT là `{dvt_goc}`.
   >*Dữ liệu hệ thống tham chiếu (Top 3):* 
   >- A. `{tenChuan1}` (Mã: `{ma1}`)
   >- B. `{tenChuan2}` (Mã: `{ma2}`)
   >- C. `{tenChuan3}` (Mã: `{ma3}`)
   >*Nhiệm vụ:* Hãy đưa ra kết luận và chỉ in ra chữ cái [A, B, C] nếu `{tenGoc}` thực sự chỉ cùng loại sản phẩm với A, B hoặc C. Nếu khác biệt (đây là sản phẩm hoàn toàn mới), xuất chữ cái: [NEW]. Không giải thích gì thêm.
3. Nếu Output là `[NEW]`: Ghi nhận `tenGoc` cũng chính là `tenChuan` (Ký hiệu mới hoàn toàn).

### Bước 4: Lưu Dictionary và Denormalize
- AI Agent sau khi đưa ra quyết định sẽ tạo ra record mới trong `ext_sanpham_dictionary`. Điều kiện cache sẽ giúp mọi hóa đơn về sau chứa `{tenGoc}` này bỏ qua bước RAG phức tạp.
- Áp dụng kết quả ngay vào đối tượng hóa đơn trong `ext_tonghop` với `tenHangChuan` phù hợp.
- Tính toán XNT ngay trên thuộc tính `tenHangChuan` mới từ Dictionary.

# 5. Lợi ích Đạt Được
- **Tăng Tự động hóa**: Xử lý 90% biến thể tên hóa đơn bị sai lệch, viết tắt mập mờ, loại bỏ bước đối soát thẻ kho bằng tay hàng tháng.
- **Tiền xử lý Khoản XNT**: Khi tất cả item được quy về dưới 1 Parent ID (`tenHangChuan`), thuật toán snapshot Daily (Báo Cáo Tồn cuối kỳ) sẽ tính Sum(Qty) đáng tin cậy. Biểu đồ, Lịch sử kho đều nhất quán và chuẩn xác hơn với thực tế.
- Khả năng Mở rộng (Scalable): Dictionary Master cho dữ liệu ngày một thông minh thông qua việc "tự điền", chi phí truy vấn RAG theo luồng Cache là tối thiểu do chỉ mất tài nguyên ở lần gặp sản phẩm lạ (mới xuất hiện lần đầu).
