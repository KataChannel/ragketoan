/**
 * AI Configuration and Key Management
 * Provides key rotation and unified access to Google AI services with retry logic
 */

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_MODEL = process.env.GOOGLE_MODEL || 'gemini-2.5-flash';

export function getGoogleModel(): string {
  return GOOGLE_MODEL;
}

/**
 * Thực hiện gọi Google AI API
 */
export async function callGoogleAI(
  endpoint: string, 
  body: any,
  apiVersion: string = 'v1beta',
  apiKey?: string
): Promise<any> {
  const finalApiKey = apiKey || GOOGLE_API_KEY;

  if (!finalApiKey) {
    throw new Error("Vui lòng nhập API KEY hoặc cấu hình GOOGLE_API_KEY trong file .env");
  }

  const url = `https://generativelanguage.googleapis.com/${apiVersion}/${endpoint}?key=${finalApiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (error: any) {
    console.error(`❌ Lỗi khi gọi API:`, error.message);
    throw error;
  }
}

/**
 * Helper chuyên biệt cho Generate Content
 */
export async function generateContent(prompt: string, config: any = {}, apiKey?: string): Promise<any> {
  const model = getGoogleModel();
  return callGoogleAI(`models/${model}:generateContent`, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: config
  }, 'v1beta', apiKey);
}

/**
 * Helper chuyên biệt cho Embedding
 */
export async function embedText(text: string): Promise<number[]> {
  const data = await callGoogleAI('models/gemini-embedding-001:embedContent', {
    model: 'models/gemini-embedding-001',
    content: { parts: [{ text }] },
    outputDimensionality: 768
  });
  return data.embedding.values;
}
