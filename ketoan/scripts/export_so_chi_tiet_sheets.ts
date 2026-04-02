import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

async function exportSoChiTietSheets() {
  const nkcPath = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_2023_DIEUCHINH.xlsx';
  
  if (!fs.existsSync(nkcPath)) {
    console.error(`NKC file not found: ${nkcPath}`);
    return;
  }

  console.log('Reading NKC...');
  const wbNKC = XLSX.readFile(nkcPath);
  const nkcSheet = wbNKC.Sheets[wbNKC.SheetNames[0]];
  const nkcData = XLSX.utils.sheet_to_json(nkcSheet, { header: 1 }) as any[][];

  // Map NKC headers
  // [Ngày hạch toán, Ngày chứng từ, Số chứng từ, Diễn giải, TK Nợ, TK Có, Số tiền, Đối tượng]
  
  const entries: any[] = [];
  for (let i = 1; i < nkcData.length; i++) {
    const row = nkcData[i];
    if (!row || row.length < 7) continue;
    
    entries.push({
      day: row[0],
      sh: row[2],
      desc: row[3],
      dr: row[4]?.toString(),
      cr: row[5]?.toString(),
      amt: Number(row[6]),
      partner: row[7] || ''
    });
  }

  // Group by accounts
  const accounts: Set<string> = new Set();
  for (const e of entries) {
    if (e.dr) accounts.add(e.dr);
    if (e.cr) accounts.add(e.cr);
  }

  const wbOut = XLSX.utils.book_new();

  // Create a sheet for each account
  const sortedAccounts = Array.from(accounts).sort();
  for (const acc of sortedAccounts) {
    console.log(`Processing Account ${acc}...`);
    
    const sheetData: any[] = [['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK đối ứng', 'PS Nợ', 'PS Có', 'Đối tượng']];
    
    // Find all entries involving this account
    const accEntries: any[] = [];
    for (const e of entries) {
      if (e.dr === acc) {
        accEntries.push([e.day, e.sh, e.desc, e.cr, e.amt, 0, e.partner]);
      }
      if (e.cr === acc) {
        accEntries.push([e.day, e.sh, e.desc, e.dr, 0, e.amt, e.partner]);
      }
    }
    
    // Sort account entries by date (shorter version of date parsing)
    accEntries.sort((a, b) => {
      const d1 = a[0].split('/').reverse().join('-');
      const d2 = b[0].split('/').reverse().join('-');
      return d1.localeCompare(d2);
    });
    
    sheetData.push(...accEntries);
    
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    // Excel sheet name limit is 31 characters
    XLSX.utils.book_append_sheet(wbOut, ws, acc.substring(0, 31));
  }

  const outputDir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'SO_CHI_TIET_TAI_KHOAN_DIEU_CHINH_2023.xlsx');
  XLSX.writeFile(wbOut, outputPath);
  
  console.log(`✅ Professional Subsidiary Ledger (Multi-Sheets) exported to ${outputPath}`);
}

exportSoChiTietSheets().catch(console.error);
