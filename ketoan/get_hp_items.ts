
import { PrismaClient } from './prisma/generated-client/index';
const prisma = new PrismaClient();
async function main() {
  const mst = '5900428904';
  const company = await prisma.ext_congty.findUnique({ where: { mst } });
  if (!company) {
    console.log('Company not found');
    return;
  }
  const items = await prisma.ext_detailhoadon.groupBy({
    by: ['ten'],
    _count: { id: true },
    where: { invoice: { congtyId: company.id } }
  });
  console.log('Total items count:', items.length);
  // Show top 20 items
  const topItems = await prisma.ext_detailhoadon.groupBy({
    by: ['ten'],
    _count: { id: true },
    where: { invoice: { congtyId: company.id } },
    orderBy: { _count: { id: 'desc' } },
    take: 20
  });
  console.log('Top 20 items:', JSON.stringify(topItems, null, 2));
}
main().finally(() => prisma.$disconnect());
