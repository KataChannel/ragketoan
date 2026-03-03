import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, fileName } = body;

    if (!imageData) {
      return NextResponse.json({ success: false, error: 'Không có dữ liệu hình ảnh' }, { status: 400 });
    }

    // Thư mục images ở root project
    const imagesDir = path.join(process.cwd(), '..', 'images');

    // Tạo thư mục nếu chưa tồn tại
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true });
    }

    // Chuyển base64 sang Buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFileName = fileName || `capture_${timestamp}.jpg`;
    const filePath = path.join(imagesDir, finalFileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      data: {
        fileName: finalFileName,
        size: buffer.length,
        savedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error saving captured image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), '..', 'images');

    if (!existsSync(imagesDir)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const files = await readdir(imagesDir);
    const imageFiles = [];

    for (const file of files) {
      if (/\.(jpg|jpeg|png|webp)$/i.test(file)) {
        try {
          const filePath = path.join(imagesDir, file);
          const stats = await stat(filePath);
          imageFiles.push({
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          });
        } catch (e) {
          // Bỏ qua file lỗi
        }
      }
    }

    // Sort by modified time desc
    imageFiles.sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime());

    return NextResponse.json({ success: true, data: imageFiles });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Lỗi không xác định' },
      { status: 500 }
    );
  }
}
