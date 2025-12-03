import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET /api/congty - Lấy danh sách công ty
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const companies = await prisma.ext_congty.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [
        { isDefault: 'desc' },
        { ten: 'asc' }
      ],
      include: {
        _count: {
          select: {
            hoadons: true,
            apiConfigs: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: companies,
      total: companies.length
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy danh sách công ty' },
      { status: 500 }
    );
  }
}

// POST /api/congty - Tạo công ty mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mst, ten, tenVietTat, diaChi, dienThoai, email, nguoiDaiDien, isDefault } = body;

    if (!mst || !ten) {
      return NextResponse.json(
        { success: false, error: 'Mã số thuế và tên công ty là bắt buộc' },
        { status: 400 }
      );
    }

    // Nếu set isDefault = true, bỏ default của các công ty khác
    if (isDefault) {
      await prisma.ext_congty.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    const company = await prisma.ext_congty.upsert({
      where: { mst },
      update: {
        ten,
        tenVietTat,
        diaChi,
        dienThoai,
        email,
        nguoiDaiDien,
        isDefault: isDefault || false
      },
      create: {
        mst,
        ten,
        tenVietTat,
        diaChi,
        dienThoai,
        email,
        nguoiDaiDien,
        isDefault: isDefault || false,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      data: company,
      message: 'Lưu công ty thành công'
    });
  } catch (error) {
    console.error('Error saving company:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lưu công ty' },
      { status: 500 }
    );
  }
}
