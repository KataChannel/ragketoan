const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();
const excelPath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function verify() {
    try {
        const workbook = XLSX.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const excelInventory = {};
        for (let i = 5; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length < 10) continue;
            const tenHang = String(row[3] || '');
            const tonDauT12024 = Number(row[7] || 0);
            if (tenHang && tonDauT12024 !== 0) {
                const normalizedName = tenHang.trim().toUpperCase().replace(/\s+/g, ' ');
                excelInventory[normalizedName] = tonDauT12024;
            }
        }

        // Get DB stock for 2024-01-01 (tonDauQty) using raw query to be safe with model names
        const dbStock = await prisma.$queryRaw`
      SELECT "tenHangChuan", "tonDauQty" 
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId}
      AND "date" >= '2024-01-01 00:00:00'
      AND "date" < '2024-01-02 00:00:00'
    `;

        console.log(`--- KẾT QUẢ ĐỐI CHIẾU SAU KHI ĐIỀU CHỈNH ---`);
        console.log(`Số mặt hàng trong DB ngày 01/01/2024: ${dbStock.length}`);

        let matchCount = 0;
        let mismatchCount = 0;
        const mismatches = [];

        for (const s of dbStock) {
            const name = s.tenHangChuan.trim().toUpperCase().replace(/\s+/g, ' ');
            const dbQty = Number(s.tonDauQty);
            const excelQty = excelInventory[name] || 0;

            if (Math.abs(dbQty - excelQty) < 0.01) {
                matchCount++;
            } else {
                mismatchCount++;
                if (mismatches.length < 10) {
                    mismatches.push({
                        item: s.tenHangChuan,
                        db: dbQty,
                        excel: excelQty,
                        diff: dbQty - excelQty
                    });
                }
            }
        }

        console.log(`Khớp: ${matchCount}`);
        console.log(`Lệch: ${mismatchCount}`);
        if (mismatches.length > 0) {
            console.log("Ví dụ các mặt hàng bị lệch:");
            console.table(mismatches);
        }

        const totalInExcel = Object.keys(excelInventory).length;
        console.log(`Tổng số mặt hàng có tồn trong Excel: ${totalInExcel}`);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

verify();
