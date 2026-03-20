const { PrismaClient } = require('@prisma/client');

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
  
  // Chunking to count unique products
  let allMappedItems = {};
  const chunkSize = 2000;
  for (let i = 0; i < hds.length; i += chunkSize) {
      const chunk = hdIds.slice(i, i + chunkSize);
      const details = await prisma.ext_detailhoadon.findMany({
          where: { idhdonServer: { in: chunk } },
          select: { id: true }
      });
      const dIds = details.map(d => d.id);
      
      const chunkItems = await prisma.ext_sanphamhoadon.groupBy({
          by: ['ten'],
          where: { iddetailhoadon: { in: dIds } },
          _count: { id: true }
      });
      
      chunkItems.forEach(item => {
          if (!allMappedItems[item.ten]) allMappedItems[item.ten] = 0;
          allMappedItems[item.ten] += item._count.id;
      });
  }
  
  const totalUnique = Object.keys(allMappedItems).length;
  console.log("Total unique products for Huy Vu:", totalUnique);
  
  // Count frequency buckets
  let countOver10 = 0;
  let countOver5 = 0;
  let countOver2 = 0;

  for (const ten in allMappedItems) {
      const sl = allMappedItems[ten];
      if (sl >= 10) countOver10++;
      if (sl >= 5) countOver5++;
      if (sl >= 2) countOver2++;
  }
  
  console.log("Products appearing >= 10 times:", countOver10);
  console.log("Products appearing >= 5 times:", countOver5);
  console.log("Products appearing >= 2 times:", countOver2);

  const fs = require('fs');
  // Generate the full list sorted by frequency
  let resultArr = Object.keys(allMappedItems).map(ten => ({
      tenGoc: ten,
      sl: allMappedItems[ten]
  }));
  resultArr.sort((a, b) => b.sl - a.sl);
  
  fs.writeFileSync('/tmp/hv_all_items.json', JSON.stringify(resultArr, null, 2));

}

main().catch(console.error).finally(() => process.exit(0));
