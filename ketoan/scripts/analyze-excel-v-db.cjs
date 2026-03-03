const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();
const excelPath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';

async function analyze() {
    const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

    // 1. Get Actual Opening 2024 from Excel (Actual Closing 2023)
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

    // 2. Get 2023 Summary from DB
    console.log("Đang truy vấn CSDL 2023...");
    const dbSummary = await prisma.$queryRaw`
    SELECT "tenHangChuan",
           SUM(CASE WHEN "loaihd" = 'muavao' THEN sluong ELSE 0 END) as nhap_2023,
           SUM(CASE WHEN "loaihd" = 'banra' THEN sluong ELSE 0 END) as xuat_2023
    FROM "ext_tonghop"
    WHERE "congtyId" = ${congtyId}
      AND "tdlap" >= '2023-01-01' AND "tdlap" < '2024-01-01'
    GROUP BY "tenHangChuan"
  `;

    const comparison = [];

    for (const dbItem of dbSummary) {
        const dbNameRaw = String(dbItem.tenHangChuan || '');
        const nameKey = dbNameRaw.trim().toUpperCase().replace(/\s+/g, ' ');
        const nhap = Number(dbItem.nhap_2023 || 0);
        const xuat = Number(dbItem.xuat_2023 || 0);

        // Look up in excel
        let actualClosing2023 = excelInventory[nameKey] || 0;

        // Calculation: RequiredOpening2023 = ActualClosing2023 + Xuat2023 - Nhap2023
        const requiredOpening2023 = actualClosing2023 + xuat - nhap;

        if (requiredOpening2023 > 0) {
            comparison.push({
                tenHang: dbNameRaw,
                nhap2023: nhap,
                xuat2023: xuat,
                currentInDB: nhap - xuat,
                actualEnd2023: actualClosing2023,
                suggestedStart2023: requiredOpening2023
            });
        }
    }

    comparison.sort((a, b) => b.suggestedStart2023 - a.suggestedStart2023);

    console.log("\n--- KẾT QUẢ ĐỐI CHIẾU THỰC TẾ (EXCEL 2024) VS HÓA ĐƠN (2023) ---");
    console.log(`- Tổng số mã hàng bị thiếu tồn đầu: ${comparison.length}`);

    const formatted = comparison.slice(0, 15).map(i => ({
        "Tên hàng": i.tenHang.substring(0, 45),
        "Mua 2023": Math.round(i.nhap2023),
        "Bán 2023": Math.round(i.xuat2023),
        "Tồn DB 2023": Math.round(i.currentInDB),
        "Tồn Thực tế chốt 2024": Math.round(i.actualEnd2023),
        "Cần Bù Tồn Đầu 2023": Math.round(i.suggestedStart2023)
    }));
    console.table(formatted);

}

analyze().catch(console.error).finally(() => prisma.$disconnect());
