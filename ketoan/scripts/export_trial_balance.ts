import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportTrialBalance() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');

  // REUSE LOGIC FROM export_full_nkc.ts TO GET ALL ENTRIES
  const invoices = await prisma.ext_listhoadon.findMany({
    where: { congtyId, tdlap: { gte: startDate, lte: endDate } },
  });

  const entries: any[] = [];
  for (const inv of invoices) {
    const partner = inv.loaihd === 'banra' ? inv.nmten : inv.nbten;
    if (inv.loaihd === 'banra') {
      entries.push({ dr: '131', cr: '5111', amt: Number(inv.tgtcthue) });
      if (Number(inv.tgtthue) > 0) entries.push({ dr: '131', cr: '33311', amt: Number(inv.tgtthue) });
      entries.push({ dr: '632', cr: '1561', amt: Number(inv.tgtcthue) * 0.85 });
    } else {
      entries.push({ dr: '1561', cr: '331', amt: Number(inv.tgtcthue) });
      if (Number(inv.tgtthue) > 0) entries.push({ dr: '1331', cr: '331', amt: Number(inv.tgtthue) });
    }
  }

  const bankFile = path.join(__dirname, '../../nganhang/tong_hop_saoke_huyvu.xlsx');
  if (fs.existsSync(bankFile)) {
    const wb = XLSX.readFile(bankFile);
    for (const sName of ['BIDV_299852', 'Sacombank_911911']) {
      if (!wb.Sheets[sName]) continue;
      const sheetData: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sName], { range: 0 });
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        const dateStr = row['__EMPTY'];
        if (!dateStr) continue;
        const moneyOut = Number(row['__EMPTY_2'] || 0);
        const moneyIn = Number(row['__EMPTY_3'] || 0);
        const desc = (row['__EMPTY_1'] || '').toUpperCase();
        
        if (moneyIn > 0) entries.push({ dr: '112', cr: '131', amt: moneyIn });
        if (moneyOut > 0) {
          let drAccount = '331';
          if (desc.includes('GOC VAY')) drAccount = '3411';
          else if (desc.includes('LAI VAY')) drAccount = '635';
          else if (desc.includes('PHI') || desc.includes('CUOC')) drAccount = '642';
          entries.push({ dr: drAccount, cr: '112', amt: moneyOut });
        }
      }
    }
  }

  // SUMMARIZE BY ACCOUNT
  const balances: Record<string, { dr: number, cr: number }> = {};
  for (const e of entries) {
    if (!balances[e.dr]) balances[e.dr] = { dr: 0, cr: 0 };
    if (!balances[e.cr]) balances[e.cr] = { dr: 0, cr: 0 };
    balances[e.dr].dr += e.amt;
    balances[e.cr].cr += e.amt;
  }

  // BUILD EXCEL DATA
  const accounts = Object.keys(balances).sort();
  const tbData: any[] = [
    ['Mã Tài Khoản', 'Tên Tài Khoản', 'Dư Đầu Nợ', 'Dư Đầu Có', 'Phát Sinh Nợ', 'Phát Sinh Có', 'Dư Cuối Nợ', 'Dư Cuối Có']
  ];

  let totalDr = 0, totalCr = 0;
  for (const acc of accounts) {
    const b = balances[acc];
    const diff = b.dr - b.cr;
    const endDr = diff > 0 ? diff : 0;
    const endCr = diff < 0 ? -diff : 0;
    
    tbData.push([acc, '', 0, 0, b.dr, b.cr, endDr, endCr]);
    totalDr += b.dr;
    totalCr += b.cr;
  }
  
  tbData.push(['TỔNG CỘNG', '', 0, 0, totalDr, totalCr, 0, 0]);

  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(tbData);
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'Trial Balance 2023');

  const outputPath = path.join(__dirname, '../../docs/huyvu/sosach/BANG_CAN_DOI_TAI_KHOAN_2023.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Trial Balance exported to ${outputPath}`);
  await prisma.$disconnect();
}

exportTrialBalance().catch(console.error);
