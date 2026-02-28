import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const congtyId = searchParams.get('congtyId');
    const fromDateStr = searchParams.get('fromDate');
    const toDateStr = searchParams.get('toDate');

    // Mặc định lấy tháng hiện tại nếu không có
    const currentDate = new Date();
    const fromDate = fromDateStr ? new Date(fromDateStr) : new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const toDate = toDateStr ? new Date(toDateStr) : new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);

    if (fromDateStr) {
      fromDate.setHours(0, 0, 0, 0);
    }
    if (toDateStr) {
      toDate.setHours(23, 59, 59, 999);
    }

    const whereCondition: any = {
      tdlap: {
        gte: fromDate,
        lte: toDate,
      },
    };

    if (congtyId) {
      whereCondition.congtyId = congtyId;
    }

    // Lấy hóa đơn bán ra
    const banra = await prisma.ext_listhoadon.findMany({
      where: { ...whereCondition, loaihd: 'banra' },
      include: {
        details: {
          orderBy: { stt: 'asc' }
        }
      },
      orderBy: { tdlap: 'asc' }, // Sắp xếp thứ tự theo Ngày Lập lớn dần
    });

    // Lấy hóa đơn mua vào
    const muavao = await prisma.ext_listhoadon.findMany({
      where: { ...whereCondition, loaihd: 'muavao' },
      include: {
        details: {
          orderBy: { stt: 'asc' }
        }
      },
      orderBy: { tdlap: 'asc' }, // Sắp xếp thứ tự theo Ngày Lập lớn dần
    });

    // Hàm map dữ liệu
    const mapToExcelData = (invoices: any[]) => {
      const data: any[] = [];
      invoices.forEach(inv => {
        if (inv.details && inv.details.length > 0) {
          inv.details.forEach((detail: any) => {
            data.push({
              'Ký hiệu HĐ': inv.khhdon,
              'Số HĐ': inv.shdon,
              'Ngày lập': new Date(inv.tdlap).toLocaleDateString('vi-VN'),
              'Mã số thuế': inv.loaihd === 'banra' ? inv.nmmst : inv.nbmst,
              'Khách/Nhà CC': inv.loaihd === 'banra' ? inv.nmten : inv.nbten,
              'STT': detail.stt,
              'Tên hàng/Dịch vụ': detail.ten,
              'ĐVT': detail.dvtinh || '',
              'Số lượng': detail.sluong ? Number(detail.sluong) : 0,
              'Đơn giá': detail.dgia ? Number(detail.dgia) : 0,
              'Thành tiền': detail.thtien ? Number(detail.thtien) : 0,
              'Thuế suất (%)': detail.tsuat ? Number(detail.tsuat) : 0,
              'Tiền thuế': detail.tthue ? Number(detail.tthue) : 0,
              'Tổng cộng': (detail.thtien ? Number(detail.thtien) : 0) + (detail.tthue ? Number(detail.tthue) : 0),
            });
          });
        } else {
          // TH không có chi tiết thì vẫn hiện dòng hóa đơn với tổng tiền
          data.push({
            'Ký hiệu HĐ': inv.khhdon,
            'Số HĐ': inv.shdon,
            'Ngày lập': new Date(inv.tdlap).toLocaleDateString('vi-VN'),
            'Mã số thuế': inv.loaihd === 'banra' ? inv.nmmst : inv.nbmst,
            'Khách/Nhà CC': inv.loaihd === 'banra' ? inv.nmten : inv.nbten,
            'STT': '',
            'Tên hàng/Dịch vụ': 'Chưa đồng bộ chi tiết',
            'ĐVT': '',
            'Số lượng': '',
            'Đơn giá': '',
            'Thành tiền': inv.tgtcthue ? Number(inv.tgtcthue) : 0,
            'Thuế suất (%)': '',
            'Tiền thuế': inv.tgtthue ? Number(inv.tgtthue) : 0,
            'Tổng cộng': inv.tgtttbso ? Number(inv.tgtttbso) : 0,
          });
        }
      });
      return data;
    };

    const banraData = mapToExcelData(banra);
    const muavaoData = mapToExcelData(muavao);

    const wb = XLSX.utils.book_new();

    const wsBanra = XLSX.utils.json_to_sheet(banraData.length > 0 ? banraData : [{ 'Message': 'Không có dữ liệu' }]);
    XLSX.utils.book_append_sheet(wb, wsBanra, 'Bán ra');

    const wsMuavao = XLSX.utils.json_to_sheet(muavaoData.length > 0 ? muavaoData : [{ 'Message': 'Không có dữ liệu' }]);
    XLSX.utils.book_append_sheet(wb, wsMuavao, 'Mua vào');

    // Make header texts bold and format numbers
    wsBanra['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
      { wch: 5 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];
    wsMuavao['!cols'] = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 },
      { wch: 5 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
    ];

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Export_Hoadon_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting invoices:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
