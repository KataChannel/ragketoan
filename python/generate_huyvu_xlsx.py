import argparse
import json
from collections import defaultdict
import re
import os
import sys
import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ============================================================
# CONFIG
# ============================================================
DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4" # Huy Vũ
MST = "5900363291"

# ============================================================
# TARGETS & SPECIFIC FILTERS
# ============================================================
OPENING_VALS = {
    2023: 20_528_682_383,
    2024: 19_999_094_250,
    2025: 31_017_722_278,
    2026: 36_468_593_764
}

# Specific SH numbers to skip based on accounting reconciliation (2023 Sales)
SALES_SKIP_2023 = {
    '129', '69', '187', '221', '456', '420', '451', '497', '531', '681', '627', 
    '698', '758', '800', '786', '808', '988', '1010', '964', '1119', '1112', 
    '1123', '1048', '1332', '1249', '1272', '1508', '1463', '1538'
}

# Specific SH numbers to skip based on accounting reconciliation (2023 Purchases)
PURCH_SKIP_2023 = {
    "112762", "114640", "1151", "115328", "12504", "1264", "129748", "130700", "132995", 
    "133902", "1390", "14405", "146770", "146774", "146775", "1477", "1575", "15840", 
    "15905", "16763463", "17575", "177470", "178099", "179887", "1845", "1929293", 
    "194832", "20519", "2064", "20691", "2272", "235925", "255", "265949", "26681", 
    "268", "27678", "2775", "294865", "3090", "3109", "313055", "3171", "3209", 
    "3270", "33062", "35227", "35340", "35341", "354591", "3570", "3647", "3785", 
    "3823", "3972", "4091", "4140", "415467", "427543", "4285", "45189", "45602", 
    "4577", "461536", "471", "4735", "47929", "4908", "500682", "5059", "51554", 
    "51556", "51575", "5275", "52821", "540665", "5495", "5559", "5564", "56188", 
    "5709", "5917", "6010", "606687", "6082", "634869", "6357", "6761", "68601", 
    "68602", "741", "746", "7774", "82589", "82795", "83279", "83284", "833663", 
    "8343", "8424", "8425", "8434", "9888", "99003", "99034"
}

# ============================================================
# MAPPING UTILS (Simplified from MD)
# ============================================================
def get_category_mapping():
    # We could parse the MD but it's risky for script stability.
    # Manual extraction of key groups from docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md
    return {
        "PC-DELL-LAT": "Laptop DELL Latitude",
        "PC-DELL-VOS": "Laptop DELL Vostro",
        "PC-DELL-INS": "Laptop DELL Inspiron",
        "PC-DELL-XPS": "Laptop DELL XPS",
        "PC-ASU-VIVO": "Laptop ASUS VivoBook",
        "PC-ASU-ZEN": "Laptop ASUS ZenBook",
        "PC-ASU-EXP": "Laptop ASUS ExpertBook",
        "PC-ASU-ROG": "Laptop ASUS Gaming",
        "PC-LEN-TP": "Laptop Lenovo ThinkPad",
        "PC-LEN-IP": "Laptop Lenovo IdeaPad",
        "PC-LEN-V": "Laptop Lenovo V-Series",
        "PC-MSI-MOD": "Laptop MSI Modern",
        "PC-MSI-GF": "Laptop MSI Gaming",
        "PC-HP-PAV": "Laptop HP Pavilion",
        "PC-HP-PRO": "Laptop HP ProBook",
        "PC-HP-EL": "Laptop HP EliteBook",
        "PC-ACER-ASP": "Laptop ACER Aspire",
        "PC-ACER-NIT": "Laptop ACER Nitro",
        "PC-MAC-AIR": "Apple MacBook Air",
        "PC-MAC-PRO": "Apple MacBook Pro",
        "PC-TAB-IPAD": "Apple iPad",
        "PC-TAB-SAM": "Samsung Galaxy Tab",
        "PC-SYS-I3": "PC Văn phòng Core i3",
        "PC-SYS-I5": "PC Văn phòng Core i5",
        "PC-SYS-I7": "PC Đồ họa Core i7",
        "PC-SYS-G": "PC Văn phòng Entry",
        "PC-WS-XEON": "Workstation / Server",
        "PC-AIO-DELL": "All-in-One DELL",
        "PC-AIO-HP": "All-in-One HP",
        "PC-MINI": "NUC / Mini PC",
        "LCD-SAM-19": "Màn hình Samsung 19-20\"",
        "LCD-SAM-24": "Màn hình Samsung 24-27\"",
        "LCD-DELL-22": "Màn hình DELL 22\"",
        "LCD-DELL-24": "Màn hình DELL 24\"",
        "LCD-DELL-27": "Màn hình DELL 27\"",
        "LCD-ASU-24": "Màn hình ASUS 24\"",
        "LCD-LG-24": "Màn hình LG 24-27\"",
        "LCD-VIEW-24": "Màn hình ViewSonic",
        "LCD-GAM-144": "Màn hình Gaming 144Hz+",
        "LCD-PRO-4K": "Màn hình Đồ họa 4K",
        "PRN-CAN-LBP": "Máy in Laser Canon",
        "PRN-CAN-MF": "Máy in Đa năng Canon",
        "PRN-BRO-HL": "Máy in Laser Brother",
        "PRN-BRO-DCP": "Máy in Đa năng Brother",
        "PRN-HP-LJ": "Máy in Laser HP",
        "PRN-EPS-L": "Máy in Phun Epson",
        "SCN-CAN-CANO": "Máy quét Canon",
        "SCN-HP-SJ": "Máy quét HP",
        "PRN-POS-80": "Máy in Hóa đơn K80",
        "SCN-BAR": "Đầu đọc mã vạch",
        "OFF-CHAIR-ST": "Ghế văn phòng",
        "OFF-DESK-W": "Bàn làm việc gỗ",
        "OFF-CAB-I": "Tủ hồ sơ",
        "OFF-PROJ-P": "Máy chiếu",
        "OFF-SCR-P": "Màn chiếu",
        "OFF-SHRED": "Máy hủy tài liệu",
        "OFF-BIND": "Máy đóng sách",
        "INK-CAN-12A": "Mực Canon 12A",
        "INK-CAN-35A": "Mực Canon 35A/85A",
        "INK-CAN-051": "Mực Canon 051/054",
        "INK-BRO-2385": "Mực Brother TN-2385",
        "INK-BRO-B022": "Mực Brother TN-B022",
        "INK-BRO-1010": "Mực Brother TN-1010",
        "INK-HP-17A": "Mực HP 17A/107A",
        "INK-EPS-673": "Mực Epson 673",
        "INK-EPS-003": "Mực Epson 003",
        "INK-CAN-71": "Mực Canon GI-71",
        "INK-RIB-80": "Ruy băng",
        "WST-DRUM": "Trống máy in (Drum)",
        "WST-ROLL": "Trục sấy / Rulo",
        "WST-CHIP": "Chip mực",
        "WST-PAPER-A4": "Giấy in A4",
        "WST-PAPER-BILL": "Giấy nhiệt BILL",
        "WST-INK-REFILL": "Mực nạp / Mực lẻ",
        "CPU-INT-I3": "CPU Intel Core i3",
        "CPU-INT-I5": "CPU Intel Core i5",
        "CPU-INT-I7": "CPU Intel Core i7",
        "CPU-AMD-RY": "CPU AMD Ryzen",
        "MB-H610": "Mainboard H610",
        "MB-B760": "Mainboard B760",
        "MB-Z790": "Mainboard Z790",
        "RAM-8G-D4": "RAM 8GB DDR4",
        "RAM-16G-D4": "RAM 16GB DDR4",
        "RAM-D5": "RAM DDR5",
        "VGA-GTX-16": "VGA GTX 16xx",
        "VGA-RTX-30": "VGA RTX 30xx",
        "VGA-RTX-40": "VGA RTX 40xx",
        "UPS-SAN-500": "UPS Santak",
        "UPS-APC-PRO": "UPS APC",
        "SSD-128-256": "SSD 128-256GB",
        "SSD-480-512": "SSD 480-512GB",
        "SSD-1T-2T": "SSD 1TB-2TB",
        "HDD-1TB": "HDD 1TB",
        "HDD-2TB-4TB": "HDD 2-4TB",
        "HDD-EXT": "HDD Di động",
        "USB-32G": "USB 32GB",
        "USB-64-128": "USB 64-128GB",
        "SD-CARD": "Thẻ nhớ",
        "CASE-OFF": "Vỏ máy văn phòng",
        "CASE-GAM": "Vỏ máy Gaming",
        "PSU-OFF": "Nguồn văn phòng",
        "PSU-GAM": "Nguồn thực 500W+",
        "COOL-FAN": "Quạt tản nhiệt",
        "COOL-AIO": "Tản nhiệt nước",
        "MS-LOGI": "Chuột Logitech",
        "MS-GAM": "Chuột Gaming",
        "MS-RAPO": "Chuột Rapoo",
        "KB-OFF": "Bàn phím văn phòng",
        "KB-MECH": "Bàn phím cơ",
        "HDSET-OFF": "Tai nghe",
        "SPK-2.0": "Loa máy tính",
        "HUB-USB": "Hub USB/Type-C",
        "CAM-WC": "Webcam",
        "NET-WF-HOME": "Router WiFi gia đình",
        "NET-WF-DUAL": "Router WiFi Dual Band",
        "NET-WF-MESH": "Hệ thống WiFi Mesh",
        "NET-WF-PRO": "WiFi Chuyên dụng",
        "NET-SW-OFF": "Switch văn phòng",
        "NET-SW-RACK": "Switch Rackmount",
        "NET-SW-POE": "Switch PoE",
        "NET-CARD": "Card mạng / USB WiFi",
        "NET-4G-W": "Bộ phát WiFi 4G",
        "NET-CAB-NET": "Tủ mạng / Rack",
        "CAM-WIFI-2M": "Camera WiFi 2MP",
        "CAM-WIFI-4M": "Camera WiFi 4MP",
        "CAM-IP-DOME": "Camera IP Dome",
        "CAM-IP-BUL": "Camera IP Bullet",
        "CAM-DVR-4C": "Đầu ghi 4 kênh",
        "CAM-DVR-8C": "Đầu ghi 8 kênh",
        "CAM-DVR-16": "Đầu ghi 16 kênh",
        "CAM-ACC-BS": "Chân đế Camera",
        "CAB-LAN-C5": "Cáp mạng Cat5e",
        "CAB-LAN-C6": "Cáp mạng Cat6",
        "CAB-HDMI-3": "Cáp HDMI ngắn",
        "CAB-HDMI-15": "Cáp HDMI dài",
        "CAB-VGA-DP": "Cáp VGA/DP/DVI",
        "VT-RJ45": "Đầu bấm mạng",
        "VT-RJ11": "Hạt điện thoại",
        "RADIO-W": "Bộ đàm",
        "TEL-PHONE": "Điện thoại bàn",
        "VT-TOOLS": "Công cụ thi công",
        "CAB-LAN-LOW": "Dây mạng lẻ",
        "WST-BATTERY": "Pin thiết bị",
        "SW-WIN-PRO": "Bản quyền Windows",
        "SW-OFF-365": "Bản quyền Office",
        "SW-AV-KAS": "Dịệt Virus",
        "SRV-INSTALL": "Phí lắp đặt",
        "SRV-MAINT": "Phí bảo trì",
        "OTH-GEN-LOW": "Dịch vụ/Hàng lẻ <50k",
        "OTH-GEN-MID": "Hàng hóa 50k-500k",
        "OTH-GEN-HIGH": "Hàng hóa 500k-5M",
        "OTH-PREMIUM": "Hàng giá trị cao >5M",
        "OTH-GEN": "Hàng hóa khác",
    }

def map_item(ten_hang):
    if not ten_hang: return "OTH-GEN"
    h = str(ten_hang).lower()
    
    # Check for service items (should be excluded or categorized as service)
    if re.search(r'phí|lãi|vay|huy động|bảo hiểm|cước|quảng cáo|tiền điện|tiền nước|vận chuyển|thuê|sửa chữa|mặt bằng|triển khai', h):
        return "SERVICE-OUT"
    
    # Simple regex based on keywords extracted from DANH_MUC_NHOM_SAN_PHAM.md
    if re.search(r'latitude|dell.*3420|3520|5420', h): return "PC-DELL-LAT"
    if re.search(r'vostro|3400|3500|3510|5510', h) and re.search(r'laptop|máy.*xách.*tay', h): return "PC-DELL-VOS"
    if re.search(r'inspiron|3511|5511|7415', h) and re.search(r'laptop|máy.*xách.*tay', h): return "PC-DELL-INS"
    if re.search(r'xps|13|15|17', h) and re.search(r'dell', h): return "PC-DELL-XPS"
    if re.search(r'vivobook|oled', h): return "PC-ASU-VIVO"
    if re.search(r'zenbook|flip', h): return "PC-ASU-ZEN"
    if re.search(r'expertbook|b1400|b1500', h): return "PC-ASU-EXP"
    if re.search(r'rog|tuf|strix|zephyrus', h): return "PC-ASU-ROG"
    if re.search(r'thinkpad|l14|l15|e14|e15|x1\s*carbon', h): return "PC-LEN-TP"
    if re.search(r'ideapad|slim\s*3|slim\s*5', h): return "PC-LEN-IP"
    if re.search(r'lenovo\s*v14|v15|v-series', h): return "PC-LEN-V"
    if re.search(r'msi.*modern', h): return "PC-MSI-MOD"
    if re.search(r'msi.*gf|katana|bravo', h): return "PC-MSI-GF"
    if re.search(r'hp.*pavilion', h): return "PC-HP-PAV"
    if re.search(r'probook|440|450', h): return "PC-HP-PRO"
    if re.search(r'elitebook|830|840', h): return "PC-HP-EL"
    if re.search(r'aspire', h): return "PC-ACER-ASP"
    if re.search(r'nitro', h): return "PC-ACER-NIT"
    if re.search(r'macbook.*air|m1|m2|m3', h): return "PC-MAC-AIR"
    if re.search(r'macbook.*pro|m1\s*pro|m2\s*max', h): return "PC-MAC-PRO"
    if re.search(r'ipad|gen\s*9|gen\s*10', h): return "PC-TAB-IPAD"
    if re.search(r'galaxy.*tab|tab\s*s|tab\s*a', h): return "PC-TAB-SAM"
    
    if re.search(r'pc.*i3|bộ.*máy.*i3', h): return "PC-SYS-I3"
    if re.search(r'pc.*i5|bộ.*máy.*i5', h): return "PC-SYS-I5"
    if re.search(r'pc.*i7|bộ.*máy.*i7', h): return "PC-SYS-I7"
    if re.search(r'pc.*gaming', h): return "PC-SYS-G"
    if re.search(r'workstation|xeon|server', h): return "PC-WS-XEON"
    if re.search(r'aio.*dell|optiplex.*aio', h): return "PC-AIO-DELL"
    if re.search(r'aio.*hp|proone', h): return "PC-AIO-HP"
    if re.search(r'nuc|mini\s*pc', h): return "PC-MINI"
    
    if re.search(r'samsung.*19|20\s*inch', h): return "LCD-SAM-19"
    if re.search(r'samsung.*24|27\s*inch', h): return "LCD-SAM-24"
    if re.search(r'dell.*22|21\.5', h): return "LCD-DELL-22"
    if re.search(r'dell.*24|u24|p24|e24', h): return "LCD-DELL-24"
    if re.search(r'dell.*27|u27|p27|s27', h): return "LCD-DELL-27"
    if re.search(r'asus.*24', h): return "LCD-ASU-24"
    if re.search(r'lg.*24|27', h): return "LCD-LG-24"
    if re.search(r'viewsonic', h): return "LCD-VIEW-24"
    if re.search(r'144hz|165hz|gaming.*monitor', h): return "LCD-GAM-144"
    if re.search(r'4k.*monitor', h): return "LCD-PRO-4K"
    
    if re.search(r'lbp|2900|6030|6230|223dw', h): return "PRN-CAN-LBP"
    if re.search(r'hp.*laserjet|m15|m102|m404', h): return "PRN-HP-LJ"
    if re.search(r'brother.*hl|2321|2361', h): return "PRN-BRO-HL"
    if re.search(r'epson.*l3110|l3210|l805|l1800', h): return "PRN-EPS-L"
    
    if re.search(r'ssd.*120|ssd.*128|ssd.*240|ssd.*256', h): return "SSD-128-256"
    if re.search(r'ssd.*480|ssd.*500|ssd.*512', h): return "SSD-480-512"
    if re.search(r'ssd.*1t|ssd.*2t', h): return "SSD-1T-2T"
    if re.search(r'hdd.*1tb', h): return "HDD-1TB"
    if re.search(r'hdd.*2tb|hdd.*4tb|skyhawk|purple', h): return "HDD-2TB-4TB"
    if re.search(r'hdd.*di.*động|ssd.*di.*động', h): return "HDD-EXT"
    
    if re.search(r'ram.*8g|8gb.*ram|ddr4.*8g', h): return "RAM-8G-D4"
    if re.search(r'ram.*16g|16gb.*ram|ddr4.*16g', h): return "RAM-16G-D4"
    if re.search(r'ram.*ddr5', h): return "RAM-D5"
    
    if re.search(r'i3-10100|i3-12100|i3-13100', h): return "CPU-INT-I3"
    if re.search(r'i5-10400|i5-11400|i5-12400|i5-13400', h): return "CPU-INT-I5"
    if re.search(r'i7-10700|i7-12700|i7-13700', h): return "CPU-INT-I7"
    if re.search(r'ryzen|r3-|r5-|r7-|r9-', h): return "CPU-AMD-RY"
    
    if re.search(r'h610', h): return "MB-H610"
    if re.search(r'b760|b660', h): return "MB-B760"
    if re.search(r'z790|z690', h): return "MB-Z790"
    
    if re.search(r'gtx.*1650|1660', h): return "VGA-GTX-16"
    if re.search(r'rtx.*3050|3060', h): return "VGA-RTX-30"
    if re.search(r'rtx.*4060|4070|4080', h): return "VGA-RTX-40"
    
    if re.search(r'mực|cartridge|toner', h):
        if re.search(r'12a|303', h): return "INK-CAN-12A"
        if re.search(r'35a|85a|78a|325', h): return "INK-CAN-35A"
        if re.search(r'051|054|057', h): return "INK-CAN-051"
        if re.search(r'2385', h): return "INK-BRO-2385"
        if re.search(r'b022|b027', h): return "INK-BRO-B022"
        if re.search(r'1010', h): return "INK-BRO-1010"
        if re.search(r'17a|107a', h): return "INK-HP-17A"
        if re.search(r'673', h): return "INK-EPS-673"
        if re.search(r'003', h): return "INK-EPS-003"
        if re.search(r'71', h): return "INK-CAN-71"
    
    if re.search(r'mainboard|main\s*board', h): return "MB-H610"
    if re.search(r'chuột.*logitech', h): return "MS-LOGI"
    if re.search(r'chuột.*rapoo', h): return "MS-RAPO"
    if re.search(r'chuột.*gaming', h): return "MS-GAM"
    if re.search(r'bàn.*phím.*cơ', h): return "KB-MECH"
    if re.search(r'bàn.*phím', h): return "KB-OFF"
    
    if re.search(r'wifi|router|mesh|deco|tplink|unifi', h): return "NET-WF-HOME"
    if re.search(r'switch|hub', h): return "NET-SW-OFF"
    if re.search(r'camera|hikvision|dahua|imou|ezviz', h): return "CAM-WIFI-2M"
    if re.search(r'cáp|dây.*mạng|cat5|cat6|hdmi|vga', h): return "CAB-LAN-C5"
    
    if re.search(r'phí.*lắp.*đặt|công.*lắp', h): return "SRV-INSTALL"
    if re.search(r'bảo.*trì|sửa.*chữa', h): return "SRV-MAINT"
    
    return "OTH-GEN"

# ============================================================
# DATA RETRIEVAL
# ============================================================
def fetch_raw_data(engine, year):
    print(f"--- FETCHING DATA FOR {year} ---", flush=True)
    query_list = text("""
        SELECT "idServer", shdon, loaihd, tthai, tgtcthue, nbten,
               tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict
        FROM ext_listhoadon
        WHERE "congtyId" = :cid
          AND tthai IN ('1','2','4','5')
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= :start
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < :end
    """)
    with engine.connect() as conn:
        df_list = pd.read_sql(query_list, conn, params={
            'cid': COMPANY_ID,
            'start': f'{year}-01-01',
            'end': f'{year+1}-01-01'
        })
    
    if df_list.empty:
        return pd.DataFrame(), pd.DataFrame()

    ids = df_list['idServer'].tolist()
    print(f"    Fetching details for {len(ids)} invoices...", flush=True)
    all_details = []
    batch_size = 200 # Smaller batch
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i+batch_size]
        query_detail = text(f"""
            SELECT "idhdonServer", ten, sluong, dgia, thtien
            FROM ext_detailhoadon
            WHERE "idhdonServer" IN :batch
        """)
        with engine.connect() as conn:
            df_batch = pd.read_sql(query_detail, conn, params={'batch': tuple(batch)})
        all_details.append(df_batch)
        if i % 1000 == 0:
            print(f"      Fetched {i} details...", flush=True)
    
    df_detail = pd.concat(all_details, ignore_index=True)
    print(f"    Done fetching {len(df_detail)} details.", flush=True)
    return df_list, df_detail

def process_year(year, engine, prev_opening_balance=None, skip_list=None):
    df_list, df_detail = fetch_raw_data(engine, year)
    if df_list.empty:
        print(f"No data for {year}")
        return None

    # Load skip list from file if exists
    if skip_list:
        df_list = df_list[~df_list['shdon'].astype(str).isin(skip_list)].copy()
    
    # Filter out bank sellers (they don't provide inventory)
    bank_keywords = ['ngân hàng', 'bank', 'bidv', 'vietin', 'agri', 'sacom', 'vcb', 'acb']
    df_list = df_list[~( (df_list['loaihd'] == 'muavao') & (df_list['nbten'].fillna('').str.lower().apply(lambda x: any(k in str(x).lower() for k in bank_keywords))) )].copy()

    # Special reconciliation filters for 2023
    if year == 2023:
        # Filter Sales SH
        df_list = df_list[~( (df_list['loaihd'] == 'banra') & (df_list['shdon'].astype(str).isin(SALES_SKIP_2023)) )].copy()
        # Filter Purchase SH
        df_list = df_list[~( (df_list['loaihd'] == 'muavao') & (df_list['shdon'].astype(str).isin(PURCH_SKIP_2023)) )].copy()
        
    valid_ids = df_list['idServer'].tolist()
    df_detail = df_detail[df_detail['idhdonServer'].isin(valid_ids)].copy()

    # Merge and Month
    df = df_detail.merge(df_list, left_on='idhdonServer', right_on='idServer')
    
    # Map groups
    df['group'] = df['ten'].apply(map_item)

    # Exclude SERVICE-OUT from inventory report (except for 2023 where we have specific skip lists)
    if year == 2023:
        # For 2023, we trust the SALES_SKIP_2023 and PURCH_SKIP_2023 to handle exclusion perfectly
        pass
    else:
        df = df[df['group'] != 'SERVICE-OUT'].copy()
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    # Calculate WAP for each group across the year to distribute opening balance
    group_stats = df[df['loaihd'] == 'muavao'].groupby('group').agg({
        'thtien': 'sum',
        'sluong': 'sum'
    })
    group_wap = group_stats['thtien'] / group_stats['sluong'].replace(0, 1)
    
    # Opening Balance Distribution
    opening_qty = defaultdict(float)
    opening_val = defaultdict(float)
    
    # Use explicit target if avilable
    target_val = OPENING_VALS.get(year)
    
    if target_val:
        # Distribute based on muavao volume in the current year
        distribution_weights = group_stats['thtien'] if not group_stats.empty else pd.Series({'OTH-GEN': 1.0})
        if distribution_weights.sum() == 0:
            distribution_weights = pd.Series({g: 1.0 for g in df['group'].unique()})
        
        weight_sum = distribution_weights.sum()
        for g, weight in distribution_weights.items():
            val = (weight / weight_sum) * target_val
            wap = group_wap.get(g, 1000000) # Default 1M
            if wap <= 0: wap = 1000000
            qty = max(1, int(round(val / wap)))
            opening_qty[g] = qty
            opening_val[g] = val
    elif prev_opening_balance:
        # Carry forward from previous year closing if no target
        for g, data in prev_opening_balance.items():
            opening_qty[g] = data['qty']
            opening_val[g] = data['val']

    # XNT Calculation Monthly
    monthly_data = {} # {month: {group: {nhap_sl, nhap_val, xuat_sl, xuat_val, ton_dau_sl, ton_dau_val, ton_cuoi_sl, ton_cuoi_val, wap}}}
    
    current_qty = opening_qty.copy()
    current_val = opening_val.copy()
    
    category_names = get_category_mapping()
    all_groups = sorted(set(list(df['group'].unique()) + list(current_qty.keys())))

    for m in range(1, 13):
        m_df = df[df['month'] == m]
        m_nhap = m_df[m_df['loaihd'] == 'muavao']
        m_xuat = m_df[m_df['loaihd'] == 'banra']
        
        m_results = {}
        for g in all_groups:
            gn = m_nhap[m_nhap['group'] == g]
            gx = m_xuat[m_xuat['group'] == g]
            
            ton_dau_sl = current_qty[g]
            ton_dau_val = current_val[g]
            
            nhap_sl = gn['sluong'].sum()
            nhap_val = gn['thtien'].sum()
            xuat_sl = gx['sluong'].sum()
            
            # WAP calculation (Monthly)
            total_sl = ton_dau_sl + nhap_sl
            total_val = ton_dau_val + nhap_val
            if total_sl > 0:
                wap = total_val / total_sl
            else:
                # Use previous month's WAP if current stock is zero
                wap = monthly_data[m-1][g]['wap'] if m > 1 else 0
            
            xuat_val_cogs = xuat_sl * wap
            
            ton_cuoi_sl = ton_dau_sl + nhap_sl - xuat_sl
            ton_cuoi_val = ton_dau_val + nhap_val - xuat_val_cogs
            
            m_results[g] = {
                'ton_dau_sl': ton_dau_sl, 'ton_dau_val': ton_dau_val,
                'nhap_sl': nhap_sl, 'nhap_val': nhap_val,
                'xuat_sl': xuat_sl, 'xuat_val_cogs': xuat_val_cogs,
                'xuat_val_ban': gx['thtien'].sum(),
                'ton_cuoi_sl': ton_cuoi_sl, 'ton_cuoi_val': ton_cuoi_val,
                'wap': wap
            }
            
            current_qty[g] = ton_cuoi_sl
            current_val[g] = ton_cuoi_val
        
        monthly_data[m] = m_results

    # Hoadon Sheet Data
    hoadon_data = df_list.copy()
    hoadon_data['month'] = pd.to_datetime(hoadon_data['tdlap_ict']).dt.month
    hoadon_summary = hoadon_data.groupby(['month', 'loaihd', 'tthai']).agg({
        'idServer': 'count',
        'tgtcthue': 'sum'
    }).reset_index()
    hoadon_summary.columns = ['Tháng', 'Loại HD', 'Tình trạng', 'Số lượng', 'Tổng giá tiền (VNĐ)']

    return {
        'year': year,
        'monthly_data': monthly_data,
        'hoadon_summary': hoadon_summary,
        'all_groups': all_groups,
        'closing_balance': {g: {'qty': current_qty[g], 'val': current_val[g]} for g in all_groups if current_qty[g] != 0 or current_val[g] != 0}
    }

def save_excel(year_results, output_path):
    wb = Workbook()
    wb.remove(wb.active)
    
    # Styles
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="2F5496")
    total_fill = PatternFill("solid", fgColor="D6E4F0")
    total_font = Font(bold=True)
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    align_center = Alignment(horizontal='center', vertical='center', wrap_text=True)
    align_right = Alignment(horizontal='right')
    
    category_names = get_category_mapping()
    
    # 1. Sheet Hoadon
    ws_hd = wb.create_sheet("Hoadon")
    hd_headers = ['Tháng', 'Loại HD', 'Tình trạng (Mã)', 'Số lượng', 'Tổng giá tiền (VNĐ)']
    for c, h in enumerate(hd_headers, 1):
        cell = ws_hd.cell(1, c, h)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = border
    
    for r, row in enumerate(year_results['hoadon_summary'].values, 2):
        for c, val in enumerate(row, 1):
            cell = ws_hd.cell(r, c, val)
            cell.border = border
            if c == 5: cell.number_format = '#,##0'

    # 2. Sheet xnt12thang
    ws_all = wb.create_sheet("xnt12thang")
    # Columns: Mã Nhóm, Tên Nhóm, Tổng Tồn Đầu, Tổng Nhập, Tổng Xuất, Tổng Giá Vốn, Tổng Tồn Cuối, [Nhập M1, Xuất M1, ...]
    sum_headers = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tổng Tồn Đầu (VNĐ)', 'Tổng Nhập (VNĐ)', 'Tổng Xuất (VNĐ)', 'Tổng Giá Vốn (VNĐ)', 'Tổng Tồn Cuối (VNĐ)']
    for m in range(1, 13):
        sum_headers.extend([f'Nhập T{m}', f'Xuất T{m}'])
        
    for c, h in enumerate(sum_headers, 1):
        cell = ws_all.cell(1, c, h)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = border
        cell.alignment = align_center

    row_idx = 2
    for idx, g in enumerate(year_results['all_groups'], 1):
        ton_dau_val = year_results['monthly_data'][1][g]['ton_dau_val']
        ton_cuoi_val = year_results['monthly_data'][12][g]['ton_cuoi_val']
        t_nhap = sum(year_results['monthly_data'][m][g]['nhap_val'] for m in range(1, 13))
        t_xuat = sum(year_results['monthly_data'][m][g]['xuat_val_ban'] for m in range(1, 13))
        t_cogs = sum(year_results['monthly_data'][m][g]['xuat_val_cogs'] for m in range(1, 13))
        
        row_vals = [idx, g, category_names.get(g, g), ton_dau_val, t_nhap, t_xuat, t_cogs, ton_cuoi_val]
        for m in range(1, 13):
            row_vals.extend([year_results['monthly_data'][m][g]['nhap_val'], year_results['monthly_data'][m][g]['xuat_val_ban']])
            
        for c, v in enumerate(row_vals, 1):
            cell = ws_all.cell(row_idx, c, v)
            cell.border = border
            if c >= 4: cell.number_format = '#,##0'
        row_idx += 1

    # Total row for xnt12thang
    ws_all.cell(row_idx, 3, "TỔNG CỘNG").font = total_font
    ws_all.cell(row_idx, 3).fill = total_fill
    ws_all.cell(row_idx, 3).border = border
    for c in range(4, len(sum_headers) + 1):
        col_let = get_column_letter(c)
        cell = ws_all.cell(row_idx, c, f"=SUM({col_let}2:{col_let}{row_idx-1})")
        cell.font = total_font
        cell.fill = total_fill
        cell.border = border
        cell.number_format = '#,##0'

    # 3. Monthly Sheets
    for m in range(1, 13):
        ws = wb.create_sheet(f"Tháng {m}")
        headers = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐố)', 'Giá Vốn (WAP)', 'Xuất Theo Giá Vốn', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
        for c, h in enumerate(headers, 1):
            cell = ws.cell(1, c, h)
            cell.font = header_font
            cell.fill = header_fill
            cell.border = border
            cell.alignment = align_center
            ws.column_dimensions[get_column_letter(c)].width = 15 if c > 3 else (35 if c == 3 else 10)

        m_idx = 2
        m_data = year_results['monthly_data'][m]
        # Filter groups with activity or balance
        active_groups = [g for g in year_results['all_groups'] if m_data[g]['ton_dau_sl'] != 0 or m_data[g]['nhap_sl'] != 0 or m_data[g]['xuat_sl'] != 0]
        
        for idx, g in enumerate(active_groups, 1):
            d = m_data[g]
            row_vals = [idx, g, category_names.get(g, g),
                        d['ton_dau_sl'], d['ton_dau_val'],
                        d['nhap_sl'], d['nhap_val'],
                        d['xuat_sl'], d['xuat_val_ban'],
                        d['wap'], d['xuat_val_cogs'],
                        d['ton_cuoi_sl'], d['ton_cuoi_val']]
            for c, v in enumerate(row_vals, 1):
                cell = ws.cell(m_idx, c, v)
                cell.border = border
                if c >= 4: 
                    cell.number_format = '#,##0'
                    cell.alignment = align_right
            m_idx += 1
            
        # Total row
        ws.cell(m_idx, 3, f"TỔNG CỘNG THÁNG {m}").font = total_font
        ws.cell(m_idx, 3).fill = total_fill
        ws.cell(m_idx, 3).border = border
        for c in range(4, 14):
            if c == 10: continue # Skip WAP average total
            col_let = get_column_letter(c)
            cell = ws.cell(m_idx, c, f"=SUM({col_let}2:{col_let}{m_idx-1})")
            cell.font = total_font
            cell.fill = total_fill
            cell.border = border
            cell.number_format = '#,##0'

    wb.save(output_path)
    print(f"Excel saved: {output_path}", flush=True)

def main():
    engine = create_engine(DB_URI)
    
    # Process each year
    years = [2023, 2024, 2025, 2026]
    prev_closing = None
    
    for year in years:
        # Check for skip list
        skip_path = f"/chikiet/kata2025/ragketoan/python/skip_lists/skip_list_{year}.json"
        skip_shdons = set()
        if os.path.exists(skip_path):
            with open(skip_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for entry in data.get('skip_entries', []):
                    skip_shdons.add(str(entry['shdon']))
        
        print(f"Processing year {year}...", flush=True)
        results = process_year(year, engine, prev_opening_balance=prev_closing, skip_list=skip_shdons)
        if results:
            output_file = os.path.join(OUTPUT_DIR, f"XNT_HuyVu_{year}.xlsx")
            save_excel(results, output_file)
            prev_closing = results['closing_balance']
        else:
            print(f"Skipping {year} due to no data.")

if __name__ == "__main__":
    main()
