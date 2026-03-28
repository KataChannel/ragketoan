import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const companies = await prisma.ext_congty.findMany({ 
    where: { 
      OR: [
        { ten: { contains: 'Huy Vũ', mode: 'insensitive' } },
        { tenVietTat: { contains: 'Huy Vũ', mode: 'insensitive' } }
      ]
    }
  })
  console.log(JSON.stringify(companies, null, 2))
}
main().catch(console.error).finally(() => prisma.$disconnect())
