import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportNKC2023DieuChinh() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  
  console.log('Fetching Invoices 2023...');
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');
  const invoices = await prisma.ext_listhoadon.findMany({
    where: { 
      congtyId, 
      tdlap: { gte: startDate, lte: endDate }, 
      tthai: { in: ['1', '2', '4', '5'] } 
    }
  });

  const entries: any[] = [];
  
  // 1. Process Invoices
  for (const inv of invoices) {
    const dt = inv.tdlap;
    const day = dt.toLocaleDateString('vi-VN');
    const partner = (inv.loaihd === 'banra' ? inv.nmten : inv.nbten) || '';
    const partnerUpper = partner.toUpperCase();
    const amt = Number(inv.tgtcthue);
    const vat = Number(inv.tgtthue);

    if (inv.loaihd === 'banra') {
      // Doanh thu bán hàng
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Doanh thu bán hàng - ' + partner, dr: '131', cr: '5111', amt, partner });
      if (vat > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu ra', dr: '131', cr: '3331', amt: vat, partner });
      // Giá vốn (Tạm tính 85%)
      entries.push({ dt, day, shdon: 'PXK', desc: 'Giá vốn hàng bán', dr: '632', cr: '1561', amt: amt * 0.85, partner: '' });
    } else {
      // Mua hàng / dịch vụ
      let drAcc = '131'; // Default as per adjusted rule for goods
      let crAcc = '331'; // Default
      
      if (partnerUpper.includes('NGÂN HÀNG TMCP Á CHÂU') || partnerUpper.includes('ACB')) {
        drAcc = '635';
        crAcc = '112'; // Direct bank payout as per user's latest update
      } else if (
        partnerUpper.includes('XĂNG DẦU BẮC TÂY NGUYÊN') ||
        partnerUpper.includes('BẢO HIỂM BƯU ĐIỆN GIA LAI') ||
        partnerUpper.includes('MOBIFONE') ||
        partnerUpper.includes('VIETTEL') ||
        partnerUpper.includes('QUÂN ĐỘI') ||
        partnerUpper.includes('Ô TÔ GIA LAI') ||
        partnerUpper.includes('VNPT')
      ) {
        drAcc = '642';
      }

      entries.push({ dt, day, shdon: inv.shdon, desc: 'Mua hàng/dịch vụ - ' + partner, dr: drAcc, cr: crAcc, amt, partner });
      if (vat > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu vào', dr: '1331', cr: crAcc, amt: vat, partner });
    }
  }

  // 2. Process Bank JSON Files
  console.log('Processing Bank JSON files...');
  const jsonDir = path.join(__dirname, '../../docs/nganhang/huyvu20232024/text-data');
  const files = fs.readdirSync(jsonDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(jsonDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    for (const tx of data) {
      if (!tx.date || tx.date.includes('2024')) continue; // Skip 2024
      
      const parts = tx.date.split('/');
      const dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const day = tx.date;
      const desc = (tx.description || '').toUpperCase();
      const moneyOut = Number(tx.debit || 0);
      const moneyIn = Number(tx.credit || 0);

      if (moneyIn > 0) {
        let crAcc = '131'; // Default
        if (desc.includes('NOP TM')) {
          crAcc = '1111';
        } else if (desc.includes('040019911911') && (desc.includes('LAI') || desc.includes('TIEN GUI'))) {
          crAcc = '515';
        } else if (desc.includes('LAI') || desc.includes('TIEN GUI')) {
          crAcc = '515'; // Keep existing logic for other accounts if it's interest
        }
        
        entries.push({ dt, day, shdon: 'GBC', desc: tx.description, dr: '112', cr: crAcc, amt: moneyIn, partner: '' });
      }

      if (moneyOut > 0) {
        let drAcc = '131'; // Default as per adjusted rule ("Còn lại hạch toán 131")
        
        if (desc.includes('GOC VAY') || desc.includes('TRA NO')) {
          drAcc = '3411';
        } else if (desc.includes('LAI VAY')) {
          drAcc = '635';
        } else if (desc.includes('PHI') || desc.includes('CUOC')) {
          drAcc = '635'; // Fees go to 635
        }
        
        entries.push({ dt, day, shdon: 'GBN', desc: tx.description, dr: drAcc, cr: '112', amt: moneyOut, partner: '' });
      }
    }
  }

  // Sort by date
  entries.sort((a, b) => a.dt.getTime() - b.dt.getTime());

  // BUILD EXCEL
  const excelData: any[] = [['Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng']];
  for (const e of entries) {
    excelData.push([e.day, e.day, e.shdon, e.desc, e.dr, e.cr, e.amt, e.partner]);
  }

  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'NKC_2023_DIEU_CHINH');

  const outputDir = path.join(__dirname, '../../docs/huyvu/sosach/nam2023');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'NKC_2023_DIEUCHINH.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ NKC 2023 Adjusted exported to ${outputPath}`);
  
  // 4. BUILD SUBSIDIARY LEDGER (Sổ chi tiết)
  console.log('Generating Subsidiary Ledger...');
  const soChiTietData: any[] = [['Tài khoản', 'Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Nợ', 'Có', 'Đối tượng']];
  const detailEntries: any[] = [];
  
  for (const e of entries) {
    // Debit record
    detailEntries.push({ acc: e.dr, d: e.day, sh: e.shdon, ds: e.desc, contra: e.cr, dr: e.amt, cr: 0, p: e.partner, dt: e.dt });
    // Credit record
    detailEntries.push({ acc: e.cr, d: e.day, sh: e.shdon, ds: e.desc, contra: e.dr, dr: 0, cr: e.amt, p: e.partner, dt: e.dt });
  }
  
  // Sort by Account (string) then Date (Date object)
  detailEntries.sort((a, b) => {
    if (a.acc !== b.acc) return a.acc.localeCompare(b.acc);
    return a.dt.getTime() - b.dt.getTime();
  });
  
  for (const d of detailEntries) {
    soChiTietData.push([d.acc, d.d, d.sh, d.ds, d.contra, d.dr, d.cr, d.p]);
  }
  
  const wbDetail = XLSX.utils.book_new();
  const wsDetail = XLSX.utils.aoa_to_sheet(soChiTietData);
  XLSX.utils.book_append_sheet(wbDetail, wsDetail, 'So_Chi_Tiet_2023');
  const detailPath = path.join(outputDir, 'So_Chi_Tiet_2023.xlsx');
  XLSX.writeFile(wbDetail, detailPath);
  
  console.log(`✅ Subsidiary Ledger exported to ${detailPath}`);

  // Summary
  const current: Record<string, { dr: number, cr: number }> = {};
  for (const e of entries) {
    if (!current[e.dr]) current[e.dr] = { dr: 0, cr: 0 };
    if (!current[e.cr]) current[e.cr] = { dr: 0, cr: 0 };
    current[e.dr].dr += e.amt;
    current[e.cr].cr += e.amt;
  }
  
  console.log('--- SUMMARY OF ADJUSTED NKC 2023 ---');
  Object.keys(current).sort().forEach(acc => {
    console.log(`${acc}: Dr ${current[acc].dr.toLocaleString()}, Cr ${current[acc].cr.toLocaleString()}`);
  });

  await prisma.$disconnect();
}

exportNKC2023DieuChinh().catch(console.error);
