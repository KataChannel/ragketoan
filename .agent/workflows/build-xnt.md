---
description: Tạo báo cáo Xuất Nhập Tồn (XNT) chính xác từ database kế toán
---

# Workflow: Build XNT Report

Tạo báo cáo Xuất Nhập Tồn (Xuất/Nhập/Tồn kho) theo tháng từ database PostgreSQL.

## Yêu cầu
- PostgreSQL đang chạy (docker container `ragketoan-postgres-1`)
- Database `ketoan` có bảng `ext_listhoadon` và `ext_detailhoadon`
- Python3 với packages: pandas, sqlalchemy, psycopg2, openpyxl

## Logic quan trọng (PHẢI TUÂN THỦ)

### 1. Timezone: UTC → ICT
```sql
tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh'
```

### 2. Lọc trạng thái: `tthai IN ('1','2','4','5')`, loại '6' (hủy)

### 3. Giá trị trước thuế: dùng `tgtcthue` (list) hoặc `thtien` (detail)

### 4. Loại HĐ dịch vụ: auto-detect bằng regex + skip list JSON từ kế toán

### 5. KHÔNG dùng `ext_tonghop` cho 2023 (thiếu dữ liệu muavao)

Chi tiết logic → xem SKILL `accounting_xnt_logic` và `accounting-principles`

## Pipeline đầy đủ (3 bước)

// turbo-all

### Bước 1: Kiểm tra DB
```bash
docker ps | grep ragketoan-postgres
```
Nếu chưa chạy: `cd /chikiet/kata2025/ragketoan && docker compose up -d postgres`

### Bước 2: Phát hiện HĐ dịch vụ & tạo skip list
```bash
cd /chikiet/kata2025/ragketoan && python3 python/detect_skip_invoices.py --year 2023
```
Output: `python/skip_lists/skip_list_2023.json`

Kế toán có thể bổ sung thêm `shdon` vào file JSON nếu cần loại thêm HĐ.

### Bước 3: Tạo XNT Excel
```bash
cd /chikiet/kata2025/ragketoan && python3 python/build_xnt_correct.py --year 2023
```
Script tự động tìm `skip_lists/skip_list_2023.json` nếu có.

Hoặc chỉ định skip list:
```bash
python3 python/build_xnt_correct.py --year 2023 --skip-list python/skip_lists/skip_list_2023.json
```

Output: `docs/huyvu/XNT_HuyVu_2023.xlsx`

### Tham số tùy chọn
| Tham số | Mô tả | Default |
|---------|--------|---------|
| `--year YYYY` | Năm báo cáo | 2023 |
| `--company MST` | Mã số thuế | 5900363291 (Huy Vũ) |
| `--output PATH` | File Excel output | `docs/huyvu/XNT_HuyVu_YYYY.xlsx` |
| `--skip-list PATH` | Skip list JSON | Tự tìm trong `skip_lists/` |
| `--db URI` | Database URI | postgresql://root:password@localhost:5432/ketoan |

## Số liệu kiểm chứng 2023

| Chỉ số | Giá trị |
|--------|---------|
| Mục tiêu (Tờ khai thuế) | **15,640,942,868** |
| DB tgtcthue (ICT + status 1,2,4,5) | 16,230,923,990 |
| HĐ dịch vụ cần loại | ~590,000,000 |
| Bán ra (Tờ khai thuế) | 16,170,531,001 |

## Files
| File | Chức năng |
|------|-----------|
| `python/build_xnt_correct.py` | Script chính tạo XNT Excel |
| `python/detect_skip_invoices.py` | Phát hiện HĐ dịch vụ → skip list |
| `python/skip_lists/skip_list_YYYY.json` | Danh sách HĐ loại trừ |
| `python/audit_muavao_2023.py` | Audit tổng quát |
| `python/compare_monthly.py` | So sánh tháng vs target |
| `docs/huyvu/BAO_CAO_GIAI_TRINH_KHOP_SO_2023.md` | Báo cáo đối soát kế toán |
| `docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md` | Mapping sản phẩm → nhóm |
