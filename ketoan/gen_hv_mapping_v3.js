const fs = require('fs');

const items = JSON.parse(fs.readFileSync('/tmp/hv_tonghop_items_prices.json', 'utf8'));

// Sort by sl desc
items.sort((a, b) => b.sl - a.sl);

function extractPriceBand(price, thresholds) {
    if (!price || price === 0) return { label: "Không thu tiền", en: "FREE" };
    for (let t of thresholds) {
        if (price < t.max) return { label: t.label, en: t.en };
    }
    const last = thresholds[thresholds.length - 1];
    return { label: last.label, en: last.en };
}

function getMapping(tenGoc, price) {
    const tenGocUpper = tenGoc.toUpperCase();
    
    // ---------------- Laptops ----------------
    if (tenGocUpper.includes("LAPTOP") || tenGocUpper.includes("MÁY TÍNH XÁCH TAY") || tenGocUpper.includes("MÁY VI TÌNH XÁCH TAY")) {
        const bands = [
            {max: 10000000, label: "Dưới 10 Triệu", en: "U10M"},
            {max: 15000000, label: "Từ 10-15 Triệu", en: "10-15M"},
            {max: 20000000, label: "Từ 15-20 Triệu", en: "15-20M"},
            {max: 999000000, label: "Trên 20 Triệu", en: "O20M"}
        ];
        const band = extractPriceBand(price, bands);
        
        let brand = "Khác", brandEn = "OTH", model = "", modelEn = "";
        if (tenGocUpper.includes("DELL")) {
            brand = "Dell"; brandEn = "DEL";
            if (tenGocUpper.includes("INSPIRON")) { model = "Inspiron"; modelEn = "INS"; }
            else if (tenGocUpper.includes("VOSTRO")) { model = "Vostro"; modelEn = "VOS"; }
            else if (tenGocUpper.includes("LATITUDE")) { model = "Latitude"; modelEn = "LAT"; }
        } else if (tenGocUpper.includes("HP")) {
            brand = "HP"; brandEn = "HP";
        } else if (tenGocUpper.includes("ASUS")) {
            brand = "ASUS"; brandEn = "ASU";
            if (tenGocUpper.includes("VIVOBOOK")) { model = "Vivobook"; modelEn = "VIV"; }
            else if (tenGocUpper.includes("ZENBOOK")) { model = "Zenbook"; modelEn = "ZEN"; }
            else if (tenGocUpper.includes("TUF")) { model = "TUF Gaming"; modelEn = "TUF"; }
        } else if (tenGocUpper.includes("LENOVO")) {
            brand = "Lenovo"; brandEn = "LEN";
            if (tenGocUpper.includes("THINKPAD")) { model = "ThinkPad"; modelEn = "TPD"; }
            else if (tenGocUpper.includes("THINKBOOK")) { model = "ThinkBook"; modelEn = "TBK"; }
            else if (tenGocUpper.includes("IDEAPAD")) { model = "IdeaPad"; modelEn = "IPD"; }
        } else if (tenGocUpper.includes("MACBOOK") || tenGocUpper.includes("APPLE")) {
            brand = "Apple"; brandEn = "MAC"; model = "MacBook"; modelEn = "MBK";
        } else if (tenGocUpper.includes("MSI")) {
            brand = "MSI"; brandEn = "MSI";
        }
        
        const ma = `LT-${brandEn}${modelEn?"-"+modelEn:""}-${band.en}`;
        const name = `Laptop ${brand} ${model} (${band.label})`.trim().replace("  ", " ");
        return [ma, name];
    }
            
    // ---------------- PC ----------------
    if (tenGocUpper.includes("MÁY VI TÍNH") || tenGocUpper.includes("BỘ MÁY") || tenGocUpper.includes("DESKTOP") || tenGocUpper.includes("MÁY BÀN")) {
        const bands = [
            {max: 8000000, label: "Dưới 8 Triệu", en: "U8M"},
            {max: 12000000, label: "Từ 8-12 Triệu", en: "8-12M"},
            {max: 20000000, label: "Từ 12-20 Triệu", en: "12-20M"},
            {max: 999000000, label: "Trên 20 Triệu", en: "O20M"}
        ];
        const band = extractPriceBand(price, bands);
        let brand = "Lắp ráp", brandEn = "CUSTOM";
        if (tenGocUpper.includes("DELL")) { brand = "Dell"; brandEn = "DEL"; }
        else if (tenGocUpper.includes("HP")) { brand = "HP"; brandEn = "HP"; }
        else if (tenGocUpper.includes("LENOVO")) { brand = "Lenovo"; brandEn = "LEN"; }
        else if (tenGocUpper.includes("ASUS")) { brand = "ASUS"; brandEn = "ASU"; }
        
        return [`PC-${brandEn}-${band.en}`, `Máy bộ PC để bàn ${brand} (${band.label})`];
    }

    // ---------------- Máy In ----------------
    if (tenGocUpper.includes("MÁY IN") && !tenGocUpper.includes("HỘP MỰC") && !tenGocUpper.includes("MỰC IN")) {
        let brand = "Hãng Khác", brandEn = "OTH", model = "", modelEn = "";
        if (tenGocUpper.includes("CANON")) {
            brand = "Canon"; brandEn = "CAN";
            if (tenGocUpper.includes("2900")) { model = "LBP2900"; modelEn = "LBP2900"; }
            else if (tenGocUpper.includes("6030")) { model = "LBP6030"; modelEn = "LBP6030"; }
            else if (tenGocUpper.includes("243") || tenGocUpper.includes("246")) { model = "LBP 240 Series"; modelEn = "LBP240"; }
        } else if (tenGocUpper.includes("BROTHER")) {
            brand = "Brother"; brandEn = "BRO";
            if (tenGocUpper.includes("2321")) { model = "HL-L2321D"; modelEn = "HL2321"; }
            else if (tenGocUpper.includes("2100") || tenGocUpper.includes("2180")) { model = "B2100/B2180 Series"; modelEn = "B2100"; }
            else if (tenGocUpper.includes("2701") || tenGocUpper.includes("2366")) { model = "Dòng Đa Năng"; modelEn = "MFC_HL"; }
        } else if (tenGocUpper.includes("EPSON")) {
            brand = "Epson"; brandEn = "EPS";
            if (tenGocUpper.includes("8050") || tenGocUpper.includes("L805")) { model = "L805/L8050"; modelEn = "L805"; }
            else { model = "Dòng L-Series Khác"; modelEn = "LSER"; }
        } else if (tenGocUpper.includes("HÓA ĐƠN") || tenGocUpper.includes("XP-")) {
            brand = "Xprinter (Máy in bill)"; brandEn = "XPR";
        }
        
        const ma = `PR-${brandEn}${modelEn?"-"+modelEn:""}`;
        const name = `Máy in ${brand} ${model}`.trim();
        return [ma, name];
    }
            
    // ---------------- Mực in ----------------
    if ((tenGocUpper.includes("MỰC") || tenGocUpper.includes("CATRIDGE") || tenGocUpper.includes("CARTRIDGE") || tenGocUpper.includes("TRỐNG")) && !tenGocUpper.includes("MÁY IN")) {
        const bands = [
            {max: 100000, label: "< 100K (Bơm mực/Thay thế)", en: "REFILL"},
            {max: 250000, label: "100K-250K (Hộp mực tương thích)", en: "COMPAT"},
            {max: 600000, label: "250K-600K (Hộp mực xịn)", en: "PREMIUM"},
            {max: 9999000, label: "> 600k (Mực chính hãng/Màu)", en: "OEM"}
        ];
        const band = extractPriceBand(price, bands);
        let brand = "Thường", brandEn = "GEN";
        if (tenGocUpper.includes("CANON")) { brand = "Canon"; brandEn = "CAN"; }
        else if (tenGocUpper.includes("BROTHER")) { brand = "Brother"; brandEn = "BRO"; }
        else if (tenGocUpper.includes("EPSON")) { brand = "Epson"; brandEn = "EPS"; }
        
        let type = "Laser/Bột", typeEn = "LSR";
        if (tenGocUpper.includes("MỰC NƯỚC") || tenGocUpper.includes("DYEINK")) { type = "Nước/Màu"; typeEn = "INK"; }
        if (tenGocUpper.includes("12A") || tenGocUpper.includes("303") || tenGocUpper.includes("FX9")) { type = "Phổ thông (12A/303)"; typeEn = "12A"; }
        
        return [`INK-${brandEn}-${typeEn}-${band.en}`, `Mực in ${type} ${brand} (${band.label})`];
    }

    // ---------------- Linh kiện Core ----------------
    if (tenGocUpper.includes("SSD") || tenGocUpper.includes("Ổ CỨNG") || tenGocUpper.includes("HDD")) {
        let size = "Phổ thông", sizeEn = "GEN";
        if (tenGocUpper.includes("120") || tenGocUpper.includes("128") || tenGocUpper.includes("240") || tenGocUpper.includes("256")) { size = "120GB-256GB"; sizeEn = "256G"; }
        else if (tenGocUpper.includes("500") || tenGocUpper.includes("512")) { size = "500GB-512GB"; sizeEn = "512G"; }
        else if (tenGocUpper.includes("1TB") || tenGocUpper.includes("1T")) { size = "1TB+"; sizeEn = "1TB"; }
        else if (price < 400000) { size = "120GB-256GB"; sizeEn = "256G"; }
        else if (price > 900000) { size = "1TB+"; sizeEn = "1TB"; }
        else { size = "500GB-512GB"; sizeEn = "512G"; }
        
        let type = tenGocUpper.includes("HDD") ? "HDD" : "SSD";
        return [`${type}-${sizeEn}`, `Ổ cứng ${type} dung lượng ${size}`];
    }
    
    if (tenGocUpper.includes("RAM") || tenGocUpper.includes("BỘ NHỚ TRONG")) {
        let size = "PC/Lap", sizeEn = "GEN";
        if (tenGocUpper.includes("4GB") || price < 300000) { size = "4GB"; sizeEn = "4GB"; }
        else if (tenGocUpper.includes("8GB") || (price >= 300000 && price <= 600000)) { size = "8GB"; sizeEn = "8GB"; }
        else if (tenGocUpper.includes("16GB") || price > 600000) { size = "16GB"; sizeEn = "16GB"; }
        return [`RAM-${sizeEn}`, `Bộ nhớ RAM ${size}`];
    }
    
    if (tenGocUpper.includes("MAINBOARD") || tenGocUpper.includes("BO MẠCH CHỦ") || tenGocUpper.includes("BẢNG MẠCH CHÍNH")) {
        let brand = "Linh kiện", brandEn = "GEN";
        if (tenGocUpper.includes("ASUS")) { brand = "ASUS"; brandEn = "ASU"; }
        else if (tenGocUpper.includes("GIGABYTE")) { brand = "Gigabyte"; brandEn = "GIG"; }
        else if (tenGocUpper.includes("MSI")) { brand = "MSI"; brandEn = "MSI"; }
        
        let chipset = "Bo mạch chủ", chipsetEn = "GEN";
        if (tenGocUpper.includes("H610")) { chipset = "H610"; chipsetEn = "H610"; }
        else if (tenGocUpper.includes("H510")) { chipset = "H510"; chipsetEn = "H510"; }
        else if (tenGocUpper.includes("B760")) { chipset = "B760"; chipsetEn = "B760"; }
        
        return [`MAIN-${brandEn}-${chipsetEn}`, `Mainboard ${brand} dòng ${chipset}`];
    }
    
    if (tenGocUpper.includes("CHÍP VI XỬ LÝ") || tenGocUpper.includes("BỘ VI XỬ LÝ") || tenGocUpper.includes("CPU") || tenGocUpper.includes("PROCESSOR")) {
        let series = "CPU", seriesEn = "CPU";
        if (tenGocUpper.includes("I3")) { series = "Core i3"; seriesEn = "I3"; }
        else if (tenGocUpper.includes("I5")) { series = "Core i5"; seriesEn = "I5"; }
        else if (tenGocUpper.includes("I7")) { series = "Core i7"; seriesEn = "I7"; }
        return [`CPU-${seriesEn}`, `Bộ vi xử lý Intel ${series}`];
    }

    if (tenGocUpper.includes("MÀN HÌNH") || tenGocUpper.includes("MONITOR") || tenGocUpper.includes("DISPLAY")) {
        let brand = "Thường", brandEn = "GEN";
        if (tenGocUpper.includes("DELL")) { brand = "Dell"; brandEn = "DEL"; }
        else if (tenGocUpper.includes("SAMSUNG")) { brand = "Samsung"; brandEn = "SAM"; }
        else if (tenGocUpper.includes("VIEWSONIC")) { brand = "ViewSonic"; brandEn = "VS"; }
        else if (tenGocUpper.includes("LG")) { brand = "LG"; brandEn = "LG"; }
        
        let size = "21-24 Inch", sizeEn = "22_24";
        if (tenGocUpper.includes("19") || tenGocUpper.includes("20")) { size = "19-20 Inch"; sizeEn = "19_20"; }
        else if (tenGocUpper.includes("27") || price > 3000000) { size = "27 Inch+"; sizeEn = "27P"; }
        
        return [`MON-${brandEn}-${sizeEn}`, `Màn hình máy tính ${brand} ${size}`];
    }

    // ---------------- Phụ kiện ngoại vi ----------------
    if (tenGocUpper.includes("CHUỘT") || (tenGocUpper.includes("MOUSE") && !tenGocUpper.includes("PAD"))) {
        let type = "Dây", typeEn = "WIR";
        if (tenGocUpper.includes("KHÔNG DÂY") || tenGocUpper.includes("WIRELESS") || price > 150000) { type = "Không Dây"; typeEn = "WLS"; }
        let brand = "Khác", brandEn = "OTH";
        if (tenGocUpper.includes("LOGITECH")) { brand = "Logitech"; brandEn = "LOGI"; }
        else if (tenGocUpper.includes("RAPOO")) { brand = "Rapoo"; brandEn = "RAPOO"; }
        else if (tenGocUpper.includes("DELL")) { brand = "Dell"; brandEn = "DELL"; }
        return [`MOUSE-${brandEn}-${typeEn}`, `Chuột máy tính ${brand} (${type})`];
    }
    
    if (tenGocUpper.includes("BỘ BÀN PHÍM + CHUỘT") || tenGocUpper.includes("COMBO")) {
        return ["KB-COMBO", "Bộ Combo Bàn phím & Chuột"];
    }
    
    if (tenGocUpper.includes("BÀN PHÍM") || tenGocUpper.includes("KEYBOARD")) {
        let brand = "Khác", brandEn = "OTH";
        if (tenGocUpper.includes("LOGITECH")) { brand = "Logitech"; brandEn = "LOGI"; }
        else if (tenGocUpper.includes("RAPOO")) { brand = "Rapoo"; brandEn = "RAPOO"; }
        else if (tenGocUpper.includes("DELL")) { brand = "Dell"; brandEn = "DELL"; }
        return [`KB-${brandEn}`, `Bàn phím máy tính ${brand}`];
    }

    if (tenGocUpper.includes("TAI NGHE") || tenGocUpper.includes("HEADPHONE")) {
        return ["HP-GEN", "Tai nghe máy tính"];
    }
    
    if (tenGocUpper.includes("LOA") || tenGocUpper.includes("SPEAKER")) {
        let brand = "Khác", brandEn = "OTH";
        if (tenGocUpper.includes("SOUNDMAX")) { brand = "SoundMax"; brandEn = "SMAX"; }
        return [`SPK-${brandEn}`, `Loa máy tính ${brand}`];
    }
    
    // ---------------- Camera & Webcam ----------------
    if (tenGocUpper.includes("CAMERA") || tenGocUpper.includes("CCTV")) {
        let brand = "Khác", brandEn = "OTH";
        if (tenGocUpper.includes("EZVIZ")) { brand = "EZVIZ"; brandEn = "EZVIZ"; }
        else if (tenGocUpper.includes("HIKVISION")) { brand = "HIKVISION"; brandEn = "HIKV"; }
        return [`CAM-${brandEn}`, `Camera quan sát ${brand}`];
    }
    if (tenGocUpper.includes("WEBCAM") || tenGocUpper.includes("GHÌNH") || tenGocUpper.includes("TRUYỀN HÌNH ẢNH")) {
        let brand = "Khác", brandEn = "OTH";
        if (tenGocUpper.includes("LOGITECH")) { brand = "Logitech"; brandEn = "LOGI"; }
        return [`WCAM-${brandEn}`, `Webcam / Thiết bị ghi hình ${brand}`];
    }
    
    // ---------------- Mạng (Network) ----------------
    if (tenGocUpper.includes("ROUTER") || tenGocUpper.includes("BỘ ĐỊNH TUYẾN") || tenGocUpper.includes("THIẾT BỊ ĐỊNH TUYẾN")) {
        let brand = "TPLink / Khác", brandEn = "TPL_OTH";
        if (tenGocUpper.includes("TP-LINK") || tenGocUpper.includes("TPLINK")) { brand = "TP-Link"; brandEn = "TPLINK"; }
        return [`NW-ROUTER-${brandEn}`, `Bộ định tuyến WiFi (Router) ${brand}`];
    }
    if (tenGocUpper.includes("SWITCH") || tenGocUpper.includes("CHUYỂN MẠCH")) return ["NW-SWITCH", "Thiết bị chia mạng (Switch)"];
    if (tenGocUpper.includes("WIFI") || tenGocUpper.includes("THU PHÁT")) return ["NW-ADAPTER", "USB/Card thu phát WiFi"];
    if (tenGocUpper.includes("CÁP MẠNG")) return ["NW-CABLE", "Dây cáp mạng Internet"];
        
    // ---------------- Linh kiện khác ----------------
    if (tenGocUpper.includes("NGUỒN") || tenGocUpper.includes("POWER")) {
        let brand = "Máy tính", brandEn = "GEN";
        if (tenGocUpper.includes("JETEK")) { brand = "Jetek"; brandEn = "JETEK"; }
        return [`PSU-${brandEn}`, `Nguồn máy tính ${brand}`];
    }
    if (tenGocUpper.includes("USB") || tenGocUpper.includes("BỘ NHỚ NGOÀI") || tenGocUpper.includes("THẺ NHỚ")) {
        let bands = [
            {max:150000, label: "32GB/Thấp", en: "32G"}, 
            {max:300000, label: "64GB", en: "64G"}, 
            {max: 9990000, label: "128GB+", en: "128G"}
        ];
        const band = extractPriceBand(price, bands);
        return [`USB-${band.en}`, `Bộ nhớ ngoài / USB / Thẻ nhớ (${band.label})`];
    }
    if (tenGocUpper.includes("CÁP") && (tenGocUpper.includes("DỮ LIỆU") || tenGocUpper.includes("TÍN HIỆU") || tenGocUpper.includes("HDMI") || tenGocUpper.includes("VGA"))) {
        return ["CABLE-SIG", "Cáp truyền tín hiệu HDMI/VGA/USB"];
    }
    if (tenGocUpper.includes("BỘ LƯU ĐIỆN") || tenGocUpper.includes("UPS")) return ["UPS-GEN", "Bộ lưu điện (UPS)"];
    
    // ---------------- Dịch vụ & Phí ----------------
    if (tenGocUpper.includes("BẢO TRÌ") || tenGocUpper.includes("CÀI ĐẶT") || tenGocUpper.includes("SỬA CHỮA")) return ["SV-MAINT", "Dịch vụ Bảo trì / Sửa chữa IT"];
    if (tenGocUpper.includes("THI CÔNG") || tenGocUpper.includes("LẮP ĐẶT")) return ["SV-INSTALL", "Dịch vụ Thi công / Lắp đặt mạng"];
    if (tenGocUpper.includes("DỊCH VỤ VIỄN THÔNG") || tenGocUpper.includes("CƯỚC VIỄN THÔNG") || tenGocUpper.includes("CƯỚC")) return ["SV-TELECOM", "Cước Viễn thông / Internet"];
    if (tenGocUpper.includes("THU PHÍ CT") || tenGocUpper.includes("DỊCH VỤ NGÂN HÀNG") || tenGocUpper.includes("PHÍ")) return ["FEE-BANK", "Phí dịch vụ ngân hàng / CK"];
    if (tenGocUpper.includes("CHIẾT KHẤU") || tenGocUpper.includes("GIẢM GIÁ")) return ["FEE-DISC", "Chiết khấu thương mại / Giảm giá"];
    if (tenGocUpper.includes("LÃI VAY") || tenGocUpper.includes("THU LÃI")) return ["FEE-LOAN", "Thu phí trả góp / Lãi vay"];
    if (tenGocUpper.includes("KHUYẾN MẠI") || tenGocUpper.includes("KHUYẾN MÃI") || tenGocUpper.includes("HÀNG TẶNG")) return ["FEE-GIFT", "Hàng tặng / Khuyến mãi"];

    // ---------------- Phần mềm & Khác ----------------
    if (tenGocUpper.includes("KASPERSKY") || tenGocUpper.includes("PHẦN MỀM BẢO MẬT") || tenGocUpper.includes("DIỆT VIRUS")) return ["SW-AV", "Phần mềm diệt Virus Kaspersky"];
    if (tenGocUpper.includes("PHẦN MỀM") || tenGocUpper.includes("BẢN QUYỀN") || tenGocUpper.includes("WINDOWS") || tenGocUpper.includes("OFFICE")) return ["SW-GEN", "Bản quyền phần mềm (Win/Office/Khác)"];
    
    if (tenGocUpper.includes("MÁY CHIẾU") || tenGocUpper.includes("MÀN CHIẾU") || tenGocUpper.includes("TRÌNH CHIẾU")) return ["PRJ-EQ", "Thiết bị Máy chiếu / Màn chiếu"];
    if (tenGocUpper.includes("MÁY QUÉT") || tenGocUpper.includes("MÁY CHẤM CÔNG") || tenGocUpper.includes("MÁY ĐỌC MÃ")) return ["OFFICE-EQ", "Thiết bị kiểm soát (Chấm công/Mã vạch)"];
    
    // Anything else
    const bands = [
        {max: 200000, label: "< 200k", en: "U200K"}, 
        {max: 1000000, label: "200k - 1M", en: "200K_1M"}, 
        {max: 99900000, label: "> 1M", en: "O1M"}
    ];
    const band = extractPriceBand(price, bands);
    return [`ACC-GEN-${band.en}`, `Phụ kiện & vật tư phụ (${band.label})`];
}

const groups = {};

items.forEach(item => {
    if (item.sl < 2) return;
    const tenGoc = item.tenGoc.replace(/\n/g, ' ').trim();
    const price = item.dgia || 0;
    
    const [maHang, tenChuan] = getMapping(tenGoc, price);
    
    const key = maHang + "__" + tenChuan;
    
    if (!groups[key]) {
        groups[key] = { ma: maHang, chuan: tenChuan, sl_tong: 0, gocs: new Set(), goc_list: [] };
    }
    
    const grp = groups[key];
    grp.sl_tong += item.sl;
    if (!grp.gocs.has(tenGoc)) {
        grp.gocs.add(tenGoc);
        if (grp.goc_list.length < 5) {
            grp.goc_list.push(tenGoc);
        }
    }
});

let sortedGroups = Object.values(groups);
sortedGroups.sort((a, b) => b.sl_tong - a.sl_tong);

let out = [];
out.push(`# Bảng Từ Điển Đồng Nghĩa (Synonyms) AI - CÔNG TY TNHH HUY VŨ`);
out.push("");
out.push(`Theo yêu cầu, AI đã tái lập trình nhóm mặt hàng với **Mã AI hoàn toàn bằng tiếng Anh tiêu chuẩn**. Đã phân chia thành **${sortedGroups.length} nhóm mặt hàng chi tiết**, chuẩn hóa cấu trúc cho hệ thống RAG CSDL:`);
out.push("");
out.push("| STT | Mã Hàng (AI) | Tên Chuẩn Hóa | Số Lần Phát Sinh | Các Biến Thể Tên Hàng Thực Tế (Ví dụ) |");
out.push("| :--- | :--- | :--- | :--- | :--- |");

sortedGroups.forEach((grp, idx) => {
    let variants = "<br>- ".concat(grp.goc_list.join("<br>- "));
    if (grp.gocs.size > 5) {
        variants += `<br>*(...và ${grp.gocs.size - 5} biến thể khác)*`;
    }
    let s = `| ${idx + 1} | **${grp.ma}** | **${grp.chuan}** | ${grp.sl_tong} | ${variants.substring(4)} |`;
    out.push(s);
});

out.push("");
out.push(`*Ghi chú: Mã AI giờ đây tuân thủ chuẩn ký hiệu quốc tế (ví dụ: LT-DEL-INS-U10M = Laptop Dell Inspiron Under 10M).*`);

fs.writeFileSync('/mnt/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/mapping_items.md', out.join('\n'));
console.log(`Written successfully! Group count: ${sortedGroups.length}`);
