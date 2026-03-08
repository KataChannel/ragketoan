import { PrismaClient } from './prisma/generated-client/index';

const prisma = new PrismaClient();

async function main() {
  const mst = '5900363291';
  
  // 1. Get Company
  const company = await prisma.ext_congty.findUnique({
    where: { mst }
  });

  if (!company) {
    console.log(JSON.stringify({ error: 'Company not found' }));
    return;
  }

  // 2. Invoice stats per month (2023 -> 2026)
  const fromDate = new Date('2023-01-01T00:00:00Z');
  const toDate = new Date('2026-03-07T23:59:59Z');

  const invoiceStats = await prisma.ext_listhoadon.groupBy({
    by: ['loaihd', 'tthai'],
    _count: {
      id: true
    },
    where: {
      congtyId: company.id,
      tdlap: {
        gte: fromDate,
        lte: toDate
      }
    }
  });

  // Monthly stats (Raw query for easier month formatting)
  const monthlyStats = await prisma.$queryRaw`
    SELECT 
      TO_CHAR(tdlap, 'YYYY-MM') as month,
      loaihd,
      tthai,
      COUNT(*)::int as count,
      SUM(tgtttbso)::float as total_amount
    FROM ext_listhoadon
    WHERE "congtyId" = ${company.id}
      AND tdlap >= ${fromDate}
      AND tdlap <= ${toDate}
    GROUP BY month, loaihd, tthai
    ORDER BY month ASC, loaihd ASC;
  `;

  // 3. Item analysis
  // Total unique items (by name)
  const items = await prisma.ext_detailhoadon.groupBy({
    by: ['ten'],
    _count: {
      id: true
    },
    where: {
      invoice: {
        congtyId: company.id
      }
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 1000 // Top 1000 for analysis
  });

  console.log(JSON.stringify({
    company,
    invoiceStats,
    monthlyStats,
    itemsTop: items
  }));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
