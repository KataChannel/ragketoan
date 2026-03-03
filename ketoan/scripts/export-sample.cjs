const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function exportSample() {
    try {
        const xntSummary = await prisma.$queryRaw`
      SELECT "tenHangChuan", "maHang", "dvtinh",
             SUM("nhapQty") as nhap, SUM("xuatQty") as xuat
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId} AND date >= '2023-01-01' AND date < '2024-01-01'
      GROUP BY "tenHangChuan", "maHang", "dvtinh"
      LIMIT 100
    `;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(xntSummary);
        XLSX.utils.book_append_sheet(wb, ws, "Sample");
        XLSX.writeFile(wb, '/chikiet/kata2025/ragketoan/SAMPLE_REPORT.xlsx');
        console.log("Sample Excel exported.");
    } catch (e) { console.error(e); } finally { await prisma.$disconnect(); }
}
exportSample();
