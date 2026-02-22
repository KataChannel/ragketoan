import prisma from './app/lib/prisma';

async function main() {
  const count = await prisma.ext_tonghop.count({ where: { tenHangChuan: null } });
  console.log('tenHangChuan null count:', count);
  
  const allCount = await prisma.ext_tonghop.count();
  console.log('all count:', allCount);
  
  const dictCount = await (prisma as any).ext_sanpham_dictionary.count();
  console.log('dictCount:', dictCount);
}

main().catch(console.error).finally(() => process.exit());
