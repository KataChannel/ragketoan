import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const statuses = await prisma.ext_listhoadon.groupBy({
    by: ['tthai'],
    _count: { tthai: true }
  });
  console.log("Trạng thái hóa đơn ext_listhoadon:");
  console.table(statuses);

  // Check unique values of tthai
  const tthaiList = await prisma.$queryRaw`SELECT DISTINCT tthai FROM ext_listhoadon`;
  console.log("Các giá trị tthai:", tthaiList);
}
run();
