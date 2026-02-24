import prisma from '@/app/lib/prisma';
import { embedText, generateContent } from './ai-config';

export interface AgentDecision {
  status: 'CONFIDENT_MATCH' | 'UNCERTAIN';
  mapped_tenChuan?: string;
  mapped_maHang?: string;
  confidence_score: number;
  reasoning: string;
}

export interface SimilarItem {
  id: string;
  tenGoc: string;
  tenChuan: string;
  maHang: string;
  dvtinh: string;
  similarity: number;
}

/**
 * 1. Hàm Sinh Embedding cho một Text (Tên Hàng Gốc)
 */
export async function getEmbedding(text: string, apiKey?: string): Promise<number[]> {
  try {
    return await embedText(text, apiKey);
  } catch (error) {
    console.error('Error generating embedding with Google API:', error);
    throw error;
  }
}

/**
 * 2. Hàm tìm kiếm Vector Vector bằng Prisma Raw Query (KNN)
 */
export async function findSimilarItems(embedding: number[], congtyId: string | null, topK: number = 5): Promise<SimilarItem[]> {
  const vectorStr = `[${embedding.join(',')}]`;
  
  // Chúng ta sử dụng Cosine Distance operator <=> của pgvector
  // Similarity = 1 - Distance
  const items = await prisma.$queryRaw<any[]>`
    SELECT "id", "tenGoc", "tenChuan", "maHang", "dvtinh",
           1 - ("embedding" <=> ${vectorStr}::vector) as similarity
    FROM "ext_sanpham_dictionary"
    WHERE "embedding" IS NOT NULL
      AND ("congtyId" = ${congtyId} OR "congtyId" IS NULL)
    ORDER BY "embedding" <=> ${vectorStr}::vector
    LIMIT ${topK};
  `;

  return items.map(item => ({
    id: item.id,
    tenGoc: item.tenGoc,
    tenChuan: item.tenChuan,
    maHang: item.maHang,
    dvtinh: item.dvtinh,
    similarity: Number(item.similarity)
  }));
}

/**
 * 3. Hàm gọi LLM để Evaluate và Đưa ra Cấu trúc JSON (Reasoning)
 */
export async function evaluateMapping(tenGoc: string, dvtGoc: string | null, contextItems: SimilarItem[]): Promise<AgentDecision> {
  const contextStr = contextItems.map((item, i) => 
    `${i + 1}. Tên chuẩn: "${item.tenChuan}" (Mã: ${item.maHang || 'N/A'}, ĐVT: ${item.dvtinh || 'N/A'}) - Độ giống theo ngữ nghĩa: ${(item.similarity * 100).toFixed(1)}%`
  ).join('\n');

  const systemInstruction = `
Ngữ cảnh: Bạn là chuyên gia Kế toán Kho vật tư.
Nhiệm vụ: Bạn nhận được tên vật tư gốc ghi trên hóa đơn là "${tenGoc}" (Đơn vị tính: ${dvtGoc || 'không có'}).
Dưới đây là các mã hàng chuẩn đã có trong CSDL (sắp xếp theo độ giống ngữ nghĩa):
${contextStr || "Không có mặt hàng nào trong cơ sở dữ liệu."}

Yêu cầu xuất: Dựa trên kinh nghiệm và ngữ cảnh được cung cấp, nếu tên gốc thực sự chỉ cùng loại sản phẩm với một trong các tên chuẩn bên trên, hãy chọn nó (Độ tin cậy > 90%).
Trả về dạng JSON thuần tuý bao gồm các field sau (KHÔNG giải thích gì thêm ngoài JSON):
{
  "status": "CONFIDENT_MATCH" hoặc "UNCERTAIN",
  "mapped_tenChuan": "Tên chuẩn đã chọn hoặc để trống nếu UNCERTAIN",
  "mapped_maHang": "Mã hàng tương ứng của tên chuẩn đó",
  "confidence_score": "số thập phân từ 0.0 đến 1.0 diễn tả mức độ tự tin",
  "reasoning": "Lý do vì sao bạn chọn mã này hoặc vì sao bạn không tự tin (bằng tiếng Việt)"
}`;

  return _askGoogleGemini(systemInstruction);
}

// Helpers gọi nội bộ
async function _askGoogleGemini(prompt: string): Promise<AgentDecision> {
  const data = await generateContent(prompt, { 
    response_mime_type: "application/json",
    temperature: 0.1
  });
  let resText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  
  // Clean markdown if any
  resText = resText.replace(/```json/g, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(resText) as AgentDecision;
  } catch (e) {
    console.error("JSON Parse Error in Agent Decision:", resText);
    const match = resText.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as AgentDecision;
    }
    throw e;
  }
}


