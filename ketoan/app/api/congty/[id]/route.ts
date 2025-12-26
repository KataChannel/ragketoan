import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET /api/congty/[id] - Lấy chi tiết công ty
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const company = await prisma.ext_congty.findUnique({
      where: { id },
      include: {
        apiConfigs: {
          where: { isActive: true }
        },
        _count: {
          select: {
            hoadons: true,
            synclogs: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy công ty' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin công ty' },
      { status: 500 }
    );
  }
}

// PUT /api/congty/[id] - Cập nhật công ty
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ten, tenVietTat, diaChi, dienThoai, email, nguoiDaiDien, isActive, isDefault } = body;

    // Nếu set isDefault = true, bỏ default của các công ty khác
    if (isDefault) {
      await prisma.ext_congty.updateMany({
        where: { 
          isDefault: true,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const company = await prisma.ext_congty.update({
      where: { id },
      data: {
        ten,
        tenVietTat,
        diaChi,
        dienThoai,
        email,
        nguoiDaiDien,
        isActive,
        isDefault
      }
    });

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Cập nhật công ty thành công'
    });
  } catch (error) {
    console.error('Error updating company:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật công ty' },
      { status: 500 }
    );
  }
}

// DELETE /api/congty/[id] - Xóa công ty
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Kiểm tra xem công ty có hóa đơn không
    const invoiceCount = await prisma.ext_listhoadon.count({
      where: { congtyId: id }
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { success: false, error: `Không thể xóa công ty vì có ${invoiceCount} hóa đơn liên quan` },
        { status: 400 }
      );
    }

    await prisma.ext_congty.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa công ty thành công'
    });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa công ty' },
      { status: 500 }
    );
  }
}
