const fs = require('fs');
const path = require('path');

const READ_PATH = '/tmp/vth_xt_data_2023_2026.json';
const OUTPUT_PATH = '/tmp/hv_tonghop_items_prices.json';
const MD_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md';

function main() {
    console.log("Đang đọc file markdown để trích xuất danh sách 248 nhóm...");
    if (!fs.existsSync(MD_PATH)) {
        console.error(`Lỗi: Không tìm thấy file markdown tại ${MD_PATH}`);
        process.exit(1);
    }
    
    // 1. Phân tích file Markdown để lấy 248 Nhóm
    const mdContent = fs.readFileSync(MD_PATH, 'utf-8');
    const groups = [];
    const lines = mdContent.split('\n');
    for (const line of lines) {
        if (line.includes('| **')) {
            const parts = line.split('|').map(p => p.trim());
            // Format kì vọng: | STT | **CAM-001** | Camera & An ninh - CAMERA | 8 |
            if (parts.length >= 4) {
                const code = parts[2].replace(/\*\*/g, '');
                const name = parts[3];
                groups.push({ code, name });
            }
        }
    }
    console.log(`Thành công! Đã load ${groups.length} nhóm từ markdown.`);

    // 2. Hàm gom nhóm (Tái tạo lại logic từ Python final_sync_xnt_248.py)
    function mapToGroup(tenHang) {
        const hhp_low = String(tenHang || '').toLowerCase();
        
        // Strategy A: Exact model keyword match from group name
        for (let g of groups) {
            if (g.name.toLowerCase().includes('khác')) continue;
            const parts = g.name.split(' - ');
            if (parts.length > 1) {
                const model = parts[parts.length - 1].toLowerCase().trim();
                // Match nếu keyword nằm ở đâu đó trong tên gốc
                if (model && hhp_low.includes(model)) {
                    return g;
                }
            }
        }
        
        // Strategy B: Category heuristics cho các mặt hàng không khớp keyword
        let cat_found = "Khác / Chưa phân loại";
        if (["pc", "máy tính", "laptop"].some(k => hhp_low.includes(k))) cat_found = "Máy tính (PC/Laptop)";
        else if (["máy in", "mực", "chuột", "bàn phím"].some(k => hhp_low.includes(k))) cat_found = "Thiết bị văn phòng";
        else if (["cam", "đầu ghi"].some(k => hhp_low.includes(k))) cat_found = "Camera & An ninh";
        else if (["mạng", "wifi", "switch", "net"].some(k => hhp_low.includes(k))) cat_found = "Mạng & Kết nối";
        else if (["linh kiện", "ram", "ssd", "ổ cứng"].some(k => hhp_low.includes(k))) cat_found = "Linh kiện máy tính";
        else if (["màn hình", "lcd"].some(k => hhp_low.includes(k))) cat_found = "Màn hình (Monitors)";
        else if (["thi công", "dịch vụ", "cước"].some(k => hhp_low.includes(k))) cat_found = "Dịch vụ & Thi công";
        else if (["phần mềm", "win"].some(k => hhp_low.includes(k))) cat_found = "Phần mềm";

        // Gán vào group "Khác" của ngành hàng đó
        for (let g of groups) {
            if (g.name.toLowerCase().includes('khác') && g.name.includes(cat_found)) {
                return g;
            }
        }
        
        return { code: "OTH-084", name: "Khác / Chưa phân loại - Khác" }; // Fallback cuối cùng
    }

    // 3. Đọc dữ liệu JSON CSDL
    console.log(`Đang đọc dữ liệu XNT từ ${READ_PATH}...`);
    if(!fs.existsSync(READ_PATH)) {
        console.error(`Lỗi: Không tìm thấy file JSON data tại ${READ_PATH}`);
        console.log(`Lưu ý: Bạn cần đảm bảo file này đã được xuất ra trước khi chạy script nhe.`);
        process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(READ_PATH, 'utf8'));
    console.log(`Đã đọc ${data.length} records. Xử lý gộp và phân nhóm...`);
    
    // 4. Extract Unique Items và Cộng dồn
    const mapUnique = {};

    for (const item of data) {
        // Hỗ trợ multi key formats để robust
        const maHang = item.maHang || item.ma_hang || '';
        const tenGoc = item.tenGoc || item.tenHang || item.ten_hang || '';
        if (!maHang) continue;
        
        const slNhap = Number(item.slNhap || item.soLuongNhap || 0);
        const slXuat = Number(item.slXuat || item.soLuongXuat || 0);
        const tienNhap = Number(item.tienNhap || item.giaTriNhap || 0);
        const tienXuat = Number(item.tienXuat || item.giaTriXuat || 0);
        let itemDgia = Number(item.dgia || item.donGia || item.don_gia || 0);
        
        const sl = slNhap + slXuat;
        const tien = tienNhap + tienXuat;
        
        if (!mapUnique[maHang]) {
            mapUnique[maHang] = { maHang, tenGoc, sl: 0, tien: 0, dgia: 0 };
        }
        
        mapUnique[maHang].sl += sl;
        mapUnique[maHang].tien += tien;
        
        // Nếu input json trực tiếp có dgia thì ưu tiên
        if (itemDgia > 0) {
            mapUnique[maHang].dgia = itemDgia;
        }
        
        // Lưu giữ tenGoc tốt nhất
        if (!mapUnique[maHang].tenGoc && tenGoc) {
            mapUnique[maHang].tenGoc = tenGoc;
        }
    }

    // 5. Chuẩn bị Format Output Cuối
    const result = [];
    for (const key in mapUnique) {
        const obj = mapUnique[key];
        const grpK = mapToGroup(obj.tenGoc);
        
        let dgia = obj.dgia;
        
        // Tính toán lại dgia qua bình quân gia quyền Nếu file CSDL không có trường dgia!
        if (dgia === 0 && obj.sl > 0) {
            dgia = Math.round(obj.tien / obj.sl);
        }
        
        result.push({
            maHang: obj.maHang,
            tenGoc: obj.tenGoc,
            dgia: dgia,
            tenNhom: grpK.name,
            maNhom: grpK.code,
            sl: obj.sl
        });
    }

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), 'utf-8');
    console.log(`DONE! Chúc mừng, Đã phân loại thành công ${result.length} mặt hàng duy nhất và xuất ra ${OUTPUT_PATH}!`);
}

main();
