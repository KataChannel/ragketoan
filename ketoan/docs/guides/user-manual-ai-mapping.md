---
title: "Hướng dẫn Sử dụng Tính năng: Duyệt Mặt Hàng (AI HITL)"
date: "2026-02-22"
description: "Tài liệu hướng dẫn chi tiết từng bước cách Kế toán tương tác với tính năng Duyệt Ánh xạ Tên Hàng Hóa bằng Trí Tuệ Nhân Tạo (Human-in-the-loop)."
---

# Hướng dẫn Sử dụng Giao diện "Duyệt Mặt Hàng (AI)"

Tính năng **Duyệt Mặt Hàng (AI)** - cơ chế Human-in-the-Loop (HITL) được thiết kế nhằm giúp Kế toán kiểm soát 100% việc chuẩn hóa thông tin xuất nhập tồn, nhưng đồng thời vẫn tận dụng sức mạnh của Trí tuệ nhân tạo (AI/LLM) để gợi ý và hỗ trợ thao tác tự động.

---

## 🚀 1. Làm thế nào để truy cập giao diện?

1. Đăng nhập vào trang chủ ứng dụng Ketoan: `http://localhost:3000` (hoặc thông qua tên miền ứng dụng).
2. Nhìn sang **Thanh điều hướng bên trái (Sidebar)**.
3. Tìm và click vào Menu có tên: **🤖 Duyệt Mặt Hàng (AI)** (nằm ngay dưới mục Chuẩn hóa).
4. Trang Dashboard Duyệt AI sẽ hiện ra với toàn bộ danh sách Hàng đợi.

---

## 📥 2. Khi nào một mặt hàng xuất hiện ở Hàng Đợi (Queue) này?

Bạn không cần thao tác thêm rắc rối nào, quy trình hoàn toàn tự động phía sau như sau:
* Mỗi khi bạn bấm **Đồng bộ Hóa Đơn**, hệ thống sẽ lấy dữ liệu từ Cơ quan Thuế.
* Tại đây, nếu hệ thống phát hiện **CÓ MỘT TÊN HÀNG GỐC HOÀN TOÀN MỚI** (chưa từng xuất hiện tại Công ty bạn, và chưa từng tồn tại trong Từ điển Chuẩn Hóa).
* Hệ thống ngầm gọi **AI Agent (Gemini/Ollama)** đánh giá.
* Nếu độ tự tin của AI **=> 95%**, hệ thống *âm thầm* ánh xạ thành công.
* Nếu độ tự tin **< 95%** (Rất thường gặp với các hàng hóa khó phân biệt như: Ống thép bọc nhựa, Thép hình... bị viết tắt thành "Thp bn", "thep hnh"...). AI lập tức đẩy mặt hàng đó vào Giao diện này để **chờ Kế Toán xét duyệt thủ công**.

---

## 💻 3. Các thành phần trên Giao diện Duyệt

Trên màn hình Dashboard, mỗi Thẻ (Card) tương ứng với một Tên Mặt Hàng bị treo. Gồm 3 khu vực chính:

### Khu vực Header Thẻ (Thông tin Gốc)
- **Tên Gốc:** Tên chính xác mà người viết hóa đơn đã điền.
- **ĐVT Gốc:** Đơn vị tính ghi trên tờ hóa đơn.
- **Biểu tượng Tự Tin:** Ví dụ hiển thị `87.5%`, đây là độ tự tin của phân tích hệ thống Vector và suy luận của LLM.

### Cột Trái: Đề xuất của AI (Màu Xanh Dương)
- **Gợi ý Mã/Tên Chuẩn:** Đây là lựa chọn mà AI tin rằng khả thi nhất lấy từ CSDL Tên Chuẩn của bạn.
- **Lập luận (Reasoning):** Một đoạn văn giải thích lý do vì sao AI lại chọn Mã/Tên Chuẩn này, hoặc tại sao nó thấy bối rối.
- Nút **[Duyệt Gợi Ý Của AI]**: Bấm vào đây nếu bạn đồng tình 100% với AI.

### Cột Phải: Override Thủ Công (Màu Xanh Ngọc / Đỏ)
Đây là khu vực "Kế Toán Làm Chủ". Nếu Cột Trái AI báo sai, bạn chỉnh tay ở đây:
- **Tên Chuẩn Hóa mới:** Bắt buộc nhập tên bạn muốn.
- **Mã Hàng Quốc Tế:** Gõ mã SP00XX (Nếu quản lý quy củ).
- **ĐVT Chuẩn:** Gõ chữ cái đầu viết Hoa (Ví dụ: "Chiếc", "Bộ").
- Nút **[Lưu Tùy Chỉnh]**: Xác nhận áp dụng Tên Chuẩn/Mã Hàng bạn tự nhập.
- Nút **[Bỏ Qua]**: Từ chối không muốn ánh xạ mặt hàng này vào sổ sách XNT chung lúc này.

---

## 🛠️ 4. Thao tác Từng Bước (Step-by-step)

### Kịch bản 1: AI Đề xuất đúng
*Ví dụ: Hóa đơn ghi "XM PCB40 bao", Cột AI đề xuất "Xi Măng PCB-40 (Bao)" và cho lý do.*
1. Bạn đọc Lập luận của AI, thấy hợp lý.
2. Bấm nút **[Duyệt Gợi Ý Của AI]** (nút màu Xanh Dương bên trái).
3. Góc phải màn hình báo *Duyệt thành công*. Toàn bộ hóa đơn cũ chứa tên kia lập tức được gán về "Xi Măng PCB-40". Thẻ (Card) biến mất khỏi hàng đợi. 
4. AI đã tự update từ điển, lần tới "XM PCB40 bao" về sẽ tự chạy vào chuẩn mà không hỏi lại.

### Kịch bản 2: AI Không có Đề xuất hoặc Đề xuất Sai (Hàng Mới Hoàn Toàn)
*Ví dụ: Công ty mua cái "Két sắt điện tử chống cháy", AI không tìm được đồ nào giống trong kho cũ -> tự tin 0% hoặc gợi ý lăng nhăng thành "Sắt cuộn".*
1. Bạn bỏ qua cột bên trái.
2. Tại cột bên phải (Nhập Mã/Tên Chuẩn mới), bạn nhập tự động tên muốn xuất hiện trên Sổ Kho XNT: `Két sắt điện tử (Cái)`.
3. Nhập mã hàng mới: `TSCD_001`.
4. Bấm nút **[Lưu Tùy Chỉnh]** (nút màu Xanh Lá ở bên phải).
5. Xong. Danh mục sản phẩm công ty có thêm Vât tư mới, lần sau Hóa đơn nào mua "Két sắt điện tử" cũng sẽ ánh xạ chuẩn theo format của bạn.
 
### Kịch bản 3: Không muốn xử lý (Mặt hàng chi phí, không nhập xuất Tồn)
*Ví dụ: "Chi phí tiếp khách", "Dịch vụ luật sư"*
1. Bạn không muốn xuất nhập tồn những mặt hàng này.
2. Bấm nút **[Bỏ Qua]** (Màu đỏ bên phải).
3. Item được dọn dẹp khỏi màn hình (vào thùng rác), không đưa vào từ điển hàng hóa.

---
*Lưu ý: Bạn có thể nhấn nút [Làm mới] ở góc trên cùng bên phải để Load lại dữ liệu Hàng Đợi nếu vừa đồng bộ hóa đơn ở trang khác mà chưa thấy hiện.*
