const { Client } = require('/chikiet/kata2025/ragketoan/ketoan/node_modules/pg');
const fs = require('fs');
const path = require('path');

const connectionString = "postgresql://root:password@127.0.0.1:5432/ketoan";
const congtyId = 'db88c924-206b-4544-9256-c1cd79d417e4';
const outputDir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach';

async function getAccountMapping(loaihd, tenHang) {
  const tenUpper = tenHang.toUpperCase();
  if (loaihd === 'banra') {
    if (tenUpper.includes('CHIET KHAU') || tenUpper.includes(' CK ') || tenUpper.startsWith('CK ')) {
      return { no: '521', co: '131', isDiscount: true };
    }
    return { no: '131', co: '511' };
  } else {
    if (tenUpper.includes('CUOC') || tenUpper.includes('PHI') || tenUpper.includes('DICH VU') || 
        tenUpper.includes('GIA CONG') || tenUpper.includes('VAN CHUYEN')) {
      return { no: '642', co: '331' };
    }
    if (tenUpper.includes('CONG CU') || tenUpper.includes('DUNG CU') || tenUpper.includes('VAN PHONG PHAM') || tenUpper.includes('MUC IN')) {
      return { no: '153', co: '331' };
    }
    if (tenUpper.includes('MAY TINH') || tenUpper.includes('LAPTOP') || tenUpper.includes('DIEU HOA') || tenUpper.includes('TU LANH')) {
      return { no: '242', co: '331' };
    }
    if (tenUpper.includes('NGUYEN LIEU') || tenUpper.includes('VAT LIEU') || tenUpper.includes('PHU LIEU')) {
      return { no: '152', co: '331' };
    }
    return { no: '1561', co: '331' };
  }
}

async function run() {
  const client = new Client({ connectionString });
  await client.connect();

  console.log("Fetching data...");
  
  const resTongHop = await client.query(`
    SELECT shdon, tdlap, "tenHang", "tenHangChuan", thtien, tthue, loaihd, nbten, nmten, sluong 
    FROM ext_tonghop 
    WHERE "congtyId" = $1 AND nam = 2023 
    ORDER BY tdlap ASC`, [congtyId]);

  const resStock = await client.query(`
    SELECT date, "tenHangChuan", "xuatQty", "xuatVal" 
    FROM ext_daily_stock_v2 
    WHERE "congtyId" = $1 AND date >= '2023-01-01' AND date < '2024-01-01'`, [congtyId]);

  const stockMap = new Map();
  resStock.rows.forEach(s => {
    const d = new Date(s.date);
    const dateStr = d.toISOString().split('T')[0];
    stockMap.set(`${dateStr}_${s.tenHangChuan}`, s);
  });

  const entries = [];

  for (const item of resTongHop.rows) {
    const valAmount = Number(item.thtien);
    const valTax = Number(item.tthue);
    if (valAmount === 0 && valTax === 0) continue;

    const mapping = await getAccountMapping(item.loaihd, item.tenHang);
    const doitac = item.loaihd === 'banra' ? item.nmten : item.nbten;
    
    if (valAmount !== 0) {
      entries.push({
        ngay: item.tdlap,
        soHdon: item.shdon,
        dienGiai: item.tenHang,
        doitac: doitac || '',
        tkNo: mapping.no,
        tkCo: mapping.co,
        soTien: Math.abs(valAmount)
      });

      if (item.loaihd === 'banra' && !mapping.isDiscount) {
        const d = new Date(item.tdlap);
        const dateStr = d.toISOString().split('T')[0];
        const stock = stockMap.get(`${dateStr}_${item.tenHangChuan}`);
        if (stock && Number(stock.xuatQty) > 0) {
          const unitCOGS = Number(stock.xuatVal) / Number(stock.xuatQty);
          const totalCOGS = unitCOGS * Number(item.sluong);
          if (totalCOGS > 0) {
            entries.push({
              ngay: item.tdlap,
              soHdon: item.shdon,
              dienGiai: `Giá vốn: ${item.tenHang}`,
              doitac: 'Hệ thống kho',
              tkNo: '632',
              tkCo: '1561',
              soTien: totalCOGS
            });
          }
        }
      }
    }

    if (valTax !== 0) {
      const tkThue = item.loaihd === 'banra' ? '3331' : '1331';
      entries.push({
        ngay: item.tdlap,
        soHdon: item.shdon,
        dienGiai: `Thuế GTGT ${item.loaihd === 'banra' ? 'bán ra' : 'mua vào'}`,
        doitac: doitac || '',
        tkNo: item.loaihd === 'banra' ? '131' : tkThue,
        tkCo: item.loaihd === 'banra' ? tkThue : '331',
        soTien: Math.abs(valTax)
      });
    }
  }

  const targetAccounts = ['131', '331', '1561', '511', '632', '1331', '3331', '642'];
  const formatDate = (d) => {
    const dt = new Date(d);
    return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${dt.getFullYear()}`;
  };

  targetAccounts.forEach(tk => {
    const accEntries = entries.filter(e => e.tkNo === tk || e.tkCo === tk);
    if (accEntries.length === 0) return;

    let md = `# SỔ CHI TIẾT THỰC TẾ - TK ${tk} - HUY VŨ 2023\n\n`;
    md += `*Dữ liệu chi tiết từ hóa đơn gốc.*\n\n`;
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

    const fileName = `SO_CHI_TIET_THUC_TE_${tk}_2023.md`;
    fs.writeFileSync(path.join(outputDir, fileName), md);
    console.log(`Generated: ${fileName}`);
  });

  let nkcMd = `# NHẬT KÝ CHUNG THỰC TẾ - HUY VŨ 2023\n\n`;
  nkcMd += "| Ngày | Số HĐ | Diễn giải | Tài khoản Nợ | Tài khoản Có | Số tiền |\n";
  nkcMd += "| :--- | :--- | :--- | :---: | :---: | ---: |\n";
  
  let totalTien = 0;
  entries.forEach(e => {
    totalTien += e.soTien;
    nkcMd += `| ${formatDate(e.ngay)} | ${e.soHdon} | ${e.dienGiai} | ${e.tkNo} | ${e.tkCo} | ${e.soTien.toLocaleString('vi-VN')} |\n`;
  });
  nkcMd += `| | | **TỔNG CỘNG** | | | **${totalTien.toLocaleString('vi-VN')}** |\n`;
  fs.writeFileSync(path.join(outputDir, 'NKC_THUC_TE_2023.md'), nkcMd);
  console.log("Generated: NKC_THUC_TE_2023.md");

  await client.end();
  console.log("Done.");
}

run().catch(console.error);
