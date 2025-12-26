import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET /api/config - Lấy cấu hình API
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const congtyId = searchParams.get('congtyId');

    const configs = await prisma.ext_apiconfig.findMany({
      where: { 
        isActive: true,
        ...(congtyId ? { congtyId } : {})
      },
      include: {
        congty: {
          select: {
            id: true,
            mst: true,
            ten: true,
            tenVietTat: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Hide sensitive token info
    const safeConfigs = configs.map((config) => ({
      ...config,
      bearerToken: config.bearerToken ? '***' + config.bearerToken.slice(-10) : '',
    }));

    return NextResponse.json({
      success: true,
      data: safeConfigs,
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

// POST /api/config - Tạo/Cập nhật cấu hình API
export async function POST(request: NextRequest) {
  try {
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
    } = body;

    if (!name || !bearerToken || !congtyId) {
      return NextResponse.json(
        { success: false, error: 'Tên, công ty và Bearer token là bắt buộc' },
        { status: 400 }
      );
    }

    // Kiểm tra công ty tồn tại
    const company = await prisma.ext_congty.findUnique({
      where: { id: congtyId }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Công ty không tồn tại' },
        { status: 400 }
      );
    }

    const config = await prisma.ext_apiconfig.upsert({
      where: { 
        congtyId_name: { congtyId, name }
      },
      update: {
        bearerToken,
        baseUrl: baseUrl || 'https://hoadondientu.gdt.gov.vn:30000',
        brandname,
        batchSize: batchSize || 3,
        delayBetweenBatches: delayBetweenBatches || 3000,
        delayBetweenDetailCalls: delayBetweenDetailCalls || 2000,
        maxRetries: maxRetries || 5,
      },
      create: {
        name,
        congtyId,
        bearerToken,
        baseUrl: baseUrl || 'https://hoadondientu.gdt.gov.vn:30000',
        brandname,
        batchSize: batchSize || 3,
        delayBetweenBatches: delayBetweenBatches || 3000,
        delayBetweenDetailCalls: delayBetweenDetailCalls || 2000,
        maxRetries: maxRetries || 5,
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
      message: 'Đã lưu cấu hình thành công',
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Lỗi không xác định' 
      },
      { status: 500 }
    );
  }
}
