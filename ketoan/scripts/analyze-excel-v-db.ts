import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();
const excelPath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';

async function analyze() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

  // 1. Get Actual Opening 2024 from Excel (Actual Closing 2023)
  const workbook = XLSX.readFile(excelPath);
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const excelData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  const excelInventory: Record<string, { maHang: string, tenHang: string, tonDauT12024: number }> = {};
  for (let i = 5; i < excelData.length; i++) {
    const row = excelData[i];
    if (!row || row.length < 10) continue;
    const maHang = String(row[2] || '');
    const tenHang = String(row[3] || '');
    const tonDauT12024 = Number(row[7] || 0);
    if (tenHang && tonDauT12024 !== 0) {
      const normalizedName = tenHang.trim().toUpperCase().replace(/\s+/g, ' ');
      excelInventory[normalizedName] = { maHang, tenHang, tonDauT12024 };
    }
  }

  // 2. Get 2023 Summary from DB
  console.log("Đang tổng hợp dữ liệu 2023 từ DB...");
  const dbSummary: any[] = await prisma.$queryRaw`
    SELECT "tenHangChuan",
           SUM(CASE WHEN "loaihd" = 'muavao' THEN sluong ELSE 0 END) as nhap_2023,
           SUM(CASE WHEN "loaihd" = 'banra' THEN sluong ELSE 0 END) as xuat_2023
    FROM "ext_tonghop"
    WHERE "congtyId" = ${congtyId}
      AND "tdlap" >= '2023-01-01' AND "tdlap" < '2024-01-01'
    GROUP BY "tenHangChuan"
  `;

  const comparison = [];
  const unmatchedInDB = [];

  for (const dbItem of dbSummary) {
    const name = dbItem.tenHangChuan ? String(dbItem.tenHangChuan).trim().toUpperCase().replace(/\s+/g, ' ') : '';
    const nhap = Number(dbItem.nhap_2023 || 0);
    const xuat = Number(dbItem.xuat_2023 || 0);
    
    // Look up in excel
    let actualClosing2023 = 0;
    if (excelInventory[name]) {
       actualClosing2023 = excelInventory[name].tonDauT12024;
    }

    // Calculation: RequiredOpening2023 = ActualClosing2023 + Xuat2023 - Nhap2023
    const requiredOpening2023 = actualClosing2023 + xuat - nhap;

    if (requiredOpening2023 > 0) {
      comparison.push({
        tenHang: dbItem.tenHangChuan,
        nhap2023: nhap,
        xuat2023: xuat,
        currentBalanceByBill: nhap - xuat,
        actual2024Open: actualClosing2023,
        suggestedOpening2023: requiredOpening2023
      });
    }
  }

  // Sort by significant opening required
  comparison.sort((a, b) => b.suggestedOpening2023 - a.suggestedOpening2023);

  console.log("\n--- DỰ BÁO NHU CẦU BỔ SUNG TỒN ĐẦU KỲ 2023 ---");
  console.table(comparison.slice(0, 20).map(i => ({
      "Tên hàng": i.tenHang.substring(0, 40),
      "Mua vào 2023": i.nhap2023,
      "Bán ra 2023": i.xuat2023,
      "Tồn DB 2023 (Chưa bù)": i.currentBalanceByBill,
      "Tồn Thực tế 01/01/2024 (Excel)": i.actual2024Open,
      "=> Cần bù Tồn đầu 2023": i.suggestedOpening2023
  })));
  
  const totalSuggested = comparison.reduce((sum, item) => sum + item.suggestedOpening2023, 0);
  console.log(`\nTổng số mã hàng cần điều chỉnh tồn đầu kỳ: ${comparison.length}`);
  console.log(`Tổng số lượng cần "Bơm" vào 01/01/2023 để khớp số chốt 2024: ${totalSuggested}`);

}

analyze().catch(console.error).finally(() => prisma.$disconnect());
