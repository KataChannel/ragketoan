const { PrismaClient } = require('./prisma/generated-client');
const prisma = new PrismaClient();

async function main() {
  const mst = '5900363291';
  const company = await prisma.ext_congty.findUnique({ where: { mst } });
  if (!company) {
    console.log('Company not found');
    return;
  }

  const results = await prisma.ext_listhoadon.groupBy({
    by: ['loaihd'],
    where: {
      congtyId: company.id,
      tdlap: {
        gte: new Date('2023-01-01T00:00:00Z'),
        lte: new Date('2023-12-31T23:59:59Z'),
      }
    },
    _sum: {
      tgtcthue: true,
      tgtthue: true,
      tgtttbso: true
    }
  });

  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
