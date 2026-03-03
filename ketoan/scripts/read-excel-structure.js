const XLSX = require('xlsx');
const filePath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const headers = data[3]; // Try different header rows
    console.log("Header row indices:");
    headers.forEach((h, i) => {
        if (h) console.log(`${i}: ${h}`);
    });

    const subHeaders = data[4];
    console.log("SubHeader row indices:");
    subHeaders.forEach((h, i) => {
        if (h) console.log(`${i}: ${h}`);
    });

} catch (e) { console.error(e); }
