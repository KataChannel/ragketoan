const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function main() {
  const prisma = new PrismaClient();
  const huyVu = await prisma.ext_congty.findUnique({
        where: { mst: '5900363291' }
  });
  
  if (!huyVu) {
      console.log("No Huy Vu congty found");
      return;
  }
  
  // Query flat table ext_tonghop
  const items = await prisma.ext_tonghop.groupBy({
      by: ['tenHang'],
      where: { congtyId: huyVu.id },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
  });
  
  console.log("Found unique products in ext_tonghop:", items.length);
  
  let resultArr = items.map(i => ({ tenGoc: i.tenHang, sl: i._count.id }));
  
  console.log("Products >= 2 count:", resultArr.filter(i => i.sl >= 2).length);
  
  // Clean it to items >= 2
  resultArr = resultArr.filter(i => i.sl >= 2);
  
  // Avoid JSON too large, cap if needed, but if it is ~1000 it is fine.
  if (resultArr.length > 2500) resultArr = resultArr.slice(0, 2500);

  fs.writeFileSync('/tmp/hv_tonghop_items.json', JSON.stringify(resultArr, null, 2));

}

main().catch(console.error).finally(() => process.exit(0));
