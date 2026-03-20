const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const huyVu = await prisma.ext_congty.findUnique({
        where: { mst: '5900363291' }
  });
  
  if (!huyVu) return;
  const hds = await prisma.ext_listhoadon.findMany({
      where: { congtyId: huyVu.id },
      select: { idServer: true }
  });
  
  const hdIds = hds.map(h => h.idServer);
  
  const details = await prisma.ext_detailhoadon.groupBy({
      by: ['ten'],
      where: { idhdonServer: { in: hdIds } },
      _count: { ten: true },
      orderBy: { _count: { ten: 'desc' } },
      take: 341
  });
  
  console.log("Found items:", details.length);
  fs.writeFileSync('/tmp/hv_invoice_items.json', JSON.stringify(details, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
