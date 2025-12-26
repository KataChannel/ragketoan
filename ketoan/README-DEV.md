# Hệ thống Quản lý Hóa đơn Điện tử - Kế Toán

Ứng dụng web Next.js để đồng bộ và quản lý hóa đơn điện tử từ API Thuế Điện Tử, tích hợp với n8n để xây dựng RAG (Retrieval Augmented Generation) cho dữ liệu kế toán.

## 📋 Tính năng

- ✅ Đồng bộ hóa đơn bán ra/mua vào từ API Thuế Điện Tử
- ✅ Quản lý danh sách hóa đơn với tìm kiếm và lọc
- ✅ Xem chi tiết hóa đơn và line items
- ✅ Thống kê tổng hợp theo loại hóa đơn
- ✅ Cấu hình API Token và Rate Limiting
- ✅ RESTful API endpoints cho n8n integration
- ✅ Database PostgreSQL với Prisma ORM

## 🏗️ Kiến trúc

```
┌─────────────────┐      ┌──────────────┐      ┌──────────────┐
│   Next.js Web   │ ────▶│  API Routes  │ ────▶│  PostgreSQL  │
│   (Frontend)    │      │  (Backend)   │      │  Database    │
└─────────────────┘      └──────────────┘      └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Tax API      │
                         │ (External)   │
                         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   n8n        │
                         │   (RAG)      │
                         └──────────────┘
```

## 🚀 Bắt đầu

### Yêu cầu

- Node.js 20+ 
- Docker & Docker Compose
- npm hoặc yarn

### Cài đặt nhanh

1. **Clone repository**
   ```bash
   cd /chikiet/kata2025/ragketoan/ketoan
   ```

2. **Cài đặt dependencies**
   ```bash
   npm install
   ```

3. **Khởi động môi trường development**
   ```bash
   ./start-dev.sh
   ```

   Script sẽ tự động:
   - Khởi động PostgreSQL trong Docker
   - Tạo database `ketoan`
   - Chạy Prisma migration
   - Khởi động Next.js dev server

4. **Truy cập ứng dụng**
   - Web UI: http://localhost:3000
   - Quản lý hóa đơn: http://localhost:3000/hoadon
   - API: http://localhost:3000/api/invoices

### Dừng môi trường

```bash
./stop-dev.sh
```

## 📂 Cấu trúc thư mục

```
ketoan/
├── app/
│   ├── api/               # API routes
│   │   ├── invoices/      # Invoice endpoints
│   │   ├── config/        # Config endpoints
│   │   └── ...
│   ├── components/        # UI components
│   │   └── ui/            # shadcn/ui components
│   ├── hoadon/            # Invoice management page
│   ├── lib/               # Utilities
│   │   ├── prisma.ts      # Prisma client
│   │   └── utils.ts       # Helper functions
│   ├── services/          # Business logic
│   │   ├── invoice.service.ts
│   │   └── tax-api.service.ts
│   └── types/             # TypeScript types
├── prisma/
│   └── schema.prisma      # Database schema
├── start-dev.sh           # Script khởi động
├── stop-dev.sh            # Script dừng
└── package.json
```

## 🔧 Cấu hình

### Database (.env trong ketoan/)

```env
DATABASE_URL="postgresql://root:password@localhost:5432/ketoan?schema=public"
```

### Docker Compose (root level)

PostgreSQL được cấu hình trong `docker-compose.yml`:

```yaml
postgres:
  image: postgres:16-alpine
  ports:
    - 5432:5432
  environment:
    - POSTGRES_USER=root
    - POSTGRES_PASSWORD=password
    - POSTGRES_DB=n8n
```

## 📡 API Endpoints

### Invoices

```bash
# Lấy danh sách hóa đơn
GET /api/invoices?loaihd=banra&page=0&pageSize=50

# Lấy chi tiết hóa đơn
GET /api/invoices/{id}

# Đồng bộ từ API Thuế
POST /api/invoices/sync
Body: {
  "bearerToken": "eyJhbGc...",
  "invoiceType": "banra",
  "fromDate": "2025-01-01",
  "toDate": "2025-01-31"
}

# Đồng bộ chi tiết hóa đơn
POST /api/invoices/{id}/sync-details
Body: { "bearerToken": "..." }

# Thống kê
GET /api/invoices/stats
```

### Config

```bash
# Lấy cấu hình
GET /api/config

# Lưu cấu hình
POST /api/config
Body: {
  "name": "thue_dienttu",
  "bearerToken": "...",
  "baseUrl": "https://hoadondientu.gdt.gov.vn:30000"
}
```

## 🗄️ Database Schema

### ext_listhoadon
Bảng chính lưu thông tin hóa đơn

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| idServer | String | ID từ API Thuế (unique) |
| nbmst | String | MST người bán |
| nmmst | String | MST người mua |
| shdon | String | Số hóa đơn |
| tgtttbso | Decimal | Tổng thanh toán |
| tdlap | DateTime | Thời điểm lập |
| loaihd | String | banra/muavao |

### ext_detailhoadon
Chi tiết hàng hóa trong hóa đơn

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| idServer | String | ID từ API Thuế |
| idhdonServer | String | FK → ext_listhoadon |
| ten | String | Tên hàng hóa |
| sluong | Decimal | Số lượng |
| dgia | Decimal | Đơn giá |
| thtien | Decimal | Thành tiền |

## 🔐 Lấy Bearer Token

1. Đăng nhập vào https://hoadondientu.gdt.gov.vn
2. Mở Developer Tools (F12)
3. Tab Network → tìm request API
4. Copy Bearer token từ header `Authorization`

## 🤖 Tích hợp n8n

n8n có thể truy vấn database thông qua:

### PostgreSQL Node

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

### HTTP Request Node

```javascript
{
  "method": "GET",
  "url": "http://localhost:3000/api/invoices",
  "qs": {
    "loaihd": "banra",
    "pageSize": 100
  }
}
```

## 🛠️ Development

### Chạy migration

```bash
cd /chikiet/kata2025/ragketoan/ketoan
npx prisma db push
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Xem database với Prisma Studio

```bash
npx prisma studio
```

### Build production

```bash
npm run build
npm start
```

## 📊 Monitoring

### Xem logs Next.js

```bash
tail -f /tmp/ketoan-dev.log
```

### Check PostgreSQL

```bash
docker exec ragketoan-postgres-1 psql -U root -d ketoan -c "\dt"
```

### Check running processes

```bash
ps aux | grep "next dev"
docker ps | grep postgres
```

## 🐛 Troubleshooting

### Port 3000 đã được sử dụng

```bash
# Tìm process
lsof -i :3000
# Kill process
kill -9 <PID>
```

### PostgreSQL không kết nối được

```bash
# Kiểm tra container
docker ps | grep postgres

# Restart container
cd /chikiet/kata2025/ragketoan
docker compose restart postgres

# Check logs
docker logs ragketoan-postgres-1
```

### Database schema không đồng bộ

```bash
npx prisma db push --force-reset
```

## 📚 Tài liệu tham khảo

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [API Thuế Điện Tử](https://hoadondientu.gdt.gov.vn)

## 📝 License

MIT License

## 👥 Contributors

- KataChannel - Initial work

## 🎯 Roadmap

- [ ] Thêm authentication/authorization
- [ ] Export Excel/PDF
- [ ] Real-time sync với WebSocket
- [ ] Dashboard analytics
- [ ] Email notifications
- [ ] Mobile responsive improvements
- [ ] Unit tests & E2E tests
