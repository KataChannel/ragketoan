import prisma from '@/app/lib/prisma';
import { getEmbedding, findSimilarItems, evaluateMapping } from './rag-agent.service';

export async function pushToMappingQueue(items: { tenGoc: string, dvtGoc: string | null, congtyId: string | null }[]) {
  // Lọc unique theo tên gốc + congtyId
  const uniqueItemsMap = new Map<string, any>();
  for (const item of items) {
    uniqueItemsMap.set(`${item.congtyId || 'NULL'}-||-${item.tenGoc}`, item);
  }
  const uniqueItems = Array.from(uniqueItemsMap.values());
  
  if (uniqueItems.length === 0) return;

  const orConditions = uniqueItems.map(i => ({ tenGoc: i.tenGoc, congtyId: i.congtyId }));

  // Lấy các item đã có trong queue hoặc dict để không đẩy trùng
  const existingQueue = await prisma.ext_mapping_queue.findMany({
    where: { OR: orConditions },
    select: { tenGoc: true, congtyId: true }
  });
  const queueSet = new Set(existingQueue.map(q => `${q.congtyId || 'NULL'}-||-${q.tenGoc}`));

  const existingDict = await prisma.ext_sanpham_dictionary.findMany({
    where: { OR: orConditions },
    select: { tenGoc: true, congtyId: true }
  });
  const dictSet = new Set(existingDict.map(d => `${d.congtyId || 'NULL'}-||-${d.tenGoc}`));

  const newItemsToInsert = uniqueItems.filter(item => {
    const key = `${item.congtyId || 'NULL'}-||-${item.tenGoc}`;
    return !queueSet.has(key) && !dictSet.has(key);
  });

  if (newItemsToInsert.length > 0) {
    await prisma.ext_mapping_queue.createMany({
      data: newItemsToInsert.map(item => ({
        tenGoc: item.tenGoc,
        dvtGoc: item.dvtGoc,
        congtyId: item.congtyId,
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

  const itemsWithVectors: (typeof pendingItems[0] & { vector?: number[] })[] = [];

  // BƯỚC 1: Tạo Embedding hàng loạt. 
  // (Giúp Ollama giữ mô hình embed trong RAM không bị đẩy ra ngoài liên tục)
  for (const item of pendingItems) {
    try {
      const vector = await getEmbedding(item.tenGoc);
      itemsWithVectors.push({ ...item, vector });
    } catch (err) {
      console.error(`Lỗi sinh Embedding cho mặt hàng: ${item.tenGoc}`, err);
    }
  }

  // BƯỚC 2: Rút trích Vector Similarity và Đánh giá ngữ nghĩa hàng loạt 
  // (Lúc này Ollama mới load mô hình Llama3.2/Reasoning lên RAM)
  for (const item of itemsWithVectors) {
    if (!item.vector) continue;

    try {
      // Tìm top k ngữ nghĩa gần nhất (5 kết quả) dựa theo công ty
      const contextItems = await findSimilarItems(item.vector, item.congtyId, 5);

      // AI Evaluate
      const decision = await evaluateMapping(item.tenGoc, item.dvtGoc, contextItems);

      // Quyết định
      if (decision.status === 'CONFIDENT_MATCH' && decision.confidence_score >= 0.95 && decision.mapped_tenChuan) {
         // Auto Approve!
         // Cập nhật Dictionary và chuyển status
         await prisma.$transaction([
           // Xoá record cũ nếu có (cùng công ty)
           prisma.ext_sanpham_dictionary.deleteMany({ where: { tenGoc: item.tenGoc, congtyId: item.congtyId } }),
           // Lưu từ điển
           prisma.$executeRaw`
             INSERT INTO "ext_sanpham_dictionary" ("id", "tenGoc", "tenChuan", "maHang", "dvtinh", "embedding", "updatedAt", "congtyId")
             VALUES (gen_random_uuid(), ${item.tenGoc}, ${decision.mapped_tenChuan}, ${decision.mapped_maHang}, ${item.dvtGoc}, ${`[${item.vector.join(',')}]`}::vector, NOW(), ${item.congtyId})
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
      console.error(`Lỗi xử lý LLM Agent cho mặt hàng: ${item.tenGoc}`, err);
    }
  }
}
