import { PrismaClient } from '../prisma/generated-client';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportNKC() {
  const prisma = new PrismaClient();
  const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-12-31T23:59:59.999Z');

  console.log('Fetching invoices...');
  const invoices = await prisma.ext_listhoadon.findMany({
    where: {
      congtyId: congtyId,
      tdlap: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { tdlap: 'asc' },
  });

  const data: any[] = [];
  // Headers
  data.push([
    'Ngày hạch toán',
    'Ngày chứng từ',
    'Số chứng từ',
    'Diễn giải',
    'TK Nợ',
    'TK Có',
    'Số tiền',
    'Đối tượng'
  ]);

  for (const inv of invoices) {
    const day = inv.tdlap.toLocaleDateString('vi-VN');
    const note = inv.loaihd === 'banra' ? 'Doanh thu bán hàng cho ' + inv.nmten : 'Mua hàng từ ' + inv.nbten;
    const partner = inv.loaihd === 'banra' ? inv.nmten : inv.nbten;

    if (inv.loaihd === 'banra') {
      // 131 / 5111
      data.push([day, day, inv.shdon, note, '131', '5111', Number(inv.tgtcthue), partner]);
      // 131 / 33311
      if (Number(inv.tgtthue) > 0) {
        data.push([day, day, inv.shdon, 'Thuế GTGT đầu ra', '131', '33311', Number(inv.tgtthue), partner]);
      }
    } else {
      // 1561 / 331
      data.push([day, day, inv.shdon, note, '1561', '331', Number(inv.tgtcthue), partner]);
      // 1331 / 331
      if (Number(inv.tgtthue) > 0) {
        data.push([day, day, inv.shdon, 'Thuế GTGT đầu vào', '1331', '331', Number(inv.tgtthue), partner]);
      }
    }
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  const wscols = [
    { wch: 15 }, // Ngày hạch toán
    { wch: 15 }, // Ngày chứng từ
    { wch: 10 }, // Số chứng từ
    { wch: 50 }, // Diễn giải
    { wch: 10 }, // TK Nợ
    { wch: 10 }, // TK Có
    { wch: 15 }, // Số tiền
    { wch: 40 }, // Đối tượng
  ];
  ws['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, 'NKC 2023');

  const outputDir = path.join(__dirname, '../../docs/huyvu/sosach');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, 'NKC_HUYVU_2023.xlsx');
  XLSX.writeFile(wb, outputPath);
  
  console.log(`✅ Exported ${data.length - 1} entries to ${outputPath}`);
  await prisma.$disconnect();
}

exportNKC().catch(console.error);
