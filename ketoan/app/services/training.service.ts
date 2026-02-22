import prisma from '@/app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

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
  if (congtyId) where.congtyId = congtyId
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

  // 2. Lấy từ điển hiện tại
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

  // Sinh embedding ngầm cho tên gốc để phục vụ tìm kiếm Vector sau này (bỏ qua await để không chặn UI)
  import('./rag-agent.service').then(async ({ getEmbedding }) => {
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
         console.error('Lỗi khi sinh embedding thủ công cho:', tenGoc, err);
       }
     }
  }).catch(console.error);

  return { success: true, message: `Đã cập nhật chuẩn hóa cho ${items.length} mặt hàng` }
}

/**
 * Tự động tìm kiếm các mặt hàng tương đồng (Simple fuzzy matching)
 */
export async function autoSuggestGrouping(
  congtyId?: string, 
  onProgress?: (percent: number, message: string) => void
) {
  if (onProgress) onProgress(10, 'Đang trích xuất dữ liệu rác từ CSDL...');

  // Lấy các mặt hàng đã chuẩn hóa để loại trừ
  const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany({ 
     select: { tenGoc: true },
     ...(congtyId ? { where: { congtyId } } : {})
  });
  const mappedNames = new Set(dictionary.map((d: any) => d.tenGoc));

  // Lấy danh sách các mặt hàng gốc, sắp xếp theo số lượng xuất hiện nhiều nhất
  const allGroups = await prisma.ext_tonghop.groupBy({
    by: ['tenHang'],
    where: congtyId ? { congtyId } : undefined,
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

  // Lọc lấy 150 items chưa map
  const unmapped = allGroups.filter(g => !mappedNames.has(g.tenHang)).slice(0, 150);

  if (unmapped.length === 0) {
    if (onProgress) onProgress(100, 'Tuyệt vời, không có mặt hàng nào cần chuẩn hóa!');
    return [];
  }

  const itemsList = unmapped.map(i => i.tenHang);

  if (onProgress) onProgress(30, `Đã trích xuất ${itemsList.length} mặt hàng rác. Đang đẩy lên AI để phân cụm...`);

  const prompt = `Bạn là một chuyên gia AI xuất sắc về xử lý và chuẩn hóa dữ liệu kế toán kho.
Nhiệm vụ: Phân cụm (cluster) danh sách tên mặt hàng thô (sai chính tả, thiếu dấu, đảo ngữ, viết tắt) thành các nhóm tương đồng về ý nghĩa sản phẩm thực tế. Sau đó tạo ra 1 Tên Chuẩn (Standard Name) hoàn hảo cho mỗi nhóm.

Danh sách ${itemsList.length} mặt hàng gốc trên hóa đơn:
${itemsList.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

QUY TẮC NGHIÊM NGẶT:
1. Chỉ gộp các mục chắc chắn 100% là CÙNG 1 sản phẩm. Đừng gộp sai chủng loại thép với nhau.
2. Một nhóm (cluster) phải có ÍT NHẤT TỪ 2 MẶT HÀNG TRỞ LÊN. Nếu mặt hàng nào không giống với ai trong danh sách này, HÃY BỎ QUA NÓ (Không xuất ra).
3. Tên chuẩn phải ngắn gọn, đúng chính tả, in hoa chữ cái đầu và có vẻ chuyên nghiệp.
4. Trả kết quả DUY NHẤT bằng JSON (không markdown, không giải thích).

CẤU TRÚC JSON ĐẦU RA BẮT BUỘC:
[
  {
    "standard": "Đá Xây Dựng 1x2",
    "variants": ["Da 1x2", "đá1x2", "Da xay dung loai 1x2"]
  }
]`;

  if (onProgress) onProgress(45, `Đang kết nối đến LLM (Google Gemini / Ollama). Tiến trình này mất khoảng 10-20s...`);

  // Có thể dùng gemini (GOOGLE_API_KEY) hoặc local (OLLAMA_HOST)
  const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama';
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || '';
  const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';

  let resultJsonStr = "";

  try {
     if (LLM_PROVIDER === 'google' || GOOGLE_API_KEY) {
        if (onProgress) onProgress(65, `Đang phân tích ngữ nghĩa 150 mặt hàng bằng Google Gemini 1.5...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json", temperature: 0.1 }
          })
        });
        if (!res.ok) throw new Error(`Gemini API Error: ${await res.text()}`);
        const data = await res.json();
        resultJsonStr = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
     } else {
        const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
        const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:latest';
        if (onProgress) onProgress(65, `Đang phân tích ngữ nghĩa bằng Local AI (${OLLAMA_MODEL})...`);
        const url = `${OLLAMA_HOST.includes('http') ? OLLAMA_HOST : `http://${OLLAMA_HOST}`}/api/generate`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt: prompt,
            format: "json",
            stream: false
          })
        });
        if (!res.ok) throw new Error(`Ollama API Error: ${await res.text()}`);
        const data = await res.json();
        resultJsonStr = data.response || "[]";
     }

     if (onProgress) onProgress(90, `Đã nhận kết quả cụm từ AI. Đang chuẩn hóa cấu trúc DOM...`);

     let suggestions = JSON.parse(resultJsonStr);
     if (!Array.isArray(suggestions)) {
        if (suggestions.suggestions && Array.isArray(suggestions.suggestions)) suggestions = suggestions.suggestions;
        else if (suggestions.data && Array.isArray(suggestions.data)) suggestions = suggestions.data;
        else suggestions = [];
     }

     // Lọc lại chắc chắn variants có >= 2 length
     suggestions = suggestions.filter((s: any) => s.variants && Array.isArray(s.variants) && s.variants.length > 1);

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
