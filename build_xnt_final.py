import psycopg2
import pandas as pd
import re
from collections import defaultdict
import os

# --- 1. CONFIG & DB ---
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
HUY_VU_MST = "5900363291"
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def map_item(ten_hang):
    if not ten_hang: return "OTH-GEN"
    h = str(ten_hang).lower()
    
    # --- TIER 1: PC Models ---
    if re.search(r'optiplex|ins.*3910|mt.*3910|3000.*dell', h): return "PC-DELL-OPT"
    if re.search(r'vostro.*3[0-9]{3}|3020\s*st|3910.*vostro', h): return "PC-DELL-VOS"
    if re.search(r'inspir.*3[0-9]{3}|st.*3910.*ins', h): return "PC-DELL-INS"
    if re.search(r'precision|dell.*t[0-9]{4}', h): return "PC-DELL-PRE"
    if re.search(r'v50t|v530|m70t|m720t|thinkcentre', h): return "PC-LEN-V"
    if re.search(r'pavilion.*tp01|hp.*tp01|prodesk|elitedesk', h): return "PC-HP-PAV"
    if re.search(r'msi.*modern|modern.*am242', h): return "PC-MSI-MOD"
    
    # --- TIER 2: Laptop Models ---
    if re.search(r'laptop.*vostro|laptop.*latitude|laptop.*inspiron', h): return "PC-DELL-INS"
    if re.search(r'laptop.*thinkpad|laptop.*ideapad|yoga', h): return "PC-LEN-TP"
    if re.search(r'laptop.*probook|laptop.*elitebook|laptop.*pavilion', h): return "PC-HP-PAV"
    if re.search(r'laptop.*vivobook|laptop.*zenbook|x415|x515', h): return "PC-ASU-X"
    if re.search(r'laptop.*acer|aspire|swift', h): return "PC-ACE-AS"
    if re.search(r'laptop.*msi|modern.*14|modern.*15', h): return "PC-MSI-MOD"
    if re.search(r'laptop|máy\s*tính\s*xách\s*tay', h): return "PC-DELL-INS"

    # --- TIER 3: Custom PC Systems (By CPU) ---
    if re.search(r'i7-|i7\s*[0-9]|7700|8700|9700|10700|11700|12700', h): return "PC-SYS-I7"
    if re.search(r'i5-|i5\s*[0-9]|4570|6500|7500|8400|9400|10400|11400|12400', h): return "PC-SYS-I5"
    if re.search(r'i3-|i3\s*[0-9]|4130|6100|7100|8100|9100|10100|12100', h): return "PC-SYS-I3"
    if re.search(r'g[45][0-9]{3}|celeron|pentium', h): return "PC-SYS-G"
    if re.search(r'r3-|r5-|r7-|ryzen', h): return "PC-SYS-AMD"

    # --- TIER 4: Printers & Scanners ---
    if re.search(r'canon.*2900|canon.*6030|canon.*223|canon.*243|lbp', h): return "PRN-CAN-LBP"
    if re.search(r'canon.*g1010|g2010|g3010|ix6770|ix6870', h): return "PRN-CAN-G"
    if re.search(r'hp.*1102|hp.*107|hp.*135|hp.*404|laserjet', h): return "PRN-HP-LJ"
    if re.search(r'brother.*l2321|l2361|l2366|hl-', h): return "PRN-BRO-HL"
    if re.search(r'brother.*t420|t520|t720|t820|mfc-', h): return "PRN-BRO-MFC"
    if re.search(r'epson.*l3110|l3210|l805|l1800|l1300', h): return "PRN-EPS-L"
    if re.search(r'epson.*lq|plq', h): return "PRN-EPS-LQ"
    if re.search(r'máy\s*scan|hp.*sj|canon.*dr| brother.*ads', h): return "SCN-HP-SJ"
    
    # --- TIER 5: Monitors (By Size) ---
    if re.search(r'lcm.*27|lcd.*27|monitor.*27|u27|p27|e27|27.*inch', h): return "LCD-DELL-27"
    if re.search(r'lcm.*24|lcd.*24|monitor.*24|u24|p24|e24|24.*inch|s24|se24', h): return "LCD-DELL-24"
    if re.search(r'lcm.*2[123]|lcd.*2[123]|monitor.*2[123]|21\.5|22|23', h): return "LCD-DELL-22"
    if re.search(r'lcm.*1[89]|lcd.*1[89]|monitor.*1[89]|18\.5|19|19\.5', h): return "LCD-DELL-19"
    if re.search(r'màn\s*hình|lcd|monitor', h): return "LCD-DELL-24"

    # --- TIER 6: Ink & Consumables ---
    if re.search(r'mực\s*hộp|cartridge|canon.*12a|hp.*12a|hp.*05a|hp.*80a|hp.*26a', h): return "INK-CAN-12A"
    if re.search(r'mực\s*đổ|mực\s*chai|nạp\s*mực|mực\s*nước', h): return "INK-GEN-BOT"
    if re.search(r'rulo|trống|drum|gạt|bao\s*lụa', h): return "VT-PRN-ACC"
    
    # --- TIER 7: Components ---
    if re.search(r'ssd.*12[08]|ssd.*2[45][06]|ssd.*250', h): return "SSD-128-256"
    if re.search(r'ssd.*5[01][02]|ssd.*480|500gb.*ssd', h): return "SSD-500-1TB"
    if re.search(r'ssd', h): return "SSD-128-256"
    if re.search(r'hdd.*1tb|hdd.*2tb|hdd.*4tb|ổ\s*cứng.*1t|ổ\s*cứng.*2t|western|wd.*blue', h): return "HDD-WD-1TB"
    if re.search(r'ram.*4g|4gb.*ram', h): return "RAM-D4-4G"
    if re.search(r'ram.*8g|8gb.*ram', h): return "RAM-D4-8G"
    if re.search(r'ram.*16g|16gb.*ram', h): return "RAM-D4-16G"
    if re.search(r'ram', h): return "RAM-D4-8G"
    if re.search(r'mainboard|h61|h81|h110|h310|h410|h510|h610|b360|b365|b460|b560|b660', h): return "MAIN-H-SER"
    if re.search(r'vga|card.*họa|gtx|rtx|graphics', h): return "VGA-NVI-GTX"
    if re.search(r'nguồn|psu|power\s*supply|acbel|cooler\s*master|corsair', h): return "PSU-GEN-500"
    if re.search(r'case|thùng\s*máy|vỏ\s*máy', h): return "CASE-GEN-OFF"
    
    # --- TIER 8: Peripherals ---
    if re.search(r'chuột.*logi|logitech|m1[78][0-9]|m22[0-9]|m33[0-9]', h): return "MS-LOGI"
    if re.search(r'chuột.*rapoo|rapoo', h): return "MS-RAPO"
    if re.search(r'chuột|mouse', h): return "MS-LOGI"
    if re.search(r'bàn\s*phím.*logi|logitech|k120|k2[0-9]0', h): return "KB-LOGI"
    if re.search(r'bàn\s*phím|keyboard|kb\b', h): return "KB-OFF"
    if re.search(r'loa|sound|creative|microlab', h): return "SPK-GEN-2.0"
    if re.search(r'tai\s*nghe|headphone|headset', h): return "HSET-OFF"
    if re.search(r'ups|bộ\s*lưu\s*điện|santak|apc', h): return "UPS-SAN-500"
    if re.search(r'router|modem|switch|tplink|dlink|totolink|draytek|wifi', h): return "NET-WIFI-AC"
    if re.search(r'usb|thẻ\s*nhớ|micro\s*sd|kingston.*8g|kingston.*16g', h): return "USB-ST-32G"
    
    # --- TIER 9: Camera & Security ---
    if re.search(r'camera.*wifi|imou|c6n|ty[12]', h): return "CAM-WIFI-2M"
    if re.search(r'camera.*dome|ip.*dome', h): return "CAM-IP-DOME"
    if re.search(r'camera.*bullet|body.*camera|ip.*thân', h): return "CAM-IP-BUL"
    if re.search(r'đầu\s*ghi|dvr|nvr', h): return "CAM-DVR-4C"
    
    # --- TIER 10: Software & Services ---
    if re.search(r'windows|office|kaspersky|antivirus|license', h): return "SW-WIN-PRO"
    if re.search(r'lắp\s*đặt|công\s*lắp|phí\s*dịch\s*vụ|sửa\s*chữa', h): return "SRV-INSTALL"
    
    return "OTH-GEN"

# --- 2. FETCH DATA ---
print("Querying database (ext_tonghop)...")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

# Query summary records
cur.execute(f'SELECT nam, thang, "tenHang", "soLuongNhap", "soLuongXuat" FROM ext_tonghop WHERE "congtyMst" = \'{HUY_VU_MST}\'')
raw_data = cur.fetchall()
conn.close()

# --- 3. CALCULATE XNT ---
def create_stat():
    return {"nhap": 0.0, "xuat": 0.0, "ton": 0.0}

# stats[year][month][group]
stats = defaultdict(lambda: defaultdict(lambda: defaultdict(create_stat)))

for y, m, ten, sl_nhap, sl_xuat in raw_data:
    grp = map_item(ten)
    stats[y][m][grp]["nhap"] += float(sl_nhap or 0)
    stats[y][m][grp]["xuat"] += float(sl_xuat or 0)

# Rolling balance
years = sorted(stats.keys())
running_total = defaultdict(float) # {grp: qty}

for y in years:
    for m in range(1, 13):
        for grp in set(stats[y][m].keys()) | set(running_total.keys()):
            s = stats[y][m][grp]
            running_total[grp] += s["nhap"] - s["xuat"]
            s["ton"] = running_total[grp]

# --- 4. GENERATE MD ---
for y in years:
    content = [f"# Báo cáo Xuất Nhập Tồn {y} - Huy Vũ", ""]
    has_data = False
    for m in range(1, 13):
        if not any(v["nhap"] > 0 or v["xuat"] > 0 or v["ton"] > 0 for v in stats[y][m].values()): continue
        has_data = True
        content.append(f"## Tháng {m}/{y}")
        content.append("| Nhóm Sản Phẩm | Nhập SL | Xuất SL | Tồn Cuối |")
        content.append("| :--- | :---: | :---: | :---: |")
        
        # Sort groups by activity + residual stock
        sorted_grps = sorted(stats[y][m].items(), key=lambda x: x[1]["nhap"] + x[1]["xuat"] + abs(x[1]["ton"]), reverse=True)
        for grp, s in sorted_grps:
            # Only show rows with actual stock or activity
            if s["nhap"] == 0 and s["xuat"] == 0 and s["ton"] <= 0: continue
            content.append(f"| {grp} | {s['nhap']:,.0f} | {s['xuat']:,.0f} | {s['ton']:,.0f} |")
        content.append("")
    
    if has_data:
        fname = f"{OUTPUT_DIR}/xnt_{y}.md"
        with open(fname, "w") as f:
            f.write("\n".join(content))
        print(f"Generated: {fname}")

print("Done!")
