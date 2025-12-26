// ============================================================================
// Types cho Hóa đơn Điện tử - API Thuế
// ============================================================================

// ======================
// API Response Types
// ======================

/** Response từ API danh sách hóa đơn */
export interface InvoiceListResponse {
  datas: InvoiceApiData[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  total: number;
  state?: string; // Token cho pagination
}

/** Response từ API chi tiết hóa đơn */
export interface InvoiceDetailResponse {
  // API có thể trả về datas hoặc data hoặc hddvu
  datas?: InvoiceDetailApiData[];
  data?: InvoiceDetailApiData[] | InvoiceDetailApiData;
  hddvu?: InvoiceDetailApiData[]; // Hàng hóa dịch vụ
  success?: boolean;
  // Các field khác của hóa đơn (thông tin header)
  nbmst?: string;
  nbten?: string;
  nmmst?: string;
  nmten?: string;
  khmshdon?: string;
  khhdon?: string;
  shdon?: string;
  tdlap?: string;
  tgtcthue?: number;
  tgtthue?: number;
  tgtttbso?: number;
}

/** Dữ liệu hóa đơn từ API Thuế */
export interface InvoiceApiData {
  id: string;
  nbmst: string;      // MST người bán
  nbten?: string;     // Tên người bán
  nbdchi?: string;    // Địa chỉ người bán
  nmmst?: string;     // MST người mua
  nmten?: string;     // Tên người mua
  nmdchi?: string;    // Địa chỉ người mua
  khmshdon: string;   // Ký hiệu mẫu số hóa đơn
  khhdon: string;     // Ký hiệu hóa đơn
  shdon: string;      // Số hóa đơn
  mhso?: string;      // Mẫu hóa đơn
  tdlap: string;      // Thời điểm lập (ISO string)
  tgtcthue: number;   // Tổng tiền chưa thuế
  tgtthue: number;    // Tổng tiền thuế
  tgtttbso: number;   // Tổng thanh toán
  tthai?: string;     // Trạng thái
}

/** Dữ liệu chi tiết hóa đơn từ API Thuế */
export interface InvoiceDetailApiData {
  id: string;
  stt: number;
  ten: string;        // Tên hàng hóa
  dvtinh?: string;    // Đơn vị tính
  sluong: number;     // Số lượng
  dgia: number;       // Đơn giá
  thtcthue?: number;  // Thành tiền chưa thuế
  thtien?: number;    // Thành tiền
  tsuat: number;      // Thuế suất (%)
  tthue: number;      // Tiền thuế
}

// ======================
// Database Types
// ======================

/** Hóa đơn trong database */
export interface Invoice {
  id: string;
  idServer: string;
  brandname?: string;
  congtyId?: string;   // FK → ext_congty.id
  congty?: CongTy;     // Relation
  nbmst: string;
  nbten?: string;
  nbdchi?: string;
  nmmst?: string;
  nmten?: string;
  nmdchi?: string;
  khmshdon: string;
  khhdon: string;
  shdon: string;
  mhso?: string;
  tgtcthue: number;
  tgtthue: number;
  tgtttbso: number;
  tdlap: Date;
  tthai?: string;
  loaihd: 'banra' | 'muavao';
  createdAt: Date;
  updatedAt: Date;
  details?: InvoiceDetail[];
}

/** Chi tiết hóa đơn trong database */
export interface InvoiceDetail {
  id: string;
  idServer: string;
  idhdonServer: string;
  stt: number;
  ten: string;
  dvtinh?: string;
  sluong: number;
  dgia: number;
  thtien: number;
  tsuat: number;
  tthue: number;
  createdAt: Date;
  updatedAt: Date;
  products?: Product[];
}

/** Sản phẩm trong database */
export interface Product {
  id: string;
  iddetailhoadon: string;
  ten: string;
  ten2?: string;
  ma?: string;
  dvt?: string;
  dgia: number;
  createdAt: Date;
  updatedAt: Date;
}

// ======================
// Công ty Types
// ======================

/** Thông tin công ty */
export interface CongTy {
  id: string;
  mst: string;          // Mã số thuế
  ten: string;          // Tên công ty
  tenVietTat?: string;  // Tên viết tắt
  diaChi?: string;      // Địa chỉ
  dienThoai?: string;   // Số điện thoại
  email?: string;       // Email
  nguoiDaiDien?: string;// Người đại diện
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Input tạo/cập nhật công ty */
export interface CongTyInput {
  mst: string;
  ten: string;
  tenVietTat?: string;
  diaChi?: string;
  dienThoai?: string;
  email?: string;
  nguoiDaiDien?: string;
  isActive?: boolean;
  isDefault?: boolean;
}

// ======================
// Filter & Search Types
// ======================

/** Filter cho danh sách hóa đơn */
export interface InvoiceFilter {
  fromDate: string;       // YYYY-MM-DD
  toDate: string;         // YYYY-MM-DD
  invoiceNumber?: string; // Số hóa đơn
  taxCode?: string;       // MST
  amountFrom?: number;    // Số tiền từ
  amountTo?: number;      // Số tiền đến
  status?: string;        // Trạng thái
}

/** Params cho API list */
export interface InvoiceListParams {
  page?: number;
  size?: number;
  state?: string;  // Pagination token
  sort?: string;
}

/** Params cho API chi tiết */
export interface InvoiceDetailParams {
  nbmst: string;    // MST người bán
  khhdon: string;   // Ký hiệu hóa đơn
  shdon: string;    // Số hóa đơn
  khmshdon: string; // Ký hiệu mẫu số
}

// ======================
// Config Types
// ======================

/** Cấu hình API */
export interface ApiConfig {
  id: string;
  name: string;
  congtyId: string;        // FK → ext_congty.id
  congty?: CongTy;         // Relation
  bearerToken: string;
  baseUrl: string;
  brandname?: string;
  batchSize: number;
  delayBetweenBatches: number;
  delayBetweenDetailCalls: number;
  maxRetries: number;
  lastSyncAt?: Date;
  lastSyncStatus?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Input tạo/cập nhật API config */
export interface ApiConfigInput {
  name: string;
  congtyId: string;
  bearerToken: string;
  baseUrl?: string;
  brandname?: string;
  batchSize?: number;
  delayBetweenBatches?: number;
  delayBetweenDetailCalls?: number;
  maxRetries?: number;
  isActive?: boolean;
}

/** Rate limit config */
export interface RateLimitConfig {
  minRequestInterval: number;
  maxRetries: number;
  retryDelays: number[];
}

// ======================
// Sync Types
// ======================

/** Loại hóa đơn */
export type InvoiceType = 'banra' | 'muavao';

/** Trạng thái sync */
export type SyncStatus = 'pending' | 'running' | 'completed' | 'failed';

/** Kết quả sync */
export interface SyncResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  errors?: string[];
}

/** Progress callback */
export interface SyncProgress {
  current: number;
  total: number;
  message: string;
  percentage: number;
}

/** Stream progress - chi tiết từng bước đồng bộ */
export interface StreamProgress {
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
    itemName?: string;
  };
  result?: {
    totalRecords: number;
    successCount: number;
    errorCount: number;
    detailResult?: {
      totalRecords: number;
      successCount: number;
      errorCount: number;
    };
  };
  error?: string;
  sessionId?: string;
}

/** Sync log */
export interface SyncLog {
  id: string;
  configId?: string;
  syncType: string;
  fromDate?: Date;
  toDate?: Date;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  status: SyncStatus;
  errorMessage?: string;
  startedAt: Date;
  completedAt?: Date;
}

// ======================
// Input Types
// ======================

/** Input tạo hóa đơn */
export interface CreateInvoiceInput {
  idServer: string;
  brandname?: string;
  congtyId?: string;
  nbmst: string;
  nbten?: string;
  nbdchi?: string;
  nmmst?: string;
  nmten?: string;
  nmdchi?: string;
  khmshdon: string;
  khhdon: string;
  shdon: string;
  mhso?: string;
  tgtcthue: number;
  tgtthue: number;
  tgtttbso: number;
  tdlap: string | Date;
  tthai?: string;
  loaihd: InvoiceType;
}

/** Input tạo chi tiết hóa đơn */
export interface CreateInvoiceDetailInput {
  idServer: string;
  idhdonServer: string;
  stt: number;
  ten: string;
  dvtinh?: string;
  sluong: number;
  dgia: number;
  thtien: number;
  tsuat: number;
  tthue: number;
}

/** Input sync hóa đơn */
export interface SyncInvoicesInput {
  invoiceType: InvoiceType;
  fromDate: string;
  toDate: string;
  brandname?: string;
  congtyId?: string;
}

// ======================
// UI Types
// ======================

/** Column cho table */
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

/** Option cho combobox */
export interface ComboboxOption {
  value: string;
  label: string;
}

/** Pagination info */
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
