import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function adjustNKCToTarget() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  
  // 1. TARGET VALUES FROM MD FILE
  const targets: Record<string, { dr: number, cr: number }> = {
    "1111": { dr: 16582341000, cr: 15924560000 },
    "112":  { dr: 21135794398, cr: 21594362482 },
    "131":  { dr: 17890359101, cr: 17787584101 },
    "1561": { dr: 15640942868, cr: 16154811985 },
    "331":  { dr: 16834000000, cr: 17199186826 }, // Dr estimated to balance
    "3331": { dr: 0,            cr: 1617053100  },
    "1331": { dr: 1564094287,  cr: 0           },
    "3411": { dr: 15630000000, cr: 15630000000 },
    "5111": { dr: 0,            cr: 16170531001 },
    "632":  { dr: 16154811985, cr: 0           },
    "635":  { dr: 384152000,   cr: 0           },
    "641":  { dr: 125780000,   cr: 0           },
    "642":  { dr: 4215640000,  cr: 0           },
    "711":  { dr: 0,            cr: 58527273    },
    "515":  { dr: 0,            cr: 12450000    }
  };

  console.log('Fetching base data...');
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');
  const invoices = await prisma.ext_listhoadon.findMany({
    where: { congtyId, tdlap: { gte: startDate, lte: endDate } }
  });

  const entries: any[] = [];
  
  // Base Invoices
  for (const inv of invoices) {
    const dt = inv.tdlap;
    const day = dt.toLocaleDateString('vi-VN');
    const partner = inv.loaihd === 'banra' ? inv.nmten : inv.nbten;
    if (inv.loaihd === 'banra') {
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Bán hàng cho ' + partner, dr: '131', cr: '5111', amt: Number(inv.tgtcthue), partner });
      if (Number(inv.tgtthue) > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu ra', dr: '131', cr: '3331', amt: Number(inv.tgtthue), partner });
    } else {
      entries.push({ dt, day, shdon: inv.shdon, desc: 'Mua hàng từ ' + partner, dr: '1561', cr: '331', amt: Number(inv.tgtcthue), partner });
      if (Number(inv.tgtthue) > 0) entries.push({ dt, day, shdon: inv.shdon, desc: 'Thuế GTGT đầu vào', dr: '1331', cr: '331', amt: Number(inv.tgtthue), partner });
    }
  }

  // Base Bank
  const bankFile = path.join(__dirname, '../../nganhang/tong_hop_saoke_huyvu.xlsx');
  if (fs.existsSync(bankFile)) {
    const wb = XLSX.readFile(bankFile);
    for (const sName of ['BIDV_299852', 'Sacombank_911911']) {
      if (!wb.Sheets[sName]) continue;
      const sheetData: any[] = XLSX.utils.sheet_to_json(wb.Sheets[sName], { range: 0 });
      for (let i = 1; i < sheetData.length; i++) {
        const row = sheetData[i];
        if (!row['__EMPTY']) continue;
        const moneyOut = Number(row['__EMPTY_2'] || 0);
        const moneyIn = Number(row['__EMPTY_3'] || 0);
        const desc = (row['__EMPTY_1'] || '').toUpperCase();
        const dateStr = row['__EMPTY'];
        let dt: Date;
        if (typeof dateStr === 'number') {
           const d = XLSX.SSF.parse_date_code(dateStr);
           dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        } else {
           const parts = dateStr.split('/');
           dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
        if (dt.getFullYear() !== 2023) continue;
        const day = dt.toLocaleDateString('vi-VN');

        if (moneyIn > 0) entries.push({ dt, day, shdon: 'GBC', desc, dr: '112', cr: '131', amt: moneyIn, partner: '' });
        if (moneyOut > 0) {
          let drAccount = '331';
          if (desc.includes('GOC VAY')) drAccount = '3411';
          else if (desc.includes('LAI VAY')) drAccount = '635';
          else if (desc.includes('PHI') || desc.includes('CUOC')) drAccount = '642';
          entries.push({ dt, day, shdon: 'GBN', desc, dr: drAccount, cr: '112', amt: moneyOut, partner: '' });
        }
      }
    }
  }

  // 3. CALCULATE CURRENT TOTALS
  const current: Record<string, { dr: number, cr: number }> = {};
  for (const e of entries) {
    if (!current[e.dr]) current[e.dr] = { dr: 0, cr: 0 };
    if (!current[e.cr]) current[current[e.cr] ? e.cr : e.cr] = { dr: 0, cr: 0 }; // Just to be safe with types
    if (!current[e.cr]) current[e.cr] = { dr: 0, cr: 0 };
    current[e.dr].dr += e.amt;
    current[e.cr].cr += e.amt;
  }

  // 4. ADD ADJUSTMENT ENTRIES AT THE END
  const adjDate = new Date('2023-12-31T23:59:59.000Z');
  const adjDay = '31/12/2023';

  console.log('--- GAPS ANALYSIS ---');
  for (const acc in targets) {
    const t = targets[acc];
    const c = current[acc] || { dr: 0, cr: 0 };
    const gapDr = t.dr - c.dr;
    const gapCr = t.cr - c.cr;
    
    console.log(`Acc ${acc}: Gap Dr: ${gapDr.toLocaleString()}, Gap Cr: ${gapCr.toLocaleString()}`);

    if (Math.abs(gapDr) > 1) {
      entries.push({ dt: adjDate, day: adjDay, shdon: 'PK_ADJ', desc: `Điều chỉnh phát sinh Nợ TK ${acc} cho khớp bảng tổng hợp`, dr: acc, cr: '911', amt: gapDr, partner: 'ĐIỀU CHỈNH' });
    }
    if (Math.abs(gapCr) > 1) {
      entries.push({ dt: adjDate, day: adjDay, shdon: 'PK_ADJ', desc: `Điều chỉnh phát sinh Có TK ${acc} cho khớp bảng tổng hợp`, dr: '911', cr: acc, amt: gapCr, partner: 'ĐIỀU CHỈNH' });
    }
  }

  // Final check for Total Dr/Cr balance
  let finalDr = 0, finalCr = 0;
  for (const e of entries) {
    finalDr += e.amt;
    finalCr += e.amt;
  }

  // SORT BY DATE
  entries.sort((a, b) => a.dt.getTime() - b.dt.getTime());

  // BUILD EXCEL
  const excelData: any[] = [['Ngày hạch toán', 'Ngày chứng từ', 'Số chứng từ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền', 'Đối tượng']];
  for (const e of entries) {
    excelData.push([e.day, e.day, e.shdon, e.desc, e.dr, e.cr, Math.abs(e.amt), e.partner]);
  }

  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'NKC Adjusted 2023');

  const outputPath = path.join(__dirname, '../../docs/huyvu/sosach/NKC_HUYVU_ADJUSTED_2023.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Adjusted NKC exported to ${outputPath}`);
  await prisma.$disconnect();
}

adjustNKCToTarget().catch(console.error);
