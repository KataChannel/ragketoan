const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const path = require('path');

const prisma = new PrismaClient();
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function exportReports() {
    try {
        console.log("Đang trích xuất dữ liệu để xuất Excel...");

        // 1. Tổng hợp XNT năm 2023
        const xntSummary = await prisma.$queryRaw`
      SELECT 
        "tenHangChuan", "maHang", "dvtinh",
        SUM(CASE WHEN date = '2023-01-01' THEN "tonDauQty" ELSE 0 END) as ton_dau_dau_nam,
        SUM("nhapQty") as tong_nhap,
        SUM("xuatQty") as tong_xuat,
        SUM(CASE WHEN date = (SELECT MAX(date) FROM "ext_daily_stock_v2" WHERE "congtyId" = ${congtyId} AND date < '2024-01-01') 
            THEN "tonCuoiQty" ELSE 0 END) as ton_cuoi_nam
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId} 
        AND date >= '2023-01-01' AND date < '2024-01-01'
      GROUP BY "tenHangChuan", "maHang", "dvtinh"
      HAVING SUM("nhapQty") > 0 OR SUM("xuatQty") > 0 OR SUM(CASE WHEN date = '2023-01-01' THEN "tonDauQty" ELSE 0 END) > 0
    `;

        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(xntSummary.map(i => ({
            "Mã hàng": i.maHang,
            "Tên hàng": i.tenHangChuan,
            "ĐVT": i.dvtinh,
            "Tồn đầu 01/01/2023": Number(i.ton_dau_dau_nam || 0),
            "Tổng Nhập 2023": Number(i.tong_nhap || 0),
            "Tổng Xuất 2023": Number(i.tong_xuat || 0),
            "Tồn cuối 31/12/2023": Number(i.ton_cuoi_nam || 0)
        })));
        XLSX.utils.book_append_sheet(wb, wsSummary, "Tong hop XNT 2023");

        // 2. Bảng kê hóa đơn
        const invoices = await prisma.ext_tonghop.findMany({
            where: { congtyId, nam: 2023 },
            orderBy: { tdlap: 'asc' }
        });
        const wsInvoices = XLSX.utils.json_to_sheet(invoices.map(i => ({
            "Ngày": i.tdlap.toISOString().split('T')[0],
            "Số HĐ": i.shdon,
            "Loại": i.loaihd === 'muavao' ? 'Mua vào' : 'Bán ra',
            "Tên hàng": i.tenHang,
            "Số lượng": Number(i.sluong),
            "Đơn giá": Number(i.dgia),
            "Thành tiền": Number(i.thtien),
            "Thuế": Number(i.tthue)
        })));
        XLSX.utils.book_append_sheet(wb, wsInvoices, "Ke khai Hoa don 2023");

        const outPath = '/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx';
        XLSX.writeFile(wb, outPath);
        console.log(`Đã xuất báo cáo tại: ${outPath}`);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

exportReports();
