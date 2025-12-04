# Quản lý Cấu hình API Thuế Điện Tử

## Tổng quan

Cập nhật chức năng quản lý cấu hình kết nối API Thuế Điện Tử với khả năng:
- Xem danh sách cấu hình đã lưu
- Chọn cấu hình để chỉnh sửa
- Tạo cấu hình mới
- Xóa cấu hình không cần thiết

## Ngày cập nhật
- **Ngày**: 03/12/2025
- **Phiên bản**: 1.1.0

## Thay đổi

### 1. API Route cho CRUD Config

**File mới**: `app/api/config/[id]/route.ts`

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/config/[id]` | Lấy chi tiết cấu hình (bao gồm token đầy đủ) |
| PUT | `/api/config/[id]` | Cập nhật cấu hình |
| DELETE | `/api/config/[id]` | Xóa (soft delete) cấu hình |

### 2. State mới trong HoaDonPage

```tsx
// Danh sách cấu hình đã lưu
const [savedConfigs, setSavedConfigs] = useState<ApiConfig[]>([]);
// ID cấu hình đang chọn để edit
const [selectedConfigId, setSelectedConfigId] = useState<string>('');
// Flag đang edit hay tạo mới
const [isEditingConfig, setIsEditingConfig] = useState(false);
// Loading state cho delete
const [isDeletingConfig, setIsDeletingConfig] = useState(false);
```

### 3. Các hàm mới

| Hàm | Mô tả |
|-----|-------|
| `fetchAllConfigs()` | Lấy tất cả cấu hình đã lưu |
| `fetchConfigDetail(id)` | Lấy chi tiết 1 cấu hình để edit |
| `handleSelectConfig(id)` | Xử lý khi chọn cấu hình từ combobox |
| `handleDeleteConfig()` | Xử lý xóa cấu hình |
| `resetConfigForm()` | Reset form về trạng thái tạo mới |

### 4. Cập nhật Config Dialog

**Tính năng mới:**
- Combobox chọn cấu hình đã lưu hoặc tạo mới
- Separator phân tách giữa danh sách và form
- Nút Xóa (chỉ hiện khi đang edit)
- Icon và text khác nhau cho Tạo mới / Cập nhật

## Giao diện

### Dialog Cài đặt API

```
┌──────────────────────────────────────────┐
│ Cài đặt API                              │
│ Cấu hình kết nối đến API Thuế Điện Tử    │
├──────────────────────────────────────────┤
│                                          │
│ Chọn cấu hình đã lưu                     │
│ [Combobox: + Tạo mới / Config 1 / ...]   │
│                                          │
│ ─────── Chỉnh sửa cấu hình ───────       │
│                                          │
│ Công ty *                                │
│ [Combobox: Huy Vũ (5900363291)]          │
│                                          │
│ Tên cấu hình                             │
│ [thue_dienttu                         ]  │
│                                          │
│ Bearer Token *                           │
│ [eyJhbGciOiJIUzUxMiJ9...              ]  │
│                                          │
│ Base URL                                 │
│ [https://hoadondientu.gdt.gov.vn:30000]  │
│                                          │
│ Batch Size    │    Delay (ms)            │
│ [    3     ]  │    [   3000   ]          │
│                                          │
├──────────────────────────────────────────┤
│ [🗑️ Xóa]              [Hủy] [✏️ Cập nhật]│
└──────────────────────────────────────────┘
```

## Cách sử dụng

### 1. Tạo cấu hình mới

1. Nhấn nút **Cài đặt** trên trang Hóa đơn
2. Để combobox "Chọn cấu hình" là **+ Tạo cấu hình mới**
3. Chọn Công ty
4. Điền Bearer Token và các thông tin khác
5. Nhấn **Lưu cấu hình**

### 2. Chỉnh sửa cấu hình

1. Nhấn nút **Cài đặt**
2. Chọn cấu hình cần sửa từ combobox
3. Thông tin sẽ tự động điền vào form
4. Chỉnh sửa các trường cần thay đổi
5. Nhấn **Cập nhật**

### 3. Xóa cấu hình

1. Chọn cấu hình cần xóa từ combobox
2. Nhấn nút **Xóa** (màu đỏ, góc trái)
3. Cấu hình sẽ được soft delete (isActive = false)

## Files đã cập nhật

1. `app/api/config/[id]/route.ts` - API route mới (GET, PUT, DELETE)
2. `app/hoadon/page.tsx` - Cập nhật UI và logic
3. `docs/202-QUAN_LY_CAU_HINH_API.md` - Tài liệu này

## Tuân thủ Rules

- ✅ **Rule 2**: Clean Architecture - Tách API routes riêng
- ✅ **Rule 8**: Phân tách tính năng để maintenance, reuse
- ✅ **Rule 10**: shadcn UI + Mobile First + Responsive
- ✅ **Rule 11**: Combobox thay cho Select
- ✅ **Rule 12**: Dialog với header, footer, content scrollable
- ✅ **Rule 11**: Giao diện tiếng Việt
