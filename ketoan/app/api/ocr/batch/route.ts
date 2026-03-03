import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/app/services/ocr.service';
import path from 'path';
import { existsSync } from 'fs';

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), '..', 'images');
    
    if (!existsSync(imagesDir)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Thư mục images không tồn tại' 
      }, { status: 404 });
    }

    const results = await ocrService.processDirectory(imagesDir);

    return NextResponse.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    console.error('Error in batch OCR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định'
    }, { status: 500 });
  }
}
