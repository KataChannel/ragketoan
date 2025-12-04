# Cập Nhật Tính Năng Đồng Bộ Hóa Đơn

## Tổng Quan

Cập nhật tính năng đồng bộ hóa đơn với khả năng **dừng đồng bộ** và **hiển thị tiến trình chi tiết** từng hóa đơn đang được xử lý.

## Các File Thay Đổi

| File | Mô tả |
|------|-------|
| `app/api/invoices/sync-stream/route.ts` | **MỚI** - API endpoint streaming với SSE |
| `app/services/invoice.service.ts` | Thêm function `syncInvoicesWithProgress` |
| `app/types/invoice.ts` | Thêm type `StreamProgress` |
| `app/hoadon/page.tsx` | Cập nhật UI hiển thị chi tiết, nút dừng |

## Chi Tiết Thay Đổi

### 1. API Streaming Endpoint (`/api/invoices/sync-stream`)

- Sử dụng **Server-Sent Events (SSE)** để stream tiến trình real-time
- Hỗ trợ **abort signal** để dừng đồng bộ giữa chừng
- Methods:
  - `POST` - Bắt đầu đồng bộ với streaming progress
  - `DELETE` - Dừng đồng bộ theo `sessionId`

### 2. Service Layer (`syncInvoicesWithProgress`)

- Hỗ trợ `AbortSignal` để dừng giữa chừng
- Stream callbacks cho từng phase:
  - `fetch` - Đang tải từ API Thuế
  - `save` - Đang lưu hóa đơn
  - `detail` - Đang lấy chi tiết hóa đơn
- Gửi thông tin chi tiết từng hóa đơn đang xử lý

### 3. UI Cải Tiến

- **Progress bar** với 3 phases: Tải API → Lưu HĐ → Chi tiết
- **Hiển thị hóa đơn đang xử lý**: Số HĐ, Ký hiệu, Tên KH
- **Progress chi tiết**: Khi đồng bộ chi tiết, hiển thị riêng thanh progress
- **Nút dừng**: Cho phép dừng đồng bộ giữa chừng
- **Không cho đóng dialog** khi đang sync (phải dừng trước)

## Kiến Trúc

```
┌─────────────┐     SSE Stream      ┌──────────────────┐
│   Frontend  │ ◄─────────────────── │ /sync-stream API │
│  (page.tsx) │                      └────────┬─────────┘
│             │                               │
│  EventSource├── DELETE /sync-stream ───►   │ AbortController
│             │   ?sessionId=xxx              │
└─────────────┘                      ┌────────▼─────────┐
                                     │ InvoiceSyncService│
                                     │ +syncWithProgress │
                                     └──────────────────┘
```

## Sử Dụng

1. Mở dialog **Đồng bộ Hóa đơn**
2. Chọn cấu hình API
3. Tick **Đồng bộ chi tiết hóa đơn** nếu cần
4. Nhấn **Đồng bộ**
5. Theo dõi tiến trình chi tiết:
   - Xem hóa đơn đang xử lý
   - Xem phase hiện tại
   - Xem progress chi tiết khi sync details
6. Nhấn **Dừng** nếu muốn hủy giữa chừng

## Type Definitions

```typescript
interface StreamProgress {
  type: 'progress' | 'invoice' | 'detail' | 'complete' | 'error' | 'aborted';
  phase?: 'fetch' | 'save' | 'detail';
  current?: number;
  total?: number;
  message?: string;
  percentage?: number;
  invoice?: {
    shdon: string;
    khhdon: string;
    nbten?: string;
    nmten?: string;
  };
  detail?: {
    invoiceShdon: string;
    current: number;
    total: number;
  };
  sessionId?: string;
}
```

---
*Cập nhật: 04/12/2025*
