import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82'
  
  const count = await prisma.ext_tonghop.groupBy({
    by: ['tenHangChuan'],
    where: { congtyId }
  })
  
  console.log(`Total normalized items (tenHangChuan): ${count.length}`)
  
  const stockV2Count = await prisma.ext_daily_stock_v2.groupBy({
    by: ['tenHangChuan'],
    where: { congtyId }
  })
  console.log(`Total items in ext_daily_stock_v2: ${stockV2Count.length}`)

  // Monthly breakdown
  const months = await prisma.ext_tonghop.groupBy({
    by: ['thang', 'nam'],
    where: { congtyId },
    _count: true
  })
  console.log('Monthly breakdown:', months)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
