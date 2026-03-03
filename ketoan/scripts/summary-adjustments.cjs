const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';

async function summary() {
    try {
        const adjustedItems = await prisma.ext_tonghop.findMany({
            where: {
                congtyId,
                idHoadonServer: 'OPEN_2023'
            },
            orderBy: { sluong: 'desc' }
        });

        console.log(`Dòng điều chỉnh (Bơm tồn đầu):`);
        console.table(adjustedItems.slice(0, 20).map(i => ({
            "Tên hàng": i.tenHangChuan,
            "Số lượng bù": Number(i.sluong),
            "Đơn giá bù": Number(i.dgia),
            "Thành tiền bù": Number(i.thtien)
        })));

        const totalQty = adjustedItems.reduce((s, i) => s + Number(i.sluong), 0);
        const totalVal = adjustedItems.reduce((s, i) => s + Number(i.thtien), 0);
        console.log(`\nTổng số mã hàng đã điều chỉnh: ${adjustedItems.length}`);
        console.log(`Tổng số lượng bù: ${totalQty}`);
        console.log(`Tổng giá trị bù: ${totalVal.toLocaleString()} VNĐ`);

    } catch (err) { console.error(err); } finally { await prisma.$disconnect(); }
}
summary();
