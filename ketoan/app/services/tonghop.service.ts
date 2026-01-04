/**
 * Service Tổng hợp dữ liệu hóa đơn
 * Kết hợp ext_detailhoadon và ext_listhoadon thành ext_tonghop
 * Phục vụ cho RAG và xử lý xuất nhập tồn theo mặt hàng
 */

import prisma from '@/app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// Types
// ============================================================================

export interface TongHopSyncOptions {
  congtyId?: string
  fromDate?: Date
  toDate?: Date
  forceResync?: boolean // Xóa và đồng bộ lại tất cả
}

export interface TongHopSyncResult {
  success: boolean
  totalProcessed: number
  inserted: number
  updated: number
  errors: number
  message: string
  details?: string[]
}

export interface TongHopStats {
  tongSoLuong: number
  tongNhap: number
  tongXuat: number
  giaTriNhap: number
  giaTriXuat: number
  tongMatHang: number
  soHoaDon: number
  giaTriTonCuoi: number
  soLuongTonCuoi: number
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Chuẩn hóa tên hàng hóa cho RAG
 * - Loại bỏ dấu
 * - Viết hoa
 * - Trim whitespace
 */
function chuanHoaTenHang(ten: string): string {
  return ten
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/đ/gi, 'd')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Tạo search text cho full-text search
 */
function taoSearchText(tenHang: string, nbten?: string | null, nmten?: string | null): string {
  const parts = [tenHang]
  if (nbten) parts.push(nbten)
  if (nmten) parts.push(nmten)
  return parts.join(' | ')
}

/**
 * Tính quý từ tháng
 */
function tinhQuy(thang: number): number {
  return Math.ceil(thang / 3)
}

/**
 * Sinh mã hàng từ tên
 */
function sinhMaHang(ten: string, index: number): string {
  const tenChuan = chuanHoaTenHang(ten)
  const words = tenChuan.split(' ').filter(w => w.length > 2)
  const prefix = words.slice(0, 3).map(w => w.charAt(0)).join('')
  return `${prefix || 'SP'}${index.toString().padStart(4, '0')}`
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Đồng bộ dữ liệu từ ext_detailhoadon + ext_listhoadon → ext_tonghop
 */
export async function syncTongHop(options: TongHopSyncOptions = {}): Promise<TongHopSyncResult> {
  const { congtyId, fromDate, toDate, forceResync = false } = options
  const errors: string[] = []
  let inserted = 0
  let updated = 0

  try {
    // Nếu forceResync, xóa dữ liệu cũ theo điều kiện
    if (forceResync) {
      const deleteWhere: Record<string, unknown> = {}
      if (congtyId) deleteWhere.congtyId = congtyId
      if (fromDate || toDate) {
        deleteWhere.tdlap = {}
        if (fromDate) (deleteWhere.tdlap as Record<string, Date>).gte = fromDate
        if (toDate) (deleteWhere.tdlap as Record<string, Date>).lte = toDate
      }
      
      await prisma.ext_tonghop.deleteMany({
        where: Object.keys(deleteWhere).length > 0 ? deleteWhere : undefined
      })
    }

    // Lấy danh sách chi tiết hóa đơn với thông tin header
    const whereClause: Record<string, unknown> = {}
    if (congtyId) {
      whereClause.invoice = { congtyId }
    }
    if (fromDate || toDate) {
      whereClause.invoice = {
        ...(whereClause.invoice as object || {}),
        tdlap: {
          ...(fromDate ? { gte: fromDate } : {}),
          ...(toDate ? { lte: toDate } : {})
        }
      }
    }

    const details = await prisma.ext_detailhoadon.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        invoice: {
          include: {
            congty: true
          }
        }
      }
    })

    // Lấy danh sách idServer đã có trong ext_tonghop
    const existingIds = new Set(
      (await prisma.ext_tonghop.findMany({
        select: { idDetailServer: true }
      })).map(t => t.idDetailServer)
    )

    // Lấy từ điển chuẩn hóa để map tự động
    const dictionary = await (prisma as any).ext_sanpham_dictionary.findMany()
    const dictMap = new Map<string, any>()
    dictionary.forEach((d: any) => dictMap.set(d.tenGoc, d))

    // Xử lý từng chi tiết
    let index = await prisma.ext_tonghop.count()
    
    for (const detail of details) {
      try {
        const invoice = detail.invoice
        const congty = invoice.congty
        
        // Tính các trường derived
        const nam = invoice.tdlap.getFullYear()
        const thang = invoice.tdlap.getMonth() + 1
        const quy = tinhQuy(thang)
        
        const tenHangChuan = chuanHoaTenHang(detail.ten)
        const searchText = taoSearchText(detail.ten, invoice.nbten, invoice.nmten)
        
        // Tính số lượng và giá trị nhập/xuất
        const sluong = new Decimal(detail.sluong)
        const thtien = new Decimal(detail.thtien)
        const tthue = new Decimal(detail.tthue)
        const tongTien = thtien.add(tthue)
        
        const isNhap = invoice.loaihd === 'muavao'
        const soLuongNhap = isNhap ? sluong : new Decimal(0)
        const soLuongXuat = isNhap ? new Decimal(0) : sluong
        const giaTriNhap = isNhap ? tongTien : new Decimal(0)
        const giaTriXuat = isNhap ? new Decimal(0) : tongTien

        const data = {
          idDetailServer: detail.idServer,
          idHoadonServer: invoice.idServer,
          
          // Thông tin công ty
          congtyId: congty?.id || null,
          congtyMst: congty?.mst || null,
          congtyTen: congty?.ten || null,
          
          // Thông tin hóa đơn
          khmshdon: invoice.khmshdon,
          khhdon: invoice.khhdon,
          shdon: invoice.shdon,
          mhso: invoice.mhso,
          tdlap: invoice.tdlap,
          tthai: invoice.tthai,
          loaihd: invoice.loaihd,
          
          // Người bán
          nbmst: invoice.nbmst,
          nbten: invoice.nbten,
          nbdchi: invoice.nbdchi,
          
          // Người mua
          nmmst: invoice.nmmst,
          nmten: invoice.nmten,
          nmdchi: invoice.nmdchi,
          
          // Chi tiết hàng hóa
          stt: detail.stt,
          tenHang: detail.ten,
          tenHangChuan: dictMap.get(detail.ten)?.tenChuan || tenHangChuan,
          maHang: dictMap.get(detail.ten)?.maHang || sinhMaHang(detail.ten, ++index),
          nhomHang: dictMap.get(detail.ten)?.nhomHang || null,
          dvtinh: detail.dvtinh,
          
          // Số liệu
          sluong: detail.sluong,
          dgia: detail.dgia,
          thtien: detail.thtien,
          
          // Thuế
          tsuat: detail.tsuat,
          tthue: detail.tthue,
          tongTien,
          
          // Xuất nhập tồn
          soLuongNhap,
          soLuongXuat,
          giaTriNhap,
          giaTriXuat,
          
          // RAG metadata
          searchText,
          tags: [],
          
          // Thời gian
          nam,
          thang,
          quy,
          
          syncedAt: new Date()
        }

        if (existingIds.has(detail.idServer)) {
          // Update nếu đã tồn tại
          await prisma.ext_tonghop.update({
            where: { idDetailServer: detail.idServer },
            data
          })
          updated++
        } else {
          // Insert mới
          await prisma.ext_tonghop.create({ data })
          inserted++
        }
      } catch (err) {
        const errorMsg = `Lỗi xử lý detail ${detail.idServer}: ${err instanceof Error ? err.message : 'Unknown'}`
        errors.push(errorMsg)
        console.error(errorMsg)
      }
    }

    return {
      success: true,
      totalProcessed: details.length,
      inserted,
      updated,
      errors: errors.length,
      message: `Đồng bộ thành công: ${inserted} mới, ${updated} cập nhật, ${errors.length} lỗi`,
      details: errors.length > 0 ? errors : undefined
    }
  } catch (err) {
    return {
      success: false,
      totalProcessed: 0,
      inserted: 0,
      updated: 0,
      errors: 1,
      message: `Lỗi đồng bộ: ${err instanceof Error ? err.message : 'Unknown'}`,
      details: [err instanceof Error ? err.stack || err.message : 'Unknown error']
    }
  }
}

/**
 * Lấy thống kê tổng hợp
 */
export async function getTongHopStats(options: {
  congtyId?: string
  fromDate?: Date
  toDate?: Date
  maHang?: string
  tenHang?: string
}): Promise<TongHopStats> {
  const { congtyId, fromDate, toDate, maHang, tenHang } = options
  
  const where: Record<string, unknown> = {}
  if (congtyId) where.congtyId = congtyId
  if (maHang) where.maHang = maHang
  if (tenHang) where.tenHang = { contains: tenHang, mode: 'insensitive' }
  if (fromDate || toDate) {
    where.tdlap = {}
    if (fromDate) (where.tdlap as Record<string, Date>).gte = fromDate
    if (toDate) (where.tdlap as Record<string, Date>).lte = toDate
  }

  const [aggregation, countMatHang, countHoaDon, closingStock] = await Promise.all([
    prisma.ext_tonghop.aggregate({
      where,
      _sum: {
        sluong: true,
        soLuongNhap: true,
        soLuongXuat: true,
        giaTriNhap: true,
        giaTriXuat: true
      }
    }),
    prisma.ext_tonghop.groupBy({
      by: ['tenHangChuan'],
      where,
      _count: true
    }),
    prisma.ext_tonghop.groupBy({
      by: ['idHoadonServer'],
      where,
      _count: true
    }),
    (prisma as any).ext_daily_stock_v2.aggregate({
      where: {
        congtyId,
        date: toDate ? { lte: toDate } : undefined
      },
      // Lấy balance gần nhất cho mỗi mặt hàng là phức tạp trong aggregate đơn lẻ
      // Nếu toDate được cung cấp, ta lý tưởng nhất là lấy sum của tonCuoiQty vào ngày toDate
      _sum: {
        tonCuoiQty: true,
        tonCuoiVal: true
      }
    })
  ])

  // Nếu có toDate chi tiết, ta lấy aggregate của ngày đó
  let giaTriTonCuoi = 0;
  let soLuongTonCuoi = 0;
  let tongMatHangWithBalance = 0;

  if (toDate) {
    const endOfDay = new Date(toDate);
    endOfDay.setUTCHours(0, 0, 0, 0);
    
    const [stockAtDate, countWithBalance] = await Promise.all([
      (prisma as any).ext_daily_stock_v2.aggregate({
        where: {
          congtyId,
          date: endOfDay
        },
        _sum: {
          tonCuoiQty: true,
          tonCuoiVal: true
        }
      }),
      (prisma as any).ext_daily_stock_v2.count({
        where: {
          congtyId,
          date: endOfDay,
          OR: [
            { tonCuoiQty: { not: 0 } },
            { tonCuoiVal: { not: 0 } }
          ]
        }
      })
    ]);

    giaTriTonCuoi = Number(stockAtDate._sum.tonCuoiVal || 0);
    soLuongTonCuoi = Number(stockAtDate._sum.tonCuoiQty || 0);
    tongMatHangWithBalance = countWithBalance;
  } else {
    giaTriTonCuoi = Number(closingStock._sum.tonCuoiVal || 0);
    soLuongTonCuoi = Number(closingStock._sum.tonCuoiQty || 0);
    tongMatHangWithBalance = countMatHang.length; // Fallback
  }

  // tongMatHang should be union of transaction items and balance items
  // For simplicity, if we have balance snapshots, we use that count as it's more comprehensive
  const finalTongMatHang = Math.max(countMatHang.length, tongMatHangWithBalance);

  return {
    tongSoLuong: Number(aggregation._sum.sluong || 0),
    tongNhap: Number(aggregation._sum.soLuongNhap || 0),
    tongXuat: Number(aggregation._sum.soLuongXuat || 0),
    giaTriNhap: Number(aggregation._sum.giaTriNhap || 0),
    giaTriXuat: Number(aggregation._sum.giaTriXuat || 0),
    tongMatHang: finalTongMatHang,
    soHoaDon: countHoaDon.length,
    giaTriTonCuoi,
    soLuongTonCuoi
  }
}

/**
 * Lấy danh sách tổng hợp với pagination và filter
 */
export async function getTongHopList(options: {
  congtyId?: string
  fromDate?: Date
  toDate?: Date
  loaihd?: 'banra' | 'muavao'
  search?: string
  page?: number
  limit?: number
  orderBy?: 'tdlap' | 'tenHang' | 'sluong' | 'tongTien'
  order?: 'asc' | 'desc'
}) {
  const {
    congtyId,
    fromDate,
    toDate,
    loaihd,
    search,
    page = 1,
    limit = 20,
    orderBy = 'tdlap',
    order = 'desc'
  } = options

  const where: Record<string, unknown> = {}
  if (congtyId) where.congtyId = congtyId
  if (loaihd) where.loaihd = loaihd
  if (search) {
    where.OR = [
      { tenHang: { contains: search, mode: 'insensitive' } },
      { tenHangChuan: { contains: search, mode: 'insensitive' } },
      { maHang: { contains: search, mode: 'insensitive' } },
      { nbten: { contains: search, mode: 'insensitive' } },
      { nmten: { contains: search, mode: 'insensitive' } }
    ]
  }
  if (fromDate || toDate) {
    where.tdlap = {}
    if (fromDate) (where.tdlap as Record<string, Date>).gte = fromDate
    if (toDate) (where.tdlap as Record<string, Date>).lte = toDate
  }

  const [items, total] = await Promise.all([
    prisma.ext_tonghop.findMany({
      where,
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.ext_tonghop.count({ where })
  ])

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Lấy báo cáo xuất nhập tồn theo mặt hàng với pagination
 */
export async function getXuatNhapTonByMatHang(options: {
  congtyId?: string
  fromDate?: Date
  toDate?: Date
  groupBy?: 'tenHangChuan' | 'maHang' | 'nhomHang'
  page?: number
  limit?: number
  search?: string
}) {
  const { 
    congtyId, 
    fromDate, 
    toDate, 
    groupBy = 'tenHangChuan',
    page = 1,
    limit = 20,
    search
  } = options

  const startDate = fromDate ? new Date(fromDate) : new Date(new Date().getFullYear(), 0, 1);
  const endDate = toDate ? new Date(toDate) : new Date();
  
  // Normalize to UTC midnight for ext_daily_stock_v2 consistency
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(0, 0, 0, 0);

  // Lấy tổng số mặt hàng (nhóm)
  const groupQuery = {
    where: {
      congtyId,
      date: { gte: startDate, lte: endDate },
      ...(search ? { tenHangChuan: { contains: search, mode: 'insensitive' } } : {})
    }
  };
  const groups = await (prisma as any).ext_daily_stock_v2.groupBy({
    by: ['tenHangChuan'],
    where: groupQuery.where,
  });
  const total = groups.length;

  // Lấy dữ liệu tổng hợp từ snapshots
  const snapshots = await (prisma as any).ext_daily_stock_v2.groupBy({
    by: ['tenHangChuan', 'dvtinh'],
    where: groupQuery.where,
    _sum: {
      nhapQty: true,
      nhapVal: true,
      xuatQty: true,
      xuatVal: true,
    },
    orderBy: {
      tenHangChuan: 'asc'
    },
    skip: (page - 1) * limit,
    take: limit
  });

  // Lấy số dư đầu kỳ (tonDauQty ngày startDate) và số dư cuối kỳ (tonCuoiQty ngày endDate)
  const items = await Promise.all(snapshots.map(async (s: any) => {
    const [opening, closing] = await Promise.all([
      (prisma as any).ext_daily_stock_v2.findFirst({
        where: {
          congtyId,
          tenHangChuan: s.tenHangChuan,
          date: startDate
        },
        select: { tonDauQty: true, tonDauVal: true }
      }),
      (prisma as any).ext_daily_stock_v2.findFirst({
        where: {
          congtyId,
          tenHangChuan: s.tenHangChuan,
          date: endDate
        },
        select: { tonCuoiQty: true, tonCuoiVal: true }
      })
    ]);

    const nhapQty = Number(s._sum.nhapQty || 0);
    const nhapVal = Number(s._sum.nhapVal || 0);
    const xuatQty = Number(s._sum.xuatQty || 0);
    const xuatVal = Number(s._sum.xuatVal || 0);
    const tonDauQty = Number(opening?.tonDauQty || 0);
    const tonDauVal = Number(opening?.tonDauVal || 0);
    
    // Nếu không tìm thấy closing (có thể do chưa tính đến ngày đó), ta lấy tonDau + nhap - xuat
    const tonCuoiQty = closing ? Number(closing.tonCuoiQty) : tonDauQty + nhapQty - xuatQty;
    const tonCuoiVal = closing ? Number(closing.tonCuoiVal) : tonDauVal + nhapVal - xuatVal;

    return {
      tenMatHang: s.tenHangChuan || 'Chưa phân loại',
      dvtinh: s.dvtinh,
      soLuongNhap: nhapQty,
      soLuongXuat: xuatQty,
      tonDauQty: tonDauQty,
      tonDauVal: tonDauVal,
      tonCuoi: tonCuoiQty,
      giaTriNhap: nhapVal,
      giaTriXuat: xuatVal,
      giaTriTon: tonCuoiVal,
      soLanGiaoDich: 0 // Snapshot không lưu số lần GD trực tiếp, có thể bổ sung nếu cần
    };
  }));

  // Lấy danh sách tên gốc cho các mặt hàng trong trang này để hiển thị nhỏ bên dưới
  const itemNames = items.map(i => i.tenMatHang).filter(n => n && n !== 'Chưa phân loại')
  const originalNamesMap = new Map<string, Set<string>>()
  
  if (itemNames.length > 0) {
    const originals = await prisma.ext_tonghop.findMany({
      where: {
        congtyId,
        tdlap: { gte: startDate, lte: endDate },
        tenHangChuan: { in: itemNames }
      },
      select: {
        tenHangChuan: true,
        tenHang: true
      }
    })
    
    originals.forEach((o: any) => {
      const key = o.tenHangChuan
      if (key) {
        if (!originalNamesMap.has(key)) originalNamesMap.set(key, new Set())
        originalNamesMap.get(key)?.add(o.tenHang)
      }
    })
  }

  const itemsWithOriginals = items.map(item => ({
    ...item,
    tenGocList: Array.from(originalNamesMap.get(item.tenMatHang) || []).join(', ')
  }))

  return {
    items: itemsWithOriginals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

/**
 * Lấy báo cáo theo thời gian (tháng/quý/năm)
 */
export async function getXuatNhapTonTheoThoiGian(options: {
  congtyId?: string
  nam: number
  groupBy?: 'thang' | 'quy'
}) {
  const { congtyId, nam, groupBy = 'thang' } = options

  const where: Record<string, unknown> = { nam }
  if (congtyId) where.congtyId = congtyId

  // Tách riêng 2 case để tránh lỗi TypeScript với dynamic orderBy
  if (groupBy === 'thang') {
    const result = await prisma.ext_tonghop.groupBy({
      by: ['thang'],
      where,
      _sum: {
        soLuongNhap: true,
        soLuongXuat: true,
        giaTriNhap: true,
        giaTriXuat: true
      },
      _count: true,
      orderBy: {
        thang: 'asc'
      }
    })

    return result.map(item => ({
      thang: item.thang,
      soLuongNhap: Number(item._sum.soLuongNhap || 0),
      soLuongXuat: Number(item._sum.soLuongXuat || 0),
      giaTriNhap: Number(item._sum.giaTriNhap || 0),
      giaTriXuat: Number(item._sum.giaTriXuat || 0),
      soGiaoDich: item._count
    }))
  } else {
    const result = await prisma.ext_tonghop.groupBy({
      by: ['quy'],
      where,
      _sum: {
        soLuongNhap: true,
        soLuongXuat: true,
        giaTriNhap: true,
        giaTriXuat: true
      },
      _count: true,
      orderBy: {
        quy: 'asc'
      }
    })

    return result.map(item => ({
      quy: item.quy,
      soLuongNhap: Number(item._sum.soLuongNhap || 0),
      soLuongXuat: Number(item._sum.soLuongXuat || 0),
      giaTriNhap: Number(item._sum.giaTriNhap || 0),
      giaTriXuat: Number(item._sum.giaTriXuat || 0),
      soGiaoDich: item._count
    }))
  }
}

/**
 * Lấy báo cáo xuất nhập tồn 12 tháng với số dư đầu kỳ/cuối kỳ
 */
export async function getXuatNhapTonBaoCaoThang(options: {
  congtyId?: string
  fromDate: Date
  toDate: Date
}) {
  const { congtyId, fromDate, toDate } = options
  const report: Record<string, any[]> = {}
  
  // Start from the beginning of the fromDate month
  let current = new Date(Date.UTC(fromDate.getUTCFullYear(), fromDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), 1));

  while (current <= end) {
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth() + 1;
    const key = `${month}/${year}`;
    
    // Determine start and end of the month in UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    
    // 1. Sum up all activity (Nhap/Xuat) for the month
    const monthlyActivity = await (prisma as any).ext_daily_stock_v2.groupBy({
      by: ['tenHangChuan', 'dvtinh'],
      where: {
        congtyId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _sum: {
        nhapQty: true,
        nhapVal: true,
        xuatQty: true,
        xuatVal: true
      }
    });

    // 2. Get Opening Balance (TonDau of the first day of the month)
    const openingBalances = await (prisma as any).ext_daily_stock_v2.findMany({
      where: {
        congtyId,
        date: startDate
      },
      select: {
        tenHangChuan: true,
        tonDauQty: true,
        tonDauVal: true
      }
    });

    // 3. Get Closing Balance (TonCuoi of the last day of the month)
    const closingBalances = await (prisma as any).ext_daily_stock_v2.findMany({
      where: {
        congtyId,
        date: endDate
      },
      select: {
        tenHangChuan: true,
        tonCuoiQty: true,
        tonCuoiVal: true
      }
    });

    // Create maps for quick lookup
    const openMap = new Map<string, any>(openingBalances.map((b: any) => [b.tenHangChuan, b]));
    const closeMap = new Map<string, any>(closingBalances.map((b: any) => [b.tenHangChuan, b]));
    
    // Combine into final report for the month
    const allItemNames = new Set([
      ...monthlyActivity.map((a: any) => a.tenHangChuan),
      ...closingBalances.filter((b: any) => Number(b.tonCuoiQty) !== 0 || Number(b.tonCuoiVal) !== 0).map((b: any) => b.tenHangChuan),
      ...openingBalances.filter((b: any) => Number(b.tonDauQty) !== 0 || Number(b.tonDauVal) !== 0).map((b: any) => b.tenHangChuan)
    ]);

    report[key] = Array.from(allItemNames).map(name => {
      const act = monthlyActivity.find((a: any) => a.tenHangChuan === name);
      const open = openMap.get(name);
      const close = closeMap.get(name);

      return {
        tenMatHang: name,
        dvt: act?.dvtinh || open?.dvtinh || close?.dvtinh || '',
        tonDauQty: Number(open?.tonDauQty || 0),
        tonDauVal: Number(open?.tonDauVal || 0),
        nhapQty: Number(act?._sum?.nhapQty || 0),
        nhapVal: Number(act?._sum?.nhapVal || 0),
        xuatQty: Number(act?._sum?.xuatQty || 0),
        xuatVal: Number(act?._sum?.xuatVal || 0),
        tonCuoiQty: Number(close?.tonCuoiQty || 0),
        tonCuoiVal: Number(close?.tonCuoiVal || 0)
      };
    }).sort((a, b) => a.tenMatHang.localeCompare(b.tenMatHang));

    // Move to next month
    current.setUTCMonth(current.getUTCMonth() + 1);
  }

  return report;
}

/**
 * Tính toán lại tồn kho hàng ngày và lưu vào bảng ext_daily_stock_balance
 * @param congtyId ID công ty (null nếu tất cả)
 */
export async function recalculateDailyInventory(congtyId?: string) {
  console.log(`Starting recalculateDailyInventory for company: ${congtyId || 'ALL'}`);
  
  // 1. Xóa dữ liệu cũ
  const deleteWhere = congtyId ? { congtyId } : {};
  await (prisma as any).ext_daily_stock_v2.deleteMany({ where: deleteWhere });

  // 2. Lấy tất cả các mặt hàng chuẩn và DVT của chúng
  const items = await prisma.ext_tonghop.findMany({
    where: congtyId ? { congtyId } : {},
    select: {
      tenHangChuan: true,
      dvtinh: true,
      maHang: true,
      congtyId: true,
    },
    distinct: ['tenHangChuan', 'congtyId']
  });

  if (items.length === 0) return { success: true, message: 'Không có dữ liệu để tính toán' };

  // 3. Lấy tất cả giao dịch, sắp xếp theo ngày
  const transactions = await prisma.ext_tonghop.findMany({
    where: congtyId ? { congtyId } : {},
    orderBy: { tdlap: 'asc' },
    select: {
      tdlap: true,
      tenHangChuan: true,
      soLuongNhap: true,
      soLuongXuat: true,
      giaTriNhap: true,
      giaTriXuat: true,
      congtyId: true
    }
  });

  // 4. Tìm ngày bắt đầu và kết thúc
  const startDate = new Date(transactions[0].tdlap);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setUTCHours(0, 0, 0, 0);

  // Group transactions by date and product
  const transByDate = new Map<string, Map<string, any>>();
  transactions.forEach(t => {
    if (!t.tenHangChuan) return;
    const dateStr = t.tdlap.toISOString().split('T')[0];
    if (!transByDate.has(dateStr)) transByDate.set(dateStr, new Map());
    const dayMap = transByDate.get(dateStr)!;
    
    // Key is companyId + tenHangChuan
    const key = `${t.congtyId}_${t.tenHangChuan}`;
    if (!dayMap.has(key)) {
      dayMap.set(key, { 
        nhapQty: new Decimal(0), nhapVal: new Decimal(0), 
        xuatQty: new Decimal(0), xuatVal: new Decimal(0) 
      });
    }
    const sum = dayMap.get(key);
    sum.nhapQty = sum.nhapQty.add(t.soLuongNhap);
    sum.nhapVal = sum.nhapVal.add(t.giaTriNhap);
    sum.xuatQty = sum.xuatQty.add(t.soLuongXuat);
    sum.xuatVal = sum.xuatVal.add(t.giaTriXuat);
  });

  // Current running balance: Map<Key, {qty, val}>
  const balances = new Map<string, { qty: Decimal, val: Decimal }>();
  
  // Data for bulk insert
  const snapshotData: any[] = [];
  
  // Iterate day by day
  let current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const dayTrans = transByDate.get(dateStr) || new Map();
    
    // Process each item
    for (const item of items) {
      if (!item.tenHangChuan) continue;
      const key = `${item.congtyId}_${item.tenHangChuan}`;
      const prevBal = balances.get(key) || { qty: new Decimal(0), val: new Decimal(0) };
      const trans = dayTrans.get(key) || { 
        nhapQty: new Decimal(0), nhapVal: new Decimal(0), 
        xuatQty: new Decimal(0), xuatVal: new Decimal(0) 
      };

      const tonCuoiQty = prevBal.qty.add(trans.nhapQty).sub(trans.xuatQty);
      const tonCuoiVal = prevBal.val.add(trans.nhapVal).sub(trans.xuatVal);

      // Only save if there's a balance or a transaction today
      if (tonCuoiQty.toNumber() !== 0 || tonCuoiVal.toNumber() !== 0 || 
          prevBal.qty.toNumber() !== 0 || trans.nhapQty.toNumber() !== 0 || trans.xuatQty.toNumber() !== 0) {
        
        snapshotData.push({
          congtyId: item.congtyId,
          date: new Date(current),
          tenHangChuan: item.tenHangChuan,
          maHang: item.maHang,
          dvtinh: item.dvtinh,
          tonDauQty: prevBal.qty,
          tonDauVal: prevBal.val,
          nhapQty: trans.nhapQty,
          nhapVal: trans.nhapVal,
          xuatQty: trans.xuatQty,
          xuatVal: trans.xuatVal,
          tonCuoiQty: tonCuoiQty,
          tonCuoiVal: tonCuoiVal
        });

        // Update running balance
        balances.set(key, { qty: tonCuoiQty, val: tonCuoiVal });
      }
    }
    
    current.setDate(current.getDate() + 1);
    
    // Batch insert every 5000 records to avoid memory issues and query limits
    if (snapshotData.length >= 5000) {
       await (prisma as any).ext_daily_stock_v2.createMany({ data: snapshotData });
       snapshotData.length = 0;
    }
  }

  // Final batch insert
  if (snapshotData.length > 0) {
    await (prisma as any).ext_daily_stock_v2.createMany({ data: snapshotData });
  }

  return { 
    success: true, 
    message: `Đã tính toán xong tồn kho hàng ngày từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()}` 
  };
}

// ============================================================================
// Export default
// ============================================================================

export default {
  syncTongHop,
  getTongHopStats,
  getTongHopList,
  getXuatNhapTonByMatHang,
  getXuatNhapTonTheoThoiGian,
  getXuatNhapTonBaoCaoThang,
  recalculateDailyInventory
}
