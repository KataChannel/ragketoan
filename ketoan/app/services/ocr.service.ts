import { callGoogleAI } from './ai-config';
import path from 'path';
import { readFile } from 'fs/promises';

export interface OcrResult {
  fileName: string;
  extractedText: string;
  tableData?: any[];
  success: boolean;
  error?: string;
}

export class OcrService {
  /**
   * Trích xuất dữ liệu bảng từ hình ảnh sử dụng Gemini Vision
   */
  async extractTableFromImage(imagePath: string): Promise<OcrResult> {
    try {
      const fileName = path.basename(imagePath);
      const imageBuffer = await readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      const prompt = `
        Bạn là một chuyên gia kế toán. Hãy trích xuất dữ liệu từ hình ảnh này dưới định dạng bảng.
        Hình ảnh là một "Bảng kê" hoặc "Hóa đơn".
        Hãy trả về kết quả là một chuỗi Markdown Table.
        Nếu có thể, hãy trích xuất các cột: STT, Ngày, Số chứng từ, Nội dung, Số tiền.
        Chỉ trả về bảng Markdown, không giải thích thêm.
      `;

      const response = await callGoogleAI('models/gemini-1.5-flash:generateContent', {
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      });

      const extractedText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        fileName,
        extractedText,
        success: true
      };
    } catch (error: any) {
      console.error(`❌ Lỗi OCR cho file ${imagePath}:`, error.message);
      return {
        fileName: path.basename(imagePath),
        extractedText: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Batch process images in a directory
   */
  async processDirectory(directoryPath: string): Promise<OcrResult[]> {
    const { readdir } = require('fs/promises');
    const { existsSync } = require('fs');
    
    if (!existsSync(directoryPath)) {
      throw new Error(`Thư mục không tồn tại: ${directoryPath}`);
    }

    const files = await readdir(directoryPath);
    const imageFiles = files.filter((f: string) => /\.(jpg|jpeg|png|webp)$/i.test(f));
    
    const results: OcrResult[] = [];
    for (const file of imageFiles) {
      const filePath = path.join(directoryPath, file);
      const result = await this.extractTableFromImage(filePath);
      results.push(result);
    }

    return results;
  }
}

export const ocrService = new OcrService();
