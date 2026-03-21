
import { PrismaClient } from './prisma/generated-client/index';
const prisma = new PrismaClient();
async function main() {
  const companies = await prisma.ext_congty.findMany({
    select: { id: true, mst: true, ten: true }
  });
  console.log(JSON.stringify(companies, null, 2));
}
main().finally(() => prisma.$disconnect());
