import { NextRequest, NextResponse } from 'next/server';
import { invoiceSyncService } from '@/app/services';
import { InvoiceType } from '@/app/types';
import prisma from '@/app/lib/prisma';

// POST /api/invoices/sync - Đồng bộ hóa đơn từ API Thuế
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      configId,
      bearerToken: manualToken, 
      invoiceType, 
      fromDate, 
      toDate, 
      brandname,
      congtyId,
      baseUrl,
      syncDetails = false, // Có đồng bộ chi tiết không
      delayBetweenDetails = 2000, // Delay giữa các request chi tiết (ms)
    } = body;

    let bearerToken = manualToken;
    let effectiveBaseUrl = baseUrl;
    let effectiveBrandname = brandname;
    let effectiveCongtyId = congtyId;

    // Nếu có configId, lấy thông tin từ database
    if (configId) {
      const config = await prisma.ext_apiconfig.findUnique({
        where: { id: configId },
        include: {
          congty: {
            select: { id: true, mst: true, ten: true }
          }
        }
      });

      if (!config) {
        return NextResponse.json(
          { success: false, error: 'Không tìm thấy cấu hình API' },
          { status: 404 }
        );
      }

      if (!config.isActive) {
        return NextResponse.json(
          { success: false, error: 'Cấu hình API đã bị vô hiệu hóa' },
          { status: 400 }
        );
      }

      bearerToken = config.bearerToken;
      effectiveBaseUrl = config.baseUrl || baseUrl;
      effectiveBrandname = brandname || config.brandname;
      effectiveCongtyId = config.congtyId;
    }

    // Validate required fields
    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: 'Bearer token là bắt buộc' },
        { status: 400 }
      );
    }

    if (!invoiceType || !['banra', 'muavao'].includes(invoiceType)) {
      return NextResponse.json(
        { success: false, error: 'Loại hóa đơn không hợp lệ (banra hoặc muavao)' },
        { status: 400 }
      );
    }

    if (!fromDate || !toDate) {
      return NextResponse.json(
        { success: false, error: 'Ngày bắt đầu và kết thúc là bắt buộc' },
        { status: 400 }
      );
    }

    // Init Tax API Service
    invoiceSyncService.initTaxApi(bearerToken, { baseUrl: effectiveBaseUrl });

    // Sync invoices
    const result = await invoiceSyncService.syncInvoices({
      invoiceType: invoiceType as InvoiceType,
      fromDate,
      toDate,
      brandname: effectiveBrandname,
      congtyId: effectiveCongtyId,
      syncDetails,
      delayBetweenDetails,
    });

    // Cập nhật lastSyncAt nếu dùng configId
    if (configId) {
      await prisma.ext_apiconfig.update({
        where: { id: configId },
        data: {
          lastSyncAt: new Date(),
          lastSyncStatus: result.errorCount > 0 ? 'partial' : 'success',
        }
      });
    }

    // Build response message
    let message = `Đã đồng bộ ${result.successCount}/${result.totalRecords} hóa đơn`;
    if (result.detailResult) {
      message += `. Chi tiết: ${result.detailResult.successCount}/${result.detailResult.totalRecords} dòng`;
    }

    return NextResponse.json({
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    console.error('Error syncing invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
