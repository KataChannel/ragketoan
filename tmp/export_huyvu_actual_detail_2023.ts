import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4' // Huy Vu
const outputDir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach'

async function getAccountMapping(loaihd: string, tenHang: string): Promise<{ no: string, co: string, isDiscount?: boolean }> {
  const tenUpper = tenHang.toUpperCase()
  if (loaihd === 'banra') {
    if (tenUpper.includes('CHIET KHAU') || tenUpper.includes(' CK ') || tenUpper.startsWith('CK ')) {
      return { no: '521', co: '131', isDiscount: true }
    }
    return { no: '131', co: '511' }
  } else {
    if (tenUpper.includes('CUOC') || tenUpper.includes('PHI') || tenUpper.includes('DICH VU') || 
        tenUpper.includes('GIA CONG') || tenUpper.includes('VAN CHUYEN')) {
      return { no: '642', co: '331' }
    }
    if (tenUpper.includes('CONG CU') || tenUpper.includes('DUNG CU') || tenUpper.includes('VAN PHONG PHAM') || tenUpper.includes('MUC IN')) {
      return { no: '153', co: '331' }
    }
    if (tenUpper.includes('MAY TINH') || tenUpper.includes('LAPTOP') || tenUpper.includes('DIEU HOA') || tenUpper.includes('TU LANH')) {
      return { no: '242', co: '331' }
    }
    if (tenUpper.includes('NGUYEN LIEU') || tenUpper.includes('VAT LIEU') || tenUpper.includes('PHU LIEU')) {
      return { no: '152', co: '331' }
    }
    return { no: '1561', co: '331' } // Huy Vu uses 1561 specifically
  }
}

async function exportActualLedgers() {
  console.log("Starting export of actual detailed ledgers for Huy Vu 2023...")
  
  const fromDate = new Date('2023-01-01T00:00:00Z')
  const toDate = new Date('2023-12-31T23:59:59Z')

  const data = await prisma.ext_tonghop.findMany({
    where: {
      congtyId,
      tdlap: { gte: fromDate, lte: toDate }
    },
    orderBy: { tdlap: 'asc' }
  })

  // Pre-fetch stock for COGS (632/1561)
  const stockData = await prisma.ext_daily_stock_v2.findMany({
    where: {
      congtyId,
      date: { gte: fromDate, lte: toDate }
    }
  })
  const stockMap = new Map()
  stockData.forEach((s: any) => {
    const dateStr = s.date.toISOString().split('T')[0]
    stockMap.set(`${dateStr}_${s.tenHangChuan}`, s)
  })

  const entries: any[] = []

  for (const item of data) {
    const valAmount = Number(item.thtien)
    const valTax = Number(item.tthue)
    if (valAmount === 0 && valTax === 0) continue

    const mapping = await getAccountMapping(item.loaihd, item.tenHang)
    const doitac = item.loaihd === 'banra' ? item.nmten : item.nbten
    
    // Revenue / Goods Purchase
    if (valAmount !== 0) {
      entries.push({
        ngay: item.tdlap,
        soHdon: item.shdon,
        dienGiai: item.tenHang,
        doitac: doitac || '',
        tkNo: mapping.no,
        tkCo: mapping.co,
        soTien: Math.abs(valAmount)
      })

      // Automatic COGS for sales
      if (item.loaihd === 'banra' && !mapping.isDiscount) {
        const dateStr = item.tdlap.toISOString().split('T')[0]
        const stock = stockMap.get(`${dateStr}_${item.tenHangChuan}`)
        if (stock && Number(stock.xuatQty) > 0) {
          const unitCOGS = Number(stock.xuatVal) / Number(stock.xuatQty)
          const totalCOGS = unitCOGS * Number(item.sluong)
          if (totalCOGS > 0) {
            entries.push({
              ngay: item.tdlap,
              soHdon: item.shdon,
              dienGiai: `Giá vốn: ${item.tenHang}`,
              doitac: 'Hệ thống kho',
              tkNo: '632',
              tkCo: '1561',
              soTien: totalCOGS
            })
          }
        }
      }
    }

    // Tax
    if (valTax !== 0) {
      const tkThue = item.loaihd === 'banra' ? '3331' : '1331'
      entries.push({
        ngay: item.tdlap,
        soHdon: item.shdon,
        dienGiai: `Thuế GTGT ${item.loaihd === 'banra' ? 'bán ra' : 'mua vào'}`,
        doitac: doitac || '',
        tkNo: item.loaihd === 'banra' ? '131' : tkThue,
        tkCo: item.loaihd === 'banra' ? tkThue : '331',
        soTien: Math.abs(valTax)
      })
    }
  }

  const targetAccounts = ['131', '331', '1561', '511', '632', '1331', '3331', '642']
  
  const formatDate = (d: Date) => d.toLocaleDateString('vi-VN')

  for (const tk of targetAccounts) {
    const accEntries = entries.filter(e => e.tkNo === tk || e.tkCo === tk)
    if (accEntries.length === 0) continue

    let md = `# SỔ CHI TIẾT THỰC TẾ - TK ${tk} - HUY VŨ 2023\n\n`
    md += `*Dữ liệu chi tiết từ hóa đơn gốc.*\n\n`
    md += "| Ngày | Số HĐ | Diễn giải (Hàng hóa/Dịch vụ) | Đối tác | TK Đ/Ứ | Nợ | Có |\n"
    md += "| :--- | :--- | :--- | :--- | :---: | ---: | ---: |\n"

    let totalNo = 0
    let totalCo = 0

    accEntries.forEach(e => {
      const no = e.tkNo === tk ? e.soTien : 0
      const co = e.tkCo === tk ? e.soTien : 0
      const tkDoiUng = e.tkNo === tk ? e.tkCo : e.tkNo
      totalNo += no
      totalCo += co

      md += `| ${formatDate(e.ngay)} | ${e.soHdon} | ${e.dienGiai} | ${e.doitac} | ${tkDoiUng} | ${no.toLocaleString('vi-VN')} | ${co.toLocaleString('vi-VN')} |\n`
    })

    md += `| | | **TỔNG CỘNG** | | | **${totalNo.toLocaleString('vi-VN')}** | **${totalCo.toLocaleString('vi-VN')}** |\n`

    const fileName = `SO_CHI_TIET_THUC_TE_${tk}_2023.md`
    fs.writeFileSync(path.join(outputDir, fileName), md)
    console.log(`Generated: ${fileName}`)
  }

  // Also Generate a General Journal with actual descriptions
  let nkcMd = `# NHẬT KÝ CHUNG THỰC TẾ - HUY VŨ 2023\n\n`
  nkcMd += "| Ngày | Số HĐ | Diễn giải | Tài khoản Nợ | Tài khoản Có | Số tiền |\n"
  nkcMd += "| :--- | :--- | :--- | :---: | :---: | ---: |\n"
  
  let totalTien = 0
  entries.forEach(e => {
    totalTien += e.soTien
    nkcMd += `| ${formatDate(e.ngay)} | ${e.soHdon} | ${e.dienGiai} | ${e.tkNo} | ${e.tkCo} | ${e.soTien.toLocaleString('vi-VN')} |\n`
  })
  nkcMd += `| | | **TỔNG CỘNG** | | | **${totalTien.toLocaleString('vi-VN')}** |\n`
  fs.writeFileSync(path.join(outputDir, 'NKC_THUC_TE_2023.md'), nkcMd)
  console.log("Generated: NKC_THUC_TE_2023.md")

  console.log("Export complete.")
}

exportActualLedgers().catch(console.error).finally(() => prisma.$disconnect())
