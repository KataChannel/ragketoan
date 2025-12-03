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
      nbmst: input.nbmst,
      nbten: input.nbten,
      nbdchi: input.nbdchi,
      nmmst: input.nmmst,
      nmten: input.nmten,
      nmdchi: input.nmdchi,
      khmshdon: input.khmshdon,
      khhdon: input.khhdon,
      shdon: input.shdon,
      mhso: input.mhso,
      tgtcthue: input.tgtcthue,
      tgtthue: input.tgtthue,
      tgtttbso: input.tgtttbso,
      tdlap: new Date(input.tdlap),
      tthai: input.tthai,
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
      if (filter.fromDate) {
        where.tdlap = { ...((where.tdlap as object) || {}), gte: new Date(filter.fromDate) };
      }
      if (filter.toDate) {
        where.tdlap = { ...((where.tdlap as object) || {}), lte: new Date(filter.toDate) };
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
      data: data.map(this.mapToInvoice),
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

    return results.map(this.mapToInvoiceDetail);
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
      details: data.details?.map(this.mapToInvoiceDetail),
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
    onProgress?: (progress: { current: number; total: number; message: string; percentage: number }) => void;
  }): Promise<SyncResult> {
    if (!this.taxApiService) {
      throw new Error('Tax API Service chưa được khởi tạo. Gọi initTaxApi() trước.');
    }

    const { invoiceType, fromDate, toDate, brandname, onProgress } = options;

    // 1. Lấy danh sách hóa đơn từ API Thuế
    const invoices = await this.taxApiService.fetchAllInvoices(
      invoiceType,
      { fromDate, toDate },
      (progress) => {
        if (onProgress) {
          onProgress({
            ...progress,
            percentage: Math.round((progress.current / progress.total) * 50), // 0-50%
          });
        }
      }
    );

    // 2. Chuyển đổi và lưu vào database
    const inputs: CreateInvoiceInput[] = invoices.map((inv) =>
      this.mapApiToCreateInput(inv, invoiceType, brandname)
    );

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < inputs.length; i++) {
      try {
        await this.dbService.upsertInvoice(inputs[i]);
        successCount++;

        if (onProgress) {
          onProgress({
            current: successCount,
            total: inputs.length,
            message: `Đã lưu ${successCount}/${inputs.length} hóa đơn...`,
            percentage: 50 + Math.round((successCount / inputs.length) * 50), // 50-100%
          });
        }
      } catch (error) {
        errorCount++;
        errors.push(
          `Lỗi hóa đơn ${inputs[i].shdon}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // 3. Ghi log sync
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
    };
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

    // Lấy chi tiết từ API
    const response = await this.taxApiService.fetchInvoiceDetails({
      nbmst: invoice.nbmst,
      khhdon: invoice.khhdon,
      shdon: invoice.shdon,
      khmshdon: invoice.khmshdon,
    });

    // Lưu chi tiết vào database
    const inputs: CreateInvoiceDetailInput[] = response.datas.map((detail) =>
      this.mapDetailApiToCreateInput(detail, invoiceIdServer)
    );

    return this.dbService.bulkUpsertInvoiceDetails(inputs);
  }

  /**
   * Map API data to CreateInvoiceInput
   */
  private mapApiToCreateInput(
    data: InvoiceApiData,
    invoiceType: InvoiceType,
    brandname?: string
  ): CreateInvoiceInput {
    return {
      idServer: data.id,
      brandname,
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
    return {
      idServer: data.id,
      idhdonServer: invoiceIdServer,
      stt: data.stt,
      ten: data.ten,
      dvtinh: data.dvtinh,
      sluong: data.sluong,
      dgia: data.dgia,
      thtien: data.thtcthue || data.thtien || 0,
      tsuat: data.tsuat,
      tthue: data.tthue,
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
