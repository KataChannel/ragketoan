import prisma from '@/app/lib/prisma';
import {
  Invoice,
  InvoiceDetail,
  CreateInvoiceInput,
  CreateInvoiceDetailInput,
  InvoiceFilter,
  InvoiceType,
  SyncResult,
  InvoiceApiData,
  InvoiceDetailApiData,
  StreamProgress,
} from '@/app/types';
import { TaxApiService, createTaxApiService } from './tax-api.service';

// ============================================================================
// Invoice Database Service
// ============================================================================

export class InvoiceDbService {
  // ====================
  // Invoice CRUD
  // ====================

  /**
   * Tạo hoặc cập nhật hóa đơn
   */
  async upsertInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const data = {
      idServer: input.idServer,
      brandname: input.brandname,
      congtyId: input.congtyId,
      nbmst: input.nbmst,
      nbten: input.nbten,
      nbdchi: input.nbdchi,
      nmmst: input.nmmst,
      nmten: input.nmten,
      nmdchi: input.nmdchi,
      khmshdon: String(input.khmshdon), // Convert to string
      khhdon: input.khhdon,
      shdon: String(input.shdon), // Convert to string
      mhso: input.mhso,
      tgtcthue: input.tgtcthue,
      tgtthue: input.tgtthue,
      tgtttbso: input.tgtttbso,
      tdlap: new Date(input.tdlap),
      tthai: input.tthai != null ? String(input.tthai) : null, // Convert to string
      loaihd: input.loaihd,
    };

    const result = await prisma.ext_listhoadon.upsert({
      where: { idServer: input.idServer },
      update: data,
      create: data,
    });

    return this.mapToInvoice(result);
  }

  /**
   * Bulk upsert hóa đơn
   */
  async bulkUpsertInvoices(inputs: CreateInvoiceInput[]): Promise<SyncResult> {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const input of inputs) {
      try {
        await this.upsertInvoice(input);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Lỗi hóa đơn ${input.shdon}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      totalRecords: inputs.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Lấy danh sách hóa đơn
   */
  async getInvoices(options: {
    filter?: Partial<InvoiceFilter>;
    loaihd?: InvoiceType;
    page?: number;
    pageSize?: number;
    orderBy?: { field: string; direction: 'asc' | 'desc' };
  }): Promise<{ data: Invoice[]; total: number }> {
    const { filter, loaihd, page = 0, pageSize = 50, orderBy } = options;

    const where: Record<string, unknown> = {};

    if (loaihd) {
      where.loaihd = loaihd;
    }

    if (filter) {
      if (filter.congtyId) {
        where.congtyId = filter.congtyId;
      }
      if (filter.fromDate) {
        where.tdlap = { ...((where.tdlap as object) || {}), gte: new Date(filter.fromDate) };
      }
      if (filter.toDate) {
        // Cộng thêm 1 ngày để bao gồm dữ liệu của ngày kết thúc
        const toDate = new Date(filter.toDate);
        toDate.setHours(23, 59, 59, 999);
        where.tdlap = { ...((where.tdlap as object) || {}), lte: toDate };
      }
      if (filter.invoiceNumber) {
        where.shdon = { contains: filter.invoiceNumber };
      }
      if (filter.taxCode) {
        where.OR = [
          { nbmst: { contains: filter.taxCode } },
          { nmmst: { contains: filter.taxCode } },
        ];
      }
      if (filter.status) {
        where.tthai = filter.status;
      }
    }

    const [data, total] = await Promise.all([
      prisma.ext_listhoadon.findMany({
        where,
        skip: page * pageSize,
        take: pageSize,
        orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : { tdlap: 'desc' },
        include: { details: true },
      }),
      prisma.ext_listhoadon.count({ where }),
    ]);

    return {
      data: data.map((d) => this.mapToInvoice(d)),
      total,
    };
  }

  /**
   * Lấy hóa đơn theo ID
   */
  async getInvoiceById(id: string): Promise<Invoice | null> {
    const result = await prisma.ext_listhoadon.findUnique({
      where: { id },
      include: { details: { include: { products: true } } },
    });

    return result ? this.mapToInvoice(result) : null;
  }

  /**
   * Lấy hóa đơn theo idServer
   */
  async getInvoiceByIdServer(idServer: string): Promise<Invoice | null> {
    const result = await prisma.ext_listhoadon.findUnique({
      where: { idServer },
      include: { details: { include: { products: true } } },
    });

    return result ? this.mapToInvoice(result) : null;
  }

  // ====================
  // Invoice Detail CRUD
  // ====================

  /**
   * Tạo hoặc cập nhật chi tiết hóa đơn
   */
  async upsertInvoiceDetail(input: CreateInvoiceDetailInput): Promise<InvoiceDetail> {
    const data = {
      idServer: input.idServer,
      idhdonServer: input.idhdonServer,
      stt: input.stt,
      ten: input.ten,
      dvtinh: input.dvtinh,
      sluong: input.sluong,
      dgia: input.dgia,
      thtien: input.thtien,
      tsuat: input.tsuat,
      tthue: input.tthue,
    };

    const result = await prisma.ext_detailhoadon.upsert({
      where: { idServer: input.idServer },
      update: data,
      create: data,
    });

    return this.mapToInvoiceDetail(result);
  }

  /**
   * Bulk upsert chi tiết hóa đơn
   */
  async bulkUpsertInvoiceDetails(inputs: CreateInvoiceDetailInput[]): Promise<SyncResult> {
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const input of inputs) {
      try {
        await this.upsertInvoiceDetail(input);
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push(`Lỗi chi tiết ${input.ten}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      totalRecords: inputs.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Lấy chi tiết hóa đơn theo invoice id
   */
  async getInvoiceDetails(invoiceIdServer: string): Promise<InvoiceDetail[]> {
    const results = await prisma.ext_detailhoadon.findMany({
      where: { idhdonServer: invoiceIdServer },
      orderBy: { stt: 'asc' },
      include: { products: true },
    });

    return results.map((d) => this.mapToInvoiceDetail(d));
  }

  // ====================
  // Statistics
  // ====================

  /**
   * Lấy thống kê hóa đơn
   */
  async getInvoiceStats(loaihd?: InvoiceType): Promise<{
    totalInvoices: number;
    totalAmount: number;
    totalTax: number;
    byMonth: { month: string; count: number; amount: number }[];
  }> {
    const where = loaihd ? { loaihd } : {};

    const [totalInvoices, aggregates] = await Promise.all([
      prisma.ext_listhoadon.count({ where }),
      prisma.ext_listhoadon.aggregate({
        where,
        _sum: {
          tgtttbso: true,
          tgtthue: true,
        },
      }),
    ]);

    // Group by month (last 12 months)
    const byMonth = loaihd
      ? await prisma.$queryRaw<{ month: string; count: bigint; amount: number }[]>`
          SELECT 
            TO_CHAR(tdlap, 'YYYY-MM') as month,
            COUNT(*) as count,
            SUM(tgtttbso) as amount
          FROM ext_listhoadon
          WHERE loaihd = ${loaihd}
          GROUP BY TO_CHAR(tdlap, 'YYYY-MM')
          ORDER BY month DESC
          LIMIT 12
        `
      : await prisma.$queryRaw<{ month: string; count: bigint; amount: number }[]>`
          SELECT 
            TO_CHAR(tdlap, 'YYYY-MM') as month,
            COUNT(*) as count,
            SUM(tgtttbso) as amount
          FROM ext_listhoadon
          GROUP BY TO_CHAR(tdlap, 'YYYY-MM')
          ORDER BY month DESC
          LIMIT 12
        `;

    return {
      totalInvoices,
      totalAmount: Number(aggregates._sum.tgtttbso) || 0,
      totalTax: Number(aggregates._sum.tgtthue) || 0,
      byMonth: byMonth.map((row) => ({
        month: row.month,
        count: Number(row.count),
        amount: Number(row.amount),
      })),
    };
  }

  // ====================
  // Mappers
  // ====================

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToInvoice(data: any): Invoice {
    return {
      id: data.id,
      idServer: data.idServer,
      brandname: data.brandname,
      nbmst: data.nbmst,
      nbten: data.nbten,
      nbdchi: data.nbdchi,
      nmmst: data.nmmst,
      nmten: data.nmten,
      nmdchi: data.nmdchi,
      khmshdon: data.khmshdon,
      khhdon: data.khhdon,
      shdon: data.shdon,
      mhso: data.mhso,
      tgtcthue: Number(data.tgtcthue),
      tgtthue: Number(data.tgtthue),
      tgtttbso: Number(data.tgtttbso),
      tdlap: data.tdlap,
      tthai: data.tthai,
      loaihd: data.loaihd,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      details: data.details?.map((d: any) => this.mapToInvoiceDetail(d)),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToInvoiceDetail(data: any): InvoiceDetail {
    return {
      id: data.id,
      idServer: data.idServer,
      idhdonServer: data.idhdonServer,
      stt: data.stt,
      ten: data.ten,
      dvtinh: data.dvtinh,
      sluong: Number(data.sluong),
      dgia: Number(data.dgia),
      thtien: Number(data.thtien),
      tsuat: Number(data.tsuat),
      tthue: Number(data.tthue),
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      products: data.products,
    };
  }
}

// ============================================================================
// Sync Service
// ============================================================================

export class InvoiceSyncService {
  private dbService: InvoiceDbService;
  private taxApiService: TaxApiService | null = null;

  constructor() {
    this.dbService = new InvoiceDbService();
  }

  /**
   * Khởi tạo Tax API Service
   */
  initTaxApi(bearerToken: string, config?: { baseUrl?: string }): void {
    this.taxApiService = createTaxApiService(bearerToken, config);
  }

  /**
   * Đồng bộ hóa đơn từ API Thuế
   */
  async syncInvoices(options: {
    invoiceType: InvoiceType;
    fromDate: string;
    toDate: string;
    brandname?: string;
    congtyId?: string;
    syncDetails?: boolean; // Có đồng bộ chi tiết không
    delayBetweenDetails?: number; // Delay giữa các request lấy chi tiết (ms)
    onProgress?: (progress: { current: number; total: number; message: string; percentage: number }) => void;
  }): Promise<SyncResult & { detailResult?: SyncResult }> {
    if (!this.taxApiService) {
      throw new Error('Tax API Service chưa được khởi tạo. Gọi initTaxApi() trước.');
    }

    const { 
      invoiceType, 
      fromDate, 
      toDate, 
      brandname, 
      congtyId, 
      syncDetails = false,
      delayBetweenDetails = 2000,
      onProgress 
    } = options;

    // 1. Lấy danh sách hóa đơn từ API Thuế
    const invoices = await this.taxApiService.fetchAllInvoices(
      invoiceType,
      { fromDate, toDate },
      (progress) => {
        if (onProgress) {
          const basePercentage = syncDetails ? 30 : 50; // Chia tỷ lệ progress khác nếu sync details
          onProgress({
            ...progress,
            percentage: Math.round((progress.current / progress.total) * basePercentage),
          });
        }
      }
    );

    // 2. Chuyển đổi và lưu vào database
    const inputs: CreateInvoiceInput[] = invoices.map((inv) =>
      this.mapApiToCreateInput(inv, invoiceType, brandname, congtyId)
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const headerStartPercent = syncDetails ? 30 : 50;
    const headerEndPercent = syncDetails ? 50 : 100;

    for (let i = 0; i < inputs.length; i++) {
      try {
        await this.dbService.upsertInvoice(inputs[i]);
        successCount++;

        if (onProgress) {
          onProgress({
            current: successCount,
            total: inputs.length,
            message: `Đã lưu ${successCount}/${inputs.length} hóa đơn...`,
            percentage: headerStartPercent + Math.round((successCount / inputs.length) * (headerEndPercent - headerStartPercent)),
          });
        }
      } catch (error) {
        errorCount++;
        errors.push(
          `Lỗi hóa đơn ${inputs[i].shdon}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 3. Đồng bộ chi tiết hóa đơn nếu được yêu cầu
    let detailResult: SyncResult | undefined;
    if (syncDetails && successCount > 0) {
      detailResult = await this.syncAllInvoiceDetails({
        invoiceIdServers: inputs.filter((_, idx) => idx < successCount).map(inv => inv.idServer),
        delayBetweenCalls: delayBetweenDetails,
        onProgress: (progress) => {
          if (onProgress) {
            onProgress({
              ...progress,
              message: `Đồng bộ chi tiết: ${progress.current}/${progress.total}...`,
              percentage: 50 + Math.round((progress.current / progress.total) * 50), // 50-100%
            });
          }
        },
      });
    }

    // 4. Ghi log sync
    await this.logSync({
      syncType: invoiceType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      totalRecords: inputs.length,
      successCount,
      errorCount,
      status: errorCount > 0 ? 'completed' : 'completed',
      errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
    });

    return {
      totalRecords: inputs.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      detailResult,
    };
  }

  /**
   * Đồng bộ chi tiết cho nhiều hóa đơn
   */
  async syncAllInvoiceDetails(options: {
    invoiceIdServers: string[];
    delayBetweenCalls?: number;
    onProgress?: (progress: { current: number; total: number; message: string }) => void;
  }): Promise<SyncResult> {
    const { invoiceIdServers, delayBetweenCalls = 2000, onProgress } = options;

    let totalDetails = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < invoiceIdServers.length; i++) {
      try {
        const result = await this.syncInvoiceDetails(invoiceIdServers[i]);
        totalDetails += result.totalRecords;
        successCount += result.successCount;
        errorCount += result.errorCount;
        if (result.errors) {
          errors.push(...result.errors);
        }

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: invoiceIdServers.length,
            message: `Đã đồng bộ chi tiết ${i + 1}/${invoiceIdServers.length} hóa đơn`,
          });
        }

        // Rate limiting: đợi giữa các request
        if (i < invoiceIdServers.length - 1) {
          await this.delay(delayBetweenCalls);
        }
      } catch (error) {
        errorCount++;
        errors.push(`Lỗi chi tiết hóa đơn ${invoiceIdServers[i]}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    return {
      totalRecords: totalDetails,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Đồng bộ chi tiết hóa đơn
   */
  async syncInvoiceDetails(invoiceIdServer: string): Promise<SyncResult> {
    if (!this.taxApiService) {
      throw new Error('Tax API Service chưa được khởi tạo. Gọi initTaxApi() trước.');
    }

    // Lấy thông tin hóa đơn
    const invoice = await this.dbService.getInvoiceByIdServer(invoiceIdServer);
    if (!invoice) {
      throw new Error(`Không tìm thấy hóa đơn với idServer: ${invoiceIdServer}`);
    }

    console.log(`📋 Đồng bộ chi tiết hóa đơn: ${invoice.shdon} (${invoice.khhdon})`);
    console.log(`   - Invoice data: nbmst=${invoice.nbmst}, khhdon=${invoice.khhdon}, shdon=${invoice.shdon}, khmshdon=${invoice.khmshdon}`);

    try {
      // Lấy chi tiết từ API - đảm bảo các giá trị là string
      const params = {
        nbmst: String(invoice.nbmst),
        khhdon: String(invoice.khhdon),
        shdon: String(invoice.shdon),
        khmshdon: String(invoice.khmshdon),
      };
      
      console.log(`   - API params:`, JSON.stringify(params));
      
      const response = await this.taxApiService.fetchInvoiceDetails(params);

      console.log(`   - Full response keys:`, Object.keys(response));
      console.log(`   - Response preview:`, JSON.stringify(response).substring(0, 1000));

      // Lấy danh sách chi tiết từ response (hỗ trợ nhiều cấu trúc khác nhau)
      const details = this.extractDetailsFromResponse(response as unknown as Record<string, unknown>);
      
      console.log(`✅ Nhận được ${details.length} chi tiết từ API`);

      // Kiểm tra response có datas không
      if (details.length === 0) {
        console.log(`⚠️ Không có chi tiết cho hóa đơn ${invoice.shdon}`);
        return {
          totalRecords: 0,
          successCount: 0,
          errorCount: 0,
        };
      }

      // Lưu chi tiết vào database
      const inputs: CreateInvoiceDetailInput[] = details.map((detail) =>
        this.mapDetailApiToCreateInput(detail, invoiceIdServer)
      );

      return this.dbService.bulkUpsertInvoiceDetails(inputs);
    } catch (error) {
      console.error(`❌ Lỗi đồng bộ chi tiết hóa đơn ${invoice.shdon}:`, error);
      throw error;
    }
  }

  /**
   * Extract details từ response (hỗ trợ nhiều cấu trúc response khác nhau)
   */
  private extractDetailsFromResponse(response: Record<string, unknown>): InvoiceDetailApiData[] {
    // Thử các key khác nhau
    if (response.datas && Array.isArray(response.datas)) {
      return response.datas as InvoiceDetailApiData[];
    }
    
    if (response.data) {
      if (Array.isArray(response.data)) {
        return response.data as InvoiceDetailApiData[];
      }
      // Nếu data là object đơn lẻ, wrap thành array
      return [response.data as InvoiceDetailApiData];
    }
    
    // Thử key "hddvu" (hàng hóa dịch vụ)
    if (response.hddvu && Array.isArray(response.hddvu)) {
      return response.hddvu as InvoiceDetailApiData[];
    }
    
    // Thử key "chitiet" 
    if (response.chitiet && Array.isArray(response.chitiet)) {
      return response.chitiet as InvoiceDetailApiData[];
    }
    
    // Thử key "details"
    if (response.details && Array.isArray(response.details)) {
      return response.details as InvoiceDetailApiData[];
    }

    // Nếu response có các field của detail (stt, ten, sluong...), wrap thành array
    if (response.stt !== undefined && response.ten !== undefined) {
      return [response as unknown as InvoiceDetailApiData];
    }

    // Tìm trong tất cả các key để tìm array có cấu trúc detail
    for (const key of Object.keys(response)) {
      const value = response[key];
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        // Kiểm tra xem có phải là detail không (có ten hoặc stt)
        if (firstItem && (firstItem.ten !== undefined || firstItem.stt !== undefined)) {
          console.log(`   - Found details in key "${key}"`);
          return value as InvoiceDetailApiData[];
        }
      }
    }

    return [];
  }

  /**
   * Map API data to CreateInvoiceInput
   */
  private mapApiToCreateInput(
    data: InvoiceApiData,
    invoiceType: InvoiceType,
    brandname?: string,
    congtyId?: string
  ): CreateInvoiceInput {
    return {
      idServer: data.id,
      brandname,
      congtyId,
      nbmst: data.nbmst,
      nbten: data.nbten,
      nbdchi: data.nbdchi,
      nmmst: data.nmmst,
      nmten: data.nmten,
      nmdchi: data.nmdchi,
      khmshdon: data.khmshdon,
      khhdon: data.khhdon,
      shdon: data.shdon,
      mhso: data.mhso,
      tgtcthue: data.tgtcthue,
      tgtthue: data.tgtthue,
      tgtttbso: data.tgtttbso,
      tdlap: data.tdlap,
      tthai: data.tthai,
      loaihd: invoiceType,
    };
  }

  /**
   * Map Detail API data to CreateInvoiceDetailInput
   */
  private mapDetailApiToCreateInput(
    data: InvoiceDetailApiData,
    invoiceIdServer: string
  ): CreateInvoiceDetailInput {
    // Tạo idServer cho chi tiết nếu API không trả về
    const detailIdServer = data.id || `${invoiceIdServer}_${data.stt}`;
    
    return {
      idServer: detailIdServer,
      idhdonServer: invoiceIdServer,
      stt: data.stt || 1,
      ten: data.ten || 'Không có tên',
      dvtinh: data.dvtinh,
      sluong: data.sluong || 1,
      dgia: data.dgia || 0,
      thtien: data.thtcthue || data.thtien || 0,
      tsuat: data.tsuat || 0,
      tthue: data.tthue || 0,
    };
  }

  // ============================================================================
  // Stream Progress Sync - Đồng bộ với streaming progress và abort support
  // ============================================================================

  /**
   * Đồng bộ hóa đơn với streaming progress
   * Hỗ trợ abort signal để dừng giữa chừng
   */
  async syncInvoicesWithProgress(options: {
    invoiceType: InvoiceType;
    fromDate: string;
    toDate: string;
    brandname?: string;
    congtyId?: string;
    syncDetails?: boolean;
    delayBetweenDetails?: number;
    abortSignal?: AbortSignal;
    onProgress?: (progress: StreamProgress) => void;
  }): Promise<SyncResult & { detailResult?: SyncResult }> {
    if (!this.taxApiService) {
      throw new Error('Tax API Service chưa được khởi tạo. Gọi initTaxApi() trước.');
    }

    const { 
      invoiceType, 
      fromDate, 
      toDate, 
      brandname, 
      congtyId, 
      syncDetails = false,
      delayBetweenDetails = 2000,
      abortSignal,
      onProgress 
    } = options;

    // Check abort signal helper
    const checkAbort = () => {
      if (abortSignal?.aborted) {
        throw new Error('ABORTED');
      }
    };

    // Phase 1: Lấy danh sách hóa đơn từ API Thuế
    onProgress?.({
      type: 'progress',
      phase: 'fetch',
      message: 'Đang lấy danh sách hóa đơn từ API Thuế...',
      percentage: 0,
    });

    checkAbort();

    const invoices = await this.taxApiService.fetchAllInvoices(
      invoiceType,
      { fromDate, toDate },
      (progress) => {
        checkAbort();
        onProgress?.({
          type: 'progress',
          phase: 'fetch',
          current: progress.current,
          total: progress.total,
          message: `Đang tải ${progress.current}/${progress.total} hóa đơn từ API...`,
          percentage: Math.round((progress.current / progress.total) * 30),
        });
      }
    );

    // Phase 2: Lưu vào database
    const inputs: CreateInvoiceInput[] = invoices.map((inv) =>
      this.mapApiToCreateInput(inv, invoiceType, brandname, congtyId)
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    const savedInvoiceIdServers: string[] = [];

    onProgress?.({
      type: 'progress',
      phase: 'save',
      current: 0,
      total: inputs.length,
      message: `Đang lưu 0/${inputs.length} hóa đơn...`,
      percentage: 30,
    });

    for (let i = 0; i < inputs.length; i++) {
      checkAbort();
      
      try {
        await this.dbService.upsertInvoice(inputs[i]);
        successCount++;
        savedInvoiceIdServers.push(inputs[i].idServer);

        // Gửi progress mỗi 50 hóa đơn hoặc hóa đơn cuối cùng để tránh quá tải frontend
        if (successCount % 50 === 0 || i === inputs.length - 1) {
          onProgress?.({
            type: 'invoice',
            phase: 'save',
            current: successCount,
            total: inputs.length,
            message: `Đang lưu hóa đơn vào hệ thống: ${successCount}/${inputs.length}...`,
            percentage: 30 + Math.round((successCount / inputs.length) * (syncDetails ? 20 : 70)),
            invoice: {
              shdon: String(inputs[i].shdon),
              khhdon: String(inputs[i].khhdon),
              nbten: inputs[i].nbten,
              nmten: inputs[i].nmten,
            },
          });
        }
      } catch (error) {
        errorCount++;
        errors.push(`Lỗi hóa đơn ${inputs[i].shdon}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Phase 3: Đồng bộ chi tiết nếu được yêu cầu
    let detailResult: SyncResult | undefined;
    if (syncDetails && savedInvoiceIdServers.length > 0) {
      detailResult = await this.syncAllInvoiceDetailsWithProgress({
        invoiceIdServers: savedInvoiceIdServers,
        delayBetweenCalls: delayBetweenDetails,
        abortSignal,
        onProgress: (progress) => {
          onProgress?.({
            ...progress,
            percentage: 50 + Math.round((progress.current! / progress.total!) * 50),
          });
        },
      });
    }

    // Log sync
    await this.logSync({
      syncType: invoiceType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      totalRecords: inputs.length,
      successCount,
      errorCount,
      status: abortSignal?.aborted ? 'aborted' : (errorCount > 0 ? 'completed_with_errors' : 'completed'),
      errorMessage: errors.length > 0 ? errors.join('; ') : undefined,
    });

    return {
      totalRecords: inputs.length,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
      detailResult,
    };
  }

  /**
   * Đồng bộ chi tiết cho nhiều hóa đơn với streaming progress
   */
  async syncAllInvoiceDetailsWithProgress(options: {
    invoiceIdServers: string[];
    delayBetweenCalls?: number;
    abortSignal?: AbortSignal;
    onProgress?: (progress: StreamProgress) => void;
  }): Promise<SyncResult> {
    const { invoiceIdServers, delayBetweenCalls = 2000, abortSignal, onProgress } = options;

    let totalDetails = 0;
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < invoiceIdServers.length; i++) {
      // Check abort
      if (abortSignal?.aborted) {
        break;
      }

      try {
        // Lấy thông tin hóa đơn để hiển thị
        const invoice = await this.dbService.getInvoiceByIdServer(invoiceIdServers[i]);
        
        onProgress?.({
          type: 'detail',
          phase: 'detail',
          current: i + 1,
          total: invoiceIdServers.length,
          message: `Đang đồng bộ chi tiết ${i + 1}/${invoiceIdServers.length} hóa đơn...`,
          detail: {
            invoiceShdon: invoice?.shdon || invoiceIdServers[i],
            current: i + 1,
            total: invoiceIdServers.length,
          },
        });

        const result = await this.syncInvoiceDetails(invoiceIdServers[i]);
        totalDetails += result.totalRecords;
        successCount += result.successCount;
        errorCount += result.errorCount;
        if (result.errors) {
          errors.push(...result.errors);
        }

        // Rate limiting: đợi giữa các request
        if (i < invoiceIdServers.length - 1 && !abortSignal?.aborted) {
          await this.delay(delayBetweenCalls);
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'ABORTED') {
          break;
        }
        errorCount++;
        errors.push(`Lỗi chi tiết hóa đơn ${invoiceIdServers[i]}: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    }

    return {
      totalRecords: totalDetails,
      successCount,
      errorCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Log sync result
   */
  private async logSync(data: {
    syncType: string;
    fromDate: Date;
    toDate: Date;
    totalRecords: number;
    successCount: number;
    errorCount: number;
    status: string;
    errorMessage?: string;
  }): Promise<void> {
    await prisma.ext_synclog.create({
      data: {
        ...data,
        completedAt: new Date(),
      },
    });
  }
}

// ============================================================================
// Export instances
// ============================================================================

export const invoiceDbService = new InvoiceDbService();
export const invoiceSyncService = new InvoiceSyncService();
