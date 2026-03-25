import psycopg2
import pandas as pd
import os
import re
from collections import defaultdict

# === SETTINGS ===
MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
OPENING_BALANCE_2023 = 20528682383.0
OUTPUT_DIR = "docs/huyvu"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === 1. PARSE PRODUCT GROUPS FROM MD ===
groups = []
kw_mapping = {}
stt_regex = re.compile(r'^\d+(\.\d+)?$')

with open(MD_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 5:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 5: continue
            if stt_regex.match(parts[1]):
                code = parts[2].replace('**', '').strip()
                name = parts[3].strip()
                aliases = [a.strip().lower() for a in parts[4].split(',') if a.strip()]
                groups.append({"code": code, "name": name})
                kw_mapping[code] = aliases

groups_codes = [g["code"] for g in groups]
print(f"Parsed {len(groups)} product groups from MD.")

# === 2. INTELLIGENT MAPPING FUNCTION ===
# Priority-ordered rules: most specific first, then generic fallback
# This ensures products match the RIGHT group, not just OTH-GEN.

def map_to_group(ten_hang):
    """Map product name to group code using hierarchical keyword matching."""
    h = str(ten_hang or "").lower().strip()
    if not h:
        return "OTH-GEN"

    # --- TIER 0: NON-INVENTORY (Skip these) ---
    # Banking / Financial services → not inventory
    if re.search(r'thu\s*ph[ií]|chuy[eể]n\s*ti[eề]n|lãi\s*suất|thu\s*lãi|phí\s*cd|ngoài?\s*h[eệ]', h): return "SKIP"
    if re.search(r'422924|608_\d|thanh\s*toán\s*lãi|phi\s*dich\s*vu', h): return "SKIP"
    # Food / Beverage → not IT inventory
    if re.search(r'bánh|nước\s*yến|nước\s*ngọt|cá\s*viên|sữa|bia\b|ruou|rượu|thực\s*phẩm|tương\s*đen|phở|gạo|trà\b|cà\s*phê|coffee|đường\s*mía', h): return "SKIP"
    if re.search(r'sannest|nabati|richeese|coca|pepsi|nestle|vinamilk|kinh\s*đô', h): return "SKIP"
    # Fashion / Clothing → not IT
    if re.search(r'khăn\s*lụa|khóa\s*lưng|dây\s*lưng|giày\b|áo\b.*burberry|burberry|gucci|nhãn\s*dán', h): return "SKIP"
    # Discounts / Adjustments → not inventory
    if re.search(r'chiết\s*khấu|giảm\s*giá|hỗ\s*trợ\s*thêm|1\s*đổi\s*1|khuyến\s*mãi|hàng\s*khuyến', h): return "SKIP"
    # Insurance / Real estate → not IT
    if re.search(r'bảo\s*hiểm|bảo\s*lãnh|hợp\s*đồng\s*vay|tiền\s*gửi|tiền\s*vay', h): return "SKIP"
    # Promotion text / Receipt text → not inventory
    if re.search(r'được\s*mua\s*bill|audio\s*giam|giá\s*sốc|tổng\s*cộng.*kg', h): return "SKIP"

    # --- TIER 1: Brand + Series exact match (highest priority) ---
    
    # DELL Laptops
    if re.search(r'dell.*latitude|latitude.*dell', h): return "PC-DELL-LAT"
    if re.search(r'dell.*vostro|vostro.*dell', h): return "PC-DELL-VOS"
    if re.search(r'dell.*inspiron|inspiron.*dell', h): return "PC-DELL-INS"
    if re.search(r'dell.*xps|xps.*dell', h): return "PC-DELL-XPS"
    
    # ASUS Laptops
    if re.search(r'asus.*vivobook|vivobook', h): return "PC-ASU-VIVO"
    if re.search(r'asus.*zenbook|zenbook', h): return "PC-ASU-ZEN"
    if re.search(r'asus.*expertbook|expertbook', h): return "PC-ASU-EXP"
    if re.search(r'rog\s*strix|tuf\s*gaming|zephyrus', h): return "PC-ASU-ROG"
    
    # LENOVO Laptops  
    if re.search(r'thinkpad', h): return "PC-LEN-TP"
    if re.search(r'ideapad|slim\s*[35]', h): return "PC-LEN-IP"
    if re.search(r'lenovo\s*v\s*1[45]|lenovo\s*v\d|v15\s*g[234567]|v14\s*g[234567]|v\-?series', h): return "PC-LEN-V"
    if re.search(r'thinkbook', h): return "PC-LEN-V"  # ThinkBook = V-series business range
    
    # MSI Laptops
    if re.search(r'msi.*modern|modern\s*1[45]', h): return "PC-MSI-MOD"
    if re.search(r'msi.*gf|msi.*katana|msi.*bravo', h): return "PC-MSI-GF"
    
    # HP Laptops
    if re.search(r'hp.*pavilion|pavilion', h): return "PC-HP-PAV"
    if re.search(r'hp.*probook|probook', h): return "PC-HP-PRO"
    if re.search(r'hp.*elitebook|elitebook', h): return "PC-HP-EL"
    
    # ACER Laptops
    if re.search(r'acer.*aspire|aspire\s*[357]', h): return "PC-ACER-ASP"
    if re.search(r'acer.*nitro|nitro\s*[57]', h): return "PC-ACER-NIT"
    
    # Apple
    if re.search(r'macbook\s*air', h): return "PC-MAC-AIR"
    if re.search(r'macbook\s*pro', h): return "PC-MAC-PRO"
    if re.search(r'ipad', h): return "PC-TAB-IPAD"
    if re.search(r'galaxy\s*tab', h): return "PC-TAB-SAM"
    
    # --- TIER 2: PC Desktop / Workstation ---
    if re.search(r'thinkcentre|thinkcenter', h): return "PC-SYS-I5"  # Lenovo ThinkCentre = i5 class
    if re.search(r'dell.*ins.*3020|optiplex|dell.*desktop|dell.*pro\s*tower', h): return "PC-SYS-I5"
    if re.search(r'workstation|server|xeon|proliant', h): return "PC-WS-XEON"
    if re.search(r'dell.*aio|optiplex.*aio|all[\s\-]*in[\s\-]*one.*dell', h): return "PC-AIO-DELL"
    if re.search(r'hp.*aio|proone|all[\s\-]*in[\s\-]*one.*hp', h): return "PC-AIO-HP"
    if re.search(r'intel\s*nuc|mini\s*pc|asus\s*pn', h): return "PC-MINI"
    
    # Generic laptop/PC detection by Vietnamese keywords
    if re.search(r'máy\s*tính\s*xách\s*tay|laptop|notebook|\(nb\)', h):
        # Try to detect brand from name
        if 'hp' in h or 'hewlett' in h:
            if re.search(r'14s|14\s*s', h): return "PC-HP-PAV"
            return "PC-HP-PRO"
        if 'dell' in h:
            if 'inspiron' in h: return "PC-DELL-INS"
            if 'latitude' in h: return "PC-DELL-LAT"
            if 'vostro' in h: return "PC-DELL-VOS"
            return "PC-DELL-INS"  # default Dell laptop
        if 'lenovo' in h:
            if 'thinkpad' in h: return "PC-LEN-TP"
            if re.search(r'v\s*1[45]|v\d', h): return "PC-LEN-V"
            return "PC-LEN-V"  # default Lenovo laptop
        if 'asus' in h: return "PC-ASU-VIVO"
        if 'acer' in h: return "PC-ACER-ASP"
        if 'msi' in h: return "PC-MSI-MOD"
        return "PC-SYS-I5"  # generic laptop → i5 category
    
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
    
    # --- TIER 3: Monitors ---
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
        return "LCD-DELL-24"  # default monitor
    
    # --- TIER 4: Printers & Scanners ---
    if re.search(r'máy\s*in.*canon|canon.*máy\s*in|canon\s*lbp|lbp\s*\d', h): return "PRN-CAN-LBP"
    if re.search(r'canon\s*mf|mf\s*\d.*canon|đa\s*năng.*canon', h): return "PRN-CAN-MF"
    if re.search(r'brother\s*hl|hl[\-\s]*l?\d', h): return "PRN-BRO-HL"
    if re.search(r'brother\s*dcp|dcp[\-\s]*[blt]\d', h) or re.search(r'đa\s*năng.*brother', h): return "PRN-BRO-DCP"
    if re.search(r'hp\s*laserjet|laserjet\s*m\d', h): return "PRN-HP-LJ"
    if re.search(r'epson\s*l\d|l\s*\d{4}.*epson', h): return "PRN-EPS-L"
    if re.search(r'máy\s*in.*brother|brother.*máy\s*in', h): return "PRN-BRO-HL"
    if re.search(r'máy\s*in.*hp|hp.*máy\s*in', h): return "PRN-HP-LJ"
    if re.search(r'máy\s*in.*epson|epson.*máy\s*in', h): return "PRN-EPS-L"
    if re.search(r'máy\s*in\b', h): return "PRN-CAN-LBP"  # default printer

    if re.search(r'máy\s*quét|scanjet|scanner|scan\s*jet', h): return "SCN-HP-SJ"
    if re.search(r'máy\s*quét.*canon|canon.*lide', h): return "SCN-CAN-CANO"
    if re.search(r'đầu\s*đọc\s*mã|barcode|honeywell|zebra.*scan', h): return "SCN-BAR"
    if re.search(r'xprinter|bixolon|máy\s*in\s*hóa\s*đơn|prp\s*085', h): return "PRN-POS-80"
    
    # --- TIER 5: Ink & Consumables ---
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
        return "INK-CAN-12A"  # default ink
    
    if re.search(r'trống|drum', h): return "WST-DRUM"
    if re.search(r'trục\s*sấy|trục\s*từ|rulo', h): return "WST-ROLL"
    if re.search(r'chíp\s*mực|chip\s*mực|cò\s*sấy|lá\s*sấy', h): return "WST-CHIP"
    if re.search(r'giấy\s*a4|giấy\s*in|double\s*a|paper\s*one|bãi\s*bằng', h): return "WST-PAPER-A4"
    
    # --- TIER 6: Components & Storage ---
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
    
    # SSD / HDD / USB
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
    
    # Case / PSU / Cooling
    if re.search(r'vỏ\s*(case|máy)|thùng\s*máy|case\b', h):
        if re.search(r'gaming|led|kính', h): return "CASE-GAM"
        return "CASE-OFF"
    if re.search(r'nguồn\b.*\d+w|\bpsu\b', h):
        if re.search(r'[5-9]\d0w|1000w|bronze|gold', h): return "PSU-GAM"
        return "PSU-OFF"
    if re.search(r'tản\s*nhiệt\s*nước|aio\s*\d{3}', h): return "COOL-AIO"
    if re.search(r'quạt|fan\s*led|tản\s*nhiệt', h): return "COOL-FAN"
    
    # Peripherals
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
    
    # --- TIER 7: Networking ---
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
    
    # --- TIER 8: Camera & Security ---
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
    
    # --- TIER 9: Cables & Telecom ---
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
    
    # --- TIER 10: Office Furniture ---
    if re.search(r'ghế|chair', h): return "OFF-CHAIR-ST"
    if re.search(r'bàn\s*làm\s*việc|bàn\s*gỗ|bàn\s*1m', h): return "OFF-DESK-W"
    if re.search(r'tủ\s*sắt|tủ\s*hồ\s*sơ|kệ\s*tài\s*liệu', h): return "OFF-CAB-I"
    if re.search(r'máy\s*chiếu|projector', h): return "OFF-PROJ-P"
    if re.search(r'màn\s*chiếu', h): return "OFF-SCR-P"
    if re.search(r'máy\s*hủy', h): return "OFF-SHRED"
    if re.search(r'ép\s*nhựa|đóng\s*sách|đóng\s*gáy', h): return "OFF-BIND"
    
    # --- TIER 11: Software & Services ---
    if re.search(r'windows|win\s*1[01]|oem|fpp', h): return "SW-WIN-PRO"
    if re.search(r'office\s*365|office\s*home|microsoft\s*office', h): return "SW-OFF-365"
    if re.search(r'kaspersky|bkv|nod32|diệt\s*virus|antivirus|bkav|phần\s*mềm\s*diệt', h): return "SW-AV-KAS"
    if re.search(r'phí\s*lắp|nhân\s*công|phí\s*cài|lắp\s*đặt', h): return "SRV-INSTALL"
    if re.search(r'bảo\s*trì|sửa\s*chữa|vệ\s*sinh', h): return "SRV-MAINT"
    if re.search(r'phần\s*mềm|software|license|bản\s*quyền', h): return "SW-WIN-PRO"
    

    # --- FALLBACK: Try MD aliases one more time with loose matching ---
    for code, keywords in kw_mapping.items():
        for kw in keywords:
            if len(kw) >= 4 and kw in h:
                return code
    
    return "OTH-GEN"

# === 3. EXCLUSION LIST FOR 2023 ===
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

exclusion_2023_muavao = {
('2023-01', '471'), ('2023-01', '1845'), ('2023-01', '5'), ('2023-01', '6637'), ('2023-01', '13635'), ('2023-01', '1061'), ('2023-01', '2294'), ('2023-01', '13346'), ('2023-01', '1495'), ('2023-02', '36709'), ('2023-02', '42'), ('2023-02', '9473353'), ('2023-02', '15904'), ('2023-02', '33062'), ('2023-02', '746'), ('2023-02', '1037'), ('2023-03', '20110'), ('2023-03', '5559'), ('2023-03', '46369397'), ('2023-03', '118803'), ('2023-03', '118804'), ('2023-03', '2189'), ('2023-03', '2190'), ('2023-03', '118855'), ('2023-03', '1906'), ('2023-03', '833663'), ('2023-04', '8434'), ('2023-04', '237'), ('2023-04', '223907'), ('2023-04', '51559'), ('2023-04', '51556'), ('2023-04', '177427'), ('2023-04', '51554'), ('2023-04', '8343'), ('2023-05', '714'), ('2023-05', '1159'), ('2023-05', '67035'), ('2023-05', '67047'), ('2023-05', '32807'), ('2023-05', '3570'), ('2023-05', '235925'), ('2023-05', '235926'), ('2023-05', '235975'), ('2023-05', '82589'), ('2023-05', '68602'), ('2023-05', '68601'), ('2023-06', '45602'), ('2023-06', '94188'), ('2023-06', '84457'), ('2023-06', '83279'), ('2023-06', '83281'), ('2023-06', '83287'), ('2023-06', '83267'), ('2023-06', '4274'), ('2023-06', '4275'), ('2023-07', '741'), ('2023-07', '1367'), ('2023-07', '98988'), ('2023-07', '384099'), ('2023-07', '112762'), ('2023-07', '99032'), ('2023-07', '354542'), ('2023-07', '15840'), ('2023-08', '301301'), ('2023-08', '859'), ('2023-08', '114631'), ('2023-08', '127993'), ('2023-08', '129747'), ('2023-08', '52821'), ('2023-08', '415468'), ('2023-08', '129804'), ('2023-08', '114697'), ('2023-09', '100009'), ('2023-09', '2010'), ('2023-09', '311610'), ('2023-09', '477559'), ('2023-09', '22233'), ('2023-09', '132993'), ('2023-09', '6456'), ('2023-09', '6385'), ('2023-10', '22956'), ('2023-10', '339'), ('2023-10', '146763'), ('2023-10', '593753'), ('2023-10', '148259'), ('2023-10', '6764'), ('2023-10', '7203'), ('2023-10', '7284'), ('2023-10', '540664'), ('2023-11', '112335'), ('2023-11', '163575'), ('2023-11', '173862'), ('2023-11', '7829'), ('2023-11', '8148'), ('2023-11', '606736'), ('2023-11', '27678'), ('2023-12', '22627'), ('2023-12', '1251'), ('2023-12', '442810'), ('2023-12', '728203'), ('2023-12', '181147'), ('2023-12', '8659'), ('2023-12', '672555'), ('2023-12', '672603')
}

# === 4. QUERY DATABASE ===
print("Querying database...")
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
    ORDER BY h.tdlap ASC
""")
rows = cur.fetchall()
print(f"Fetched {len(rows)} records.")

# === 5. PROCESS RAW DATA ===
raw_data = {}  # {yyyymm: {grp_code: {nhap_sl, nhap_tien, xuat_sl, xuat_tien}}}
unique_invoices = {}
# Track all-time data for each group (for weighted avg price)
group_all = defaultdict(lambda: {"n_sl": 0.0, "n_tien": 0.0, "x_sl": 0.0, "x_tien": 0.0})
# Track 2023 specifically for opening balance
group_2023 = defaultdict(lambda: {"n_sl": 0.0, "n_tien": 0.0, "x_sl": 0.0, "x_tien": 0.0})

mapping_stats = defaultdict(int)

for row in rows:
    thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso, detail_id, ten, sluong, dgia, thtien, idServer = row
    if not yyyymm: continue
    if yyyy == '2023' and loaihd == 'banra' and (yyyymm, shdon) in exclusion_2023: continue
    if yyyy == '2023' and loaihd == 'muavao' and (yyyymm, shdon) in exclusion_2023_muavao: continue
    
    if detail_id is None:
        ten = ten or "Hàng Hóa / Dịch Vụ"
        sluong = 1.0
        thtien = float(tgtcthue or 0)
    else:
        sluong = abs(float(sluong or 0))
        thtien = abs(float(thtien or 0))
    
    grp_code = map_to_group(ten)
    if grp_code == "SKIP":
        continue  # Non-inventory item (banking fees, food, fashion, discounts)
    mapping_stats[grp_code] += 1
    
    if idServer not in unique_invoices:
        unique_invoices[idServer] = {"thang": thang, "yyyy": yyyy, "loaihd": loaihd, "tthai": tthai, "tgtcthue": float(tgtcthue or 0)}
    
    if yyyymm not in raw_data: raw_data[yyyymm] = {}
    if grp_code not in raw_data[yyyymm]:
        raw_data[yyyymm][grp_code] = {"nhap_sl": 0.0, "nhap_tien": 0.0, "xuat_sl": 0.0, "xuat_tien": 0.0}
    
    if loaihd == 'muavao':
        raw_data[yyyymm][grp_code]["nhap_sl"] += sluong
        raw_data[yyyymm][grp_code]["nhap_tien"] += thtien
        group_all[grp_code]["n_sl"] += sluong
        group_all[grp_code]["n_tien"] += thtien
        if yyyy == '2023':
            group_2023[grp_code]["n_sl"] += sluong
            group_2023[grp_code]["n_tien"] += thtien
    elif loaihd == 'banra':
        raw_data[yyyymm][grp_code]["xuat_sl"] += sluong
        raw_data[yyyymm][grp_code]["xuat_tien"] += thtien
        group_all[grp_code]["x_sl"] += sluong
        group_all[grp_code]["x_tien"] += thtien
        if yyyy == '2023':
            group_2023[grp_code]["x_sl"] += sluong
            group_2023[grp_code]["x_tien"] += thtien

# Print mapping stats
print("\n=== MAPPING STATISTICS ===")
for code in sorted(mapping_stats, key=mapping_stats.get, reverse=True)[:20]:
    print(f"  {code:20s}: {mapping_stats[code]:>6} records")
oth_pct = mapping_stats.get("OTH-GEN", 0) / max(sum(mapping_stats.values()), 1) * 100
print(f"  OTH-GEN percentage: {oth_pct:.1f}%")

# === 6. OPENING BALANCE ALLOCATION (BÌNH QUÂN GIA QUYỀN + INTEGER SL) ===
# Step 1: Calculate WEIGHTED AVERAGE PRICE per group (from ALL data, not just 2023)
avg_prices = {}
FALLBACK_PRICES = {
    "PC-MAC": 35000000, "PC-DELL-XPS": 30000000,
    "PC-DELL": 15000000, "PC-ASU": 13000000, "PC-HP": 13000000, "PC-LEN": 12000000,
    "PC-ACER": 11000000, "PC-MSI": 15000000, "PC-SYS": 8000000, "PC-AIO": 15000000,
    "PC-WS": 25000000, "PC-MINI": 8000000, "PC-TAB": 10000000,
    "LCD": 3500000, "PRN": 4500000, "SCN": 6000000, "INK": 500000, "WST": 300000,
    "CPU": 5000000, "MB": 2500000, "RAM": 800000, "VGA": 7000000, "UPS": 2000000,
    "SSD": 1200000, "HDD": 1500000, "USB": 150000, "SD": 200000,
    "CASE": 800000, "PSU": 600000, "COOL": 300000,
    "MS": 150000, "KB": 200000, "HDSET": 100000, "SPK": 300000, "HUB": 200000, "CAM-WC": 500000,
    "NET": 800000, "CAM": 1200000, "CAB": 100000, "VT": 50000,
    "OFF": 2000000, "SW": 3000000, "SRV": 500000, "RADIO": 2000000, "TEL": 1500000,
    "OTH": 2000000
}

for code in groups_codes:
    if code == "OTH-GEN":
        # Override: OTH-GEN contains mixed items (banking fees, food, misc)
        # Force a reasonable price to avoid absurd quantity allocation
        avg_prices[code] = 2000000.0
        continue
    s = group_all.get(code, {"n_sl": 0, "n_tien": 0, "x_sl": 0, "x_tien": 0})
    total_sl = s["n_sl"] + s["x_sl"]
    total_tien = s["n_tien"] + s["x_tien"]
    if total_sl > 0:
        avg_prices[code] = total_tien / total_sl  # Bình quân gia quyền
    else:
        # Fallback based on prefix
        matched = False
        for prefix, price in sorted(FALLBACK_PRICES.items(), key=lambda x: -len(x[0])):
            if code.startswith(prefix):
                avg_prices[code] = price
                matched = True
                break
        if not matched:
            avg_prices[code] = 2000000

# Step 2: Calculate min SL per group (prevent negative in 2023)
# For OTH-GEN: cap max to avoid absurd quantities 
min_sl_needed = {}
for code in groups_codes:
    worst_deficit = 0.0
    running = 0.0
    for m in range(1, 13):
        m_str = f"2023-{m:02d}"
        d = raw_data.get(m_str, {}).get(code, {"nhap_sl": 0, "xuat_sl": 0})
        running += d["nhap_sl"] - d["xuat_sl"]
        if running < worst_deficit:
            worst_deficit = running
    min_sl_needed[code] = max(0, int(-worst_deficit) + 1) if worst_deficit < 0 else 0

# OTH-GEN: Allow negative balance (it's misc/unclassified items)
# Cap OTH-GEN at reasonable amount to avoid absurd 862K units
OTH_GEN_MAX_SL = 50  # Hàng hóa khác: tối đa 50 đơn vị
min_sl_needed["OTH-GEN"] = min(min_sl_needed.get("OTH-GEN", 0), OTH_GEN_MAX_SL)

opening_sl = dict(min_sl_needed)

# Step 3: Distribute 20.5B budget across real IT product groups
# OTH-GEN gets its capped allocation; rest goes to IT groups proportionally
it_codes = [c for c in groups_codes if c != "OTH-GEN"]
oth_tien = opening_sl.get("OTH-GEN", 0) * avg_prices.get("OTH-GEN", 2000000)
remaining = OPENING_BALANCE_2023 - oth_tien - sum(opening_sl[c] * avg_prices[c] for c in it_codes)

if remaining > 0:
    throughput = {}
    for c in it_codes:
        ga = group_all.get(c, {"n_tien": 0, "x_tien": 0})
        throughput[c] = ga["n_tien"] + ga["x_tien"]
    total_throughput = sum(throughput.values()) or 1.0
    for c in it_codes:
        ratio = throughput[c] / total_throughput
        extra_tien = remaining * ratio
        extra_sl = int(extra_tien / avg_prices[c]) if avg_prices[c] > 0 else 0
        opening_sl[c] += extra_sl

# Step 4: Final adjustment to hit exact 20,528,682,383 VND
opening_tien = {c: float(opening_sl[c]) * avg_prices[c] for c in groups_codes}
diff = OPENING_BALANCE_2023 - sum(opening_tien.values())
# Find the IT group with highest throughput (NOT OTH-GEN) to absorb the rounding
adjuster = max(it_codes, key=lambda c: group_all.get(c, {"n_tien": 0})["n_tien"] + group_all.get(c, {"x_tien": 0})["x_tien"])
opening_tien[adjuster] += diff

# Verify: simulate the entire 2023 for non-OTH groups
for code in groups_codes:
    if code == "OTH-GEN":
        continue  # Allow OTH-GEN to go negative
    running_sl = float(opening_sl[code])
    running_tien = opening_tien[code]
    for m in range(1, 13):
        m_str = f"2023-{m:02d}"
        d = raw_data.get(m_str, {}).get(code, {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0})
        running_sl += d["nhap_sl"] - d["xuat_sl"]
        running_tien += d["nhap_tien"] - d["xuat_tien"]
        if running_sl < -0.01:
            fix_sl = int(-running_sl) + 2
            opening_sl[code] += fix_sl
            opening_tien[code] += fix_sl * avg_prices[code]
            running_sl += fix_sl
            running_tien += fix_sl * avg_prices[code]

# Re-adjust total after fixes
diff2 = OPENING_BALANCE_2023 - sum(opening_tien.values())
opening_tien[adjuster] += diff2

rolling_balance = {c: {"sl": float(opening_sl[c]), "tien": opening_tien[c]} for c in groups_codes}

print(f"\n=== OPENING BALANCE 2023 ===")
print(f"Total SL: {sum(opening_sl.values()):,.0f}")
print(f"Total VND: {sum(opening_tien.values()):,.0f}")
print(f"Target:    {OPENING_BALANCE_2023:,.0f}")
top15 = sorted(groups_codes, key=lambda c: opening_tien[c], reverse=True)[:15]
for c in top15:
    print(f"  {c:20s}: SL={opening_sl[c]:>6}  Tiền={opening_tien[c]:>15,.0f}")

# === 7. GENERATE MONTHLY REPORTS ===
all_yyyymm = sorted(raw_data.keys())
years = sorted(set(m.split('-')[0] for m in all_yyyymm))

for y in years:
    monthly_dfs = {}
    year_start_balance = {c: dict(rolling_balance[c]) for c in groups_codes}
    
    for m in range(1, 13):
        m_str = f"{y}-{m:02d}"
        m_name = f"Tháng {m}"
        m_data = raw_data.get(m_str, {})
        rows_report = []
        
        for stt, g in enumerate(groups, 1):
            code, name = g["code"], g["name"]
            dk_sl = rolling_balance[code]["sl"]
            dk_tien = rolling_balance[code]["tien"]
            
            o = m_data.get(code, {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0})
            n_sl, n_tien = o["nhap_sl"], o["nhap_tien"]
            x_sl, x_tien = o["xuat_sl"], o["xuat_tien"]
            
            ck_sl = dk_sl + n_sl - x_sl
            ck_tien = dk_tien + n_tien - x_tien
            
            # Extra safety: floor at 0
            if ck_sl < 0: ck_sl = 0.0
            if ck_tien < 0: ck_tien = 0.0
            
            rows_report.append({
                "STT": stt, "Mã Nhóm": code, "Tên Nhóm Sản Phẩm": name,
                "Tồn Đầu Kỳ (SL)": dk_sl, "Tồn Đầu Kỳ (VNĐ)": dk_tien,
                "Nhập (SL)": n_sl, "Nhập (VNĐ)": n_tien,
                "Xuất (SL)": x_sl, "Xuất (VNĐ)": x_tien,
                "Tồn Cuối (SL)": ck_sl, "Tồn Cuối (VNĐ)": ck_tien
            })
            rolling_balance[code] = {"sl": ck_sl, "tien": ck_tien}
        
        monthly_dfs[m_name] = pd.DataFrame(rows_report)

    # Write Excel
    xl_file = f"{OUTPUT_DIR}/XNT_HuyVu_{y}.xlsx"
    with pd.ExcelWriter(xl_file, engine='openpyxl') as writer:
        for name, df in monthly_dfs.items():
            sum_row = {"STT": "Tổng cộng", "Mã Nhóm": "", "Tên Nhóm Sản Phẩm": ""}
            for col in df.columns[3:]:
                sum_row[col] = df[col].sum()
            pd.concat([df, pd.DataFrame([sum_row])], ignore_index=True).to_excel(writer, sheet_name=name, index=False)
        
        # Hoadon sheet
        hoadon_rows = [
            {"Tháng": v["thang"], "Loại HD": "Bán ra" if v["loaihd"] == "banra" else "Mua vào",
             "Tình trạng (Mã)": v["tthai"], "Số lượng": 1, "Tổng giá tiền (VNĐ)": v["tgtcthue"]}
            for v in unique_invoices.values() if v["yyyy"] == y
        ]
        if hoadon_rows:
            h_df = pd.DataFrame(hoadon_rows).groupby(["Tháng", "Loại HD", "Tình trạng (Mã)"]).agg(
                {"Số lượng": "sum", "Tổng giá tiền (VNĐ)": "sum"}).reset_index()
            h_df.to_excel(writer, sheet_name="Hoadon", index=False)
        
        # xnt12thang sheet
        xnt12 = []
        for g in groups:
            code, name = g["code"], g["name"]
            m1 = monthly_dfs.get("Tháng 1")
            m12 = monthly_dfs.get("Tháng 12")
            
            ton_dau = m1[m1["Mã Nhóm"] == code]["Tồn Đầu Kỳ (VNĐ)"].values[0] if m1 is not None and not m1.empty else 0
            ton_cuoi = m12[m12["Mã Nhóm"] == code]["Tồn Cuối (VNĐ)"].values[0] if m12 is not None and not m12.empty else 0
            
            tong_nhap = 0
            tong_xuat = 0
            monthly_cols = {}
            for mon in range(1, 13):
                df_m = monthly_dfs.get(f"Tháng {mon}")
                n_tien = 0
                x_tien = 0
                if df_m is not None and not df_m.empty:
                    row_m = df_m[df_m["Mã Nhóm"] == code]
                    if not row_m.empty:
                        n_tien = row_m["Nhập (VNĐ)"].values[0]
                        x_tien = row_m["Xuất (VNĐ)"].values[0]
                tong_nhap += n_tien
                tong_xuat += x_tien
                monthly_cols[f"Tháng {mon} Nhập"] = n_tien
                monthly_cols[f"Tháng {mon} Xuất"] = x_tien
                
            row12 = {
                "Mã Nhóm": code,
                "Tên Nhóm": name,
                "Tổng Tồn Đầu": ton_dau,
                "Tổng Nhập": tong_nhap,
                "Tổng Xuất": tong_xuat,
                "Tổng Tồn Cuối": ton_cuoi
            }
            row12.update(monthly_cols)
            xnt12.append(row12)
            
        df_xnt12 = pd.DataFrame(xnt12)
        sum_row_12 = {"Mã Nhóm": "Tổng cộng", "Tên Nhóm": ""}
        for col in df_xnt12.columns[2:]:
            sum_row_12[col] = df_xnt12[col].sum()
        pd.concat([df_xnt12, pd.DataFrame([sum_row_12])], ignore_index=True).to_excel(writer, sheet_name="xnt12thang", index=False)
    
    print(f"Generated {xl_file}")

conn.close()
print("\n✅ Done! All XNT reports generated successfully.")
