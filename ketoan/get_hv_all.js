const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const huyVu = await prisma.ext_congty.findUnique({
        where: { mst: '5900363291' }
  });
  
  if (!huyVu) return;
  
  // Fetch from flat table with average price
  const items = await prisma.$queryRaw`
      SELECT "tenHang", COUNT(id) as sl, AVG(dgia) as dgia
      FROM ext_tonghop
      WHERE "congtyId" = ${huyVu.id}
      GROUP BY "tenHang"
      HAVING COUNT(id) >= 2
      ORDER BY sl DESC 
  `;
  
  const resultArr = items.map(i => ({ 
      tenGoc: i.tenHang, 
      sl: Number(i.sl),
      dgia: Number(i.dgia)
  }));
  
  fs.writeFileSync('/tmp/hv_tonghop_items_prices.json', JSON.stringify(resultArr, null, 2));
  console.log("Found >1 count:", resultArr.length);

}

main().catch(console.error).finally(() => process.exit(0));
