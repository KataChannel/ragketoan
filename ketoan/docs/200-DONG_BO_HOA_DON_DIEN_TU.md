# Tính năng Đồng bộ Hóa đơn Điện tử từ API Thuế

## Tổng quan

Tính năng này cho phép đồng bộ dữ liệu hóa đơn điện tử từ API Thuế Điện Tử (hoadondientu.gdt.gov.vn) về database PostgreSQL để phục vụ cho RAG (Retrieval Augmented Generation) dữ liệu kế toán với n8n.

**Hỗ trợ quản lý nhiều công ty** - Mỗi công ty có mã số thuế riêng, cấu hình API riêng.

## Cấu trúc thư mục

```
app/
├── api/
│   ├── congty/
│   │   ├── route.ts              # GET/POST danh sách công ty
│   │   └── [id]/
│   │       └── route.ts          # GET/PUT/DELETE công ty
│   ├── invoices/
│   │   ├── route.ts              # GET/POST danh sách hóa đơn
│   │   ├── [id]/
│   │   │   ├── route.ts          # GET chi tiết hóa đơn
│   │   │   └── sync-details/
│   │   │       └── route.ts      # POST đồng bộ chi tiết
│   │   ├── sync/
│   │   │   └── route.ts          # POST đồng bộ từ API Thuế
│   │   └── stats/
│   │       └── route.ts          # GET thống kê
│   └── config/
│       └── route.ts              # GET/POST cấu hình API (theo công ty)
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── dialog.tsx
│       ├── popover.tsx
│       ├── command.tsx
│       ├── combobox.tsx
│       ├── scroll-area.tsx
│       └── index.ts
├── hoadon/
│   └── page.tsx                  # Trang quản lý hóa đơn
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   └── utils.ts                  # Utility functions
├── services/
│   ├── tax-api.service.ts        # Service gọi API Thuế
│   └── invoice.service.ts        # Service xử lý database & sync
├── types/
│   ├── invoice.ts                # Type definitions
│   └── index.ts
├── layout.tsx
└── page.tsx                      # Trang chủ
```

## Database Schema (Prisma)

### ext_congty (MỚI)
Quản lý thông tin nhiều công ty.

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | UUID |
| mst | String @unique | Mã số thuế |
| ten | String | Tên công ty |
| tenVietTat | String? | Tên viết tắt |
| diaChi | String? | Địa chỉ |
| dienThoai | String? | Số điện thoại |
| email | String? | Email |
| nguoiDaiDien | String? | Người đại diện |
| isActive | Boolean | Trạng thái |
| isDefault | Boolean | Công ty mặc định |

### ext_listhoadon
Lưu danh sách hóa đơn đồng bộ từ API.

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | UUID |
| idServer | String @unique | ID từ server API Thuế |
| congtyId | String? | FK → ext_congty.id |
| brandname | String? | Tên nhãn hàng |
| nbmst | String | MST người bán |
| nbten | String? | Tên người bán |
| nmmst | String? | MST người mua |
| nmten | String? | Tên người mua |
| khmshdon | String | Ký hiệu mẫu số hóa đơn |
| khhdon | String | Ký hiệu hóa đơn |
| shdon | String | Số hóa đơn |
| tgtcthue | Float | Tổng tiền chưa thuế |
| tgtthue | Float | Tổng tiền thuế |
| tgtttbso | Float | Tổng thanh toán |
| tdlap | DateTime | Thời điểm lập |
| tthai | String? | Trạng thái |
| loaihd | String | banra/muavao |

### ext_detailhoadon
Lưu chi tiết từng dòng hàng hóa trong hóa đơn.

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | UUID |
| idServer | String @unique | ID từ server |
| idhdonServer | String | ID hóa đơn server |
| stt | Int | Số thứ tự |
| ten | String | Tên hàng hóa |
| dvtinh | String? | Đơn vị tính |
| sluong | Float | Số lượng |
| dgia | Float | Đơn giá |
| thtien | Float | Thành tiền |
| tsuat | Float | Thuế suất % |
| tthue | Float | Tiền thuế |

### ext_apiconfig
Lưu cấu hình kết nối API.

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | UUID |
| name | String @unique | Tên cấu hình |
| bearerToken | String | JWT Token |
| baseUrl | String | URL API |
| batchSize | Int | Số record/batch |
| delayBetweenBatches | Int | Delay (ms) |
| isActive | Boolean | Trạng thái kích hoạt |

### ext_synclog
Lưu lịch sử đồng bộ.

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | UUID |
| syncType | String | listhoadon/chitiet |
| fromDate | DateTime? | Ngày bắt đầu |
| toDate | DateTime? | Ngày kết thúc |
| totalRecords | Int | Tổng số record |
| successCount | Int | Thành công |
| errorCount | Int | Lỗi |
| status | String | pending/running/completed/failed |

## API Endpoints

### 1. Danh sách hóa đơn
```
GET /api/invoices?loaihd=banra&page=1&pageSize=20
```

### 2. Chi tiết hóa đơn
```
GET /api/invoices/{id}
```

### 3. Đồng bộ từ API Thuế
```
POST /api/invoices/sync
Body: {
  "bearerToken": "eyJhbGc...",
  "invoiceType": "banra",
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31",
  "brandname": "Công ty ABC"
}
```

### 4. Đồng bộ chi tiết hóa đơn
```
POST /api/invoices/{id}/sync-details
Body: {
  "bearerToken": "eyJhbGc..."
}
```

### 5. Thống kê
```
GET /api/invoices/stats?loaihd=banra&fromDate=2025-01-01&toDate=2025-01-31
```

### 6. Cấu hình API
```
GET /api/config
POST /api/config
Body: {
  "name": "thue_dienttu",
  "bearerToken": "...",
  "baseUrl": "https://hoadondientu.gdt.gov.vn:30000"
}
```

## Tính năng UI

### Trang chủ (`/`)
- Giới thiệu hệ thống
- Cards dẫn đến các tính năng
- Hướng dẫn bắt đầu

### Trang quản lý hóa đơn (`/hoadon`)
- **Stats cards**: Hiển thị số hóa đơn, tổng tiền, tổng thuế
- **Filter**: Combobox chọn loại hóa đơn, tìm kiếm
- **Table**: Danh sách hóa đơn với responsive columns
- **Dialog đồng bộ**: Nhập token, chọn ngày, theo dõi progress
- **Dialog chi tiết**: Xem thông tin hóa đơn đầy đủ

## Công nghệ sử dụng

- **Framework**: Next.js 16.0.6 (App Router)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Database**: PostgreSQL + Prisma ORM 7.0.1
- **HTTP Client**: Axios với retry logic
- **Icons**: Lucide React
- **Date**: date-fns với locale vi

## Cách sử dụng

### 1. Chạy migration
```bash
cd ketoan
npx prisma db push
```

### 2. Khởi động server
```bash
npm run dev
```

### 3. Lấy Bearer Token
1. Đăng nhập vào https://hoadondientu.gdt.gov.vn
2. Mở Developer Tools (F12)
3. Vào tab Network
4. Tìm request đến API, copy Bearer token từ header Authorization

### 4. Đồng bộ hóa đơn
1. Vào trang `/hoadon`
2. Click "Đồng bộ"
3. Nhập Bearer Token
4. Chọn khoảng thời gian
5. Click "Đồng bộ"

## Tích hợp n8n

Dữ liệu được lưu trong PostgreSQL có thể được truy vấn bởi n8n thông qua:

1. **PostgreSQL Node**: Kết nối trực tiếp database
2. **HTTP Request Node**: Gọi các API endpoints

### Ví dụ query cho RAG
```sql
SELECT 
  shdon, khhdon, nbten, nmten, 
  tgtttbso, tdlap, tthai
FROM ext_listhoadon
WHERE loaihd = 'banra'
  AND tdlap >= '2025-01-01'
ORDER BY tdlap DESC
LIMIT 100;
```

## Lưu ý

1. **Rate Limiting**: API Thuế có giới hạn số request. Service đã tích hợp:
   - Exponential backoff retry (2s, 5s, 10s)
   - Batch processing với delay giữa các batch
   - Min interval 3s giữa các request

2. **Bearer Token**: Token có thời hạn, cần refresh định kỳ

3. **Sync chi tiết**: Chỉ sync chi tiết khi cần thiết để tiết kiệm quota API

## Changelog

- **v1.0.0** (2025-06-07): Initial release
  - Đồng bộ hóa đơn bán ra/mua vào
  - Quản lý chi tiết hóa đơn
  - UI quản lý với shadcn components
  - Mobile responsive
