const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function check() {
    try {
        const result = await prisma.$queryRaw`SELECT MAX(date) as max_date, COUNT(*) as count FROM "ext_daily_stock_v2" WHERE "congtyId" = ${congtyId}`;
        console.log(`Tiến độ recalculate:`);
        console.log(` - Đã tính đến ngày: ${result[0].max_date}`);
        console.log(` - Tổng số bản ghi daily_stock hiện tại: ${result[0].count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
check();
