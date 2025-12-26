# Bảng Tổng Hợp Hóa Đơn (ext_tonghop)

## Mục đích
Tạo bảng tổng hợp kết hợp dữ liệu từ `ext_detailhoadon` và `ext_listhoadon` phục vụ:
- **RAG**: Full-text search trên toàn bộ dữ liệu hàng hóa, chuẩn hóa tên
- **Xuất nhập tồn**: Theo dõi số lượng và giá trị nhập/xuất theo mặt hàng
- **Báo cáo**: Thống kê theo thời gian, công ty, mặt hàng

## Cấu trúc Model

| Nhóm | Trường | Mô tả |
|------|--------|-------|
| **Nguồn** | `idDetailServer`, `idHoadonServer` | Liên kết về bảng gốc |
| **Công ty** | `congtyId`, `congtyMst`, `congtyTen` | Thông tin công ty (denormalized) |
| **Hóa đơn** | `khmshdon`, `khhdon`, `shdon`, `tdlap`, `tthai`, `loaihd` | Header hóa đơn |
| **Đối tác** | `nbmst`, `nbten`, `nmmst`, `nmten` | Người bán/người mua |
| **Hàng hóa** | `tenHang`, `tenHangChuan`, `maHang`, `nhomHang`, `dvtinh` | Chi tiết mặt hàng |
| **Số liệu** | `sluong`, `dgia`, `thtien`, `tongTien` | Số lượng và giá trị |
| **Thuế** | `tsuat`, `tthue` | Thông tin thuế |
| **XNT** | `soLuongNhap`, `soLuongXuat`, `giaTriNhap`, `giaTriXuat` | Xuất nhập tồn |
| **RAG** | `searchText`, `tags` | Full-text search và tags |
| **Thời gian** | `nam`, `thang`, `quy` | Phân tích theo kỳ |

## API Endpoints

### GET `/api/tonghop`
| Param | Mô tả |
|-------|-------|
| `action` | `list` / `stats` / `xnt-mathang` / `xnt-thoigian` |
| `congtyId` | Lọc theo công ty |
| `fromDate`, `toDate` | Khoảng thời gian |
| `search` | Tìm kiếm tên hàng |
| `page`, `limit` | Phân trang |
| `nam`, `groupBy` | Cho báo cáo theo thời gian |

### POST `/api/tonghop`
```json
{
  "congtyId": "optional",
  "fromDate": "2025-01-01",
  "toDate": "2025-12-31",
  "forceResync": true
}
```

## Service Functions

| Function | Mô tả |
|----------|-------|
| `syncTongHop()` | Đồng bộ dữ liệu từ 2 bảng nguồn |
| `getTongHopStats()` | Lấy thống kê tổng hợp |
| `getTongHopList()` | Danh sách với pagination |
| `getXuatNhapTonByMatHang()` | Báo cáo XNT theo mặt hàng |
| `getXuatNhapTonTheoThoiGian()` | Báo cáo XNT theo tháng/quý |

## Giao diện `/thongke`

Trang thống kê gồm 3 tab:
1. **Chi tiết**: Danh sách tất cả mặt hàng với filter, search, pagination
2. **XNT Mặt hàng**: Báo cáo xuất nhập tồn nhóm theo tên hàng chuẩn hóa
3. **XNT Thời gian**: Báo cáo theo tháng/quý trong năm

### Tính năng:
- Filter theo công ty, thời gian, loại hóa đơn
- Tìm kiếm theo tên hàng, mã hàng
- Đồng bộ dữ liệu từ chi tiết hóa đơn
- Mobile-first responsive design
- Stats cards tổng quan

## Files được tạo/sửa

- `prisma/schema.prisma` - Thêm model `ext_tonghop`
- `app/services/tonghop.service.ts` - Service xử lý tổng hợp
- `app/api/tonghop/route.ts` - API endpoints
- `app/services/index.ts` - Export service
- `app/thongke/page.tsx` - Trang thống kê UI
