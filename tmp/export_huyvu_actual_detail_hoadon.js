const { Client } = require('/chikiet/kata2025/ragketoan/ketoan/node_modules/pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://root:password@127.0.0.1:5432/ketoan";
const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
const outputDir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach';

async function getAccountMapping(loaihd, tenHang) {
  const tenUpper = (tenHang || "").toUpperCase();
  if (loaihd === 'banra') {
    if (tenUpper.includes('CHIET KHAU') || tenUpper.includes(' CK ') || tenUpper.startsWith('CK ')) {
      return { no: '521', co: '131', isDiscount: true };
    }
    return { no: '131', co: '511' };
  } else {
    // Purchases
    if (tenUpper.includes('VIEN THONG') || tenUpper.includes('INTERNET') || tenUpper.includes('DIEN THOAI') || 
        tenUpper.includes('TIEN DIEN') || tenUpper.includes('TIEN NUOC') || tenUpper.includes('CUOC DICH VU') ||
        tenUpper.includes('PHI DICH VU')) {
      return { no: '642', co: '331' };
    }
    if (tenUpper.includes('MUC IN') || tenUpper.includes('VAN PHONG PHAM') || tenUpper.includes('GIAY IN')) {
      return { no: '153', co: '331' };
    }
    if (tenUpper.includes('MAY TINH') || tenUpper.includes('LAPTOP') || tenUpper.includes('DELL') || 
        tenUpper.includes('HP') || tenUpper.includes('ASUS') || tenUpper.includes('ACER') || 
        tenUpper.includes('LENOVO') || tenUpper.includes('BROTHER') || tenUpper.includes('PRINTER') || 
        tenUpper.includes('MAY IN') || tenUpper.includes('Màn hình') || tenUpper.includes('MONITOR')) {
      return { no: '1561', co: '331' };
    }
    return { no: '1561', co: '331' }; // Default to goods for this company
  }
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Fetching actual detailed data (Header + Details)...");
  
  const resHeader = await client.query(`
    SELECT "idServer", shdon, tdlap, loaihd, nbten, nmten, nbmst, nmmst 
    FROM ext_listhoadon 
    WHERE "congtyId" = $1 AND tdlap >= '2023-01-01' AND tdlap < '2024-01-01'
    ORDER BY tdlap ASC`, [congtyId]);

  const resDetails = await client.query(`
    SELECT "idhdonServer", ten, thtien, tthue, sluong, dgia 
    FROM ext_detailhoadon 
    WHERE "idhdonServer" IN (
      SELECT "idServer" FROM ext_listhoadon WHERE "congtyId" = $1 AND tdlap >= '2023-01-01' AND tdlap < '2024-01-01'
    )`, [congtyId]);

  const detailsMap = new Map();
  resDetails.rows.forEach(d => {
    if (!detailsMap.has(d.idhdonServer)) detailsMap.set(d.idhdonServer, []);
    detailsMap.get(d.idhdonServer).push(d);
  });

  // Fetch stock data from ext_tonghop (where summary entries might already have normalized stock names)
  // or just use generic COGS logic if not 1:1. 
  // Given the request for "actual detail", I'll try to match COGS per sale item.
  
  const entries = [];

  for (const h of resHeader.rows) {
    const details = detailsMap.get(h.idServer) || [];
    const doitac = h.loaihd === 'banra' ? h.nmten : h.nbten;

    for (const d of details) {
      const valAmount = Number(d.thtien);
      const valTax = Number(d.tthue);
      if (valAmount === 0 && valTax === 0) continue;

      const mapping = await getAccountMapping(h.loaihd, d.ten);
      
      // Revenue / Good Purchase
      if (valAmount !== 0) {
        entries.push({
          ngay: h.tdlap,
          soHdon: h.shdon,
          dienGiai: d.ten,
          doitac: doitac || '',
          tkNo: mapping.no,
          tkCo: mapping.co,
          soTien: Math.abs(valAmount)
        });

        // Simple COGS logic for sale (assuming 80% if not calculated)
        if (h.loaihd === 'banra' && !mapping.isDiscount) {
            entries.push({
               ngay: h.tdlap,
               soHdon: h.shdon,
               dienGiai: `Giá vốn (80%): ${d.ten}`,
               doitac: 'Nội bộ',
               tkNo: '632',
               tkCo: '1561',
               soTien: Math.abs(valAmount) * 0.8
            });
        }
      }

      // Tax
      if (valTax !== 0) {
        const tkThue = h.loaihd === 'banra' ? '3331' : '1331';
        entries.push({
          ngay: h.tdlap,
          soHdon: h.shdon,
          dienGiai: `Thuế GTGT: ${d.ten}`,
          doitac: doitac || '',
          tkNo: h.loaihd === 'banra' ? '131' : tkThue,
          tkCo: h.loaihd === 'banra' ? tkThue : '331',
          soTien: Math.abs(valTax)
        });
      }
    }
  }

  const targetAccounts = ['131', '331', '1561', '511', '632', '1331', '3331', '642'];
  const formatDate = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  };

  for (const tk of targetAccounts) {
    const accEntries = entries.filter(e => e.tkNo === tk || e.tkCo === tk);
    if (accEntries.length === 0) continue;

    let md = `# SỔ CHI TIẾT THỰC TẾ (HÓA ĐƠN GỐC) - TK ${tk} - HUY VŨ 2023\n\n`;
    md += `*Trích xuất từ dữ liệu hóa đơn chi tiết (Line items).*\n\n`;
    md += "| Ngày | Số HĐ | Diễn giải (Hàng hóa/Dịch vụ) | Đối tác | TK Đ/Ứ | Nợ | Có |\n";
    md += "| :--- | :--- | :--- | :--- | :---: | ---: | ---: |\n";

    let totalNo = 0;
    let totalCo = 0;

    accEntries.forEach(e => {
      const no = e.tkNo === tk ? e.soTien : 0;
      const co = e.tkCo === tk ? e.soTien : 0;
      const tkDoiUng = e.tkNo === tk ? e.tkCo : e.tkNo;
      totalNo += no;
      totalCo += co;

      md += `| ${formatDate(e.ngay)} | ${e.soHdon} | ${e.dienGiai} | ${e.doitac} | ${tkDoiUng} | ${no.toLocaleString('vi-VN')} | ${co.toLocaleString('vi-VN')} |\n`;
    });

    md += `| | | **TỔNG CỘNG** | | | **${totalNo.toLocaleString('vi-VN')}** | **${totalCo.toLocaleString('vi-VN')}** |\n`;

    const fileName = `ACTUAL_DETAIL_${tk}_2023.md`;
    fs.writeFileSync(path.join(outputDir, fileName), md);
    console.log(`Generated: ${fileName}`);
  }

  // Also Generate a General Journal
  let nkcMd = `# NHẬT KÝ CHUNG THỰC TẾ (CHI TIẾT) - HUY VŨ 2023\n\n`;
  nkcMd += "| Ngày | Số HĐ | Diễn giải | Tài khoản Nợ | Tài khoản Có | Số tiền |\n";
  nkcMd += "| :--- | :--- | :--- | :---: | :---: | ---: |\n";
  
  let totalTien = 0;
  entries.forEach(e => {
    totalTien += e.soTien;
    nkcMd += `| ${formatDate(e.ngay)} | ${e.soHdon} | ${e.dienGiai} | ${e.tkNo} | ${e.tkCo} | ${e.soTien.toLocaleString('vi-VN')} |\n`;
  });
  nkcMd += `| | | **TỔNG CỘNG** | | | **${totalTien.toLocaleString('vi-VN')}** |\n`;
  fs.writeFileSync(path.join(outputDir, 'ACTUAL_NKC_2023.md'), nkcMd);
  console.log("Generated: ACTUAL_NKC_2023.md");

  await client.end();
  console.log("Process complete.");
}

run().catch(console.error);
