const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');

const prisma = new PrismaClient();
const excelPath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function run() {
    try {
        // 1. Get Actual Opening 2024 from Excel
        const workbook = XLSX.readFile(excelPath);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const excelInventory = {};
        for (let i = 5; i < excelData.length; i++) {
            const row = excelData[i];
            if (!row || row.length < 10) continue;
            const tenHang = String(row[3] || '');
            const tonDauT12024 = Number(row[7] || 0); // Open 2024
            if (tenHang && tonDauT12024 !== 0) {
                const normalizedName = tenHang.trim().toUpperCase().replace(/\s+/g, ' ');
                excelInventory[normalizedName] = tonDauT12024;
            }
        }

        // 2. Get 2023 Summary from DB
        const dbSummary = await prisma.$queryRaw`
      SELECT "tenHangChuan", "dvtinh",
             SUM(CASE WHEN "loaihd" = 'muavao' THEN sluong ELSE 0 END) as nhap_2023,
             SUM(CASE WHEN "loaihd" = 'banra' THEN sluong ELSE 0 END) as xuat_2023
      FROM "ext_tonghop"
      WHERE "congtyId" = ${congtyId}
        AND "tdlap" >= '2023-01-01' AND "tdlap" < '2024-01-01'
      GROUP BY "tenHangChuan", "dvtinh"
    `;

        console.log(`Bắt đầu "bơm" tồn đầu kỳ cho ${dbSummary.length} nhóm mặt hàng...`);

        let createdCount = 0;

        for (const dbItem of dbSummary) {
            const dbNameRaw = String(dbItem.tenHangChuan || '');
            const nameKey = dbNameRaw.trim().toUpperCase().replace(/\s+/g, ' ');
            const nhap = Number(dbItem.nhap_2023 || 0);
            const xuat = Number(dbItem.xuat_2023 || 0);

            let actualClosing2023 = excelInventory[nameKey] || 0;
            const requiredOpening2023 = actualClosing2023 + xuat - nhap;

            if (requiredOpening2023 > 0) {
                // Find a price
                const lastEntry = await prisma.ext_tonghop.findFirst({
                    where: {
                        congtyId,
                        tenHangChuan: dbItem.tenHangChuan,
                    },
                    orderBy: { tdlap: 'asc' }
                });

                const estimatedPrice = lastEntry ? Number(lastEntry.dgia) : 0;
                const thtien = requiredOpening2023 * estimatedPrice;

                // Use idDetailServer as unique key to prevent duplicates
                const opId = `OPEN2023_${congtyId.substring(0, 8)}_${nameKey.substring(0, 40).replace(/[^A-Z]/g, '')}`;

                // Raw Insert to avoid complex Prisma logic for dummy records
                await prisma.$executeRaw`
              INSERT INTO "ext_tonghop" (
                "id", "idDetailServer", "idHoadonServer", "congtyId", 
                "tdlap", "loaihd", "tenHang", "tenHangChuan", "dvtinh", 
                "sluong", "dgia", "thtien", "tsuat", "tthue", "tongTien",
                "nam", "thang", "quy", "khmshdon", "khhdon", "shdon", "nbmst", "nbten", "updatedAt"
              ) VALUES (
                gen_random_uuid(), ${opId}, 'OPEN_2023', ${congtyId},
                '2022-12-31 23:59:59', 'muavao', ${dbItem.tenHangChuan}, ${dbItem.tenHangChuan}, ${dbItem.dvtinh},
                ${requiredOpening2023}, ${estimatedPrice}, ${thtien}, 0, 0, ${thtien},
                2022, 12, 4, 'OPEN', '2023', '000000', '0000000000', 'DƯ ĐẦU KỲ', now()
              ) ON CONFLICT ("idDetailServer") DO UPDATE SET
                "sluong" = ${requiredOpening2023},
                "dgia" = ${estimatedPrice},
                "thtien" = ${thtien},
                "tongTien" = ${thtien}
            `;
                createdCount++;
            }
        }

        console.log(`Đã "bơm" thành công ${createdCount} bản ghi tồn đầu kỳ vào 2022-12-31.`);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
