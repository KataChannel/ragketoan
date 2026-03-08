import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82'
  
  // First, let's see how many items there are for 2023
  console.log('Fetching items...')
  const itemsRaw = await prisma.$queryRaw`
    SELECT "tenHangChuan", "maHang", "dvtinh"
    FROM "ext_daily_stock_v2"
    WHERE "congtyId" = ${congtyId} AND date >= '2023-01-01' AND date < '2024-01-01'
    GROUP BY "tenHangChuan", "maHang", "dvtinh"
  `;
  const items = itemsRaw as any[];
  console.log(`Found ${items.length} items.`)
  
  const inventoryData: Record<number, any[]> = {}
  for(let i=0; i<12; i++) {
    inventoryData[i] = []
  }

  // Group everything properly per month
  for (let m = 1; m <= 12; m++) {
    const startDate = `2023-${m.toString().padStart(2, '0')}-01`;
    const nextMonth = m === 12 ? 1 : m + 1;
    const nextYear = m === 12 ? 2024 : 2023;
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`; // exclusive
    
    // We want tonDauQty from the 1st of the month, or earliest date if no 1st
    // Actually, tonDauQty on 1st is best, but let's just make it simple: 
    // sum over the month of nhapQty, xuatQty
    // and grab the tonDau from the very first entry of the month
    const records = await prisma.$queryRaw`
      WITH ranked_first AS (
        SELECT "tenHangChuan", "tonDauQty", "tonDauVal",
               ROW_NUMBER() OVER(PARTITION BY "tenHangChuan" ORDER BY date ASC) as rn
        FROM "ext_daily_stock_v2"
        WHERE "congtyId" = ${congtyId} AND date >= ${startDate}::date AND date < ${endDate}::date
      ),
      ranked_last AS (
        SELECT "tenHangChuan", "tonCuoiQty", "tonCuoiVal",
               ROW_NUMBER() OVER(PARTITION BY "tenHangChuan" ORDER BY date DESC) as rn
        FROM "ext_daily_stock_v2"
        WHERE "congtyId" = ${congtyId} AND date >= ${startDate}::date AND date < ${endDate}::date
      ),
      sums AS (
        SELECT "tenHangChuan", "maHang", "dvtinh",
               SUM("nhapQty") as sum_nhapQty,
               SUM("nhapVal") as sum_nhapVal,
               SUM("xuatQty") as sum_xuatQty,
               SUM("xuatVal") as sum_xuatVal
        FROM "ext_daily_stock_v2"
        WHERE "congtyId" = ${congtyId} AND date >= ${startDate}::date AND date < ${endDate}::date
        GROUP BY "tenHangChuan", "maHang", "dvtinh"
      )
      SELECT 
        s."tenHangChuan", s."maHang", s."dvtinh",
        s.sum_nhapQty as "inSL", s.sum_nhapVal as "inPrice",
        s.sum_xuatQty as "outSL", s.sum_xuatVal as "outPrice",
        f."tonDauQty" as "startSL", f."tonDauVal" as "startPrice",
        l."tonCuoiQty" as "endSL", l."tonCuoiVal" as "endPrice"
      FROM sums s
      LEFT JOIN ranked_first f ON s."tenHangChuan" = f."tenHangChuan" AND f.rn = 1
      LEFT JOIN ranked_last l ON s."tenHangChuan" = l."tenHangChuan" AND l.rn = 1
    `;

    (records as any[]).forEach(r => {
      inventoryData[m-1].push({
        code: (r.maHang ? r.maHang + ' - ' : '') + r.tenHangChuan,
        unit: r.dvtinh || 'Cái',
        startSL: Number(r.startSL || 0),
        startPrice: Number(r.startPrice || 0),
        inSL: Number(r.inSL || 0),
        inPrice: Number(r.inPrice || 0),
        outSL: Number(r.outSL || 0),
        outPrice: Number(r.outPrice || 0),
        endSL: Number(r.endSL || 0),
        endPrice: Number(r.endPrice || 0)
      })
    });
  }
  
  // Fill missing items with 0 for each month to ensure 341 items per month
  const allItemCodes = items.map(r => (r.maHang ? r.maHang + ' - ' : '') + r.tenHangChuan)
  const allItemUnits = items.reduce((acc, r) => {
    acc[(r.maHang ? r.maHang + ' - ' : '') + r.tenHangChuan] = r.dvtinh || 'Cái';
    return acc;
  }, {});

  for (let m = 0; m < 12; m++) {
    const existingCodes = new Set(inventoryData[m].map(x => x.code));
    for (const code of allItemCodes) {
      if (!existingCodes.has(code)) {
        inventoryData[m].push({
          code,
          unit: allItemUnits[code],
          startSL: 0, startPrice: 0, inSL: 0, inPrice: 0, outSL: 0, outPrice: 0, endSL: 0, endPrice: 0
        });
      }
    }
  }

  // We should save this as a json file in app/hoanghuyphat
  fs.writeFileSync('./app/hoanghuyphat/inventoryData.json', JSON.stringify(inventoryData, null, 2))
  console.log('Saved data to ./app/hoanghuyphat/inventoryData.json')
}

main().catch(console.error).finally(() => prisma.$disconnect());
