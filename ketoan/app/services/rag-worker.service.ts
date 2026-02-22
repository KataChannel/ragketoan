import prisma from '@/app/lib/prisma';
import { getEmbedding, findSimilarItems, evaluateMapping } from './rag-agent.service';

export async function pushToMappingQueue(items: { tenGoc: string, dvtGoc: string | null }[]) {
  // Lọc unique theo tên gốc
  const uniqueItems = Array.from(new Map(items.map(item => [item.tenGoc, item])).values());
  
  // Lấy các item đã có trong queue hoặc dict để không đẩy trùng
  const existingQueue = await prisma.ext_mapping_queue.findMany({
    where: { tenGoc: { in: uniqueItems.map(i => i.tenGoc) } },
    select: { tenGoc: true }
  });
  const queueSet = new Set(existingQueue.map(q => q.tenGoc));

  const existingDict = await prisma.ext_sanpham_dictionary.findMany({
    where: { tenGoc: { in: uniqueItems.map(i => i.tenGoc) } },
    select: { tenGoc: true }
  });
  const dictSet = new Set(existingDict.map(d => d.tenGoc));

  const newItemsToInsert = uniqueItems.filter(item => 
    !queueSet.has(item.tenGoc) && !dictSet.has(item.tenGoc)
  );

  if (newItemsToInsert.length > 0) {
    await prisma.ext_mapping_queue.createMany({
      data: newItemsToInsert.map(item => ({
        tenGoc: item.tenGoc,
        dvtGoc: item.dvtGoc,
        status: 'PENDING'
      })),
      skipDuplicates: true
    });
  }

  // Chạy ngầm AI Agent để xử lý queue (Không đợi để tránh block API)
  processMappingQueue().catch(console.error);
}

export async function processMappingQueue(limit: number = 10) {
  // Tìm các items đang PENDING và chưa được AI phân tích
  const pendingItems = await prisma.ext_mapping_queue.findMany({
    where: { status: 'PENDING', aiSuggestedName: null },
    take: limit,
    orderBy: { createdAt: 'asc' }
  });

  if (pendingItems.length === 0) return;

  for (const item of pendingItems) {
    try {
      // 1. Tạo vector
      const vector = await getEmbedding(item.tenGoc);
      
      // 2. Tìm top k ngữ nghĩa gần nhất (5 kết quả)
      const contextItems = await findSimilarItems(vector, 5);

      // 3. AI Evaluate
      const decision = await evaluateMapping(item.tenGoc, item.dvtGoc, contextItems);

      // 4. Quyết định
      if (decision.status === 'CONFIDENT_MATCH' && decision.confidence_score >= 0.95 && decision.mapped_tenChuan) {
         // Auto Approve!
         // Cập nhật Dictionary và chuyển status
         await prisma.$transaction([
           // Xoá record cũ nếu có
           prisma.ext_sanpham_dictionary.deleteMany({ where: { tenGoc: item.tenGoc } }),
           // Lưu từ điển. (Dùng pgvector thô ở dạng chuỗi có thể khó nếu ta k update vector. Ở đây ta insert query thô để truyền embedding)
           prisma.$executeRaw`
             INSERT INTO "ext_sanpham_dictionary" ("id", "tenGoc", "tenChuan", "maHang", "dvtinh", "embedding", "updatedAt")
             VALUES (gen_random_uuid(), ${item.tenGoc}, ${decision.mapped_tenChuan}, ${decision.mapped_maHang}, ${item.dvtGoc}, ${`[${vector.join(',')}]`}::vector, NOW())
           `,
           // Cập nhật Queue status
           prisma.ext_mapping_queue.update({
             where: { id: item.id },
             data: {
               aiSuggestedName: decision.mapped_tenChuan,
               aiConfidence: decision.confidence_score,
               aiReasoning: decision.reasoning,
               status: 'APPROVED'
             }
           })
         ]);
      } else {
        // Human In the loop
        await prisma.ext_mapping_queue.update({
          where: { id: item.id },
          data: {
            aiSuggestedName: decision.mapped_tenChuan || null,
            aiConfidence: decision.confidence_score,
            aiReasoning: decision.reasoning,
            status: 'PENDING' // Tiếp tục chờ Kế toán duyệt
          }
        });
      }
    } catch (err) {
      console.error(`Lỗi xử lý AI Agent cho mặt hàng: ${item.tenGoc}`, err);
    }
  }
}
