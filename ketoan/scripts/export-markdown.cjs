const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function exportToMarkdown() {
    try {
        const xntSummary = await prisma.$queryRaw`
      SELECT 
        "tenHangChuan", "maHang", "dvtinh",
        SUM(CASE WHEN date = '2023-01-01' THEN "tonDauQty" ELSE 0 END) as ton_dau,
        SUM("nhapQty") as tong_nhap,
        SUM("xuatQty") as tong_xuat,
        SUM(CASE WHEN date = (SELECT MAX(date) FROM "ext_daily_stock_v2" WHERE "congtyId" = ${congtyId} AND date < '2024-01-01') 
            THEN "tonCuoiQty" ELSE 0 END) as ton_cuoi
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId} 
        AND date >= '2023-01-01' AND date < '2024-01-01'
      GROUP BY "tenHangChuan", "maHang", "dvtinh"
      HAVING SUM("nhapQty") > 0 OR SUM("xuatQty") > 0 OR SUM(CASE WHEN date = '2023-01-01' THEN "tonDauQty" ELSE 0 END) > 0
      ORDER BY tong_xuat DESC
      LIMIT 200
    `;

        let md = "# TỔNG HỢP XUẤT NHẬP TỒN NĂM 2023 - TOP 200\n\n";
        md += "| Tên hàng | Tồn đầu | Nhập | Xuất | Tồn cuối |\n";
        md += "| :--- | :---: | :---: | :---: | :---: |\n";

        for (const i of xntSummary) {
            md += `| ${i.tenHangChuan} | ${Number(i.ton_dau).toFixed(2)} | ${Number(i.tong_nhap).toFixed(2)} | ${Number(i.tong_xuat).toFixed(2)} | ${Number(i.ton_cuoi).toFixed(2)} |\n`;
        }

        fs.writeFileSync('/chikiet/kata2025/ragketoan/ketoan/docs/thiet-ke/view_xnt_summary.md', md);
        console.log("Markdown exported to view_xnt_summary.md");

    } catch (err) { console.error(err); } finally { await prisma.$disconnect(); }
}
exportToMarkdown();
