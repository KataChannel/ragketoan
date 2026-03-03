import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkOpeningBalance() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';
  
  try {
    console.log(`--- KẾT QUẢ KIỂM TRA TỒN ĐẦU KỲ 01/01/2023 (RAW SQL) ---`);

    // 1. Check sum of opening balances on Start of Year 2023
    const openingStock: any[] = await prisma.$queryRaw`
      SELECT 
         count(*) as count,
         SUM("tonDauQty") as total_qty,
         SUM("tonDauVal") as total_val
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId}
      AND "date" >= '2023-01-01 00:00:00'
      AND "date" < '2023-01-01 23:59:59'
    `;

    console.log("Dữ liệu bảng ext_daily_stock_v2 ngày 01/01/2023:");
    console.log(` - Số lượng dòng: ${openingStock[0].count}`);
    console.log(` - Tổng SL tồn đầu: ${Number(openingStock[0].total_qty || 0)}`);
    console.log(` - Tổng Giá trị tồn đầu: ${Number(openingStock[0].total_val || 0)}`);

    // 2. Check if there's ANY stock entry before 2023
    const anyStockBefore: any[] = await prisma.$queryRaw`
      SELECT count(*) as count
      FROM "ext_daily_stock_v2"
      WHERE "congtyId" = ${congtyId}
      AND "date" < '2023-01-01'
    `;
    console.log(`Số lượng bản ghi chốt kho ngày TRƯỚC 2023: ${anyStockBefore[0].count}`);

    // 3. Check for specific opening transactions in ext_tonghop (e.g., date 2022-12-31)
    const transactionsBefore: any[] = await prisma.$queryRaw`
      SELECT count(*) as count, SUM(sluong) as total_qty
      FROM "ext_tonghop"
      WHERE "congtyId" = ${congtyId}
      AND "tdlap" < '2023-01-01'
    `;
    console.log(`\nSố giao dịch (hóa đơn) TRƯỚC 2023: ${transactionsBefore[0].count}`);
    console.log(`Tổng số lượng hàng hóa đưa từ quá khứ qua (nếu có): ${Number(transactionsBefore[0].total_qty || 0)}`);

  } catch (err) {
    console.error("Lỗi:", err);
  } finally {
    await prisma.$disconnect();
  }
}

checkOpeningBalance();
