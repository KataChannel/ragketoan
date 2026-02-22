import prisma from '@/app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { getEmbedding } from './rag-agent.service'

export interface TrainingItem {
  tenGoc: string
  tenChuan: string | null
  dvtinh: string | null
  frequency: number
  isMapped: boolean
}

/**
 * Láy danh sách các mặt hàng chưa được chuẩn hóa để huấn luyện
 */
export async function getItemsForTraining(options: {
  congtyId?: string
  search?: string
  onlyUnmapped?: boolean
  page?: number
  limit?: number
  orderBy?: 'tenGoc' | 'frequency' | 'isMapped' | 'tenChuan'
  order?: 'asc' | 'desc'
}) {
  const { 
    congtyId, 
    search, 
    onlyUnmapped = false, 
    page = 1, 
    limit = 50,
    orderBy = 'frequency',
    order = 'desc'
  } = options

  // 1. Lấy thống kê từ ext_tonghop
  const where: any = {}
  if (congtyId && congtyId !== 'all' && congtyId !== 'null' && congtyId !== 'undefined') {
    where.congtyId = congtyId
  }
  if (search) {
    where.tenHang = { contains: search, mode: 'insensitive' }
  }

  const groupedItems = await prisma.ext_tonghop.groupBy({
    by: ['tenHang'],
    where,
    _count: {
      tenHang: true
    },
    _max: {
      dvtinh: true
    },
    orderBy: {
      _count: {
        tenHang: 'desc'
      }
    }
  })

  // 2. Lấy từ điển hiện tại - Fix type to allow dynamic model access if needed, but ext_sanpham_dictionary should be visible
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany()
  const dictMap = new Map<string, any>()
  dictionary.forEach((d: any) => dictMap.set(d.tenGoc, d))

  // 3. Merge dữ liệu
  let results: TrainingItem[] = groupedItems.map(item => {
    const mapping = dictMap.get(item.tenHang)
    return {
      tenGoc: item.tenHang,
      tenChuan: mapping?.tenChuan || null,
      dvtinh: item._max.dvtinh,
      frequency: item._count.tenHang,
      isMapped: !!mapping
    }
  })

  // Lọc nếu chỉ lấy hàng chưa map
  if (onlyUnmapped) {
    results = results.filter(r => !r.isMapped)
  }
  
  // 4. Sắp xếp kết quả
  results.sort((a, b) => {
    let valA: any = a[orderBy]
    let valB: any = b[orderBy]
    
    // Handing nulls/undefined - push to end
    if (valA === null || valA === undefined) return 1
    if (valB === null || valB === undefined) return -1
    
    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' 
        ? valA.localeCompare(valB, 'vi') 
        : valB.localeCompare(valA, 'vi')
    }
    
    return order === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
  })

  const total = results.length
  const paginatedResults = results.slice((page - 1) * limit, page * limit)

  return {
    items: paginatedResults,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Cập nhật chuẩn hóa thủ công cho danh sách mặt hàng
 */
export async function updateTrainingMapping(items: string[], standardName: string, additionalInfo: {
  maHang?: string,
  nhomHang?: string,
  dvtinh?: string,
  congtyId?: string
}) {
  const operations = items.map(tenGoc => {
    return (prisma as any).ext_sanpham_dictionary.upsert({
      where: { 
        congtyId_tenGoc: {
          congtyId: additionalInfo.congtyId || null,
          tenGoc: tenGoc
        }
      },
      update: {
        tenChuan: standardName,
        maHang: additionalInfo.maHang,
        nhomHang: additionalInfo.nhomHang,
        dvtinh: additionalInfo.dvtinh,
        updatedAt: new Date()
      },
      create: {
        tenGoc,
        tenChuan: standardName,
        maHang: additionalInfo.maHang,
        nhomHang: additionalInfo.nhomHang,
        dvtinh: additionalInfo.dvtinh,
        congtyId: additionalInfo.congtyId || null
      }
    })
  })

  await prisma.$transaction(operations)

  // Sau khi cập nhật từ điển, tiến hành cập nhật ngược lại bảng ext_tonghop
  await prisma.ext_tonghop.updateMany({
    where: {
      tenHang: { in: items },
      congtyId: additionalInfo.congtyId || null
    },
    data: {
      tenHangChuan: standardName,
      maHang: additionalInfo.maHang,
      nhomHang: additionalInfo.nhomHang
    }
  })

  // Sinh embedding ngầm cho tên gốc để phục vụ tìm kiếm Vector sau này
  const generateEmbeddingsSafely = async () => {
     for (const tenGoc of items) {
       try {
         const vector = await getEmbedding(tenGoc);
         const vectorStr = `[${vector.join(',')}]`;
         await prisma.$executeRaw`
            UPDATE "ext_sanpham_dictionary" 
            SET "embedding" = ${vectorStr}::vector
            WHERE "tenGoc" = ${tenGoc} 
              AND ("congtyId" = ${additionalInfo.congtyId || null} OR ("congtyId" IS NULL AND ${additionalInfo.congtyId || null}::text IS NULL))
         `;
       } catch (err) {
         console.error('Lỗi khi sinh embedding cho:', tenGoc, err);
       }
     }
  };
  
  // Chạy background không await
  generateEmbeddingsSafely().catch(console.error);

  return { success: true, message: `Đã cập nhật chuẩn hóa cho ${items.length} mặt hàng` }
}

/**
 * Tự động tìm kiếm các mặt hàng tương đồng (Simple fuzzy matching)
 */
export async function autoSuggestGrouping(
  congtyId?: string, 
  onProgress?: (percent: number, message: string) => void,
  limit: number = 80,
  apiKey?: string
) {
  console.log("autoSuggestGrouping called for company:", congtyId || "ALL");
  const isStrictCompany = congtyId && congtyId !== 'all' && congtyId !== 'null' && congtyId !== 'undefined' && congtyId !== '';

  if (onProgress) onProgress(10, `Đang trích xuất dữ liệu ${isStrictCompany ? 'của công ty' : 'toàn hệ thống'}...`);

  // Lấy các mặt hàng đã chuẩn hóa để loại trừ
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany({ 
     select: { tenGoc: true },
     ...(isStrictCompany ? { where: { congtyId } } : {})
  });
  const mappedNames = new Set(dictionary.map((d: any) => d.tenGoc));

  // Lấy danh sách các mặt hàng gốc, sắp xếp theo số lượng xuất hiện nhiều nhất
  const allGroups = await prisma.ext_tonghop.groupBy({
    by: ['tenHang'],
    where: isStrictCompany ? { congtyId } : undefined,
    _count: {
      tenHang: true
    },
    orderBy: {
      _count: {
        tenHang: 'desc'
      }
    },
    take: 500 // Lấy dư ra 500 mục để đảm bảo sau khi lọc xong vẫn đủ
  });

  // Sử dụng batch size động từ người dùng (mặc định 80, tối đa nên là 200-300 để tránh truncation)
  const unmapped = allGroups.filter(g => !mappedNames.has(g.tenHang)).slice(0, limit);

  if (unmapped.length === 0) {
    if (onProgress) onProgress(100, 'Tuyệt vời, không có mặt hàng nào cần chuẩn hóa!');
    return [];
  }

  const itemsList = unmapped.map(i => i.tenHang);

  if (onProgress) onProgress(30, `Đã trích xuất ${itemsList.length} mặt hàng. Đang phân tích bằng Gemini 2.5 Flash...`);

  // Tối ưu hóa Token và yêu cầu AI trả về mảng phẳng để tiết kiệm
  const prompt = `Bạn là chuyên gia chuẩn hóa dữ liệu kho. Gộp danh sách tên mặt hàng thô thành các nhóm cùng loại sản phẩm.
Yêu cầu:
1. Chỉ gộp nếu chắc chắn cùng 1 sản phẩm.
2. Mỗi nhóm phải có ít nhất 2 mặt hàng.
3. Tạo 1 "standard" name ngắn gọn, chuyên nghiệp.
4. Trả về mảng JSON: [{"standard": "Tên Chuẩn", "variants": ["Tên 1", "Tên 2"]}]

Danh sách: ${JSON.stringify(itemsList)}`;

  if (onProgress) onProgress(45, `Đang gửi ${itemsList.length} mục lên AI...`);

  const { generateContent } = await import('./ai-config');

  try {
     const data = await generateContent(prompt, { 
       response_mime_type: "application/json", 
       temperature: 0.1,
       max_output_tokens: 8192
     }, apiKey);
     
     let resultJsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
     
     // Làm sạch chuỗi JSON
     resultJsonStr = resultJsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

     if (onProgress) onProgress(85, `Đã nhận kết quả. Đang xử lý...`);

     let suggestions;
     try {
        suggestions = JSON.parse(resultJsonStr);
     } catch (e) {
        console.warn("JSON Parse Error, attempting repair. String length:", resultJsonStr.length);
        
        // Cố gắng sửa lỗi JSON bị cắt ngang (truncated)
        let repairedStr = resultJsonStr;
        
        // Đếm số lượng ngoặc để đóng lại
        const openBraces = (repairedStr.match(/\{/g) || []).length;
        const closeBraces = (repairedStr.match(/\}/g) || []).length;
        const openBrackets = (repairedStr.match(/\[/g) || []).length;
        const closeBrackets = (repairedStr.match(/\]/g) || []).length;
        
        // Nếu bị cắt ngang ở giữa một string hoặc mảng, ta cần đóng chúng lại
        if (repairedStr.endsWith('"') || repairedStr.endsWith('variants":') || repairedStr.endsWith('variants": [')) {
            // Không làm gì thêm, chỉ cố gắng đóng ngoặc
        }
        
        try {
           // Thử đóng các thành phần còn thiếu
           if (openBrackets > closeBrackets) {
              // Có thể đang ở trong mảng variants của item cuối cùng
              const diffBraces = openBraces - closeBraces;
              for (let i = 0; i < diffBraces; i++) {
                 // Nếu item cuối chưa đóng } thì xóa phần lửng lơ của nó đi cho an toàn
                 if (i === 0 && !repairedStr.trim().endsWith('}')) {
                    const lastBraceIdx = repairedStr.lastIndexOf('{');
                    if (lastBraceIdx > repairedStr.lastIndexOf('}')) {
                        repairedStr = repairedStr.substring(0, lastBraceIdx).trim();
                        // Xóa dấu phẩy thừa nếu có
                        if (repairedStr.endsWith(',')) repairedStr = repairedStr.slice(0, -1);
                    }
                 }
              }
              // Đảm bảo đóng mảng chính
              repairedStr = repairedStr.trim();
              if (!repairedStr.endsWith(']')) repairedStr += ']';
              suggestions = JSON.parse(repairedStr);
           } else {
              throw e;
           }
        } catch (repairError) {
           console.error("Repair failed:", repairError);
           const match = resultJsonStr.match(/\[\s*\{[\s\S]*\}\s*\]/);
           if (match) {
             suggestions = JSON.parse(match[0]);
           } else {
             // Cố gắng lấy phần JSON hợp lệ cuối cùng (hacky)
             const lastValidIndex = resultJsonStr.lastIndexOf('}');
             if (lastValidIndex !== -1) {
                try {
                   const partial = resultJsonStr.substring(0, lastValidIndex + 1);
                   suggestions = JSON.parse(partial + ']');
                } catch {
                   throw new Error("AI phản hồi không đúng định dạng JSON và không thể sửa lỗi.");
                }
             } else {
                throw new Error("AI phản hồi không đúng định dạng JSON.");
             }
           }
        }
     }

     if (!Array.isArray(suggestions)) {
        if (suggestions.suggestions && Array.isArray(suggestions.suggestions)) suggestions = suggestions.suggestions;
        else if (suggestions.data && Array.isArray(suggestions.data)) suggestions = suggestions.data;
        else suggestions = [];
     }

     console.log(`AI found ${suggestions.length} raw clusters.`);
     suggestions = suggestions.filter((s: any) => s && s.standard && s.variants && Array.isArray(s.variants) && s.variants.length > 1);
     console.log(`Filtered to ${suggestions.length} valid clusters.`);

     if (onProgress) onProgress(99, `Đang chuẩn bị ${suggestions.length} bản ghi...`);

     return suggestions;
  } catch (error: any) {
     console.error("AI Grouping Error:", error);
     throw new Error(`Lỗi khi AI phân tích: ${error.message}`);
  }
}

/**
 * Áp dụng toàn bộ training data cho bảng tổng hợp
 */
export async function applyTrainingToDatabase() {
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany()
  let count = 0

  for (const entry of dictionary) {
    const result = await (prisma as any).ext_tonghop.updateMany({
      where: {
        tenHang: entry.tenGoc,
        congtyId: entry.congtyId,
        OR: [
          { tenHangChuan: { not: entry.tenChuan } },
          { tenHangChuan: null }
        ]
      },
      data: {
        tenHangChuan: entry.tenChuan,
        maHang: entry.maHang,
        nhomHang: entry.nhomHang
      }
    })
    count += result.count
  }

  return { success: true, count, message: `Đã đồng bộ ${count} dòng dữ liệu dựa trên training data` }
}

/**
 * Chấp nhận hàng loạt các gợi ý từ AI
 */
export async function bulkUpdateTrainingMapping(suggestions: any[], congtyId?: string) {
  let count = 0;
  for (const s of suggestions) {
    if (s.standard && s.variants && Array.isArray(s.variants) && s.variants.length > 0) {
      // Gọi update cho từng nhóm
      await updateTrainingMapping(s.variants, s.standard, { congtyId });
      count++;
    }
  }
  return { success: true, message: `Đã áp dụng thành công ${count} nhóm chuẩn hóa từ AI.` };
}
