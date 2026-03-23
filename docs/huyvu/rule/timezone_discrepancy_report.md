# Báo cáo Chênh lệch Số lượng Hóa đơn do Múi giờ (Timezone)

## 1. Tổng quan vấn đề
Trong quá trình rà soát dữ liệu hóa đơn của **Công ty TNHH Huy Vũ** trong năm 2023, hệ thống ghi nhận sự chênh lệch về số lượng hóa đơn hàng tháng giữa kết quả truy vấn thô (Raw Query) và báo cáo kế toán thực tế.

| Tháng | Số lượng (Raw DB - UTC) | Số lượng (Báo cáo thực tế - ICT) | Chênh lệch |
| :--- | :---: | :---: | :---: |
| **01/2023** | 56 | **52** | -4 |
| **02/2023** | 130 | **128** | -2 |

---

## 2. Nguyên nhân kỹ thuật
Nguyên nhân gốc rễ là do sự khác biệt giữa múi giờ quốc tế (**UTC**) và múi giờ Việt Nam (**GMT+7 / Asia/Ho_Chi_Minh**).

Dữ liệu hóa đơn gốc thường được lưu trữ dưới dạng timestamp UTC. Do Việt Nam đi trước UTC **7 tiếng**, các hóa đơn được lập vào khoảng thời gian cuối ngày (từ 17:00 UTC trở đi) sẽ bị nhảy sang ngày hôm sau khi tính theo giờ Việt Nam.

### Chi tiết các điểm cắt (Cut-off points):
*   **Điểm cắt Tháng 1 -> Tháng 2:** 
    *   Có **4 hóa đơn** được lập vào lúc `17:00:00` ngày **31/01/2023 (UTC)**.
    *   Trong UTC: Tính vào Tháng 1.
    *   Trong ICT (Việt Nam): Tính vào **00:00:00 ngày 01/02/2023** (Tháng 2).
    *   => Tháng 1 giảm 4, Tháng 2 tăng 4.

*   **Điểm cắt Tháng 2 -> Tháng 3:**
    *   Có **6 hóa đơn** được lập vào lúc `17:00:00` ngày **28/02/2023 (UTC)**.
    *   Trong UTC: Tính vào Tháng 2.
    *   Trong ICT (Việt Nam): Tính vào **00:00:00 ngày 01/03/2023** (Tháng 3).
    *   => Tháng 2 giảm 6.

### Công thức tính toán khớp (Reconciliation):
*   **Tháng 1 thực tế:** 56 (UTC) - 4 (chuyển sang T2) = **52**.
*   **Tháng 2 thực tế:** 130 (UTC) + 4 (nhận từ T1) - 6 (chuyển sang T3) = **128**.

---

## 3. Giải pháp & Quy tắc (Rule)
Để đảm bảo dữ liệu báo cáo luôn khớp với chứng từ kế toán thực tế tại Việt Nam, tất cả các truy vấn thống kê theo thời gian phải thực hiện chuyển đổi múi giờ trực tiếp trong SQL.

**Câu lệnh SQL chuẩn để thống kê tháng:**
```sql
SELECT 
    to_char(tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as month_ict,
    count(*)
FROM ext_listhoadon
WHERE nbmst = '5900363291'
GROUP BY month_ict;
```

> [!IMPORTANT]
> **Quy tắc bắt buộc:** Tuyệt đối không sử dụng hàm `to_char(tdlap, 'YYYY-MM')` trực tiếp mà không khai báo Timezone, vì kết quả sẽ bị sai lệch vào các ngày cuối tháng.

---
*Báo cáo được thực hiện bởi Antigravity AI Agent - Hệ thống Rag Kế toán.*
