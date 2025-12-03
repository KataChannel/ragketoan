# Kế Toán - Hóa Đơn Điện Tử (ext_* Models)

## 📊 Database Schema

### 1. ext_listhoadon (Hóa đơn)
```
┌─────────────────────────────────────────────────────────┐
│ ext_listhoadon                                          │
├─────────────────────────────────────────────────────────┤
│ id          : UUID (PK)                                 │
│ idServer    : String (Unique) - ID từ server thuế       │
│ brandname   : String - Tên nhãn hàng                    │
│ nbmst       : String - MST người bán                    │
│ khmshdon    : String - Ký hiệu mẫu số hóa đơn          │
│ khhdon      : String - Ký hiệu hóa đơn                  │
│ shdon       : String - Số hóa đơn                       │
│ tgtcthue    : Decimal - Tổng chưa thuế                  │
│ tgtthue     : Decimal - Tổng thuế                       │
│ tgtttbso    : Decimal - Tổng thanh toán                 │
│ tdlap       : DateTime - Thời điểm lập                  │
│ tthai       : String - Trạng thái                       │
├─────────────────────────────────────────────────────────┤
│ Relationship: details → ext_detailhoadon[]              │
│ Indexes: nbmst, (khmshdon,shdon), tdlap, nmmst, tthai   │
└─────────────────────────────────────────────────────────┘
```

### 2. ext_detailhoadon (Chi tiết hóa đơn)
```
┌─────────────────────────────────────────────────────────┐
│ ext_detailhoadon                                        │
├─────────────────────────────────────────────────────────┤
│ id           : UUID (PK)                                │
│ idServer     : String (Unique)                          │
│ idhdonServer : String (FK) → ext_listhoadon.idServer    │
│ ten          : String - Tên hàng hóa                    │
│ dvtinh       : String - Đơn vị tính                     │
│ sluong       : Decimal - Số lượng                       │
│ dgia         : Decimal - Đơn giá                        │
│ thtien       : Decimal - Thành tiền                     │
│ tsuat        : Decimal - Thuế suất                      │
│ tthue        : Decimal - Tiền thuế                      │
│ stt          : Int - Số thứ tự                          │
├─────────────────────────────────────────────────────────┤
│ Relationship: invoice → ext_listhoadon                  │
│              ext_sanphamhoadon → ext_sanphamhoadon[]    │
│ OnDelete: Cascade                                       │
└─────────────────────────────────────────────────────────┘
```

### 3. ext_sanphamhoadon (Sản phẩm)
```
┌─────────────────────────────────────────────────────────┐
│ ext_sanphamhoadon                                       │
├─────────────────────────────────────────────────────────┤
│ id             : UUID (PK)                              │
│ iddetailhoadon : String (FK) → ext_detailhoadon.id      │
│ ten            : String - Tên gốc                       │
│ ten2           : String - Tên đã chuẩn hóa              │
│ ma             : String - Mã sản phẩm (auto-gen)        │
│ dvt            : String - Đơn vị tính                   │
│ dgia           : Decimal - Đơn giá                      │
├─────────────────────────────────────────────────────────┤
│ Relationship: detailhoadon → ext_detailhoadon           │
│ OnDelete: Cascade                                       │
└─────────────────────────────────────────────────────────┘
```

## 🔗 Relationship Diagram
```
ext_listhoadon (1) ──── (N) ext_detailhoadon (1) ──── (N) ext_sanphamhoadon
      │                          │                              │
      └─ idServer ◄────── idhdonServer                          │
                                 │                              │
                                 └─ id ◄────────── iddetailhoadon
```

---

## 🔄 DATA FLOW - Cách lấy dữ liệu

### Luồng dữ liệu tổng quan
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  External API   │ ──► │    Backend      │ ──► │    Database     │
│  (Thuế ĐT)      │     │  (NestJS)       │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        └──────────────►│    Frontend     │
                        │   (Next.js)     │
                        └─────────────────┘
```

---

## 🔐 API Thuế Điện Tử - Hướng dẫn chi tiết lấy dữ liệu

### 1. Tổng quan kết nối

| Thông tin | Giá trị |
|-----------|---------|
| **Base URL** | `https://hoadondientu.gdt.gov.vn:30000` |
| **Authentication** | Bearer Token (JWT) |
| **Timeout** | 30 giây |
| **Content-Type** | `application/json` |
| **Accept** | `application/json` |

### 2. Bearer Token - Xác thực

#### 2.1 Cách lấy Token
> ⚠️ Token được cấp bởi **Tổng cục Thuế**, có thời hạn sử dụng.

1. Đăng nhập: https://hoadondientu.gdt.gov.vn
2. Vào **Cài đặt** → **API Token** / **Quản lý kết nối**
3. Tạo mới hoặc copy token hiện có
4. Token format: `eyJhbGciOiJIUzUxMiJ9.{payload}.{signature}`

#### 2.2 Cấu trúc Token (JWT)
```json
// Header
{ "alg": "HS512" }

// Payload (decoded)
{
  "sub": "5900428904",    // MST doanh nghiệp
  "type": 2,              // Loại token
  "exp": 1758946281,      // Thời gian hết hạn (Unix timestamp)
  "iat": 1758859881       // Thời gian tạo
}
```

#### 2.3 Validate Token
```typescript
// Kiểm tra format JWT hợp lệ
function validateBearerToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}
```

---

### 3. API Endpoints chi tiết

#### 3.1 📋 Lấy danh sách hóa đơn BÁN RA

**Endpoint:** `GET /query/invoices/sold`

**cURL Request:**
```bash
curl -X GET \
  'https://hoadondientu.gdt.gov.vn:30000/query/invoices/sold?search=tdlap=ge=2025-01-01T00:00:00;tdlap=le=2025-01-31T23:59:59&sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&page=0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.xxx.yyy' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```

#### 3.2 📋 Lấy danh sách hóa đơn MUA VÀO

**Endpoint:** `GET /query/invoices/purchase`

**cURL Request:**
```bash
curl -X GET \
  'https://hoadondientu.gdt.gov.vn:30000/query/invoices/purchase?search=tdlap=ge=2025-01-01T00:00:00;tdlap=le=2025-01-31T23:59:59&sort=tdlap:desc&size=50&page=0' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.xxx.yyy' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```

#### 3.3 📄 Lấy chi tiết hóa đơn (line items)

**Endpoint:** `GET /query/invoices/detail`

**cURL Request:**
```bash
curl -X GET \
  'https://hoadondientu.gdt.gov.vn:30000/query/invoices/detail?nbmst=0123456789&khhdon=AA/23E&shdon=0000001&khmshdon=1/001' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.xxx.yyy' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```

---

### 4. Query Parameters chi tiết

#### 4.1 Tham số cho danh sách hóa đơn

| Param | Bắt buộc | Mô tả | Ví dụ |
|-------|----------|-------|-------|
| `search` | ⚠️ Nên có | Filter RSQL format | `tdlap=ge=2025-01-01T00:00:00;tdlap=le=2025-01-31T23:59:59` |
| `sort` | ❌ | Sắp xếp (field:direction) | `tdlap:desc,khmshdon:asc,shdon:desc` |
| `size` | ❌ | Số records/page (max 50) | `50` |
| `page` | ❌ | Số trang (0-indexed) | `0` |
| `state` | ❌ | Token phân trang (lấy từ response trước) | `eyJ...` |

#### 4.2 Tham số cho chi tiết hóa đơn

| Param | Bắt buộc | Mô tả | Ví dụ |
|-------|----------|-------|-------|
| `nbmst` | ✅ | Mã số thuế người bán (10 hoặc 13 số) | `0123456789` |
| `khhdon` | ✅ | Ký hiệu hóa đơn | `AA/23E` |
| `shdon` | ✅ | Số hóa đơn | `0000001` |
| `khmshdon` | ✅ | Ký hiệu mẫu số hóa đơn | `1/001` |

---

### 5. RSQL Search Query - Cú pháp filter

#### 5.1 Các operators

| Operator | Ý nghĩa | Ví dụ |
|----------|---------|-------|
| `=ge=` | Greater than or Equal (>=) | `tdlap=ge=2025-01-01T00:00:00` |
| `=le=` | Less than or Equal (<=) | `tdlap=le=2025-01-31T23:59:59` |
| `=gt=` | Greater than (>) | `tgtttbso=gt=1000000` |
| `=lt=` | Less than (<) | `tgtttbso=lt=50000000` |
| `=like=` | Contains (pattern match) | `shdon=like=0001` |
| `==` | Equals | `tthai==1` |
| `;` | AND (kết hợp điều kiện) | `tdlap=ge=...;tdlap=le=...` |

#### 5.2 Các fields có thể filter

| Field | Mô tả | Ví dụ search |
|-------|-------|--------------|
| `tdlap` | Thời điểm lập (DateTime) | `tdlap=ge=2025-01-01T00:00:00` |
| `shdon` | Số hóa đơn | `shdon=like=0001` |
| `msttcgp` | MST người bán/mua | `msttcgp=like=012345` |
| `tenxmua` | Tên người mua | `tenxmua=like=CONG TY` |
| `tgtttbso` | Tổng tiền thanh toán | `tgtttbso=ge=1000000` |
| `tghdon` | Trạng thái hóa đơn | `tghdon=like=1` |

#### 5.3 Ví dụ search query phức tạp
```bash
# Lấy hóa đơn tháng 1/2025, số tiền >= 10 triệu, số hóa đơn chứa "001"
search=tdlap=ge=2025-01-01T00:00:00;tdlap=le=2025-01-31T23:59:59;tgtttbso=ge=10000000;shdon=like=001
```

---

### 6. Response Structure

#### 6.1 Response danh sách hóa đơn
```json
{
  "datas": [
    {
      "id": "uuid-xxx-yyy-zzz",
      "nbmst": "0123456789",
      "nbten": "CÔNG TY ABC",
      "nmmst": "9876543210",
      "nmten": "CÔNG TY XYZ",
      "khmshdon": "1/001",
      "khhdon": "AA/23E",
      "shdon": "0000001",
      "tdlap": "2025-01-15T10:30:00",
      "tgtcthue": 10000000,
      "tgtthue": 1000000,
      "tgtttbso": 11000000,
      "tthai": "Đã ký",
      "mhso": "01GTKT0/001"
    }
  ],
  "totalElements": 150,
  "totalPages": 3,
  "size": 50,
  "number": 0,
  "numberOfElements": 50,
  "first": true,
  "last": false,
  "total": 150,
  "state": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 6.2 Response chi tiết hóa đơn
```json
{
  "datas": [
    {
      "id": "detail-uuid-xxx",
      "stt": 1,
      "ten": "Dịch vụ tư vấn kế toán",
      "dvtinh": "Giờ",
      "sluong": 10,
      "dgia": 1000000,
      "thtcthue": 10000000,
      "tsuat": 10,
      "tthue": 1000000,
      "thtien": 11000000
    },
    {
      "id": "detail-uuid-yyy",
      "stt": 2,
      "ten": "Phần mềm kế toán",
      "dvtinh": "Bộ",
      "sluong": 1,
      "dgia": 5000000,
      "thtcthue": 5000000,
      "tsuat": 10,
      "tthue": 500000,
      "thtien": 5500000
    }
  ],
  "success": true
}
```

---

### 7. Pagination - Phân trang khi >50 records

#### 7.1 Cơ chế phân trang
```
┌─────────────────────────────────────────────────────────────────┐
│ API trả tối đa 50 records/page                                  │
│ Nếu total > 50 → response có "state" token                      │
│ Dùng state token để lấy page tiếp theo                         │
└─────────────────────────────────────────────────────────────────┘

Request 1: GET /query/invoices/sold?search=...&size=50&page=0
Response 1: { datas: [...50], total: 150, state: "abc123" }

Request 2: GET /query/invoices/sold?search=...&size=50&page=1&state=abc123
Response 2: { datas: [...50], total: 150, state: "def456" }

Request 3: GET /query/invoices/sold?search=...&size=50&page=2&state=def456
Response 3: { datas: [...50], total: 150, state: null } // hết data
```

#### 7.2 Code xử lý pagination
```typescript
async function fetchAllInvoices(filter: InvoiceFilter): Promise<InvoiceData[]> {
  const allData: InvoiceData[] = [];
  let currentState: string | undefined;
  let page = 0;
  
  do {
    const response = await fetchInvoices(filter, { 
      page, 
      size: 50, 
      state: currentState 
    });
    
    allData.push(...response.datas);
    currentState = response.state;
    page++;
    
    // Rate limiting: đợi giữa các request
    if (currentState) {
      await new Promise(r => setTimeout(r, 1000));
    }
  } while (currentState && allData.length < response.total);
  
  return allData;
}
```

---

### 8. Rate Limiting & Error Handling

#### 8.1 Cấu hình rate limiting
```typescript
const RATE_LIMIT_CONFIG = {
  MIN_REQUEST_INTERVAL: 1000,    // 1s giữa các request
  MAX_RETRIES: 3,                // Số lần retry tối đa
  RETRY_DELAYS: [2000, 5000, 10000], // Exponential backoff (ms)
  
  // Cho pagination nhiều records
  BASE_DELAY_SMALL: 1000,        // total < 500 records
  BASE_DELAY_MEDIUM: 1500,       // total 500-1000 records
  BASE_DELAY_LARGE: 2000,        // total > 1000 records
};
```

#### 8.2 Xử lý HTTP Errors

| Status | Nguyên nhân | Giải pháp | Retry? |
|--------|-------------|-----------|--------|
| `401` | Token hết hạn/không hợp lệ | Lấy token mới từ cổng thuế | ❌ |
| `403` | Không có quyền truy cập | Kiểm tra quyền MST | ❌ |
| `404` | Endpoint không tồn tại | Kiểm tra URL | ❌ |
| `409` | Rate limit (conflict) | Đợi 2-5s rồi retry | ✅ |
| `429` | Too many requests | Đợi 5-10s rồi retry | ✅ |
| `500` | Server error | Đợi 5s rồi retry | ✅ |
| `503` | Server overload | Đợi 15-60s rồi retry | ✅ |
| `ECONNABORTED` | Timeout | Tăng timeout, retry | ✅ |

#### 8.3 Code retry với exponential backoff
```typescript
const RETRY_DELAYS = [2000, 5000, 10000];

async function executeWithRetry<T>(
  requestFn: () => Promise<T>,
  retryCount = 0
): Promise<T> {
  try {
    return await requestFn();
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      
      // Retry cho rate limit errors
      if ((status === 409 || status === 429) && retryCount < 3) {
        const delay = RETRY_DELAYS[retryCount];
        console.warn(`⚠️ Rate limit hit (${status}), retry in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return executeWithRetry(requestFn, retryCount + 1);
      }
      
      // Retry cho server overload
      if (status === 503 && retryCount < 3) {
        const delay = Math.min(15000 * (retryCount + 1), 60000);
        console.warn(`⚠️ Server overload (503), retry in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        return executeWithRetry(requestFn, retryCount + 1);
      }
    }
    throw error;
  }
}
```

---

### 9. Code Implementation đầy đủ

#### 9.1 Axios Instance Setup
```typescript
import axios from 'axios';

const BASE_URL = 'https://hoadondientu.gdt.gov.vn:30000';

function createAxiosInstance(bearerToken: string) {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: 30000, // 30 seconds
  });
}
```

#### 9.2 Build Search Query
```typescript
function buildSearchQuery(filter: {
  fromDate: string;
  toDate: string;
  invoiceNumber?: string;
  taxCode?: string;
  amountFrom?: number;
  amountTo?: number;
}): string {
  const searchParts: string[] = [];
  
  // Date range (required)
  if (filter.fromDate) {
    searchParts.push(`tdlap=ge=${filter.fromDate}T00:00:00`);
  }
  if (filter.toDate) {
    searchParts.push(`tdlap=le=${filter.toDate}T23:59:59`);
  }
  
  // Optional filters
  if (filter.invoiceNumber) {
    searchParts.push(`shdon=like=${encodeURIComponent(filter.invoiceNumber)}`);
  }
  if (filter.taxCode) {
    searchParts.push(`msttcgp=like=${encodeURIComponent(filter.taxCode)}`);
  }
  if (filter.amountFrom) {
    searchParts.push(`tgtttbso=ge=${filter.amountFrom}`);
  }
  if (filter.amountTo) {
    searchParts.push(`tgtttbso=le=${filter.amountTo}`);
  }
  
  return searchParts.join(';');
}
```

#### 9.3 Fetch Invoices Function
```typescript
async function fetchInvoices(
  bearerToken: string,
  filter: InvoiceFilter,
  invoiceType: 'banra' | 'muavao' = 'banra',
  params: { page?: number; size?: number; state?: string } = {}
) {
  const axiosInstance = createAxiosInstance(bearerToken);
  const endpoint = invoiceType === 'banra' 
    ? '/query/invoices/sold' 
    : '/query/invoices/purchase';
  
  const searchQuery = buildSearchQuery(filter);
  
  const queryParams = new URLSearchParams({
    sort: 'tdlap:desc,khmshdon:asc,shdon:desc',
    size: (params.size || 50).toString(),
    page: (params.page || 0).toString(),
    ...(searchQuery && { search: searchQuery }),
    ...(params.state && { state: params.state })
  });
  
  const response = await executeWithRetry(() => 
    axiosInstance.get(`${endpoint}?${queryParams.toString()}`)
  );
  
  return response.data;
}
```

#### 9.4 Fetch Invoice Details Function
```typescript
interface DetailParams {
  nbmst: string;     // MST người bán
  khhdon: string;    // Ký hiệu hóa đơn
  shdon: string;     // Số hóa đơn
  khmshdon: string;  // Ký hiệu mẫu số
}

async function fetchInvoiceDetails(
  bearerToken: string,
  params: DetailParams
) {
  // Validate MST format (10 or 13 digits)
  const mstRegex = /^\d{10}(\d{3})?$/;
  if (!mstRegex.test(params.nbmst)) {
    throw new Error('MST không đúng định dạng (10 hoặc 13 số)');
  }
  
  const axiosInstance = createAxiosInstance(bearerToken);
  
  const queryParams = new URLSearchParams({
    nbmst: params.nbmst,
    khhdon: params.khhdon,
    shdon: params.shdon,
    khmshdon: params.khmshdon
  });
  
  const response = await executeWithRetry(() =>
    axiosInstance.get(`/query/invoices/detail?${queryParams.toString()}`)
  );
  
  return response.data;
}
```

---

### 10. Mapping Fields API → Database

#### 10.1 Hóa đơn (ext_listhoadon)

| API Response Field | Database Field | Type | Mô tả |
|-------------------|----------------|------|-------|
| `id` | `idServer` | String | ID từ server thuế (unique) |
| `nbmst` | `nbmst` | String | MST người bán |
| `nmmst` | `nmmst` | String | MST người mua |
| `nbten` | `nbten` | String | Tên người bán |
| `nmten` | `nmten` | String | Tên người mua |
| `khmshdon` | `khmshdon` | String | Ký hiệu mẫu số hóa đơn |
| `khhdon` | `khhdon` | String | Ký hiệu hóa đơn |
| `shdon` | `shdon` | String | Số hóa đơn |
| `tdlap` | `tdlap` | DateTime | Thời điểm lập |
| `tgtcthue` | `tgtcthue` | Decimal | Tổng tiền chưa thuế |
| `tgtthue` | `tgtthue` | Decimal | Tổng tiền thuế |
| `tgtttbso` | `tgtttbso` | Decimal | Tổng thanh toán bằng số |
| `tthai` | `tthai` | String | Trạng thái hóa đơn |

#### 10.2 Chi tiết hóa đơn (ext_detailhoadon)

| API Response Field | Database Field | Type | Mô tả |
|-------------------|----------------|------|-------|
| `id` | `idServer` | String | ID chi tiết từ server |
| - | `idhdonServer` | String | FK → ext_listhoadon.idServer |
| `stt` | `stt` | Int | Số thứ tự |
| `ten` | `ten` | String | Tên hàng hóa/dịch vụ |
| `dvtinh` | `dvtinh` | String | Đơn vị tính |
| `sluong` | `sluong` | Decimal | Số lượng |
| `dgia` | `dgia` | Decimal | Đơn giá |
| `thtien` / `thtcthue` | `thtien` | Decimal | Thành tiền (chưa thuế) |
| `tsuat` | `tsuat` | Decimal | Thuế suất (%) |
| `tthue` | `tthue` | Decimal | Tiền thuế |

---

### 11. File References

| File | Mục đích |
|------|----------|
| `frontend/src/services/invoiceApi.ts` | Service gọi API danh sách hóa đơn |
| `frontend/src/services/invoiceDetailApi.ts` | Service gọi API chi tiết hóa đơn |
| `frontend/src/services/configService.ts` | Quản lý Bearer Token, config |
| `frontend/src/types/invoice.ts` | TypeScript interfaces |

---

## 📥 Nguồn dữ liệu khác - Import Excel

**File:** `backend/src/services/invoice-import.service.ts`

**Template Excel gồm 2 sheets:**
- `Danh sách hóa đơn` - Thông tin header
- `Chi tiết hóa đơn` - Thông tin line items

**Các cột bắt buộc (*):**
| Sheet | Cột |
|-------|-----|
| Hóa đơn | shdon, khhdon, khmshdon, tdlap, nbmst |
| Chi tiết | shdon, ten |

---

## 📥 SYNC FLOW - Đồng bộ dữ liệu

### Flow đồng bộ từ API Thuế → Database

```
┌─────────────────────────────────────────────────────────────────┐
│                      SYNC PROCESS                               │
├─────────────────────────────────────────────────────────────────┤
│ 1. Frontend gọi: invoiceApi.fetchInvoices()                     │
│    └─► Lấy danh sách hóa đơn từ API Thuế                       │
│                                                                 │
│ 2. Frontend gọi: invoiceDatabaseService.syncInvoiceData()       │
│    └─► POST /api/invoices/sync                                  │
│                                                                 │
│ 3. Backend: invoice.controller.ts → syncInvoices()              │
│    └─► Chuyển đổi dữ liệu API → CreateInvoiceInput              │
│                                                                 │
│ 4. Backend: invoice.service.ts → bulkCreateInvoices()           │
│    ├─► Check trùng lặp                                          │
│    ├─► Tạo ext_listhoadon                                       │
│    └─► Tự động fetch + save ext_detailhoadon                    │
│                                                                 │
│ 5. Backend: autoFetchAndSaveDetails()                           │
│    └─► Gọi API detail → lưu ext_detailhoadon                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🌐 API Endpoints (Internal Backend)

### REST API

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/api/invoices` | Search hóa đơn với filters |
| `GET` | `/api/invoices/:id` | Lấy hóa đơn theo ID |
| `POST` | `/api/invoices` | Tạo hóa đơn mới |
| `POST` | `/api/invoices/sync` | **Đồng bộ từ API Thuế** |
| `POST` | `/api/invoices/bulk` | Bulk import |
| `GET` | `/api/invoices/stats/summary` | Thống kê |
| `POST` | `/api/invoice-import/upload` | Import từ Excel |

### GraphQL API

```graphql
# Queries
getext_listhoadons(filters: JSON)
getext_detailhoadons(filters: JSON)  
getext_sanphamhoadons(filters: JSON)
getext_sanphamhoadonsPaginated(filters)
searchInvoices(input: InvoiceSearchInput)
getInvoiceStats

# Mutations
createInvoice(input)
bulkCreateInvoices(input)
createext_sanphamhoadon(data)
updateext_sanphamhoadon(id, data)
updateProductsFromDetails(dryRun, limit)
```

---

## 📁 Files Structure

### Backend
```
backend/src/
├── controllers/
│   ├── invoice.controller.ts      # REST API endpoints
│   └── invoice-import.controller.ts # Excel import
├── services/
│   ├── invoice.service.ts         # Business logic chính
│   ├── invoice-import.service.ts  # Excel parsing
│   └── backend-config.service.ts  # Config (token, rate limit)
├── graphql/
│   ├── resolvers/
│   │   ├── invoice.resolver.ts    # GraphQL mutations/queries
│   │   └── ext-models.resolver.ts # Dynamic CRUD
│   ├── models/invoice.model.ts
│   └── inputs/invoice.input.ts
└── ketoan/
    └── product-normalization.service.ts # Chuẩn hóa sản phẩm
```

### Frontend
```
frontend/src/
├── app/ketoan/
│   ├── listhoadon/page.tsx   # Danh sách + Sync
│   ├── sanpham/page.tsx      # Quản lý sản phẩm
│   └── detailhoadon/page.tsx
├── services/
│   ├── invoiceApi.ts              # Gọi API Thuế (External)
│   ├── invoiceDetailApi.ts        # Lấy chi tiết từ API Thuế
│   ├── invoiceDatabaseServiceNew.ts # Gọi Backend API
│   └── configService.ts           # Bearer token config
├── types/
│   └── invoice.ts                 # TypeScript interfaces
└── components/
    ├── InvoiceTableAdvanced.tsx
    ├── InvoiceDetailModal.tsx
    └── InvoiceImportModal.tsx     # Excel import UI
```

---

## ⚡ Tính năng đặc biệt

### 1. Product Normalization (pg_trgm)
- Fuzzy matching tên sản phẩm
- Tự động chuẩn hóa: `ten` → `ten2`
- Tìm và merge duplicate

### 2. Invoice Sync
- Rate limiting: batch 3, delay 3s giữa batches
- Progress tracking
- Auto fetch details từ API thuế
- Retry với exponential backoff (2s, 5s, 10s)

### 3. Excel Import/Export
- Import: Template với 2 sheets (hóa đơn + chi tiết)
- Export server-side: `/ketoan/listhoadon/export-excel`
- Export client-side: Preview trước khi xuất

---

## 📈 Thống kê dữ liệu

| Table | Records | Size |
|-------|---------|------|
| ext_listhoadon | ~4,210 | 14.9 MB |
| ext_detailhoadon | ~18,827 | 12.8 MB |
| ext_sanphamhoadon | ~16,238 | 5.7 MB |

---

## 🔧 Configuration

### Backend Config
```typescript
// backend/src/services/backend-config.service.ts
{
  batchSize: 3,
  delayBetweenBatches: 3000,
  delayBetweenDetailCalls: 2000,
  maxRetries: 5,
  bearerToken: process.env.INVOICE_BEARER_TOKEN,
  apiBaseUrl: 'https://hoadondientu.gdt.gov.vn:30000'
}
```

### Frontend Config
```typescript
// frontend/src/services/configService.ts
{
  bearerToken: string,    // Token từ API Thuế
  pageSize: number,       // Default 50
  invoiceType: 'banra' | 'muavao',
  brandname?: string      // Tên nhãn hàng
}
```

### Environment Variables
```bash
# Backend (.env)
INVOICE_BEARER_TOKEN=eyJhbGciOiJIUzUxMiJ9.xxx.yyy
INVOICE_API_BASE_URL=https://hoadondientu.gdt.gov.vn:30000
INVOICE_BATCH_SIZE=3
INVOICE_DELAY_BETWEEN_BATCHES=3000
INVOICE_DELAY_BETWEEN_DETAIL_CALLS=2000
INVOICE_MAX_RETRIES=5
INVOICE_BRANDNAME=TenNhanHang

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:14000
```

---
*Last updated: 2024-12-02*
