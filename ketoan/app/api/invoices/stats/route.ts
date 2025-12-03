import { NextResponse } from 'next/server';
import { invoiceDbService } from '@/app/services';

// GET /api/invoices/stats - Lấy thống kê hóa đơn
export async function GET() {
  try {
    const [statsBanra, statsMuavao, statsAll] = await Promise.all([
      invoiceDbService.getInvoiceStats('banra'),
      invoiceDbService.getInvoiceStats('muavao'),
      invoiceDbService.getInvoiceStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        banra: statsBanra,
        muavao: statsMuavao,
        all: statsAll,
      },
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
