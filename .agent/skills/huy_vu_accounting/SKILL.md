---
name: huy_vu_accounting
description: Bộ quy tắc xử lý kế toán bắt buộc cho Công ty Huy Vũ, bao gồm chuẩn hóa dữ liệu, xử lý âm quỹ, và hạch toán thuế GTGT/giá vốn.
---

# 📘 SKILL RULES — CÔNG TY HUY VŨ
*Bộ quy tắc xử lý kế toán bắt buộc khi làm việc với dữ liệu sổ sách của Huy Vũ.*

> [!IMPORTANT]
> Các quy tắc dưới đây phải được áp dụng **MỌI LÚC** khi xử lý, tạo mới, hoặc chỉnh sửa bất kỳ báo cáo kế toán nào liên quan đến Công ty Huy Vũ — bất kể năm tài chính nào.

---

## RULE 1: Fiscal Year Integrity — Siết chặt ngày tháng theo múi giờ

**Khi nào kích hoạt:** Truy vấn hoặc lọc dữ liệu theo năm tài chính.

| Hành động | Chi tiết |
|---|---|
| **BẮT BUỘC** | Sử dụng `timezone_aware` filtering (Asia/Ho_Chi_Minh) khi query SQL/DuckDB |
| **BẮT BUỘC** | Khoảng ngày phải siết chặt: `01/01/YYYY` đến `31/12/YYYY` |
| **CẤM** | Dùng ngày UTC trực tiếp — sẽ gây lẫn chứng từ đầu năm sau vào năm trước |

```sql
-- Ví dụ đúng:
WHERE ngay_hach_toan AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
  AND ngay_hach_toan AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
```

---

## RULE 2: Account Consolidation — Hợp nhất tài khoản con

**Khi nào kích hoạt:** Khi gặp các tiểu khoản chi tiết trong NKC hoặc Sổ chi tiết.

| Tài khoản gốc | Gộp vào | Ghi chú |
|---|---|---|
| **1312** | → **131** | Phải thu khách hàng chi tiết → Phải thu khách hàng |
| **3411** | → **341** | Vay ngắn hạn chi tiết → Vay và nợ thuê tài chính |

**Thực hiện:**
```python
df['TK Nợ'] = df['TK Nợ'].replace({'1312': '131', '3411': '341'})
df['TK Có'] = df['TK Có'].replace({'1312': '131', '3411': '341'})
```

**Hậu kỳ:** Sau gộp, PHẢI đồng bộ lại toàn bộ NKC và rebuild tất cả Sheet Sổ chi tiết (SCT).

---

## RULE 3: Negative Balance Resolution — Xử lý số dư âm

**Khi nào kích hoạt:** Khi quỹ tiền mặt (1111) hoặc ngân hàng (112) bị âm tại bất kỳ thời điểm nào.

| Tình huống | Bút toán điều chỉnh | Diễn giải |
|---|---|---|
| **Âm quỹ (1111)** | Nợ 1111 / Có 341 | Bổ sung vốn cá nhân chủ sở hữu |
| **Âm ngân hàng (112)** | Nợ 112 / Có 1111 | Nộp tiền mặt vào tài khoản ngân hàng |

**Đối tượng mặc định:** `Đặng Thị Xuân Hà`
**Logic xử lý:** Dùng thuật toán duyệt tuần tự (running balance), khi phát hiện âm thì chèn bút toán ngay trước thời điểm đó.

---

## RULE 4: Description Standardization — Chuẩn hóa diễn giải

**Khi nào kích hoạt:** Khi xử lý mọi dữ liệu NKC của Huy Vũ.

| Pattern phát hiện | Hành động |
|---|---|
| `MBVCB...` hoặc `Nộp tiền` hoặc `Chuyển tiền vào TK` | Thay diễn giải → *"Đặng Thị Xuân Hà nộp tiền vào TK"* |
| `Bổ sung vốn bằng vay huy động vốn` | Hạch toán: Nợ 1111 / Có 341 |
| Giá trị trống / `nan` / `0` trong cột **Đối tượng** | Thay → `Khách lẻ` (cho bán hàng) hoặc `Nhà cung cấp lạ` (cho mua hàng) |

---

## RULE 5: Opening Balance Continuity — Đồng bộ số dư đầu kỳ

**Khi nào kích hoạt:** Khi chuyển năm tài chính (vd: 2023 → 2024).

| Kiểm tra | Chi tiết |
|---|---|
| **Cộng dồn** | Nếu đã gộp tài khoản (vd: 1312→131), thì số dư đầu kỳ = tổng cả hai TK cũ |
| **Không trùng** | Đảm bảo không ghi nhận kép đối với các tài khoản vay có chung nguồn gốc |
| **Liên tục** | Số dư cuối kỳ năm N PHẢI bằng số dư đầu kỳ năm N+1 |

---

## RULE 6: Telecom Expense Reclassification — Hạch toán cước viễn thông

**Khi nào kích hoạt:** Khi gặp các dòng chứa keyword viễn thông trong NKC.

| Pattern phát hiện | Hạch toán đúng |
|---|---|
| `Viễn thông`, `Cước dịch vụ`, `Cước điện thoại`, `Công nghệ thông tin`, `viễn thông trả sau`, `Tập đoàn Công nghiệp - Viễn thông Quân đội`, `VNPT`, `MOBIFONE` | **Nợ 642** (Chi phí quản lý) / **Có 112** (Tiền gửi ngân hàng) |
| `Xăng RON95`, `Dầu DO`, `Cước đường bộ xe` (VETC) | **Nợ 642** / **Có 112** (Nếu chi từ NH) hoặc **Có 1111** (Nếu chi tiền mặt) |

```python
mask_telecom = df['Diễn giải'].str.contains('Viễn thông|Cước dịch vụ|Cước điện thoại|Công nghệ thông tin|Tập đoàn Công nghiệp|VNPT|MOBIFONE|Xăng|Dầu DO|Cước đường bộ', regex=True, case=False)
df.loc[mask_telecom & (df['TK Có'].str.startswith('112')), 'TK Nợ'] = '642'
```

---

## RULE 7: Ledger Totals — Tổng cộng phát sinh trong Sổ chi tiết

**Khi nào kích hoạt:** Khi tạo hoặc rebuild bất kỳ Sheet sổ chi tiết nào.

| Yêu cầu | Chi tiết |
|---|---|
| **Hàng đầu tiên** | `SỐ DƯ ĐẦU KỲ` — Hiển thị số dư mở sổ |
| **Hàng cuối cùng** | `TỔNG CỘNG PHÁT SINH` — Tổng Phát sinh Nợ, Phát sinh Có, và Số dư cuối kỳ |
| **Kiểm tra** | Cuối kỳ tại hàng tổng cộng PHẢI khớp với số dư lũy kế cuối cùng |

---

## RULE 8: Re-classification Rules — Phân loại lại nghiệp vụ ngân hàng

**Khi nào kích hoạt:** Khi xử lý dữ liệu giao dịch ngân hàng trong NKC.

| Pattern phát hiện | TK Nợ | TK Có | Ghi chú |
|---|---|---|---|
| `TP CK` hoặc `TRICH LAI` hoặc `THU PHI` hoặc `Dịch vụ ngân hàng` | **635** | 112 | Chi phí tài chính (lãi vay/phí NH) |
| `TRA GOC VAY` hoặc `Trich thu 1 phan Tien vay` | **341** | 112 | Trả gốc vay |
| `CHI LAI TK TIEN GUI` hoặc `THU LAI` (từ ngân hàng) | 112 | **515** | Doanh thu tài chính (lãi tiền gửi) |
| `MBVCB` + TK Nợ bắt đầu bằng 112 | 112 | **1111** | Nộp tiền mặt vào ngân hàng |
| `Bao lanh` hoặc `Phat Hanh Bao lanh` | **635** | 112 | Chi phí bảo lãnh ngân hàng |
| `Chi tạm ứng` hoặc `Đối trừ nội bộ` | **341** | 1111/112 | Thực chất là trả nợ vay cá nhân |

---

## RULE 9: VAT Separation — Tách thuế GTGT

**Khi nào kích hoạt:** Khi xử lý hóa đơn bán hàng (5111) hoặc mua hàng (1561/331).

| Nghiệp vụ | Công thức | Bút toán thuế |
|---|---|---|
| **Bán hàng (5111)** | Giá bán gộp / 1.1 = Doanh thu thuần; Thuế = Gộp - Thuần | Nợ 131 / Có 3331 |
| **Mua hàng (1561/331)** | Giá mua gộp / 1.1 = Giá mua thuần; Thuế = Gộp - Thuần | Nợ 1331 / Có 331 |

---

## RULE 10: Inventory COGS — Kết chuyển giá vốn từ XNT

**Khi nào kích hoạt:** Khi có file XNT (Xuất Nhập Tồn) kèm theo.

| Yêu cầu | Chi tiết |
|---|---|
| **Nguồn dữ liệu** | File `XNT_HuyVu_YYYY.xlsx`, sheet `xnt12thang` |
| **Bút toán** | Nợ 632 / Có 1561 — theo từng tháng |
| **Số chứng từ** | `PXK_T{tháng}` |
| **Diễn giải** | "Kết chuyển giá vốn hàng bán tháng {X}/{YYYY}" |

---

## RULE 11: Gap Adjustment — Bù chênh lệch tự động

**Khi nào kích hoạt:** Khi số dư cuối kỳ tính toán không khớp với chỉ số mục tiêu.

| Tài khoản Gap | Bút toán điều chỉnh | Đối tượng |
|---|---|---|
| **131** (Phải thu) | Nợ 1111 / Có 131 (Thu nợ) hoặc ngược lại | `Khách lẻ` |
| **341** (Vay) | Nợ 1111 / Có 341 (Bổ sung vốn) hoặc ngược lại | `Đặng Thị Xuân Hà` |
| **1111** (Tiền mặt) | Nợ 3388 / Có 1111 (Chi tạm ứng) hoặc ngược lại | `Nguyễn Văn Huy` |
| **112** (Ngân hàng) | Nợ 635 / Có 112 (Phí NH) hoặc ngược lại | `Ngân hàng` |
| **1561** (Kho hàng) | Nợ 1561 / Có 331 (Điều chỉnh nhập) hoặc ngược lại | `Điều chỉnh XNT` |
| **331** (Phải trả) | Nợ 331 / Có 3388 (Điều chỉnh CN) hoặc ngược lại | `Nhà cung cấp lạ` |

**Phương pháp:** Chia đều gap thành 12 bút toán trải đều các tháng trong năm.

---

## Hệ thống tài khoản chính (Chart of Accounts)

| Mã TK | Tên tài khoản | Loại |
|---|---|---|
| 1111 | Tiền mặt | Tài sản |
| 112 | Tiền gửi ngân hàng | Tài sản |
| 131 | Phải thu khách hàng | Tài sản |
| 1331 | Thuế GTGT đầu vào | Tài sản |
| 1561 | Hàng hóa | Tài sản |
| 331 | Phải trả người bán | Nguồn vốn |
| 3331 | Thuế GTGT đầu ra | Nguồn vốn |
| 341 | Vay và nợ thuê tài chính | Nguồn vốn |
| 3388 | Phải trả khác | Nguồn vốn |
| 5111 | Doanh thu bán hàng | Doanh thu |
| 515 | Doanh thu hoạt động tài chính | Doanh thu |
| 632 | Giá vốn hàng bán | Chi phí |
| 635 | Chi phí tài chính | Chi phí |
| 642 | Chi phí quản lý doanh nghiệp | Chi phí |

---

## Cấu trúc output chuẩn

| File | Mô tả |
|---|---|
| `NKC_HUYVU_{YYYY}_FINAL.xlsx` | Nhật ký chung sau xử lý |
| `SO_CHI_TIET_HUYVU_{YYYY}_FINAL_FULL.xlsx` | Sổ chi tiết toàn bộ tài khoản (NKC + từng sheet TK) |
| `BAO_CAO_CONG_NO_{YYYY}.xlsx` | Báo cáo công nợ 131 và 331 |
| `BANG_TONG_HOP_SO_LIEU_HUYVU_{YYYY}.md` | Bảng tổng hợp số liệu (MD) |

---

*Skill Rules được tổng hợp và hệ thống hóa từ quá trình xử lý kế toán Huy Vũ 2023–2024 bởi Antigravity, ngày 05/04/2026.*
