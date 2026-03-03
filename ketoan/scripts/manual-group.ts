import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const congtyId = '03b043e9-b7cd-42bc-a4ea-db710552af82';
  try {
    const items = await prisma.ext_tonghop.groupBy({
      by: ['tenHang'],
      where: { congtyId },
    });

    console.log(`Tong so mat hang: ${items.length}`);

    let processedCount = 0;
    const dictionaryEntries = [];

    for (const item of items) {
       const originalName = item.tenHang;
       if (!originalName) continue;

       // A basic heuristic to normalize, though it won't be as good as AI
       // Just trimming, uppercasing, and removing multiple spaces
       let normalized = originalName.trim().toUpperCase().replace(/\s+/g, ' ');

       dictionaryEntries.push({
          congtyId,
          tenGoc: originalName,
          tenChuan: normalized,
       });
       processedCount++;
    }

    console.log(`Processing ${processedCount} items into dictionary...`);
    
    // Chunk inserts
    const chunkSize = 500;
    for (let i = 0; i < dictionaryEntries.length; i += chunkSize) {
        const chunk = dictionaryEntries.slice(i, i + chunkSize);
        
        for (const entry of chunk) {
           await prisma.$executeRaw`
             INSERT INTO "ext_sanpham_dictionary" ("id", "congtyId", "tenGoc", "tenChuan", "frequency", "updatedAt")
             VALUES (gen_random_uuid(), ${entry.congtyId}, ${entry.tenGoc}, ${entry.tenChuan}, 1, now())
             ON CONFLICT ("congtyId", "tenGoc") 
             DO UPDATE SET "tenChuan" = EXCLUDED."tenChuan", "updatedAt" = now();
           `;
        }
    }

    console.log(`Done inserting dictionary. Now updating ext_tonghop...`);

    // Update ext_tonghop
    await prisma.$executeRaw`
      UPDATE "ext_tonghop" th
      SET "tenHangChuan" = dict."tenChuan",
          "maHang" = dict."maHang",
          "nhomHang" = dict."nhomHang"
      FROM "ext_sanpham_dictionary" dict
      WHERE th."tenHang" = dict."tenGoc"
        AND th."congtyId" = dict."congtyId"
        AND dict."congtyId" = ${congtyId}
    `;

    // Recalculate daily stock since mapping changed
    console.log(`Mapping updated. Please recalculate XNT via API.`);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
