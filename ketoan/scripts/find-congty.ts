import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const companies = await prisma.ext_congty.findMany({ select: { id: true, ten: true } })
  console.log(companies)
  
  if (!c) {
    console.log('Company not found')
    return
  }
  
  console.log('Found company:', c.ten, c.id)

  const items = await prisma.ext_tonghop.groupBy({
    by: ['tenHangChuan'],
    where: {
      congtyId: c.id,
      nam: 2023
    }
  })
  
  console.log('Items in ext_tonghop in 2023:', items.length)
  
  const items2 = await prisma.ext_daily_stock_v2.groupBy({
    by: ['tenHangChuan'],
    where: {
      congtyId: c.id,
      date: { gte: new Date('2023-01-01'), lt: new Date('2024-01-01') }
    }
  })
  console.log('Items in ext_daily_stock_v2 in 2023:', items2.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
