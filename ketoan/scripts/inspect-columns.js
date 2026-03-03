const XLSX = require('xlsx');
const filePath = '/chikiet/kata2025/ragketoan/Tong_hop_ton_kho T1 2024.xlsx';

try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Log row 2, 3, 4 fully (headers)
    console.log("Dòng 3 (Header):", data[3]);
    console.log("Dòng 4 (SubHeader):", data[4]);

    // Log sample data row index values carefully
    const sampleRow = data[5];
    console.log("Sample Row 5 indices and values:");
    sampleRow.forEach((val, i) => {
        console.log(`${i}: ${val}`);
    });

} catch (e) { console.error(e); }
