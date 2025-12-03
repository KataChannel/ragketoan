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
        Accept: 'application/json',
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

    const searchQuery = this.buildSearchQuery(filter);

    const queryParams = new URLSearchParams({
      sort: params.sort || 'tdlap:desc,khmshdon:asc,shdon:desc',
      size: (params.size || 50).toString(),
      page: (params.page || 0).toString(),
      ...(searchQuery && { search: searchQuery }),
      ...(params.state && { state: params.state }),
    });

    const response = await this.executeWithRetry(() =>
      this.axiosInstance.get<InvoiceListResponse>(`${endpoint}?${queryParams.toString()}`)
    );

    return response.data;
  }

  /**
   * Lấy chi tiết hóa đơn
   */
  async fetchInvoiceDetails(params: InvoiceDetailParams): Promise<InvoiceDetailResponse> {
    // Validate MST format (10 or 13 digits)
    const mstRegex = /^\d{10}(\d{3})?$/;
    if (!mstRegex.test(params.nbmst)) {
      throw new Error('MST không đúng định dạng (10 hoặc 13 số)');
    }

    const queryParams = new URLSearchParams({
      nbmst: params.nbmst,
      khhdon: params.khhdon,
      shdon: params.shdon,
      khmshdon: params.khmshdon,
    });

    const response = await this.executeWithRetry(() =>
      this.axiosInstance.get<InvoiceDetailResponse>(
        `/query/invoices/detail?${queryParams.toString()}`
      )
    );

    return response.data;
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
