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
  soMatHang: number
  soHoaDon: number
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

  const [aggregation, countMatHang, countHoaDon] = await Promise.all([
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
    })
  ])

  return {
    tongSoLuong: Number(aggregation._sum.sluong || 0),
    tongNhap: Number(aggregation._sum.soLuongNhap || 0),
    tongXuat: Number(aggregation._sum.soLuongXuat || 0),
    giaTriNhap: Number(aggregation._sum.giaTriNhap || 0),
    giaTriXuat: Number(aggregation._sum.giaTriXuat || 0),
    soMatHang: countMatHang.length,
    soHoaDon: countHoaDon.length
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

  const where: Record<string, any> = {}
  if (congtyId) where.congtyId = congtyId
  if (fromDate || toDate) {
    where.tdlap = {}
    if (fromDate) where.tdlap.gte = fromDate
    if (toDate) where.tdlap.lte = toDate
  }
  
  if (search) {
    where[groupBy] = { contains: search, mode: 'insensitive' }
  }

  // Tiếc là Prisma groupBy chưa hỗ trợ skip/take trực tiếp tốt cho pagination phức tạp
  // Nên ta lấy tất cả rồi phân trang ở code, hoặc dùng raw query
  // Tuy nhiên, vì số lượng mặt hàng thường không quá lớn (vài nghìn), 
  // ta có thể thực hiện count và sau đó lấy dữ liệu với pagination
  
  // Để pagination chính xác, ta cần biết tổng số nhóm
  const groups = await prisma.ext_tonghop.groupBy({
    by: [groupBy],
    where,
  })
  const total = groups.length

  const result = await prisma.ext_tonghop.groupBy({
    by: [groupBy, 'dvtinh'],
    where,
    _sum: {
      soLuongNhap: true,
      soLuongXuat: true,
      giaTriNhap: true,
      giaTriXuat: true
    },
    _count: true,
    orderBy: {
      _sum: {
        giaTriNhap: 'desc'
      }
    },
    skip: (page - 1) * limit,
    take: limit
  })

  const items = result.map(item => ({
    tenMatHang: (item[groupBy] as string) || 'Chưa phân loại',
    dvtinh: item.dvtinh,
    soLuongNhap: Number(item._sum.soLuongNhap || 0),
    soLuongXuat: Number(item._sum.soLuongXuat || 0),
    tonCuoi: Number(item._sum.soLuongNhap || 0) - Number(item._sum.soLuongXuat || 0),
    giaTriNhap: Number(item._sum.giaTriNhap || 0),
    giaTriXuat: Number(item._sum.giaTriXuat || 0),
    giaTriTon: Number(item._sum.giaTriNhap || 0) - Number(item._sum.giaTriXuat || 0),
    soLanGiaoDich: item._count
  }))

  // Lấy danh sách tên gốc cho các mặt hàng trong trang này để hiển thị nhỏ bên dưới
  const itemNames = items.map(i => i.tenMatHang).filter(n => n && n !== 'Chưa phân loại')
  const originalNamesMap = new Map<string, Set<string>>()
  
  if (itemNames.length > 0) {
    const originals = await prisma.ext_tonghop.findMany({
      where: {
        ...where,
        [groupBy]: { in: itemNames }
      },
      select: {
        [groupBy]: true,
        tenHang: true
      }
    })
    
    originals.forEach((o: any) => {
      const key = o[groupBy]
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
  nam: number
}) {
  const { congtyId, nam } = options
  const where: any = {}
  if (congtyId) where.congtyId = congtyId

  // 1. Lấy tất cả mặt hàng có phát sinh
  const items = await prisma.ext_tonghop.groupBy({
    by: ['tenHangChuan', 'dvtinh'],
    where: {
      ...where,
      nam: { lte: nam }
    }
  })

  // Lấy danh sách tên gốc tương ứng
  const allTenHangChuan = items.map(i => i.tenHangChuan).filter(Boolean) as string[]
  const originalNamesMap = new Map<string, Set<string>>()
  
  if (allTenHangChuan.length > 0) {
    const originals = await prisma.ext_tonghop.findMany({
      where: {
        ...where,
        tenHangChuan: { in: allTenHangChuan }
      },
      select: {
        tenHangChuan: true,
        tenHang: true
      }
    })
    
    originals.forEach(o => {
      if (o.tenHangChuan) {
        if (!originalNamesMap.has(o.tenHangChuan)) originalNamesMap.set(o.tenHangChuan, new Set())
        originalNamesMap.get(o.tenHangChuan)?.add(o.tenHang)
      }
    })
  }

  // 2. Lấy số dư đầu năm (trước ngày 01/01/nam)
  const openingYear = await prisma.ext_tonghop.groupBy({
    by: ['tenHangChuan'],
    where: {
      ...where,
      tdlap: { lt: new Date(nam, 0, 1) }
    },
    _sum: {
      soLuongNhap: true,
      soLuongXuat: true,
      giaTriNhap: true,
      giaTriXuat: true
    }
  })

  const openingYearMap = new Map()
  openingYear.forEach(item => {
    openingYearMap.set(item.tenHangChuan, {
      qty: Number(item._sum.soLuongNhap || 0) - Number(item._sum.soLuongXuat || 0),
      val: Number(item._sum.giaTriNhap || 0) - Number(item._sum.giaTriXuat || 0)
    })
  })

  // 3. Lấy dữ liệu phát sinh trong từng tháng của năm
  const monthlyTransactions = await prisma.ext_tonghop.groupBy({
    by: ['tenHangChuan', 'thang'],
    where: {
      ...where,
      nam: nam
    },
    _sum: {
      soLuongNhap: true,
      soLuongXuat: true,
      giaTriNhap: true,
      giaTriXuat: true
    }
  })

  // Map dữ liệu theo [thang][tenHangChuan]
  const transMap = new Map()
  monthlyTransactions.forEach(t => {
    if (!transMap.has(t.thang)) transMap.set(t.thang, new Map())
    transMap.get(t.thang).set(t.tenHangChuan, {
      inQty: Number(t._sum.soLuongNhap || 0),
      inVal: Number(t._sum.giaTriNhap || 0),
      outQty: Number(t._sum.soLuongXuat || 0),
      outVal: Number(t._sum.giaTriXuat || 0)
    })
  })

  // 4. Tổng hợp 12 tháng
  const report: Record<number, any[]> = {}
  
  // Khởi tạo số dư lũy kế bắt đầu từ đầu năm
  const currentBalances = new Map(openingYearMap)

  for (let m = 1; m <= 12; m++) {
    const monthData: any[] = []
    const monthTrans = transMap.get(m) || new Map()

    items.forEach(item => {
      const tenHang = item.tenHangChuan as string
      const dvt = item.dvtinh || ''
      const bal = currentBalances.get(tenHang) || { qty: 0, val: 0 }
      const trans = monthTrans.get(tenHang) || { inQty: 0, inVal: 0, outQty: 0, outVal: 0 }

      // Chỉ thêm vào báo cáo nếu có số dư hoặc có phát sinh trong tháng
      if (bal.qty !== 0 || trans.inQty !== 0 || trans.outQty !== 0) {
        const closingQty = bal.qty + trans.inQty - trans.outQty
        const closingVal = bal.val + trans.inVal - trans.outVal

        monthData.push({
          tenMatHang: tenHang,
          tenGocList: Array.from(originalNamesMap.get(tenHang) || []).join(', '),
          dvt: dvt,
          tonDauQty: bal.qty,
          tonDauVal: bal.val,
          nhapQty: trans.inQty,
          nhapVal: trans.inVal,
          xuatQty: trans.outQty,
          xuatVal: trans.outVal,
          tonCuoiQty: closingQty,
          tonCuoiVal: closingVal
        })

        // Cập nhật số dư cho tháng sau
        currentBalances.set(tenHang, {
          qty: closingQty,
          val: closingVal
        })
      }
    })

    report[m] = monthData
  }

  return report
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
  getXuatNhapTonBaoCaoThang
}
