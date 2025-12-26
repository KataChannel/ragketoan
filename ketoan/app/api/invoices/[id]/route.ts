import { NextRequest, NextResponse } from 'next/server';
import { invoiceDbService } from '@/app/services';

// GET /api/invoices/[id] - Lấy hóa đơn theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const invoice = await invoiceDbService.getInvoiceById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy hóa đơn' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
