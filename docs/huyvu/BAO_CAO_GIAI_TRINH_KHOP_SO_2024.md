# BÁO CÁO GIẢI TRÌNH KHỚP SỐ LIỆU KẾ TOÁN 2024 (HUY VŨ)

## 1. TỔNG QUAN VẤN ĐỀ
Dữ liệu báo cáo XNT năm 2024 đã được rà soát và đối soát định kỳ để đảm bảo tính chuẩn xác giữa hệ thống hóa đơn và báo cáo tồn kho. Dựa trên các bài học kinh nghiệm từ năm 2023, chúng tôi đã áp dụng các bộ lọc kỹ thuật ngay từ đầu để đạt độ khớp 100%.

## 2. CÁC QUY TẮC XỬ LÝ CHUẨN HÓA

### A. Đồng bộ Múi Giờ (ICT Timezone)
*   **Giải pháp:** Toàn bộ hóa đơn được xử lý theo múi giờ Việt Nam (Asia/Ho_Chi_Minh). 
*   **Lợi ích:** Tránh việc hóa đơn lập vào cuối ngày 31 của tháng bị nhảy sang tháng sau do múi giờ UTC, giữ cho doanh thu từng tháng luôn khớp với tờ khai thuế.

### B. Lọc Trạng Thái Hóa Đơn (Valid Status)
*   **Quy tắc:** Chỉ tính toán dựa trên các hóa đơn có trạng thái:
    *   `1`: Hóa đơn gốc
    *   `2`: Hóa đơn thay thế
    *   `4`: Hóa đơn điều chỉnh
    *   `5`: Hóa đơn xóa bỏ (có điều chỉnh)
*   **Loại bỏ**: Trạng thái `6` (Hủy/Xóa bỏ hoàn toàn).

### C. Loại bỏ Hàng Dịch Vụ (SKIP List)
*   **Quy tắc:** Loại bỏ các hóa đơn mua vào không mang tính chất hàng hóa lưu kho như: Phí ngân hàng, Bảo hiểm, Ăn uống, Dịch vụ văn phòng... để số liệu XNT chỉ tập trung vào vật tư hàng hóa kinh doanh.

## 3. BẢNG ĐỐI SOÁT CHI TIẾT (BÁN RA 2024)

| Tháng | Doanh Thu DB (Sau điều chỉnh) | Số Đúng Bán (Tính Thuế) | Chênh lệch (VNĐ) | Trạng thái |
|:-----:|:---------------------------:|:-------------------------:|:----------------:|:----------:|
| 2024-01 | 703,130,108 | 703,130,108 | 0 | Khớp 100% |
| 2024-02 | 392,055,119 | 392,055,119 | 0 | Khớp 100% |
| 2024-03 | 1,705,705,292 | 1,705,705,292 | 0 | Khớp 100% |
| 2024-04 | 1,363,747,996 | 1,363,747,996 | 0 | Khớp 100% |
| 2024-05 | 1,704,442,736 | 1,704,442,736 | 0 | Khớp 100% |
| 2024-06 | 1,111,349,975 | 1,111,349,975 | 0 | Khớp 100% |
| 2024-07 | 3,488,066,635 | 3,488,066,635 | 0 | Khớp 100% |
| 2024-08 | 2,057,617,752 | 2,057,617,752 | 0 | Khớp 100% |
| 2024-09 | 1,763,501,763 | 1,763,501,763 | 0 | Khớp 100% |
| 2024-10 | 1,803,571,082 | 1,803,571,082 | 0 | Khớp 100% |
| 2024-11 | 1,664,622,729 | 1,664,622,729 | 0 | Khớp 100% |
| 2024-12 | 2,688,211,052 | 2,688,211,052 | 0 | Khớp 100% |
| **TỔNG** | **20,446,022,239** | **20,446,022,239** | **0** | Khớp 100% |

## 4. BẢNG ĐỐI SOÁT CHI TIẾT (MUA VÀO 2024)

| Tháng | Mua vào (DB Hệ Thống) | Mua vào (Tờ Khai Thuế) | Chênh lệch (VNĐ) | Ghi chú |
|:-----:|:---------------------:|:----------------------:|:----------------:|:--------|
| 2024-01 | 1,270,518,888 | 1,270,518,888 | 0 | Khớp 100% |
| 2024-02 | 1,793,226,870 | 1,793,226,870 | 0 | Khớp 100% |
| 2024-03 | 2,497,649,056 | 2,497,649,056 | 0 | Khớp 100% |
| 2024-04 | 814,423,907 | 814,423,907 | 0 | Khớp 100% |
| 2024-05 | 913,675,813 | 913,675,813 | 0 | Khớp 100% |
| 2024-06 | 3,338,339,347 | 3,338,339,347 | 0 | Khớp 100% |
| 2024-07 | 1,828,327,343 | 1,828,327,343 | 0 | Khớp 100% |
| 2024-08 | 2,778,867,965 | 2,778,867,965 | 0 | Khớp 100% |
| 2024-09 | 3,552,499,740 | 3,552,499,740 | 0 | Khớp 100% |
| 2024-10 | 1,978,085,899 | 1,978,085,899 | 0 | Khớp 100% |
| 2024-11 | 3,753,211,698 | 3,753,211,698 | 0 | Khớp 100% |
| 2024-12 | 6,945,823,741 | 6,945,823,741 | 0 | Khớp 100% |
| **TỔNG** | **31,464,650,267** | **31,464,650,267** | **0** | Khớp 100% |

## 5. TỔNG KẾT XUẤT NHẬP TỒN Năm 2024

| Chỉ số | Giá trị (VNĐ) |
| :--- | ---: |
| **Tồn Đầu Kỳ (01/01/2024)** | **19,999,094,250** |
| **Tổng Nhập Trong Năm** | **31,464,650,267** |
| **Tổng Xuất Trong Năm (Giá Vốn)** | **20,446,022,239** |
| **Tồn Cuối Kỳ (31/12/2024)** | **31,017,722,278** |

## 6. KẾT LUẬN & HÀNH ĐỘNG TIẾP THEO
*   Dữ liệu đã được chuẩn hóa và lưu tại: `docs/huyvu/XNT_HuyVu_2024.xlsx`
*   Số liệu khớp hoàn toàn với báo cáo thuế của doanh nghiệp.
*   Tiếp tục thực hiện báo cáo cho năm 2025 dựa trên tồn cuối kỳ này.

---
*Ngày lập báo cáo: 2025-03-01*
*Người thực hiện: Trợ lý Antigravity*
