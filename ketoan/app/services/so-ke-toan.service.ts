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
function getAccountMapping(loaihd: string, tenHang: string): { no: string, co: string, isDiscount?: boolean } {
  const tenUpper = tenHang.toUpperCase()
  
  if (loaihd === 'banra') {
    // Kiểm tra hàng giảm giá/chiết khấu
    if (tenUpper.includes('CHIET KHAU') || tenUpper.includes(' CK ') || tenUpper.startsWith('CK ')) {
      // Chiết khấu thương mại: Nợ 521 / Có 131 (TT200) hoặc Có 511 (TT133 ghi giảm)
      // Ở đây dùng 521 cho chuẩn chuyên nghiệp
      return { no: '521', co: '131', isDiscount: true }
    }
    // Bán hàng mặc định: Nợ 131 / Có 511
    return { no: '131', co: '511' }
  } else {
    // Mua vào
    // Kiểm tra một số từ khóa để phân loại chi phí (642, 641, 242...)
    if (tenUpper.includes('CUOC') || tenUpper.includes('PHI') || tenUpper.includes('DICH VU') || 
        tenUpper.includes('GIA CONG') || tenUpper.includes('VAN CHUYEN')) {
      return { no: '642', co: '331' }
    }
    if (tenUpper.includes('DIEN') || tenUpper.includes('NUOC') || tenUpper.includes('INTERNET') || tenUpper.includes('WIFI')) {
      return { no: '642', co: '331' }
    }
    if (tenUpper.includes('CONG CU') || tenUpper.includes('DUNG CU') || tenUpper.includes('VAN PHONG PHAM') || tenUpper.includes('MUC IN')) {
      return { no: '153', co: '331' }
    }
    if (tenUpper.includes('MAY TINH') || tenUpper.includes('LAPTOP') || tenUpper.includes('DIEU HOA') || tenUpper.includes('TU LANH')) {
      // Có thể là TSCĐ hoặc CCDC tùy giá trị, tạm để 242 để phân bổ
      return { no: '242', co: '331' }
    }
    // Mua nguyên vật liệu (SX) hay hàng hóa?
    if (tenUpper.includes('NGUYEN LIEU') || tenUpper.includes('VAT LIEU') || tenUpper.includes('PHU LIEU')) {
      return { no: '152', co: '331' }
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

  // 2. Pre-fetch dữ liệu kho để tính giá vốn (COGS)
  const stockData = await (prisma as any).ext_daily_stock_v2.findMany({
    where: {
      congtyId,
      date: { gte: fromDate, lte: toDate }
    }
  })
  const stockMap = new Map() // Key: dateStr_tenHangChuan
  stockData.forEach((s: any) => {
    const dateStr = s.date.toISOString().split('T')[0]
    stockMap.set(`${dateStr}_${s.tenHangChuan}`, s)
  })

  // 3. Chuyển đổi thành bút toán
  const entries: AccountingEntry[] = []

  for (const item of data) {
    const valAmount = Number(item.thtien)
    const valTax = Number(item.tthue)

    // BỎ QUA dòng trắng (Khuyến mãi 0đ và không thuế) để sạch sổ
    if (valAmount === 0 && valTax === 0) continue

    const mapping = getAccountMapping(item.loaihd, item.tenHang)
    const doitac = item.loaihd === 'banra' ? item.nmten : item.nbten
    
    // Bút toán doanh thu / giá trị hàng (Chỉ ghi nếu > 0 hoặc là dòng chiết khấu)
    if (valAmount !== 0) {
      entries.push({
        id: `${item.id}_dt`,
        ngay: item.tdlap,
        soHdon: item.shdon,
        khHdon: item.khhdon,
        loaihd: item.loaihd,
        doitac: doitac || '',
        dienGiai: mapping.isDiscount ? `Chiết khấu: ${item.tenHang}` : `${item.loaihd === 'banra' ? 'Bán' : 'Mua'} ${item.tenHang}`,
        tkNo: mapping.no,
        tkCo: mapping.co,
        soTien: Math.abs(valAmount), // Luôn để số dương, tài khoản No/Co sẽ quyết định bản chất
        tenHang: item.tenHang,
        maHang: item.maHang || undefined
      })

      // TỰ ĐỘNG GHI GIÁ VỐN CHO HÓA ĐƠN BÁN RA
      if (item.loaihd === 'banra' && !mapping.isDiscount) {
        const dateStr = item.tdlap.toISOString().split('T')[0]
        const stock = stockMap.get(`${dateStr}_${item.tenHangChuan}`)
        if (stock && Number(stock.xuatQty) > 0) {
          const unitCOGS = Number(stock.xuatVal) / Number(stock.xuatQty)
          const totalCOGS = unitCOGS * Number(item.sluong)
          if (totalCOGS > 0) {
            entries.push({
              id: `${item.id}_gv`,
              ngay: item.tdlap,
              soHdon: item.shdon,
              khHdon: item.khhdon,
              loaihd: 'gia_von',
              doitac: 'Hệ thống',
              dienGiai: `Giá vốn: ${item.tenHang}`,
              tkNo: '632',
              tkCo: '156',
              soTien: totalCOGS,
              tenHang: item.tenHang,
              maHang: item.maHang || undefined
            })
          }
        }
      }
    }

    // Bút toán thuế (nếu có)
    if (valTax !== 0) {
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
        soTien: Math.abs(valTax),
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

/**
 * Lấy dữ liệu Sổ Chi Tiết theo đối tượng (Khách hàng/Nhà cung cấp) hoặc Mặt hàng
 */
export async function getDetailLedgerEntries(tk: string, doiTuong: string, options: JournalOptions) {
  const allEntries = await getJournalEntries(options)
  
  // Lọc theo tài khoản AND (đối tác OR mã hàng)
  return allEntries.filter(e => 
    (e.tkNo === tk || e.tkCo === tk) && 
    (e.doitac.includes(doiTuong) || e.maHang === doiTuong || e.tenHang.includes(doiTuong))
  ).map(e => ({
    ...e,
    no: e.tkNo === tk ? e.soTien : 0,
    co: e.tkCo === tk ? e.soTien : 0,
    tkDoiUng: e.tkNo === tk ? e.tkCo : e.tkNo
  }))
}

/**
 * Tự động tạo bút toán kết chuyển cuối kỳ (Xác định kết quả kinh doanh)
 */
export async function getClosingEntries(options: JournalOptions): Promise<AccountingEntry[]> {
  const trialBalance = await getTrialBalance(options)
  const closingEntries: AccountingEntry[] = []
  
  // 1. Kết chuyển doanh thu: Nợ 511 / Có 911
  const tk511 = trialBalance.find(t => t.tk === '511')
  if (tk511 && tk511.co > 0) {
    closingEntries.push({
      id: 'closing_511_911',
      ngay: options.toDate,
      soHdon: 'KC-DT',
      khHdon: 'KC',
      loaihd: 'ket_chuyen',
      doitac: 'Hệ thống',
      dienGiai: 'Kết chuyển doanh thu bán hàng',
      tkNo: '511',
      tkCo: '911',
      soTien: tk511.co,
      tenHang: 'Kết chuyển'
    })
  }

  // 2. Kết chuyển giá vốn (Giả định giá vốn = 80% doanh thu nếu chưa có sổ kho chuẩn)
  const tk632 = trialBalance.find(t => t.tk === '632')
  const val632 = tk632 ? tk632.no : (tk511 ? tk511.co * 0.8 : 0)
  if (val632 > 0) {
    closingEntries.push({
      id: 'closing_911_632',
      ngay: options.toDate,
      soHdon: 'KC-GV',
      khHdon: 'KC',
      loaihd: 'ket_chuyen',
      doitac: 'Hệ thống',
      dienGiai: 'Kết chuyển giá vốn hàng bán',
      tkNo: '911',
      tkCo: '632',
      soTien: val632,
      tenHang: 'Kết chuyển'
    })
  }

  // 3. Kết chuyển chi phí quản lý: Nợ 911 / Có 642
  const tk642 = trialBalance.find(t => t.tk === '642')
  if (tk642 && tk642.no > 0) {
    closingEntries.push({
      id: 'closing_911_642',
      ngay: options.toDate,
      soHdon: 'KC-CP',
      khHdon: 'KC',
      loaihd: 'ket_chuyen',
      doitac: 'Hệ thống',
      dienGiai: 'Kết chuyển chi phí quản lý',
      tkNo: '911',
      tkCo: '642',
      soTien: tk642.no,
      tenHang: 'Kết chuyển'
    })
  }

  return closingEntries
}

/**
 * Lập Báo cáo Kết quả Kinh doanh
 */
export async function getProfitAndLoss(options: JournalOptions) {
  const trialBalance = await getTrialBalance(options)
  
  const doanhThu = trialBalance.find(t => t.tk === '511')?.co || 0
  const giamTru = trialBalance.find(t => t.tk === '521')?.no || 0
  const doanhThuThuan = doanhThu - giamTru
  const giaVon = trialBalance.find(t => t.tk === '632')?.no || (doanhThu * 0.8)
  const loiNhuanGop = doanhThuThuan - giaVon
  const chiPhiQL = trialBalance.find(t => t.tk === '642')?.no || 0
  const loiNhuanThuan = loiNhuanGop - chiPhiQL
  const thueTNDN = loiNhuanThuan > 0 ? loiNhuanThuan * 0.2 : 0
  const loiNhuanSauThue = loiNhuanThuan - thueTNDN

  return [
    { target: '1. Doanh thu bán hàng và cung cấp dịch vụ', code: '01', value: doanhThu },
    { target: '2. Các khoản giảm trừ doanh thu', code: '02', value: giamTru },
    { target: '3. Doanh thu thuần về bán hàng và cung cấp dịch vụ', code: '10', value: doanhThuThuan },
    { target: '4. Giá vốn hàng bán', code: '11', value: giaVon },
    { target: '5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ', code: '20', value: loiNhuanGop },
    { target: '6. Chi phí quản lý doanh nghiệp', code: '21', value: chiPhiQL },
    { target: '7. Lợi nhuận thuần từ hoạt động kinh doanh', code: '30', value: loiNhuanThuan },
    { target: '8. Tổng lợi nhuận kế toán trước thuế', code: '50', value: loiNhuanThuan },
    { target: '9. Chi phí thuế TNDN hiện hành', code: '51', value: thueTNDN },
    { target: '10. Lợi nhuận sau thuế thu nhập doanh nghiệp', code: '60', value: loiNhuanSauThue },
  ]
}

/**
 * Lập Bảng Cân đối Kế toán (B01-DNN)
 */
export async function getBalanceSheet(options: JournalOptions) {
  const trialBalance = await getTrialBalance(options)
  
  // Nhóm các tài khoản theo chỉ tiêu
  const getVal = (tks: string[]) => trialBalance.filter(t => tks.some(tk => t.tk.startsWith(tk))).reduce((acc, curr) => acc + (curr.no - curr.co), 0)
  const getAbsVal = (tks: string[]) => Math.abs(getVal(tks))

  const tien = getVal(['111', '112'])
  const phaiThu = getVal(['131', '136', '138'])
  const hangTonKho = getVal(['152', '153', '155', '156'])
  const taiSanCoDinh = getVal(['211', '213']) - getAbsVal(['214'])
  
  const phaiTra = Math.abs(trialBalance.filter(t => ['331', '333', '334', '338'].some(tk => t.tk.startsWith(tk))).reduce((acc, curr) => acc + (curr.co - curr.no), 0))
  const vonChu = Math.abs(trialBalance.filter(t => t.tk.startsWith('411')).reduce((acc, curr) => acc + (curr.co - curr.no), 0))
  const loiNhuan = trialBalance.filter(t => t.tk.startsWith('421')).reduce((acc, curr) => acc + (curr.co - curr.no), 0)

  return [
    { target: 'A. TÀI SẢN NGẮN HẠN', code: '100', value: tien + phaiThu + hangTonKho, isHeader: true },
    { target: 'I. Tiền và các khoản tương đương tiền', code: '110', value: tien },
    { target: 'II. Các khoản phải thu ngắn hạn', code: '130', value: phaiThu },
    { target: 'III. Hàng tồn kho', code: '140', value: hangTonKho },
    { target: 'B. TÀI SẢN DÀI HẠN', code: '200', value: taiSanCoDinh, isHeader: true },
    { target: 'I. Tài sản cố định', code: '220', value: taiSanCoDinh },
    { target: 'TỔNG CỘNG TÀI SẢN', code: '250', value: tien + phaiThu + hangTonKho + taiSanCoDinh, isTotal: true },
    { target: 'C. NỢ PHẢI TRẢ', code: '300', value: phaiTra, isHeader: true },
    { target: 'I. Nợ ngắn hạn', code: '310', value: phaiTra },
    { target: 'D. VỐN CHỦ SỞ HỮU', code: '400', value: vonChu + loiNhuan, isHeader: true },
    { target: 'I. Vốn góp của chủ sở hữu', code: '411', value: vonChu },
    { target: 'II. Lợi nhuận sau thuế chưa phân phối', code: '421', value: loiNhuan },
    { target: 'TỔNG CỘNG NGUỒN VỐN', code: '440', value: phaiTra + vonChu + loiNhuan, isTotal: true },
  ]
}

/**
 * AI Audit: Rà soát lỗi và rủi ro sổ sách
 */
export async function getAuditAlerts(options: JournalOptions) {
  const entries = await getJournalEntries(options)
  const alerts: { type: 'error' | 'warning' | 'info', title: string, detail: string, amount?: number }[] = []

  // 1. Kiểm tra hóa đơn > 20 triệu thanh toán tiền mặt (Rủi ro thuế)
  const bigCashEntries = entries.filter(e => e.soTien >= 20000000 && (e.tkNo === '111' || e.tkCo === '111'))
  bigCashEntries.forEach(e => {
    alerts.push({
      type: 'error',
      title: 'Hóa đơn > 20tr thanh toán tiền mặt',
      detail: `HĐ số ${e.soHdon} ngày ${new Date(e.ngay).toLocaleDateString('vi-VN')} có giá trị ${e.soTien.toLocaleString()}đ. Cần chuyển khoản để được khấu trừ thuế.`,
      amount: e.soTien
    })
  })

  // 2. Kiểm tra tài khoản công nợ thiếu đối tượng
  const missingObjectEntries = entries.filter(e => (e.tkNo.startsWith('131') || e.tkNo.startsWith('331') || e.tkCo.startsWith('131') || e.tkCo.startsWith('331')) && (!e.doitac || e.doitac === 'Hệ thống'))
  if (missingObjectEntries.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Thiếu đối tượng công nợ',
      detail: `Có ${missingObjectEntries.length} bút toán công nợ (131/331) chưa được gán tên khách hàng/nhà cung cấp cụ thể.`,
    })
  }

  // 3. Kiểm tra lệch thuế GTGT (Giả định thuế 8% hoặc 10%)
  // Logic này cần tinh chỉnh dựa trên dữ liệu thực tế hơn, ở đây là demo đơn giản
  const revenueEntries = entries.filter(e => e.tkCo === '511')
  revenueEntries.forEach(e => {
    const relatedTax = entries.find(t => t.soHdon === e.soHdon && t.tkCo === '3331')
    if (relatedTax) {
      const taxRate = relatedTax.soTien / e.soTien
      if (taxRate > 0 && Math.abs(taxRate - 0.1) > 0.01 && Math.abs(taxRate - 0.08) > 0.01 && Math.abs(taxRate - 0.05) > 0.01) {
        alerts.push({
          type: 'warning',
          title: 'Thuế suất bất thường',
          detail: `HĐ ${e.soHdon} có thuế suất thực tế là ${(taxRate * 100).toFixed(1)}%. Vui lòng kiểm tra lại.`,
          amount: relatedTax.soTien
        })
      }
    }
  })

  // 4. Kiểm tra âm quỹ tiền mặt (TK 111) theo thời gian
  let runningCash = 0
  const cashEntries = entries.filter(e => e.tkNo === '111' || e.tkCo === '111').sort((a, b) => new Date(a.ngay).getTime() - new Date(b.ngay).getTime())
  for (const e of cashEntries) {
    runningCash += (e.tkNo === '111' ? e.soTien : -e.soTien)
    if (runningCash < 0) {
      alerts.push({
        type: 'error',
        title: 'Âm quỹ tiền mặt',
        detail: `Quỹ tiền mặt bị âm ${Math.abs(runningCash).toLocaleString()}đ vào ngày ${new Date(e.ngay).toLocaleDateString('vi-VN')}.`,
        amount: runningCash
      })
      break // Chỉ báo lỗi ngày đầu tiên bị âm
    }
  }

  // 5. Kiểm tra hóa đơn trùng lặp (Cùng số hóa đơn, cùng đối tác)
  const invoiceGroups = new Map<string, number>()
  entries.forEach(e => {
    if (e.soHdon && e.soHdon !== '0000000') {
      const key = `${e.soHdon}_${e.doitac}`
      invoiceGroups.set(key, (invoiceGroups.get(key) || 0) + 1)
    }
  })
  invoiceGroups.forEach((count, key) => {
    if (count > 2) { // 1 bút toán DT/Hàng + 1 bút toán Thuế là 2. > 2 nghĩa là trùng hoặc tách quá nhiều
      alerts.push({
        type: 'warning',
        title: 'Trùng lặp số hóa đơn',
        detail: `Số hóa đơn ${key.split('_')[0]} đang có dấu hiệu lặp lại hoặc hạch toán nhiều lần.`,
      })
    }
  })

  // 6. Kiểm tra hàng biếu tặng / Khuyến mãi (Giá 0đ)
  const zeroPriceItems = entries.filter(e => e.soTien === 0 && e.tenHang)
  if (zeroPriceItems.length > 0) {
    alerts.push({
      type: 'info',
      title: 'Hàng biếu tặng / Khuyến mãi',
      detail: `Phát hiện ${zeroPriceItems.length} mặt hàng có giá trị 0đ. Cần kiểm tra chứng từ khuyến mãi đi kèm.`,
    })
  }

  return alerts
}

export default {
  getJournalEntries,
  getLedgerEntries,
  getTrialBalance,
  getDetailLedgerEntries,
  getClosingEntries,
  getProfitAndLoss,
  getBalanceSheet,
  getAuditAlerts
}
