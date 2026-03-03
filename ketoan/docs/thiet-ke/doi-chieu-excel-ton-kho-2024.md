# Báo cáo Đối chiếu Tồn kho Thực tế (Excel 2024) vs Dữ liệu Hóa đơn (2023)
**Công ty:** CÔNG TY TNHH HOÀNG HUY PHÁT (MST: 5900428904)
**Tài liệu đối chiếu:** `Tong_hop_ton_kho T1 2024.xlsx` (Chốt số thực tế đầu năm 2024)

---

## 1. Kết quả Phân tích & Đối chiếu
Hệ thống AI đã thực hiện quét toàn bộ **294 mặt hàng** có số dư thực tế tại ngày 01/01/2024 từ file Excel bạn cung cấp và đối soát với dòng chảy hóa đơn (Mua vào/Bán ra) của năm 2023.

### 🔴 Phát hiện mâu thuẫn trọng yếu:
Dữ liệu hóa đơn năm 2023 hoàn toàn không phản ánh đủ nguồn gốc hàng hóa. Rất nhiều mặt hàng có doanh số bán ra hàng chục tỷ đồng nhưng không có hóa đơn mua vào trong suốt cả năm 2023.

**Bảng đối soát top các mặt hàng chênh lệch lớn nhất:**

| Tên hàng hóa | Mua vào 2023 | Bán ra 2023 | Tồn thực tế (01/01/2024) | **Cần Bù Tồn Đầu (01/01/2023)** |
| :--- | :---: | :---: | :---: | :---: |
| THÙNG 48 HỘP THỨC UỐNG MẠCH NHA NESVITA | 0 | 19.799 | 1.815 | **21.614** |
| THÙNG 48 HỘP SỮA MILO ACTIVE GO 115ML | 0 | 17.820 | 2.126 | **19.946** |
| SN NƯỚC YẾN SANNEST LON T (30LON/THÙNG) | 0 | 14.260 | 4.391 | **18.651** |
| BEL PHÔ MAI CBC 8M | 0 | 103.893 | 1.337 | **105.230** |
| CLM SA TẾ TÔM 450G | 0 | 95.370 | 9.318 | **104.688** |

---

## 2. Kết Luận Logic
Để số liệu chốt kho tại ngày 01/01/2024 khớp đúng với File Excel thực tế của doanh nghiệp, chúng ta **BẮT BUỘC** phải thừa nhận và ghi nhận số dư tồn kho tại ngày **01/01/2023** (Tồn từ năm 2022 đưa sang).

- **Tổng số mã hàng cần điều chỉnh:** 114 mã hàng.
- **Tổng số lượng cần "Bơm" vào đầu kỳ 2023:** Khoảng **1.144.356 đơn vị sản phẩm**.

Nếu không ghi nhận số tồn đầu kỳ này:
1. Giá vốn (COGS) năm 2023 sẽ bị tính sai (do hàng không có giá đầu vào).
2. Sổ chi tiết vật tư sẽ bị Âm nặng (như đã báo cáo trước đó).

---

## 3. Đề xuất Thực hiện "Điều chỉnh 1 chạm"
Hệ thống Kế toán AI đã sẵn sàng Script để tự động hóa việc này. Nếu bạn đồng ý, mình sẽ thực hiện:
1. **Tạo Phiếu Nhập Tồn Đầu Kỳ:** Tự động tạo các bản ghi vào bảng tồn kho tại ngày `01/01/2023` với số lượng bằng đúng mức chênh lệch tính toán được ở trên.
2. **Áp giá vốn ước tính:** Sử dụng giá vốn trung bình của các kỳ gần nhất hoặc giá bán trừ lùi % lợi nhuận định mức để đảm bảo không bị âm giá trị tồn.
3. **Trigger recalculate:** Chạy lại luồng tính toán XNT toàn năm 2023 để ra bộ báo cáo sạch.

**Bạn có đồng ý cho mình tiến hành "Bơm" số liệu tồn đầu kỳ này vào Công ty Hoàng Huy Phát không ạ?**
