const XLSX = require('xlsx');
const filePath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const results = [];
    // Data usually starts at row 5 (0-indexed) or so
    for (let i = 5; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 10) continue;

        // Some lines might be total lines, check index 0 as it usually has warehouse name
        const warehouse = row[0];
        const maHang = row[2];
        const tenHang = row[3];
        const dvt = row[5];
        const tonDauT12024 = Number(row[7] || 0);

        if (maHang && tenHang && tonDauT12024 !== 0) {
            results.push({
                maHang,
                tenHang,
                dvt,
                tonDauT12024
            });
        }
    }

    console.log(JSON.stringify(results.slice(0, 50), null, 2));
    console.log(`\nTổng số sản phẩm có tồn kho thực tế: ${results.length}`);

} catch (e) { console.error(e); }
