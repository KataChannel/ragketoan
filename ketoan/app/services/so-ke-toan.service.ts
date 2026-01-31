/**
 * Service Xử lý Sổ Kế Toán
 * Tự động hạch toán và lên sổ từ dữ liệu ext_tonghop
 */

import prisma from '@/app/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================================================
// Types
// ============================================================================

export interface AccountingEntry {
  id: string
  ngay: Date
  soHdon: string
  khHdon: string
  loaihd: string
  doitac: string
  dienGiai: string
  tkNo: string
  tkCo: string
  soTien: number
  tenHang: string
  maHang?: string
}

export interface JournalOptions {
  congtyId?: string
  fromDate: Date
  toDate: Date
  search?: string
}

// ============================================================================
// Logic Hạch Toán
// ============================================================================

/**
 * Xác định tài khoản hạch toán dựa trên loại hóa đơn và tên hàng
 */
function getAccountMapping(loaihd: string, tenHang: string): { no: string, co: string } {
  const tenUpper = tenHang.toUpperCase()
  
  if (loaihd === 'banra') {
    // Bán hàng: Nợ 131 / Có 511
    return { no: '131', co: '511' }
  } else {
    // Mua vào
    // Kiểm tra một số từ khóa để phân loại chi phí
    if (tenUpper.includes('CUOC') || tenUpper.includes('PHI') || tenUpper.includes('DICH VU')) {
      return { no: '642', co: '331' }
    }
    if (tenUpper.includes('DIEN') || tenUpper.includes('NUOC') || tenUpper.includes('INTERNET')) {
      return { no: '642', co: '331' }
    }
    // Mặc định là mua hàng hóa
    return { no: '156', co: '331' }
  }
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Lấy dữ liệu Sổ Nhật Ký Chung
 */
export async function getJournalEntries(options: JournalOptions): Promise<AccountingEntry[]> {
  const { congtyId, fromDate, toDate, search } = options

  // 1. Lấy dữ liệu từ ext_tonghop
  const query: any = {
    where: {
      tdlap: {
        gte: fromDate,
        lte: toDate
      }
    },
    orderBy: {
      tdlap: 'asc'
    }
  }

  if (congtyId) query.where.congtyId = congtyId
  if (search) {
    query.where.OR = [
      { tenHang: { contains: search, mode: 'insensitive' } },
      { nbten: { contains: search, mode: 'insensitive' } },
      { nmten: { contains: search, mode: 'insensitive' } },
      { shdon: { contains: search, mode: 'insensitive' } }
    ]
  }

  const data = await prisma.ext_tonghop.findMany(query)

  // 2. Chuyển đổi thành bút toán
  const entries: AccountingEntry[] = []

  for (const item of data) {
    const mapping = getAccountMapping(item.loaihd, item.tenHang)
    const doitac = item.loaihd === 'banra' ? item.nmten : item.nbten
    
    // Bút toán doanh thu / giá trị hàng
    entries.push({
      id: `${item.id}_dt`,
      ngay: item.tdlap,
      soHdon: item.shdon,
      khHdon: item.khhdon,
      loaihd: item.loaihd,
      doitac: doitac || '',
      dienGiai: `${item.loaihd === 'banra' ? 'Bán' : 'Mua'} ${item.tenHang}`,
      tkNo: mapping.no,
      tkCo: mapping.co,
      soTien: Number(item.thtien),
      tenHang: item.tenHang,
      maHang: item.maHang || undefined
    })

    // Bút toán thuế (nếu có)
    if (Number(item.tthue) > 0) {
      const tkThue = item.loaihd === 'banra' ? '3331' : '133'
      entries.push({
        id: `${item.id}_thue`,
        ngay: item.tdlap,
        soHdon: item.shdon,
        khHdon: item.khhdon,
        loaihd: item.loaihd,
        doitac: doitac || '',
        dienGiai: `Thuế GTGT ${item.loaihd === 'banra' ? 'bán ra' : 'mua vào'}`,
        tkNo: item.loaihd === 'banra' ? '131' : tkThue,
        tkCo: item.loaihd === 'banra' ? tkThue : '331',
        soTien: Number(item.tthue),
        tenHang: item.tenHang
      })
    }
  }

  return entries
}

/**
 * Lấy dữ liệu Sổ Cái theo tài khoản
 */
export async function getLedgerEntries(tk: string, options: JournalOptions) {
  const allEntries = await getJournalEntries(options)
  
  // Lọc các bút toán có liên quan đến tài khoản này
  return allEntries.filter(e => e.tkNo === tk || e.tkCo === tk).map(e => ({
    ...e,
    no: e.tkNo === tk ? e.soTien : 0,
    co: e.tkCo === tk ? e.soTien : 0,
    tkDoiUng: e.tkNo === tk ? e.tkCo : e.tkNo
  }))
}

/**
 * Lập Bảng cân đối số phát sinh
 */
export async function getTrialBalance(options: JournalOptions) {
  const allEntries = await getJournalEntries(options)
  const balanceMap = new Map<string, { no: number, co: number }>()

  allEntries.forEach(e => {
    // Bên Nợ
    const noBal = balanceMap.get(e.tkNo) || { no: 0, co: 0 }
    balanceMap.set(e.tkNo, { ...noBal, no: noBal.no + e.soTien })

    // Bên Có
    const coBal = balanceMap.get(e.tkCo) || { no: 0, co: 0 }
    balanceMap.set(e.tkCo, { ...coBal, co: coBal.co + e.soTien })
  })

  return Array.from(balanceMap.entries()).map(([tk, val]) => ({
    tk,
    no: val.no,
    co: val.co
  })).sort((a, b) => a.tk.localeCompare(b.tk))
}

export default {
  getJournalEntries,
  getLedgerEntries,
  getTrialBalance
}
