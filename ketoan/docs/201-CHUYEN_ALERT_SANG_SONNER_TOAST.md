# Chuyển đổi Alert sang Sonner Toast

## Tổng quan

Cập nhật hệ thống thông báo từ `alert()` browser native sang `sonner` toast notifications để cải thiện trải nghiệm người dùng.

## Ngày cập nhật
- **Ngày**: Tháng 6, 2025
- **Phiên bản**: 1.0.0

## Thay đổi

### 1. Cài đặt thư viện Sonner

```bash
npm install sonner
```

### 2. Tạo Toaster Component

**File**: `app/components/ui/toaster.tsx`

```tsx
'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: 'group toast bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg',
          title: 'text-gray-900 dark:text-white font-medium',
          description: 'text-gray-500 dark:text-gray-400 text-sm',
          success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
          error: 'border-red-500 bg-red-50 dark:bg-red-900/20',
          warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
          info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
        },
      }}
      richColors
      closeButton
    />
  );
}
```

### 3. Thêm Toaster vào Layout

**File**: `app/layout.tsx`

```tsx
import { Toaster } from "./components/ui/toaster";

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

### 4. Thay thế Alert trong các Component

**File**: `app/hoadon/page.tsx`

Import toast:
```tsx
import { toast } from 'sonner';
```

Thay thế các alert:

| Trước | Sau |
|-------|-----|
| `alert('Vui lòng nhập Bearer Token')` | `toast.warning('Vui lòng nhập Bearer Token')` |
| `alert('Lỗi đồng bộ: ...')` | `toast.error('Lỗi đồng bộ: ...')` |
| `alert('Lưu cấu hình thành công!')` | `toast.success('Lưu cấu hình thành công!')` |
| `alert('Lưu công ty thành công!')` | `toast.success('Lưu công ty thành công!')` |
| `alert('Vui lòng nhập Mã số thuế...')` | `toast.warning('Vui lòng nhập Mã số thuế...')` |

## Loại Toast được sử dụng

| Loại | Mục đích | Ví dụ |
|------|----------|-------|
| `toast.success()` | Thành công | Lưu cấu hình, lưu công ty |
| `toast.error()` | Lỗi | Lỗi đồng bộ, lỗi API |
| `toast.warning()` | Cảnh báo | Thiếu thông tin bắt buộc |
| `toast.info()` | Thông tin | Thông báo chung |

## Tính năng Sonner Toast

- ✅ Position: top-right
- ✅ Rich colors theo loại thông báo
- ✅ Close button
- ✅ Dark mode support
- ✅ Auto dismiss sau 4 giây
- ✅ Responsive trên mobile và desktop

## Files đã cập nhật

1. `app/components/ui/toaster.tsx` - Component mới
2. `app/layout.tsx` - Thêm Toaster vào layout
3. `app/hoadon/page.tsx` - Thay thế 8 alert() thành toast()

## Cách sử dụng Toast trong code mới

```tsx
import { toast } from 'sonner';

// Thành công
toast.success('Đã lưu thành công!');

// Lỗi
toast.error('Có lỗi xảy ra');

// Cảnh báo
toast.warning('Vui lòng kiểm tra lại');

// Thông tin
toast.info('Đang xử lý...');

// Custom với options
toast.success('Lưu thành công!', {
  description: 'Dữ liệu đã được cập nhật',
  duration: 5000,
});
```

## Tuân thủ Rules

- ✅ **Rule 8**: Sử dụng shadcn UI (sonner là một trong những thư viện được khuyên dùng với shadcn)
- ✅ **Rule 10**: Giao diện tiếng Việt
- ✅ **Rule 3**: Cải thiện Developer/User Experience - toast notification đẹp hơn alert
