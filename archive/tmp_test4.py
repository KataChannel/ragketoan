import sys
sys.path.append('.')
import psycopg2
import re

# Same map_to_group function
kw_mapping = {}
stt_regex = re.compile(r'^\d+(\.\d+)?$')
groups_codes = []
with open("docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md", "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 5:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 5: continue
            if stt_regex.match(parts[1]):
                code = parts[2].replace('**', '').strip()
                aliases = [a.strip().lower() for a in parts[4].split(',') if a.strip()]
                groups_codes.append(code)
                kw_mapping[code] = aliases

def map_to_group(ten_hang):
    h = str(ten_hang or "").lower().strip()
    if not h: return "OTH-GEN"
    if re.search(r'dell.*latitude|latitude.*dell', h): return "PC-DELL-LAT"
    if re.search(r'dell.*vostro|vostro.*dell', h): return "PC-DELL-VOS"
    if re.search(r'dell.*inspiron|inspiron.*dell', h): return "PC-DELL-INS"
    if re.search(r'dell.*xps|xps.*dell', h): return "PC-DELL-XPS"
    if re.search(r'asus.*vivobook|vivobook', h): return "PC-ASU-VIVO"
    if re.search(r'asus.*zenbook|zenbook', h): return "PC-ASU-ZEN"
    if re.search(r'asus.*expertbook|expertbook', h): return "PC-ASU-EXP"
    if re.search(r'rog\s*strix|tuf\s*gaming|zephyrus', h): return "PC-ASU-ROG"
    if re.search(r'thinkpad', h): return "PC-LEN-TP"
    if re.search(r'ideapad|slim\s*[35]', h): return "PC-LEN-IP"
    if re.search(r'lenovo\s*v\s*1[45]|lenovo\s*v\d|v15\s*g[234567]|v14\s*g[234567]|v\-?series', h): return "PC-LEN-V"
    if re.search(r'thinkbook', h): return "PC-LEN-V"
    if re.search(r'msi.*modern|modern\s*1[45]', h): return "PC-MSI-MOD"
    if re.search(r'msi.*gf|msi.*katana|msi.*bravo', h): return "PC-MSI-GF"
    if re.search(r'hp.*pavilion|pavilion', h): return "PC-HP-PAV"
    if re.search(r'hp.*probook|probook', h): return "PC-HP-PRO"
    if re.search(r'hp.*elitebook|elitebook', h): return "PC-HP-EL"
    if re.search(r'acer.*aspire|aspire\s*[357]', h): return "PC-ACER-ASP"
    if re.search(r'acer.*nitro|nitro\s*[57]', h): return "PC-ACER-NIT"
    if re.search(r'macbook\s*air', h): return "PC-MAC-AIR"
    if re.search(r'macbook\s*pro', h): return "PC-MAC-PRO"
    if re.search(r'ipad', h): return "PC-TAB-IPAD"
    if re.search(r'galaxy\s*tab', h): return "PC-TAB-SAM"
    if re.search(r'thinkcentre|thinkcenter', h): return "PC-SYS-I5"
    if re.search(r'dell.*ins.*3020|optiplex|dell.*desktop|dell.*pro\s*tower', h): return "PC-SYS-I5"
    if re.search(r'workstation|server|xeon|proliant', h): return "PC-WS-XEON"
    if re.search(r'dell.*aio|optiplex.*aio|all[\s\-]*in[\s\-]*one.*dell', h): return "PC-AIO-DELL"
    if re.search(r'hp.*aio|proone|all[\s\-]*in[\s\-]*one.*hp', h): return "PC-AIO-HP"
    if re.search(r'intel\s*nuc|mini\s*pc|asus\s*pn', h): return "PC-MINI"
    if re.search(r'máy\s*tính\s*xách\s*tay|laptop|notebook|\(nb\)', h):
        if 'hp' in h or 'hewlett' in h:
            if re.search(r'14s|14\s*s', h): return "PC-HP-PAV"
            return "PC-HP-PRO"
        if 'dell' in h:
            if 'inspiron' in h: return "PC-DELL-INS"
            if 'latitude' in h: return "PC-DELL-LAT"
            if 'vostro' in h: return "PC-DELL-VOS"
            return "PC-DELL-INS"
        if 'lenovo' in h:
            if 'thinkpad' in h: return "PC-LEN-TP"
            if re.search(r'v\s*1[45]|v\d', h): return "PC-LEN-V"
            return "PC-LEN-V"
        if 'asus' in h: return "PC-ASU-VIVO"
        if 'acer' in h: return "PC-ACER-ASP"
        if 'msi' in h: return "PC-MSI-MOD"
        return "PC-SYS-I5"
    if re.search(r'máy\s*tính\s*để\s*bàn|máy\s*tính\s*bàn|desktop|pc\.?desktop', h):
        if 'dell' in h: return "PC-SYS-I5"
        if 'lenovo' in h: return "PC-SYS-I5"
        if 'hp' in h: return "PC-SYS-I5"
        if 'i7' in h: return "PC-SYS-I7"
        if 'i5' in h: return "PC-SYS-I5"
        return "PC-SYS-I3"
    if re.search(r'bộ\s*máy\s*vi\s*tính|bộ\s*máy\s*tính', h):
        if 'i7' in h: return "PC-SYS-I7"
        if 'i5' in h or 'pentium' in h: return "PC-SYS-I5"
        if 'gaming' in h: return "PC-SYS-G"
        return "PC-SYS-I3"
    if re.search(r'màn\s*hình|monitor|lcd\b', h):
        if 'samsung' in h:
            if re.search(r'1[89]|20\s*inch|20\"', h): return "LCD-SAM-19"
            return "LCD-SAM-24"
        if 'dell' in h:
            if re.search(r'22|21\.5', h): return "LCD-DELL-22"
            if re.search(r'27', h): return "LCD-DELL-27"
            return "LCD-DELL-24"
        if 'asus' in h: return "LCD-ASU-24"
        if 'lg' in h: return "LCD-LG-24"
        if 'viewsonic' in h: return "LCD-VIEW-24"
        if re.search(r'144hz|165hz|240hz|gaming', h): return "LCD-GAM-144"
        if re.search(r'4k|uhd', h): return "LCD-PRO-4K"
        return "LCD-DELL-24"
    if re.search(r'máy\s*in.*canon|canon.*máy\s*in|canon\s*lbp|lbp\s*\d', h): return "PRN-CAN-LBP"
    if re.search(r'canon\s*mf|mf\s*\d.*canon|đa\s*năng.*canon', h): return "PRN-CAN-MF"
    if re.search(r'brother\s*hl|hl[\-\s]*l?\d', h): return "PRN-BRO-HL"
    if re.search(r'brother\s*dcp|dcp[\-\s]*[blt]\d', h) or re.search(r'đa\s*năng.*brother', h): return "PRN-BRO-DCP"
    if re.search(r'hp\s*laserjet|laserjet\s*m\d', h): return "PRN-HP-LJ"
    if re.search(r'epson\s*l\d|l\s*\d{4}.*epson', h): return "PRN-EPS-L"
    if re.search(r'máy\s*in.*brother|brother.*máy\s*in', h): return "PRN-BRO-HL"
    if re.search(r'máy\s*in.*hp|hp.*máy\s*in', h): return "PRN-HP-LJ"
    if re.search(r'máy\s*in.*epson|epson.*máy\s*in', h): return "PRN-EPS-L"
    if re.search(r'máy\s*in\b', h): return "PRN-CAN-LBP"
    if re.search(r'máy\s*quét|scanjet|scanner|scan\s*jet', h): return "SCN-HP-SJ"
    if re.search(r'máy\s*quét.*canon|canon.*lide', h): return "SCN-CAN-CANO"
    if re.search(r'đầu\s*đọc\s*mã|barcode|honeywell|zebra.*scan', h): return "SCN-BAR"
    if re.search(r'xprinter|bixolon|máy\s*in\s*hóa\s*đơn|prp\s*085', h): return "PRN-POS-80"
    if re.search(r'mực|hộp\s*mực|cartridge|toner|ink\b', h):
        if re.search(r'12a|303|fx9', h): return "INK-CAN-12A"
        if re.search(r'35a|85a|78a|325', h): return "INK-CAN-35A"
        if re.search(r'051|054|057', h): return "INK-CAN-051"
        if re.search(r'tn[\-\s]*2385', h): return "INK-BRO-2385"
        if re.search(r'tn[\-\s]*b022|tn[\-\s]*b027', h): return "INK-BRO-B022"
        if re.search(r'tn[\-\s]*1010', h): return "INK-BRO-1010"
        if re.search(r'hp.*17a|cf217|hp.*107a', h): return "INK-HP-17A"
        if re.search(r't673|epson.*673', h): return "INK-EPS-673"
        if re.search(r'epson.*003|003.*epson', h): return "INK-EPS-003"
        if re.search(r'gi[\-\s]*71|canon.*71', h): return "INK-CAN-71"
        if re.search(r'ribbon|ruy\s*băng|phim\s*fax', h): return "INK-RIB-80"
        if 'brother' in h: return "INK-BRO-2385"
        if 'canon' in h: return "INK-CAN-12A"
        if 'hp' in h: return "INK-HP-17A"
        return "INK-CAN-12A"
    if re.search(r'trống|drum', h): return "WST-DRUM"
    if re.search(r'trục\s*sấy|trục\s*từ|rulo', h): return "WST-ROLL"
    if re.search(r'chíp\s*mực|chip\s*mực|cò\s*sấy|lá\s*sấy', h): return "WST-CHIP"
    if re.search(r'giấy\s*a4|giấy\s*in|double\s*a|paper\s*one|bãi\s*bằng', h): return "WST-PAPER-A4"
    if re.search(r'\bcpu\b.*i3|core\s*i3.*\d{4,5}', h): return "CPU-INT-I3"
    if re.search(r'\bcpu\b.*i5|core\s*i5.*\d{4,5}', h): return "CPU-INT-I5"
    if re.search(r'\bcpu\b.*i7|core\s*i7.*\d{4,5}', h): return "CPU-INT-I7"
    if re.search(r'ryzen', h): return "CPU-AMD-RY"
    if re.search(r'mainboard|main\s*board', h):
        if re.search(r'h610', h): return "MB-H610"
        if re.search(r'b[67]60', h): return "MB-B760"
        if re.search(r'z[67]90', h): return "MB-Z790"
        return "MB-H610"
    if re.search(r'\bram\b.*ddr5|ddr5', h): return "RAM-D5"
    if re.search(r'\bram\b.*16g|16gb.*ddr4|ddr4.*16|bộ\s*nhớ.*16g', h): return "RAM-16G-D4"
    if re.search(r'\bram\b.*8g|8gb.*ddr4|ddr4.*8|bộ\s*nhớ.*8g|bộ\s*nhớ\s*trong.*8g', h): return "RAM-8G-D4"
    if re.search(r'bộ\s*nhớ\s*trong|bộ\s*nhớ\s*máy|kingston.*\d+g.*d|\bram\b|g[\.\-]?skill', h): return "RAM-8G-D4"
    if re.search(r'rtx\s*40|4060|4070|4080|4090', h): return "VGA-RTX-40"
    if re.search(r'rtx\s*30|3050|3060', h): return "VGA-RTX-30"
    if re.search(r'gtx\s*16|1650|1660', h): return "VGA-GTX-16"
    if re.search(r'ups|bộ\s*lưu\s*điện', h):
        if re.search(r'santak|tg\s*\d', h): return "UPS-SAN-500"
        if re.search(r'apc|maruson', h): return "UPS-APC-PRO"
        return "UPS-SAN-500"
    if re.search(r'ssd|kingmax.*pq|kingmax.*\d+gb|gigabyte.*gp.*\d+g', h):
        if re.search(r'1\s*tb|1000\s*g', h): return "SSD-1T-2T"
        if re.search(r'48[0-9]|500|512', h): return "SSD-480-512"
        return "SSD-128-256"
    if re.search(r'hdd|ổ\s*cứng|ổ\s*đ[ĩi]a\s*cứng|western\s*digital|seagate|wd\d+', h):
        if re.search(r'di\s*động|external|portable', h): return "HDD-EXT"
        if re.search(r'gắn\s*trong|internal|3\.5', h):
            if re.search(r'[2-8]\s*tb', h): return "HDD-2TB-4TB"
            return "HDD-1TB"
        if re.search(r'[2-8]\s*tb', h): return "HDD-2TB-4TB"
        if re.search(r'48[0-9]|500|512', h): return "SSD-480-512"
        if re.search(r'128|256', h): return "SSD-128-256"
        return "HDD-1TB"
    if re.search(r'\busb\b.*flash|\busb\b.*\d+g', h):
        if re.search(r'64|128', h): return "USB-64-128"
        return "USB-32G"
    if re.search(r'thẻ\s*nhớ|microsd|\bsd\s*card', h): return "SD-CARD"
    if re.search(r'vỏ\s*(case|máy)|thùng\s*máy|case\b', h):
        if re.search(r'gaming|led|kính', h): return "CASE-GAM"
        return "CASE-OFF"
    if re.search(r'nguồn\b.*\d+w|\bpsu\b', h):
        if re.search(r'[5-9]\d0w|1000w|bronze|gold', h): return "PSU-GAM"
        return "PSU-OFF"
    if re.search(r'tản\s*nhiệt\s*nước|aio\s*\d{3}', h): return "COOL-AIO"
    if re.search(r'quạt|fan\s*led|tản\s*nhiệt', h): return "COOL-FAN"
    if re.search(r'chuột.*gaming|gaming.*chuột|g102|g502|razer', h): return "MS-GAM"
    if re.search(r'chuột.*logitech|logitech.*b100|m90|m185|m221|m331', h): return "MS-LOGI"
    if re.search(r'chuột.*rapoo|rapoo|mitsumi', h): return "MS-RAPO"
    if re.search(r'chuột', h): return "MS-LOGI"
    if re.search(r'bàn\s*phím.*cơ|mechanical|blue\s*switch|brown\s*switch', h): return "KB-MECH"
    if re.search(r'bàn\s*phím|keyboard|kb\d', h): return "KB-OFF"
    if re.search(r'tai\s*nghe|headset|headphone', h): return "HDSET-OFF"
    if re.search(r'loa\b|speaker|soundmax|microlab', h): return "SPK-2.0"
    if re.search(r'hub\s*usb|bộ\s*chia.*usb|type[\-\s]*c.*hub|bộ\s*chia\s*cổng|cliptec', h): return "HUB-USB"
    if re.search(r'webcam', h): return "CAM-WC"
    if re.search(r'wifi\s*mesh|deco|mesh', h): return "NET-WF-MESH"
    if re.search(r'unifi|aruba|wifi.*chuyên', h): return "NET-WF-PRO"
    if re.search(r'router.*ax|ax\d|archer|băng\s*tần\s*kép|wifi\s*6', h): return "NET-WF-DUAL"
    if re.search(r'router|wifi|tplink|tp[\-\s]*link|tenda', h): return "NET-WF-HOME"
    if re.search(r'switch.*poe|poe.*switch', h): return "NET-SW-POE"
    if re.search(r'switch.*24|switch.*48|switch.*rackmount|cisco.*switch', h): return "NET-SW-RACK"
    if re.search(r'switch\b', h): return "NET-SW-OFF"
    if re.search(r'card\s*mạng|usb\s*wifi|usb\s*thu\s*wifi', h): return "NET-CARD"
    if re.search(r'phát\s*wifi.*4g|4g.*wifi|lte.*wifi', h): return "NET-4G-W"
    if re.search(r'tủ\s*rack|tủ\s*mạng', h): return "NET-CAB-NET"
    if re.search(r'camera.*wifi|wifi.*camera|imou|c6n|ty[12]', h):
        if re.search(r'4mp|4m\b', h): return "CAM-WIFI-4M"
        return "CAM-WIFI-2M"
    if re.search(r'camera.*dome|dome.*camera|ip.*dome', h): return "CAM-IP-DOME"
    if re.search(r'camera.*bullet|bullet.*camera|thân.*camera|ip.*thân', h): return "CAM-IP-BUL"
    if re.search(r'camera|hikvision|dahua', h):
        if re.search(r'dome|trong\s*nhà', h): return "CAM-IP-DOME"
        return "CAM-IP-BUL"
    if re.search(r'đầu\s*ghi.*16|đầu\s*ghi.*32|nvr.*16|nvr.*32', h): return "CAM-DVR-16"
    if re.search(r'đầu\s*ghi.*8|nvr.*8', h): return "CAM-DVR-8C"
    if re.search(r'đầu\s*ghi|dvr|nvr', h): return "CAM-DVR-4C"
    if re.search(r'chân\s*đế.*camera|hộp\s*kỹ\s*thuật', h): return "CAM-ACC-BS"
    if re.search(r'cáp\s*mạng.*cat6|cat6', h): return "CAB-LAN-C6"
    if re.search(r'cáp\s*mạng|cat5|thùng\s*cáp', h): return "CAB-LAN-C5"
    if re.search(r'cáp\s*hdmi.*1[0-9]m|hdmi.*[12][05]m', h): return "CAB-HDMI-15"
    if re.search(r'hdmi', h): return "CAB-HDMI-3"
    if re.search(r'cáp\s*vga|displayport|dp\s*to', h): return "CAB-VGA-DP"
    if re.search(r'hạt\s*mạng|rj45|modplug', h): return "VT-RJ45"
    if re.search(r'rj11|wallplate|nhân\s*mạng', h): return "VT-RJ11"
    if re.search(r'bộ\s*đàm|walkie|kenwood|motorola.*đàm|baofeng', h): return "RADIO-W"
    if re.search(r'điện\s*thoại\s*bàn|ip\s*phone|yealink|panasonic.*phone', h): return "TEL-PHONE"
    if re.search(r'kềm\s*bấm|máy\s*test\s*mạng|dao\s*phập', h): return "VT-TOOLS"
    if re.search(r'cáp\b|dây\s*cáp', h): return "CAB-LAN-C5"
    if re.search(r'ghế|chair', h): return "OFF-CHAIR-ST"
    if re.search(r'bàn\s*làm\s*việc|bàn\s*gỗ|bàn\s*1m', h): return "OFF-DESK-W"
    if re.search(r'tủ\s*sắt|tủ\s*hồ\s*sơ|kệ\s*tài\s*liệu', h): return "OFF-CAB-I"
    if re.search(r'máy\s*chiếu|projector', h): return "OFF-PROJ-P"
    if re.search(r'màn\s*chiếu', h): return "OFF-SCR-P"
    if re.search(r'máy\s*hủy', h): return "OFF-SHRED"
    if re.search(r'ép\s*nhựa|đóng\s*sách|đóng\s*gáy', h): return "OFF-BIND"
    if re.search(r'windows|win\s*1[01]|oem|fpp', h): return "SW-WIN-PRO"
    if re.search(r'office\s*365|office\s*home|microsoft\s*office', h): return "SW-OFF-365"
    if re.search(r'kaspersky|bkv|nod32|diệt\s*virus|antivirus|bkav|phần\s*mềm\s*diệt', h): return "SW-AV-KAS"
    if re.search(r'phí\s*lắp|nhân\s*công|phí\s*cài|lắp\s*đặt', h): return "SRV-INSTALL"
    if re.search(r'bảo\s*trì|sửa\s*chữa|vệ\s*sinh', h): return "SRV-MAINT"
    if re.search(r'phần\s*mềm|software|license|bản\s*quyền', h): return "SW-WIN-PRO"
    if re.search(r'thu\s*ph[ií]|chuy[eể]n\s*ti[eề]n|lãi\s*suất|thu\s*lãi|phí\s*cd|ngoài?\s*h[eệ]', h): return "SKIP"
    if re.search(r'422924|608_\d|thanh\s*toán\s*lãi|phi\s*dich\s*vu', h): return "SKIP"
    if re.search(r'bánh|nước\s*yến|nước\s*ngọt|cá\s*viên|sữa|bia\b|ruou|rượu|thực\s*phẩm|tương\s*đen|phở|gạo|trà\b|cà\s*phê|coffee|đường\s*mía', h): return "SKIP"
    if re.search(r'sannest|nabati|richeese|coca|pepsi|nestle|vinamilk|kinh\s*đô', h): return "SKIP"
    if re.search(r'khăn\s*lụa|khóa\s*lưng|dây\s*lưng|giày\b|áo\b.*burberry|burberry|gucci|nhãn\s*dán', h): return "SKIP"
    if re.search(r'chiết\s*khấu|giảm\s*giá|hỗ\s*trợ\s*thêm|1\s*đổi\s*1|khuyến\s*mãi|hàng\s*khuyến', h): return "SKIP"
    if re.search(r'bảo\s*hiểm|bảo\s*lãnh|hợp\s*đồng\s*vay|tiền\s*gửi|tiền\s*vay', h): return "SKIP"
    if re.search(r'được\s*mua\s*bill|audio\s*giam|giá\s*sốc|tổng\s*cộng.*kg', h): return "SKIP"
    for code, keywords in kw_mapping.items():
        for kw in keywords:
            if len(kw) >= 4 and kw in h:
                return code
    return "OTH-GEN"

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'MM') as thang,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        h.shdon, h.loaihd, h.tthai, h.tgtcthue, h.tgtthue, h.tgtttbso,
        d.id, d.ten, d.sluong, d.dgia, d.thtien, h."idServer"
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
""")
rows = cur.fetchall()

muavao_nhap_tien = 0
unique_invoices = {}

exclusion_2023 = {
    ('2023-02', '129'), ('2023-02', '69'), ('2023-03', '187'), ('2023-03', '221'),
    ('2023-04', '456'), ('2023-04', '420'), ('2023-04', '451'), ('2023-05', '497'),
    ('2023-05', '531'), ('2023-06', '681'), ('2023-06', '627'), ('2023-07', '698'),
    ('2023-07', '758'), ('2023-08', '800'), ('2023-08', '786'), ('2023-08', '808'),
    ('2023-09', '988'), ('2023-09', '1010'), ('2023-09', '964'), ('2023-10', '1119'),
    ('2023-10', '1112'), ('2023-10', '1123'), ('2023-10', '1048'), ('2023-11', '1332'),
    ('2023-11', '1249'), ('2023-11', '1272'), ('2023-12', '1508'), ('2023-12', '1463'),
    ('2023-12', '1538')
}

unique_invs_with_skip = set()
unique_invs_with_nonskip = set()

for row in rows:
    thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso, detail_id, ten, sluong, dgia, thtien, idServer = row
    if yyyy != '2023': continue
    if (yyyymm, shdon) in exclusion_2023: continue

    # What the code currently does to populate unique_invoices (unfiltered)
    if idServer not in unique_invoices:
        unique_invoices[idServer] = {"thang": thang, "yyyy": yyyy, "loaihd": loaihd, "tthai": tthai, "tgtttbso": float(tgtttbso or 0), "tgtcthue": float(tgtcthue or 0)}

    if detail_id is None:
        ten = ten or "Hàng Hóa / Dịch Vụ"
        sluong = 1.0
        thtien = float(tgtcthue or 0)
    else:
        sluong = abs(float(sluong or 0))
        thtien = abs(float(thtien or 0))

    grp_code = map_to_group(ten)
    if grp_code == "SKIP":
        unique_invs_with_skip.add(idServer)
    else:
        unique_invs_with_nonskip.add(idServer)
        
    if grp_code != "SKIP":
        if loaihd == 'muavao':
            muavao_nhap_tien += thtien

sum_all_tgtcthue = sum(v["tgtcthue"] for k, v in unique_invoices.items() if v["loaihd"] == 'muavao')
sum_nonskip_tgtcthue = sum(v["tgtcthue"] for k, v in unique_invoices.items() if v["loaihd"] == 'muavao' and k in unique_invs_with_nonskip)

print(f"XNT nhap tien (sum of item rows): {muavao_nhap_tien:,.0f}")
print(f"Hoadon Mua vao total tgtcthue (all invoices): {sum_all_tgtcthue:,.0f}")
print(f"Hoadon Mua vao total tgtcthue (only invoices with AT LEAST ONE non-SKIP item): {sum_nonskip_tgtcthue:,.0f}")
