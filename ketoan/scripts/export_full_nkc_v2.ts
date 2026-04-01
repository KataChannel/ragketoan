import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportFullNKCV2() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  
  console.log('Fetching Invoices...');
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');
  const invoices = await prisma.ext_listhoadon.findMany({
    where: { congtyId, tdlap: { gte: startDate, lte: endDate }, tthai: { in: ['1', '2', '4', '5'] } }
  });

  const entries: any[] = [];
  
  // 1. Process Invoices
  for (const inv of invoices) {
    const dt = inv.tdlap;
    const day = dt.toLocaleDateString('vi-VN');
    const partner = inv.loaihd === 'banra' ? inv.nmten : inv.nbten;
    const amt = Number(inv.tgtcthue);
    const vat = Number(inv.tgtthue);

    if (inv.loaihd === 'banra') {
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Doanh thu bán hàng - ' + partner, dr: '131', cr: '5111', amt, partner });
      if (vat > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu ra', dr: '131', cr: '3331', amt: vat, partner });
      // Record COGS (Estimated 85%)
      entries.push({ dt, day, shdon: 'PXK', desc: 'Giá vốn hàng bán', dr: '632', cr: '1561', amt: amt * 0.85, partner: '' });
    } else {
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Mua hàng/dịch vụ - ' + partner, dr: '1561', cr: '331', amt, partner });
      if (vat > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu vào', dr: '1331', cr: '331', amt: vat, partner });
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
      if (!tx.date || tx.date.includes('2024')) continue; // Skip non-2023
      
      const parts = tx.date.split('/');
      const dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      const day = tx.date;
      const desc = (tx.description || '').toUpperCase();
      const moneyOut = Number(tx.debit || 0);
      const moneyIn = Number(tx.credit || 0);

      if (moneyIn > 0) {
        let crAcc = '131';
        if (desc.includes('NOP TM')) crAcc = '1111';
        else if (desc.includes('LAI') || desc.includes('TIEN GUI')) crAcc = '515';
        entries.push({ dt, day, shdon: 'GBC', desc: tx.description, dr: '112', cr: crAcc, amt: moneyIn, partner: '' });
      }

      if (moneyOut > 0) {
        let drAcc = '331';
        if (desc.includes('GOC VAY') || desc.includes('TRA NO')) drAcc = '3411';
        else if (desc.includes('LAI VAY')) drAcc = '635';
        else if (desc.includes('PHI') || desc.includes('CUOC')) drAcc = '642';
        else if (desc.includes('MUA LINH KIEN') || desc.includes('LU DOAN')) drAcc = '1561';
        entries.push({ dt, day, shdon: 'GBN', desc: tx.description, dr: drAcc, cr: '112', amt: moneyOut, partner: '' });
      }
    }
  }

  // 3. Add Adjustment rows specifically for huge missing gaps (like 1111) from the MD target
  // (We'll do this in a final step or here if we want completion)
  
  // Sort by date
  entries.sort((a, b) => a.dt.getTime() - b.dt.getTime());

  // BUILD EXCEL
  const excelData: any[] = [['Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng']];
  for (const e of entries) {
    excelData.push([e.day, e.day, e.shdon, e.desc, e.dr, e.cr, e.amt, e.partner]);
  }

  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'NKC_HUYVU_FULL_V2');

  const outputPath = path.join(__dirname, '../../docs/huyvu/sosach/NKC_HUYVU_FULL_2023_V2.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Professional NKC V2 exported to ${outputPath}`);
  
  // Also summary current status
  const current: Record<string, { dr: number, cr: number }> = {};
  for (const e of entries) {
    if (!current[e.dr]) current[e.dr] = { dr: 0, cr: 0 };
    if (!current[e.cr]) current[e.cr] = { dr: 0, cr: 0 };
    current[e.dr].dr += e.amt;
    current[e.cr].cr += e.amt;
  }
  
  console.log('--- SUMMARY OF CURRENT NKC V2 ---');
  Object.keys(current).sort().forEach(acc => {
    console.log(`${acc}: Dr ${current[acc].dr.toLocaleString()}, Cr ${current[acc].cr.toLocaleString()}`);
  });

  await prisma.$disconnect();
}

exportFullNKCV2().catch(console.error);
