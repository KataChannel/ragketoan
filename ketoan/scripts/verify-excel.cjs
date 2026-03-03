const XLSX = require('xlsx');
const outPath = '/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx';

try {
    const wb = XLSX.readFile(outPath);
    console.log("SheetNames:", wb.SheetNames);
    wb.SheetNames.forEach(name => {
        const sheet = wb.Sheets[name];
        const range = XLSX.utils.decode_range(sheet['!ref']);
        console.log(`Sheet ${name}: Range ${sheet['!ref']}, Rows ${range.e.r + 1}`);
    });
} catch (e) {
    console.error("File is corrupted or cannot be read:", e.message);
}
