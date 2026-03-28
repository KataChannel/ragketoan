const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFile = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SO_SACH_KE_TOAN_TONG_HOP_2023_HUYVU.xlsx';
const outputDir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach';

if (!fs.existsSync(excelFile)) {
    console.error("File excel không tồn tại:", excelFile);
    process.exit(1);
}

const workbook = XLSX.readFile(excelFile);

workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (data.length === 0) return;
    
    let md = `# SỔ CHI TIẾT - ${sheetName.toUpperCase()} - CÔNG TY HUY VŨ 2023\n\n`;
    
    // Header
    const headers = data[0];
    md += "| " + headers.join(" | ") + " |\n";
    md += "| " + headers.map(() => "---").join(" | ") + " |\n";
    
    // Rows
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        md += "| " + row.map(val => val === null || val === undefined ? '' : String(val)).join(" | ") + " |\n";
    }
    
    const fileName = sheetName.replace(/ /g, '_').toUpperCase() + '_2023.md';
    fs.writeFileSync(path.join(outputDir, fileName), md);
    console.log("Đã xuất:", fileName);
});
