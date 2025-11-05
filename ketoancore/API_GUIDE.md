# KetoanCore - Hướng dẫn sử dụng API Database

## API Endpoints đã tạo

### 1. Health Check API
**Endpoint:** `GET /api/health`

Kiểm tra kết nối database và trả về phiên bản PostgreSQL.

**Response:**
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "current_time": "2025-11-05T10:30:00.000Z",
    "pg_version": "PostgreSQL 16.x..."
  }
}
```

### 2. Database Tables API
**Endpoint:** `GET /api/db/tables`

Lấy danh sách tất cả các bảng trong database.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "table_schema": "public",
      "table_name": "users",
      "table_type": "BASE TABLE"
    }
  ],
  "count": 10
}
```

### 3. Custom Query API
**Endpoint:** `POST /api/db/query`

Thực thi câu SQL query tùy chỉnh.

**Request Body:**
```json
{
  "sql": "SELECT * FROM users LIMIT 10",
  "params": []
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "rowCount": 10,
  "command": "SELECT"
}
```

**Lưu ý:** Trong môi trường production, chỉ cho phép câu lệnh SELECT.

## Chạy dự án

### Development (Local với Bun)
```bash
cd ketoancore
bun install
bun dev
```

### Production (Docker)
```bash
# Từ thư mục gốc của dự án
docker-compose up -d
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Kiểm tra kết nối

Sau khi chạy ứng dụng, truy cập:
- Health check: http://localhost:3000/api/health
- Danh sách tables: http://localhost:3000/api/db/tables

## Cấu trúc thư mục đã tạo

```
ketoancore/
├── lib/
│   └── db.ts              # Database connection pool
├── app/
│   └── api/
│       ├── health/
│       │   └── route.ts   # Health check endpoint
│       └── db/
│           ├── tables/
│           │   └── route.ts  # Tables listing endpoint
│           └── query/
│               └── route.ts  # Custom query endpoint
├── Dockerfile             # Bun-based Docker image
├── .env.local            # Local environment variables
└── package.json          # Updated with Bun commands
```

## Biến môi trường

File `.env.local`:
```env
DB_HOST=postgres
DB_PORT=5432
DB_USER=root
DB_PASSWORD=password
DB_NAME=n8n
NODE_ENV=development
PORT=3000
```

## Tính năng đã triển khai

✅ Sử dụng Bun.js để tăng tốc độ build và runtime
✅ Kết nối PostgreSQL với connection pooling
✅ 3 API endpoints cơ bản để thao tác với database
✅ Error handling và logging
✅ Docker integration với docker-compose
✅ TypeScript support đầy đủ
✅ Security: Chỉ cho phép SELECT trong production

## Mở rộng

Để thêm API mới, tạo file trong `app/api/[endpoint]/route.ts` và import `query` từ `@/lib/db`:

```typescript
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const result = await query('SELECT * FROM your_table');
  return NextResponse.json({ data: result.rows });
}
```
