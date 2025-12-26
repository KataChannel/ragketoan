# Cập nhật Đồng bộ Hóa đơn - Chọn Cấu hình API

## Tổng quan

Cập nhật chức năng đồng bộ hóa đơn từ API Thuế Điện Tử với khả năng:
- Chọn cấu hình API đã lưu để đồng bộ
- Không cần nhập lại Bearer Token mỗi lần
- Tự động lưu thời gian sync cuối cùng

## Ngày cập nhật
- **Ngày**: 03/12/2025
- **Phiên bản**: 1.2.0

## Thay đổi

### 1. State mới trong Sync Dialog

```tsx
// Danh sách cấu hình đã lưu cho công ty được chọn
const [syncSavedConfigs, setSyncSavedConfigs] = useState<ApiConfig[]>([]);
// ID cấu hình đang chọn để sync
const [syncSelectedConfigId, setSyncSelectedConfigId] = useState<string>('');
```

### 2. Các hàm mới

| Hàm | Mô tả |
|-----|-------|
| `fetchSyncConfigs()` | Lấy cấu hình API theo công ty đang chọn |
| `handleSelectSyncConfig(id)` | Xử lý khi chọn cấu hình từ combobox |

### 3. Cập nhật Sync Dialog

**Tính năng mới:**
- Combobox chọn cấu hình API đã lưu
- Input token ẩn khi đã chọn cấu hình
- Hiển thị thông báo "Sử dụng Bearer Token từ cấu hình đã lưu"
- Auto load brandname từ cấu hình

### 4. Cập nhật API Route `/api/invoices/sync`

**Thêm tham số:**
- `configId`: ID cấu hình để lấy Bearer Token từ database
- `congtyId`: ID công ty để gán cho hóa đơn

**Logic mới:**
1. Nếu có `configId` → lấy token từ database
2. Nếu không có `configId` → sử dụng `bearerToken` thủ công
3. Cập nhật `lastSyncAt` và `lastSyncStatus` sau khi sync

### 5. Cập nhật Types

```tsx
// SyncInvoicesInput - thêm congtyId
export interface SyncInvoicesInput {
  invoiceType: InvoiceType;
  fromDate: string;
  toDate: string;
  brandname?: string;
  congtyId?: string;  // Mới
}

// CreateInvoiceInput - thêm congtyId
export interface CreateInvoiceInput {
  // ...existing fields
  congtyId?: string;  // Mới
}
```

### 6. Cập nhật Service

- `InvoiceSyncService.syncInvoices()` - thêm tham số `congtyId`
- `InvoiceDbService.upsertInvoice()` - lưu `congtyId` vào database
- `mapApiToCreateInput()` - thêm `congtyId` vào mapping

## Giao diện

### Dialog Đồng bộ Hóa đơn

```
┌──────────────────────────────────────────┐
│ Đồng bộ Hóa đơn                          │
│ Đồng bộ hóa đơn từ API Thuế Điện Tử...   │
├──────────────────────────────────────────┤
│                                          │
│ Chọn cấu hình API                        │
│ [Combobox: Nhập thủ công / Config 1 /...]│
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │ ✓ Sử dụng Bearer Token từ cấu hình  │  │
│ │   đã lưu                            │  │
│ └─────────────────────────────────────┘  │
│                                          │
│ Từ ngày        │    Đến ngày             │
│ [2024-01-01]   │    [2024-12-31]         │
│                                          │
│ Tên nhãn hàng (tùy chọn)                 │
│ [Công ty ABC                          ]  │
│                                          │
│ ┌─────────────────────────────────────┐  │
│ │ Đang đồng bộ...             75%     │  │
│ │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░              │  │
│ └─────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│                          [Hủy] [Đồng bộ] │
└──────────────────────────────────────────┘
```

## Luồng hoạt động

```
1. User mở Dialog Đồng bộ
   └─> fetchSyncConfigs() lấy configs của công ty đang chọn

2. User chọn cấu hình từ Combobox
   └─> handleSelectSyncConfig()
       └─> Fetch config detail để lấy brandname
       └─> Ẩn input Bearer Token thủ công

3. User nhấn Đồng bộ
   └─> handleSync()
       └─> POST /api/invoices/sync với configId

4. API Route xử lý
   └─> Lấy token từ ext_apiconfig theo configId
   └─> Gọi TaxApiService để fetch hóa đơn
   └─> Lưu vào ext_listhoadon với congtyId
   └─> Cập nhật lastSyncAt, lastSyncStatus

5. Response trả về
   └─> Hiển thị toast thành công
   └─> Refresh danh sách hóa đơn
```

## Files đã cập nhật

1. `app/hoadon/page.tsx` - Thêm state và logic chọn config
2. `app/api/invoices/sync/route.ts` - Hỗ trợ configId, cập nhật sync status
3. `app/services/invoice.service.ts` - Thêm congtyId vào sync
4. `app/types/invoice.ts` - Thêm congtyId vào types
5. `docs/203-DONG_BO_HOA_DON_CHON_CAU_HINH.md` - Tài liệu này

## Tuân thủ Rules

- ✅ **Rule 2**: Clean Architecture - Tách rõ API, Service, Types
- ✅ **Rule 3**: Performance - Chỉ fetch configs của công ty đang chọn
- ✅ **Rule 4**: Developer Experience - Code rõ ràng, dễ maintain
- ✅ **Rule 5**: User Experience - Không cần nhập token mỗi lần
- ✅ **Rule 8**: Phân tách tính năng - Config riêng, Sync riêng
- ✅ **Rule 10**: shadcn UI + Mobile First + Responsive
- ✅ **Rule 11**: Combobox thay Select
- ✅ **Rule 11**: Giao diện tiếng Việt
- ✅ **Rule 12**: Dialog với header, footer, content scrollable
