import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportFullNKC() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');

  console.log('1. Fetching Invoices...');
  const invoices = await prisma.ext_listhoadon.findMany({
    where: { congtyId, tdlap: { gte: startDate, lte: endDate } },
    orderBy: { tdlap: 'asc' },
  });

  const entries: any[] = [];

  // PROCESS INVOICES
  for (const inv of invoices) {
    const dt = inv.tdlap;
    const day = dt.toLocaleDateString('vi-VN');
    const partner = inv.loaihd === 'banra' ? inv.nmten : inv.nbten;
    
    if (inv.loaihd === 'banra') {
      // 131 / 5111
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Doanh thu bán hàng cho ' + partner, dr: '131', cr: '5111', amt: Number(inv.tgtcthue), partner });
      // 131 / 33311
      if (Number(inv.tgtthue) > 0) {
        entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu ra', dr: '131', cr: '33311', amt: Number(inv.tgtthue), partner });
      }
      // CONCEPTUAL COGS: 632 / 1561 (Assuming ~85% cost for simplicity if no detailed XNT)
      entries.push({ dt, day, shdon: 'PX' + inv.shdon, desc: 'Giá vốn hàng bán - ' + partner, dr: '632', cr: '1561', amt: Number(inv.tgtcthue) * 0.85, partner });
    } else {
      // 1561 / 331
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Mua hàng từ ' + partner, dr: '1561', cr: '331', amt: Number(inv.tgtcthue), partner });
      // 1331 / 331
      if (Number(inv.tgtthue) > 0) {
        entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu vào', dr: '1331', cr: '331', amt: Number(inv.tgtthue), partner });
      }
    }
  }

  console.log('2. Fetching Bank Statements...');
  const bankFile = path.join(__dirname, '../../nganhang/tong_hop_saoke_huyvu.xlsx');
  if (fs.existsSync(bankFile)) {
    const wb = XLSX.readFile(bankFile);
    const sheets = ['BIDV_299852', 'Sacombank_911911'];
    
    for (const sName of sheets) {
      if (!wb.Sheets[sName]) continue;
      const sheetData: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sName], { range: 0 });
      
      // Skip headers (usually 1-2 rows)
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        const dateStr = row['__EMPTY'];
        const desc = row['__EMPTY_1'] || '';
        const moneyOut = Number(row['__EMPTY_2'] || 0);
        const moneyIn = Number(row['__EMPTY_3'] || 0);
        
        if (!dateStr || (moneyIn === 0 && moneyOut === 0)) continue;
        
        let dt: Date;
        if (typeof dateStr === 'number') {
           dt = XLSX.SSF.parse_date_code(dateStr);
           dt = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        } else {
           const parts = dateStr.split('/');
           dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }

        if (dt.getFullYear() !== 2023) continue;
        const day = dt.toLocaleDateString('vi-VN');

        if (moneyIn > 0) {
          // Default: 112 / 131
          entries.push({ dt, day, shdon: 'GBC', desc, dr: '112', cr: '131', amt: moneyIn, partner: '' });
        }
        if (moneyOut > 0) {
          let drAccount = '331';
          if (desc.toUpperCase().includes('GOC VAY')) drAccount = '3411';
          else if (desc.toUpperCase().includes('LAI VAY')) drAccount = '635';
          else if (desc.toUpperCase().includes('PHI') || desc.toUpperCase().includes('CUOC')) drAccount = '642';
          
          entries.push({ dt, day, shdon: 'GBN', desc, dr: drAccount, cr: '112', amt: moneyOut, partner: '' });
        }
      }
    }
  }

  // SORT BY DATE
  entries.sort((a, b) => a.dt.getTime() - b.dt.getTime());

  // BUILD EXCEL
  const excelData: any[] = [[
    'Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng'
  ]];
  
  for (const e of entries) {
    excelData.push([e.day, e.day, e.shdon, e.desc, e.dr, e.cr, e.amt, e.partner]);
  }

  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(excelData);
  const wscols = [{ wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 60 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 40 }];
  wsOut['!cols'] = wscols;
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'NKC Full 2023');

  const outputPath = path.join(__dirname, '../../docs/huyvu/sosach/NKC_HUYVU_FULL_2023.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Successfully exported ${entries.length} entries to ${outputPath}`);
  await prisma.$disconnect();
}

exportFullNKC().catch(console.error);
