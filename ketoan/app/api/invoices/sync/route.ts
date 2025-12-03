import { NextRequest, NextResponse } from 'next/server';
import { invoiceSyncService } from '@/app/services';
import { InvoiceType } from '@/app/types';

// POST /api/invoices/sync - Đồng bộ hóa đơn từ API Thuế
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      bearerToken, 
      invoiceType, 
      fromDate, 
      toDate, 
      brandname,
      baseUrl 
    } = body;

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
    invoiceSyncService.initTaxApi(bearerToken, { baseUrl });

    // Sync invoices
    const result = await invoiceSyncService.syncInvoices({
      invoiceType: invoiceType as InvoiceType,
      fromDate,
      toDate,
      brandname,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã đồng bộ ${result.successCount}/${result.totalRecords} hóa đơn`,
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
