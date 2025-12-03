import { NextRequest, NextResponse } from 'next/server';
import { invoiceSyncService } from '@/app/services';

// POST /api/invoices/[id]/sync-details - Đồng bộ chi tiết hóa đơn
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { bearerToken, baseUrl } = body;

    // Validate required fields
    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: 'Bearer token là bắt buộc' },
        { status: 400 }
      );
    }

    // Init Tax API Service
    invoiceSyncService.initTaxApi(bearerToken, { baseUrl });

    // Sync invoice details
    const result = await invoiceSyncService.syncInvoiceDetails(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Đã đồng bộ ${result.successCount}/${result.totalRecords} chi tiết`,
    });
  } catch (error) {
    console.error('Error syncing invoice details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
