import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getEmbedding } from '@/app/services/rag-agent.service';

// Lấy danh sách đang chờ duyệt
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'PENDING';

    const [items, total] = await Promise.all([
      prisma.ext_mapping_queue.findMany({
        where: { status },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.ext_mapping_queue.count({ where: { status } })
    ]);

    return NextResponse.json({
      success: true,
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in GET /api/ai-mapping-queue:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Duyệt / Từ chối
export async function POST(request: NextRequest) {
  try {
    const { id, action, customTenChuan, customMaHang, customDvt } = await request.json();

    const queueItem = await prisma.ext_mapping_queue.findUnique({ where: { id } });
    if (!queueItem) throw new Error("Item not found");

    if (action === 'REJECT') {
      await prisma.ext_mapping_queue.update({
        where: { id },
        data: { status: 'REJECTED' }
      });
      return NextResponse.json({ success: true, message: "Đã từ chối gợi ý" });
    }

    if (action === 'APPROVE') {
      // Có thể là approve gợi ý của AI hoặc approve dòng custom do Kế toán tự nhập
      const tenChuanToSave = customTenChuan || queueItem.aiSuggestedName;
      if (!tenChuanToSave) throw new Error("Thiếu tên chuẩn để ánh xạ");
      
      const maHangToSave = customMaHang || null;
      const dvtToSave = customDvt || queueItem.dvtGoc || null;

      // Sinh embedding cho tên chuẩn mới hoặc tên gốc
      const vector = await getEmbedding(queueItem.tenGoc);
      const vectorStr = `[${vector.join(',')}]`;

      await prisma.$transaction([
        // Xoá record cũ nếu bị trùng tenGoc
        prisma.ext_sanpham_dictionary.deleteMany({ where: { tenGoc: queueItem.tenGoc, congtyId: queueItem.congtyId } }),
        
        // Thêm vào từ điển
        prisma.$executeRaw`
             INSERT INTO "ext_sanpham_dictionary" ("id", "tenGoc", "tenChuan", "maHang", "dvtinh", "embedding", "updatedAt", "congtyId")
             VALUES (gen_random_uuid(), ${queueItem.tenGoc}, ${tenChuanToSave}, ${maHangToSave}, ${dvtToSave}, ${vectorStr}::vector, NOW(), ${queueItem.congtyId})
        `,

        // Đánh dấu Queue là APPROVED
        prisma.ext_mapping_queue.update({
          where: { id },
          data: { status: 'APPROVED' }
        }),

        // Cập nhật hồi tố hàng loạt lại các hóa đơn đã sync nhưng đang mang tên gốc
        prisma.ext_tonghop.updateMany({
           where: { tenHang: queueItem.tenGoc, congtyId: queueItem.congtyId },
           data: { 
             tenHangChuan: tenChuanToSave,
             maHang: maHangToSave,
             dvtinh: dvtToSave,
             updatedAt: new Date()
           }
        })
      ]);

      return NextResponse.json({ success: true, message: "Duyệt thành công. Đã cập nhật hóa đơn liên quan." });
    }

    return NextResponse.json({ success: false, message: "Hành động không hợp lệ" }, { status: 400 });
  } catch (error) {
    console.error('Error in POST /api/ai-mapping-queue:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
