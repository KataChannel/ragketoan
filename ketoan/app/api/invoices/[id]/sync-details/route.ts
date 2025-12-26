import { NextRequest, NextResponse } from 'next/server';
import { invoiceSyncService } from '@/app/services';
import prisma from '@/app/lib/prisma';

// POST /api/invoices/[id]/sync-details - Đồng bộ chi tiết hóa đơn
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { configId, bearerToken: manualToken, baseUrl } = body;

    let bearerToken = manualToken;
    let effectiveBaseUrl = baseUrl;

    // Nếu có configId, lấy token từ database
    if (configId) {
      const config = await prisma.ext_apiconfig.findUnique({
        where: { id: configId },
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
    }

    // Validate required fields
    if (!bearerToken) {
      return NextResponse.json(
        { success: false, error: 'Bearer token là bắt buộc' },
        { status: 400 }
      );
    }

    // Lấy hóa đơn từ database để lấy idServer
    const invoice = await prisma.ext_listhoadon.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }

    // Init Tax API Service
    invoiceSyncService.initTaxApi(bearerToken, { baseUrl: effectiveBaseUrl });

    // Sync invoice details using idServer
    const result = await invoiceSyncService.syncInvoiceDetails(invoice.idServer);

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
