import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { pushToMappingQueue } from '@/app/services/rag-worker.service';

export async function POST(request: NextRequest) {
  try {
    const { congtyId } = await request.json();

    const whereClause: any = {
      tdlap: { gte: new Date('2020-01-01T00:00:00Z') }
    };

    if (congtyId && congtyId !== 'all') {
      whereClause.congtyId = congtyId;
    }

    // Lấy các mặt hàng chưa có mã chuẩn
    const items = await prisma.ext_tonghop.findMany({
      where: whereClause,
      select: {
        tenHang: true,
        dvtinh: true,
        congtyId: true,
      },
      distinct: ['congtyId', 'tenHang']
    });

    const itemsToQueue = items.map(item => ({
      tenGoc: item.tenHang,
      dvtGoc: item.dvtinh,
      congtyId: item.congtyId
    }));

    if (itemsToQueue.length > 0) {
      await pushToMappingQueue(itemsToQueue);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Đã phát hiện và đẩy ${itemsToQueue.length} mặt hàng độc nhất từ 01/01/2020 vào Hàng Đợi. AI đang phân tích, vui lòng chờ...`,
      count: itemsToQueue.length
    });
  } catch (error) {
    console.error('Error in POST /api/ai-mapping-queue/scan-existing:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
