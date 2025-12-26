import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET /api/config/[id] - Lấy chi tiết cấu hình (bao gồm token đầy đủ để edit)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const config = await prisma.ext_apiconfig.findUnique({
      where: { id },
      include: {
        congty: {
          select: {
            id: true,
            mst: true,
            ten: true,
            tenVietTat: true
          }
        }
      }
    });

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy cấu hình' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}

// PUT /api/config/[id] - Cập nhật cấu hình
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      name, 
      congtyId,
      bearerToken, 
      baseUrl, 
      brandname,
      batchSize,
      delayBetweenBatches,
      delayBetweenDetailCalls,
      maxRetries,
      isActive,
    } = body;

    // Kiểm tra cấu hình tồn tại
    const existingConfig = await prisma.ext_apiconfig.findUnique({
      where: { id }
    });

    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy cấu hình' },
        { status: 404 }
      );
    }

    // Cập nhật cấu hình
    const config = await prisma.ext_apiconfig.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(congtyId && { congtyId }),
        ...(bearerToken && { bearerToken }),
        ...(baseUrl && { baseUrl }),
        ...(brandname !== undefined && { brandname }),
        ...(batchSize && { batchSize }),
        ...(delayBetweenBatches && { delayBetweenBatches }),
        ...(delayBetweenDetailCalls && { delayBetweenDetailCalls }),
        ...(maxRetries && { maxRetries }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        congty: {
          select: {
            id: true,
            mst: true,
            ten: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        bearerToken: '***' + config.bearerToken.slice(-10),
      },
      message: 'Đã cập nhật cấu hình thành công',
    });
  } catch (error) {
    console.error('Error updating config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/config/[id] - Xóa/Vô hiệu hóa cấu hình
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete - chỉ set isActive = false
    await prisma.ext_apiconfig.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã vô hiệu hóa cấu hình',
    });
  } catch (error) {
    console.error('Error deleting config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
