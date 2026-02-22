# Đánh giá và so sánh hai trang `/training` và `/ai-mapping`

Dựa trên việc kiểm tra mã nguồn của `app/training/page.tsx` và `app/ai-mapping/page.tsx`, hai trang này **KHÔNG GIỐNG NHAU**, tuy có cùng một mục tiêu chung là chuẩn hóa dữ liệu mặt hàng, nhưng chúng phục vụ cho hai quy trình/tình huống sử dụng (use-cases) hoàn toàn khác nhau.

## 1. Mục đích và Quy trình (Workflow)

### Trang `/ai-mapping` (Duyệt Mặt Hàng - AI HITL)
- **Bản chất:** Là một hàng đợi (Queue) dạng Human-in-the-Loop (HITL) để duyệt từng item một.
- **Mục đích:** Xử lý các mặt hàng "mới" vừa xuất hiện trên hóa đơn mà hệ thống AI không đủ tự tin (độ nhận diện thấp) để tự động chuẩn hóa.
- **Cách hoạt động:** 
  - Hiển thị danh sách các mặt hàng dưới dạng các thẻ (Cards) độc lập.
  - Mỗi thẻ cho thấy AI đang đề xuất tên chuẩn hóa là gì và lý do tại sao, kèm theo độ tự tin (Confidence %).
  - Người dùng có thể: **Duyệt (Approve)** đề xuất của AI, **Bỏ qua (Reject)**, hoặc **Ghi đè thủ công (Manual Override)** bằng cách nhập mã, tên chuẩn và đơn vị tính mới hoàn toàn.
  - Có tính năng "Quét Lịch Sử" để đẩy toàn bộ dữ liệu chưa map từ quá khứ vào agent AI để xử lý.

### Trang `/training` (Huấn luyện & Chuẩn hóa mặt hàng)
- **Bản chất:** Là một bảng dữ liệu (Data Grid/Table) để quản lý, gộp (group) và chuẩn hóa hàng loạt (Bulk actions).
- **Mục đích:** Gom nhóm nhiều biến thể của tên mặt hàng (các tên có đánh vần khác nhau, thiếu chữ...) về cùng một Tên chuẩn (Standard Name) duy nhất. 
- **Cách hoạt động:**
  - Hiển thị bảng toàn bộ các mặt hàng gốc, số lần xuất hiện (frequency), và trạng thái đã map hay chưa.
  - Người dùng có thể tích chọn nhiều mặt hàng gốc cùng lúc (bằng Checkbox) và **Cập nhật tương đồng** để gán cho chúng chung một Tên chuẩn, Mã hàng, và Nhóm hàng.
  - Có tính năng "Phân tích tương đồng thông minh" (AI Auto Training) gợi ý nhóm các mặt hàng trùng lặp hoặc viết sai chính tả lại với nhau.

## 2. So sánh chi tiết các tính năng

| Tính năng / Đặc điểm | `/ai-mapping` (AI HITL) | `/training` (Chuẩn hóa) |
| :--- | :--- | :--- |
| **Giao diện chính** | Dạng thẻ (Cards / Queue) duyệt từng cái | Dạng bảng (Table) xem tổng quan |
| **API Backend** | `/api/ai-mapping-queue` | `/api/training` |
| **Luồng xử lý** | Từng mặt hàng lẻ (1 vs 1) do AI đẩy lên | Chọn nhiều mặt hàng gốc gộp thành 1 chuẩn (N vs 1) |
| **Giải quyết Vấn đề** | AI không chắc chắn nên cần con người xác nhận | Con người chủ động dọn dẹp data, gộp các tên gọi khác nhau |
| **Độ bao phủ** | Chỉ hiển thị các mặt hàng trong hàng đợi (PENDING) | Hiển thị toàn bộ từ điển mặt hàng (có filter) |
| **AI Suggestion** | Đề xuất ánh xạ cho **1 mặt hàng** dựa trên ngữ nghĩa | Đề xuất gom **1 nhóm nhiều mặt hàng** lại với nhau do có cùng gốc từ |

## Tổng kết

Hai trang này **bổ trợ cho nhau** chứ không phải là bản sao của nhau:
1. Thông qua `/training`, bạn định nghĩa từ điển và gộp các biến thể lịch sử về dạng chuẩn.
2. Qua thời gian, khi có hóa đơn mới về, nếu AI gặp mặt hàng lạ không nằm trong tập dữ liệu quen thuộc, nó sẽ đẩy vào `/ai-mapping` để bạn ra quyết định (HITL).

**Do đó, cả 2 trang đều cần thiết và phục vụ 2 nghiệp vụ độc lập trong luồng vận hành của Agent AI.**
