import { NextRequest, NextResponse } from 'next/server';
import { invoiceDbService } from '@/app/services';
import { InvoiceType } from '@/app/types';

// GET /api/invoices - Lấy danh sách hóa đơn
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const loaihd = searchParams.get('loaihd') as InvoiceType | null;
    const page = parseInt(searchParams.get('page') || '0');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const congtyId = searchParams.get('congtyId');
    const invoiceNumber = searchParams.get('invoiceNumber');
    const taxCode = searchParams.get('taxCode');
    const status = searchParams.get('status');
    const orderField = searchParams.get('orderField') || 'tdlap';
    const orderDir = (searchParams.get('orderDir') || 'desc') as 'asc' | 'desc';

    const filter = {
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(congtyId && { congtyId }),
      ...(invoiceNumber && { invoiceNumber }),
      ...(taxCode && { taxCode }),
      ...(status && { status }),
    };

    const result = await invoiceDbService.getInvoices({
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      loaihd: loaihd || undefined,
      page,
      pageSize,
      orderBy: { field: orderField, direction: orderDir },
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      total: result.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Tạo hóa đơn mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const invoice = await invoiceDbService.upsertInvoice(body);
    
    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
