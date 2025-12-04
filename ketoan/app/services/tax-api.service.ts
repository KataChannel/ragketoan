import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  InvoiceListResponse,
  InvoiceDetailResponse,
  InvoiceFilter,
  InvoiceListParams,
  InvoiceDetailParams,
  InvoiceType,
  ApiConfig,
} from '@/app/types';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_BASE_URL = 'https://hoadondientu.gdt.gov.vn:30000';
const DEFAULT_TIMEOUT = 30000;
const RETRY_DELAYS = [2000, 5000, 10000];

// ============================================================================
// Tax API Service
// ============================================================================

export class TaxApiService {
  private axiosInstance: AxiosInstance;
  private config: Partial<ApiConfig>;

  constructor(bearerToken: string, config?: Partial<ApiConfig>) {
    this.config = {
      baseUrl: DEFAULT_BASE_URL,
      maxRetries: 3,
      ...config,
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'vi',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'End-Point': '/tra-cuu/tra-cuu-hoa-don',
      },
      timeout: DEFAULT_TIMEOUT,
    });
  }

  // ====================
  // Helper Methods
  // ====================

  /**
   * Validate JWT Bearer Token format
   */
  static validateBearerToken(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    return parts.length === 3 && parts.every((part) => part.length > 0);
  }

  /**
   * Build RSQL search query
   */
  private buildSearchQuery(filter: InvoiceFilter): string {
    const searchParts: string[] = [];

    // Date range (required) - format: DD/MM/YYYY
    if (filter.fromDate) {
      const fromDateFormatted = this.formatDateForApi(filter.fromDate);
      searchParts.push(`tdlap=ge=${fromDateFormatted}T00:00:00`);
    }
    if (filter.toDate) {
      const toDateFormatted = this.formatDateForApi(filter.toDate);
      searchParts.push(`tdlap=le=${toDateFormatted}T23:59:59`);
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

  /**
   * Format date to DD/MM/YYYY for API
   * Input can be: YYYY-MM-DD, DD/MM/YYYY, or Date object
   */
  private formatDateForApi(dateInput: string): string {
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
      return dateInput;
    }
    
    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [year, month, day] = dateInput.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Try parsing as date
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    // Return as-is if cannot parse
    return dateInput;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry<T>(
    requestFn: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        // Log chi tiết lỗi để debug
        if (status === 400) {
          console.error('❌ Bad Request (400) - Response:', JSON.stringify(error.response?.data, null, 2));
          console.error('❌ Request URL:', error.config?.url);
          console.error('❌ Request Headers:', JSON.stringify(error.config?.headers, null, 2));
        }

        // Retry for rate limit errors
        if ((status === 409 || status === 429) && retryCount < (this.config.maxRetries || 3)) {
          const delay = RETRY_DELAYS[retryCount] || 10000;
          console.warn(`⚠️ Rate limit hit (${status}), retry in ${delay}ms...`);
          await this.delay(delay);
          return this.executeWithRetry(requestFn, retryCount + 1);
        }

        // Retry for server overload
        if (status === 503 && retryCount < (this.config.maxRetries || 3)) {
          const delay = Math.min(15000 * (retryCount + 1), 60000);
          console.warn(`⚠️ Server overload (503), retry in ${delay}ms...`);
          await this.delay(delay);
          return this.executeWithRetry(requestFn, retryCount + 1);
        }

        // Retry for timeout
        if (error.code === 'ECONNABORTED' && retryCount < (this.config.maxRetries || 3)) {
          const delay = RETRY_DELAYS[retryCount] || 10000;
          console.warn(`⚠️ Request timeout, retry in ${delay}ms...`);
          await this.delay(delay);
          return this.executeWithRetry(requestFn, retryCount + 1);
        }
      }
      throw error;
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ====================
  // API Methods
  // ====================

  /**
   * Lấy danh sách hóa đơn bán ra
   */
  async fetchSoldInvoices(
    filter: InvoiceFilter,
    params: InvoiceListParams = {}
  ): Promise<InvoiceListResponse> {
    return this.fetchInvoices('banra', filter, params);
  }

  /**
   * Lấy danh sách hóa đơn mua vào
   */
  async fetchPurchaseInvoices(
    filter: InvoiceFilter,
    params: InvoiceListParams = {}
  ): Promise<InvoiceListResponse> {
    return this.fetchInvoices('muavao', filter, params);
  }

  /**
   * Lấy danh sách hóa đơn (generic)
   */
  async fetchInvoices(
    invoiceType: InvoiceType,
    filter: InvoiceFilter,
    params: InvoiceListParams = {}
  ): Promise<InvoiceListResponse> {
    const endpoint =
      invoiceType === 'banra' ? '/query/invoices/sold' : '/query/invoices/purchase';

    // Action header tùy theo loại hóa đơn (URL encoded để tránh lỗi invalid character)
    const actionHeader = invoiceType === 'banra' 
      ? encodeURIComponent('Tìm kiếm (hóa đơn bán ra)') 
      : encodeURIComponent('Tìm kiếm (hóa đơn mua vào)');

    const searchQuery = this.buildSearchQuery(filter);

    const queryParams = new URLSearchParams({
      sort: params.sort || 'tdlap:desc,khmshdon:asc,shdon:desc',
      size: (params.size || 50).toString(),
      page: (params.page || 0).toString(),
      ...(searchQuery && { search: searchQuery }),
      ...(params.state && { state: params.state }),
    });

    const fullUrl = `${endpoint}?${queryParams.toString()}`;
    console.log('📡 Fetching invoices:', fullUrl);

    const response = await this.executeWithRetry(() =>
      this.axiosInstance.get<InvoiceListResponse>(`${endpoint}?${queryParams.toString()}`, {
        headers: {
          'Action': actionHeader,
        }
      })
    );

    return response.data;
  }

  /**
   * Lấy chi tiết hóa đơn
   */
  async fetchInvoiceDetails(params: InvoiceDetailParams): Promise<InvoiceDetailResponse> {
    // Log params để debug
    console.log('🔍 fetchInvoiceDetails params:', JSON.stringify(params));
    
    // Validate MST - có thể có dấu gạch ngang cho chi nhánh (ví dụ: 0123456789-001)
    if (!params.nbmst || params.nbmst.trim() === '') {
      console.error('❌ MST người bán trống');
      throw new Error('MST người bán không được để trống');
    }

    const queryParams = new URLSearchParams({
      nbmst: params.nbmst.trim(),
      khhdon: params.khhdon.trim(),
      shdon: String(params.shdon).trim(),
      khmshdon: String(params.khmshdon).trim(),
    });

    const fullUrl = `/query/invoices/detail?${queryParams.toString()}`;
    console.log('📡 Fetching invoice detail:', fullUrl);

    try {
      const response = await this.executeWithRetry(() =>
        this.axiosInstance.get<InvoiceDetailResponse>(
          fullUrl,
          {
            headers: {
              'Action': encodeURIComponent('Xem hóa đơn (hóa đơn bán ra)'),
            }
          }
        )
      );

      console.log('📦 Invoice detail response status:', response.status);
      console.log('📦 Invoice detail response keys:', Object.keys(response.data || {}));
      console.log('📦 Invoice detail response:', JSON.stringify(response.data).substring(0, 1500));

      return response.data;
    } catch (error) {
      console.error('❌ Error fetching invoice detail:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả hóa đơn (với pagination)
   */
  async fetchAllInvoices(
    invoiceType: InvoiceType,
    filter: InvoiceFilter,
    onProgress?: (progress: { current: number; total: number; message: string }) => void
  ): Promise<InvoiceListResponse['datas']> {
    const allData: InvoiceListResponse['datas'] = [];
    let currentState: string | undefined;
    let page = 0;
    let total = 0;

    do {
      const response = await this.fetchInvoices(invoiceType, filter, {
        page,
        size: 50,
        state: currentState,
      });

      allData.push(...response.datas);
      currentState = response.state;
      total = response.total;
      page++;

      // Progress callback
      if (onProgress) {
        onProgress({
          current: allData.length,
          total,
          message: `Đã tải ${allData.length}/${total} hóa đơn...`,
        });
      }

      // Rate limiting: đợi giữa các request
      if (currentState) {
        const delayTime = this.getDelayTime(total);
        await this.delay(delayTime);
      }
    } while (currentState && allData.length < total);

    return allData;
  }

  /**
   * Tính thời gian delay dựa trên tổng số records
   */
  private getDelayTime(total: number): number {
    if (total < 500) return 1000;
    if (total < 1000) return 1500;
    return 2000;
  }
}

// ============================================================================
// Factory function
// ============================================================================

export function createTaxApiService(bearerToken: string, config?: Partial<ApiConfig>): TaxApiService {
  if (!TaxApiService.validateBearerToken(bearerToken)) {
    throw new Error('Bearer token không hợp lệ');
  }
  return new TaxApiService(bearerToken, config);
}

// ============================================================================
// Error handling
// ============================================================================

export interface TaxApiError {
  status: number;
  message: string;
  code: string;
  retryable: boolean;
}

export function parseTaxApiError(error: unknown): TaxApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 500;

    const errorMap: Record<number, { message: string; code: string; retryable: boolean }> = {
      401: { message: 'Token hết hạn hoặc không hợp lệ', code: 'UNAUTHORIZED', retryable: false },
      403: { message: 'Không có quyền truy cập', code: 'FORBIDDEN', retryable: false },
      404: { message: 'Không tìm thấy endpoint', code: 'NOT_FOUND', retryable: false },
      409: { message: 'Rate limit - quá nhiều request', code: 'RATE_LIMIT', retryable: true },
      429: { message: 'Too many requests', code: 'TOO_MANY_REQUESTS', retryable: true },
      500: { message: 'Lỗi server', code: 'SERVER_ERROR', retryable: true },
      503: { message: 'Server quá tải', code: 'SERVICE_UNAVAILABLE', retryable: true },
    };

    const errorInfo = errorMap[status] || {
      message: axiosError.message || 'Lỗi không xác định',
      code: 'UNKNOWN_ERROR',
      retryable: false,
    };

    return { status, ...errorInfo };
  }

  return {
    status: 500,
    message: error instanceof Error ? error.message : 'Lỗi không xác định',
    code: 'UNKNOWN_ERROR',
    retryable: false,
  };
}
