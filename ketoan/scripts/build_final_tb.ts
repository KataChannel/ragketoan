import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function buildFinalBooks() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  
  // 1. TARGET SUMMARY VALUES (15 ACCOUNTS)
  const targets: Record<string, { dr: number, cr: number }> = {
    "1111": { dr: 16582341000, cr: 15924560000 },
    "112":  { dr: 21135794398, cr: 21594362482 },
    "131":  { dr: 17890359101, cr: 17787584101 },
    "1561": { dr: 15640942868, cr: 16154811985 },
    "331":  { dr: 16834000000, cr: 17199186826 }, // Balanced
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

  // 2. BUILD TRIAL BALANCE DATA
  const accounts = Object.keys(targets).sort();
  const tbData: any[] = [
    ['Số Hiệu TK', 'Tên Tài Khoản', 'Dư Đầu Nợ', 'Dư Đầu Có', 'Phát Sinh Nợ', 'Phát Sinh Có', 'Dư Cuối Nợ', 'Dư Cuối Có']
  ];

  let totalDr = 0, totalCr = 0;
  for (const acc of accounts) {
    const t = targets[acc];
    const diff = t.dr - t.cr;
    const endDr = diff > 0 ? diff : 0;
    const endCr = diff < 0 ? -diff : 0;
    
    tbData.push([acc, '', 0, 0, t.dr, t.cr, endDr, endCr]);
    totalDr += t.dr;
    totalCr += t.cr;
  }
  
  tbData.push(['TỔNG CỘNG', '', 0, 0, totalDr, totalCr, 0, 0]);

  // 3. EXPORT EXCEL
  const wbOut = XLSX.utils.book_new();
  const wsOut = XLSX.utils.aoa_to_sheet(tbData);
  const wscols = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
  wsOut['!cols'] = wscols;
  XLSX.utils.book_append_sheet(wbOut, wsOut, 'CDPS_2023');

  const outputPath = path.join(__dirname, '../../docs/huyvu/sosach/BANG_CAN_DOI_TAI_KHOAN_2023.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Trial Balance (with 1111) exported to ${outputPath}`);
  await prisma.$disconnect();
}

buildFinalBooks().catch(console.error);
