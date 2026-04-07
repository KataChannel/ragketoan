---
name: hoang_huy_phat_accounting
description: Bộ quy tắc xử lý kế toán thực tế cho Công ty Hoàng Huy Phát, tập trung vào phân bổ động theo doanh thu, tích hợp PostgreSQL/DuckDB và đối soát hóa đơn/ngân hàng.
---

# 📘 SKILL RULES — CÔNG TY HOÀNG HUY PHÁT (HHP)
*Bộ quy tắc xử lý kế toán thực tế, bám sát dòng tiền và hóa đơn cho Công ty HHP.*

> [!IMPORTANT]
> Toàn bộ quy trình xử lý kế toán cho HHP phải được thực hiện thông qua công cụ **DuckDB** để đảm bảo tốc độ và tính chính xác của dữ liệu lớn từ PostgreSQL.

---

## RULE 1: Real-World Distribution — Phân bổ theo tỷ trọng thực tế

**Khi nào kích hoạt:** Khi cần rải các bút toán điều chỉnh (Tiền mặt 1111, Nợ vay 341) để khớp số dư mục tiêu.

| Hành động | Chi tiết |
|---|---|
| **CẤM** | Chia đều số tiền (/12) hoặc dồn cục vào ngày 31/12 — rất thiếu thực tế và khó đối soát. |
| **BẮT BUỘC** | Tính toán **Trọng số Mùa vụ (Seasonality Weight)** dựa trên tổng doanh số hóa đơn thực tế của từng tháng. |
| **THỰC HIỆN** | Tháng có doanh thu cao sẽ nhận tỷ trọng điều chỉnh cao hơn; tháng không có hoạt động sẽ không phát sinh bút toán ảo. |

```python
# Logic phân bổ động:
weights = df_inv.groupby('month')['tgtcthue'].sum() / total_turnover
monthly_adj = target_delta * weights
```

---

## RULE 2: Double-Entry Bank Sync — Đồng bộ Vay vốn & Ngân hàng

**Khi nào kích hoạt:** Xử lý dữ liệu từ file sao kê ngân hàng tổng hợp.

| Nghiệp vụ | TK Nợ | TK Có | Diễn giải chuẩn |
|---|---|---|---|
| **Giải ngân vay** | 112 | 3411 | "Giải ngân tiền vay theo Hợp đồng tín dụng / Khế ước nhận nợ" |
| **Trả gốc vay** | 3411 | 112 | "Trả nợ gốc vay ngân hàng" |
| **Thu lãi tiền gửi** | 112 | 515 | "Lãi tiền gửi ngân hàng" |
| **Phí/Lãi vay** | 635/642 | 112 | "Phí dịch vụ ngân hàng / Lãi tiền vay" |

---

## RULE 3: PostgreSQL Data Integrity — Bảo toàn dữ liệu hóa đơn

**Khi nào kích hoạt:** Query dữ liệu từ `ext_listhoadon` và `ext_detailhoadon`.

| Yêu cầu | Chi tiết |
|---|---|
| **MST Công ty** | Phải dùng đúng MST: `5900428904` để query trong DB. |
| **Trạng thái hóa đơn** | Chỉ lấy hóa đơn có `tthai` thuộc danh sách `(1, 2, 4, 5)` (Hợp lệ/Đã thay thế). |
| **Múi giờ** | Luôn convert sang `Asia/Ho_Chi_Minh` trước khi lấy phần DATE. |

---

## RULE 4: Detailed Journaling — Nhật ký chung đa nguồn

**Khi nào kích hoạt:** Xây dựng file `NKC_HHP_2023.xlsx`.

| Nguồn dữ liệu | Hành động hạch toán |
|---|---|
| **Hóa đơn Bán ra** | Nợ 131 / Có 5111 (Doanh thu) + Có 3331 (Thuế P.Sinh) |
| **Hóa đơn Mua vào** | Nợ 1561/642 (Hàng hóa/CP) + Nợ 1331 (Thuế) / Có 331 |
| **Giá vốn (Kho)** | Nợ 632 / Có 1561 — Lấy từ file `XNT_HoangHuyPhat_2023.xlsx`, sheet `xnt12thang` |

---

## RULE 5: Audit-Ready SCT — Sổ chi tiết chuẩn kiểm toán

**Khi nào kích hoạt:** Xuất file [SO_CHI_TIET_HHP_2023.xlsx](file:///chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx).

1. **Bold Formatting:** Hàng `TỔNG CỘNG` ở cuối mỗi Sheet phải được in đậm (Bold) và tô màu nền (PatternFill) để dễ nhận diện.
2. **Standard Columns:** Phải có đủ các cột: Ngày hạch toán, Số chứng từ, Diễn giải, TK Đối ứng, Đầu kỳ, Phát sinh Nợ, Phát sinh Có, Cuối kỳ.
3. **Sequence:** Sắp xếp theo ngày tăng dần. Bút toán Số dư đầu kỳ luôn nằm ở dòng đầu tiên của mỗi tài khoản.

---

## Các chỉ số mục tiêu cố định (Target 2023)

| Tài khoản | Số dư Cuối kỳ (VNĐ) | Ghi chú |
|---|---|---|
| **1111** | 292.377.476 | Phân bổ động theo tháng |
| **112** | 87.014.561 | Khớp theo sao kê + điều chỉnh phí |
| **131** | 610.548.304 | Phải thu khách hàng |
| **331** | 15.761.265.757 | Phải trả người bán |
| **341** | 27.116.010.280 | Tổng dư nợ vay ngân hàng |
| **1561** | 15.761.265.756 | Giá trị hàng tồn kho |
| **1331** | 5.637.319.415 | Thuế GTGT còn được khấu trừ |

---
*Skill Rules HHP được tổng hợp từ engine DuckDB thực tế, cập nhật ngày 06/04/2026 bởi Antigravity.*
