"""
build_xnt_correct.py - Tạo báo cáo XNT (Xuất Nhập Tồn) chính xác
Logic đúng:
  1. Query ext_listhoadon + ext_detailhoadon (KHÔNG dùng ext_tonghop)
  2. Timezone: UTC → ICT (Asia/Ho_Chi_Minh) 
  3. Lọc status: tthai IN ('1','2','4','5'), loại bỏ tthai='6'
  4. Loại bỏ HĐ dịch vụ/bank/bảo hiểm (không phải vật tư hàng hóa)
  5. Sử dụng tgtcthue (trước thuế) cho giá trị
  6. Mapping sản phẩm theo DANH_MUC_NHOM_SAN_PHAM.md

Usage:
  python3 build_xnt_correct.py --year 2023 --company 5900363291
  python3 build_xnt_correct.py --year 2024
"""
import argparse
import re
import os
import sys
import warnings
from collections import defaultdict
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

warnings.filterwarnings('ignore')

# ============================================================
# CONFIG
# ============================================================
DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"
COMPANY_MAP = {
    "5900363291": "db88c924-206b-4544-9256-c1cd79d417e4",  # Huy Vũ
}
DEFAULT_MST = "5900363291"

# Trạng thái HĐ hợp lệ cho kế toán
VALID_STATUS = ('1', '2', '4', '5')
# Trạng thái loại bỏ: '6' = hủy/thay thế

# ============================================================
# BỘ LỌC HĐ DỊCH VỤ (Không phải vật tư hàng hóa)
# ============================================================
SERVICE_KEYWORDS = [
    r'phí\s*(ngân|nh|bank)', r'phí\s*chuyển', r'phí\s*duy\s*trì',
    r'phí\s*sms', r'phí\s*dịch\s*vụ', r'phí\s*bảo\s*trì',
    r'bảo\s*hiểm', r'phí\s*bh\b',
    r'vận\s*chuyển', r'ship', r'giao\s*hàng',
    r'tiền\s*thuê', r'thuê\s*mặt\s*bằng', r'thuê\s*văn\s*phòng',
    r'tiền\s*điện', r'tiền\s*nước', r'tiền\s*internet',
    r'cơm\b', r'suất\s*ăn', r'nước\s*uống', r'trà\b.*đá', r'cà\s*phê',
    r'quảng\s*cáo', r'marketing',
    r'đào\s*tạo', r'tập\s*huấn',
    r'tư\s*vấn', r'pháp\s*lý',
    r'công\s*chứng', r'lệ\s*phí',
    r'xăng\s*dầu', r'xăng\b', r'dầu\s*diesel',
]
SERVICE_PATTERN = re.compile('|'.join(SERVICE_KEYWORDS), re.IGNORECASE)

def is_service_item(product_name):
    """Kiểm tra xem sản phẩm có phải dịch vụ/không phải hàng hóa"""
    if not product_name:
        return False
    return bool(SERVICE_PATTERN.search(str(product_name)))


# ============================================================
# MAPPING SẢN PHẨM → NHÓM
# ============================================================
def map_item(ten_hang):
    """Map tên sản phẩm → mã nhóm theo DANH_MỤC_NHOM_SAN_PHAM"""
    if not ten_hang:
        return "OTH-GEN"
    h = str(ten_hang).lower()

    # --- Laptop ---
    if re.search(r'latitude|dell.*lat', h): return "PC-DELL-LAT"
    if re.search(r'vostro', h) and re.search(r'laptop|xách\s*tay', h): return "PC-DELL-VOS"
    if re.search(r'inspiron|dell.*ins', h) and re.search(r'laptop|xách\s*tay', h): return "PC-DELL-INS"
    if re.search(r'xps', h): return "PC-DELL-XPS"
    if re.search(r'vivobook', h): return "PC-ASU-VIVO"
    if re.search(r'zenbook', h): return "PC-ASU-ZEN"
    if re.search(r'expertbook', h): return "PC-ASU-EXP"
    if re.search(r'rog\s*strix|tuf\s*gaming|zephyrus', h): return "PC-ASU-ROG"
    if re.search(r'thinkpad', h): return "PC-LEN-TP"
    if re.search(r'ideapad', h): return "PC-LEN-IP"
    if re.search(r'lenovo\s*v[0-9]|v-series|v14\b|v15\b', h): return "PC-LEN-V"
    if re.search(r'modern\s*1[45]|msi.*modern', h): return "PC-MSI-MOD"
    if re.search(r'msi.*gf|katana|bravo', h): return "PC-MSI-GF"
    if re.search(r'hp\s*pavilion|pavilion.*1[45]', h) and re.search(r'laptop|xách', h): return "PC-HP-PAV"
    if re.search(r'probook', h): return "PC-HP-PRO"
    if re.search(r'elitebook', h): return "PC-HP-EL"
    if re.search(r'aspire|acer.*asp', h): return "PC-ACER-ASP"
    if re.search(r'laptop|máy\s*tính\s*xách\s*tay', h): return "PC-DELL-INS"

    # --- Desktop ---
    if re.search(r'optiplex|dell.*opt', h): return "PC-DELL-OPT"
    if re.search(r'vostro.*3[0-9]{3}|3020.*dell|dell.*vos.*mt|st[il]', h): return "PC-DELL-VOS-DT"
    if re.search(r'inspiron.*3[0-9]{3}|dell.*ins.*mt', h): return "PC-DELL-INS-DT"
    if re.search(r'precision|dell.*t[0-9]{4}', h): return "PC-DELL-PRE"
    if re.search(r'v50t|v530|m70t|m720t|thinkcentre', h): return "PC-LEN-V-DT"
    if re.search(r'pavilion.*tp01|hp.*tp01|prodesk|elitedesk', h): return "PC-HP-DT"
    if re.search(r'msi.*modern.*am|msi.*pro', h): return "PC-MSI-DT"

    # --- Custom PC (By CPU) ---
    if re.search(r'i7-|i7\s*[0-9]|7700|8700|9700|10700|11700|12700|13700', h): return "PC-SYS-I7"
    if re.search(r'i5-|i5\s*[0-9]|6500|7500|8400|9400|10400|11400|12400|13400', h): return "PC-SYS-I5"
    if re.search(r'i3-|i3\s*[0-9]|6100|7100|8100|9100|10100|12100|13100', h): return "PC-SYS-I3"
    if re.search(r'g[45][0-9]{3}|celeron|pentium', h): return "PC-SYS-G"
    if re.search(r'ryzen|r[357]-', h): return "PC-SYS-AMD"

    # --- Printers ---
    if re.search(r'canon.*2900|canon.*6030|canon.*223|canon.*243|lbp', h): return "PRN-CAN-LBP"
    if re.search(r'canon.*g1010|g2010|g3010|ix6770', h): return "PRN-CAN-G"
    if re.search(r'hp.*1102|hp.*107|hp.*135|hp.*404|laserjet', h): return "PRN-HP-LJ"
    if re.search(r'brother.*l2321|l2361|l2366|hl-', h): return "PRN-BRO-HL"
    if re.search(r'brother.*t420|t520|t720|mfc-', h): return "PRN-BRO-MFC"
    if re.search(r'epson.*l3110|l3210|l805|l1800|l1300', h): return "PRN-EPS-L"
    if re.search(r'epson.*lq|plq', h): return "PRN-EPS-LQ"
    if re.search(r'máy\s*scan|scanner|hp.*sj|canon.*dr', h): return "SCN-HP-SJ"

    # --- Monitors ---
    if re.search(r'27.*inch|27"|monitor.*27|lcd.*27', h): return "LCD-DELL-27"
    if re.search(r'24.*inch|24"|monitor.*24|lcd.*24|se24|s24|e24|p24', h): return "LCD-DELL-24"
    if re.search(r'2[123].*inch|2[123]"|monitor.*2[123]|lcd.*2[123]|22\b|21\.5|23\.8', h): return "LCD-DELL-22"
    if re.search(r'1[89].*inch|1[89]"|monitor.*1[89]|lcd.*1[89]|19\b|18\.5', h): return "LCD-DELL-19"
    if re.search(r'màn\s*hình|lcd|monitor', h): return "LCD-DELL-24"

    # --- Consumables ---
    if re.search(r'mực\s*hộp|cartridge|12a|05a|80a|26a|toner', h): return "INK-CAN-12A"
    if re.search(r'mực\s*đổ|mực\s*chai|nạp\s*mực', h): return "INK-GEN-BOT"
    if re.search(r'rulo|trống|drum|gạt|bao\s*lụa', h): return "VT-PRN-ACC"

    # --- Components ---
    if re.search(r'ssd.*12[08]|ssd.*2[45][06]|ssd.*250|ssd.*240', h): return "SSD-128-256"
    if re.search(r'ssd.*5[01][02]|ssd.*480|ssd.*1t', h): return "SSD-500-1TB"
    if re.search(r'ssd', h): return "SSD-128-256"
    if re.search(r'hdd|ổ\s*cứng|western|wd\s*blue|seagate', h): return "HDD-WD-1TB"
    if re.search(r'ram.*4g|4gb.*ram', h): return "RAM-D4-4G"
    if re.search(r'ram.*8g|8gb.*ram', h): return "RAM-D4-8G"
    if re.search(r'ram.*16g|16gb.*ram', h): return "RAM-D4-16G"
    if re.search(r'ram.*32g|32gb.*ram', h): return "RAM-D4-32G"
    if re.search(r'ram', h): return "RAM-D4-8G"
    if re.search(r'mainboard|main\s*board|h61|h81|h110|h310|h410|h510|h610|b660', h): return "MAIN-H-SER"
    if re.search(r'vga|card\s*họa|gtx|rtx|graphics|geforce', h): return "VGA-NVI-GTX"
    if re.search(r'nguồn|psu|power\s*supply|acbel|jetek', h): return "PSU-GEN-500"
    if re.search(r'case|thùng\s*máy|vỏ\s*(thùng|máy)', h): return "CASE-GEN-OFF"

    # --- Peripherals ---
    if re.search(r'chuột.*logi|logitech.*m[0-9]|m1[78][0-9]|m22[0-9]|m33[0-9]', h): return "MS-LOGI"
    if re.search(r'rapoo|chuột.*rapoo', h): return "MS-RAPO"
    if re.search(r'chuột|mouse', h): return "MS-LOGI"
    if re.search(r'bàn\s*phím.*logi|logitech.*k[0-9]|k120|k2[0-9]0', h): return "KB-LOGI"
    if re.search(r'bàn\s*phím|keyboard|kb\b', h): return "KB-OFF"
    if re.search(r'loa|sound|creative|microlab|speaker', h): return "SPK-GEN-2.0"
    if re.search(r'tai\s*nghe|headphone|headset', h): return "HSET-OFF"
    if re.search(r'ups|bộ\s*lưu\s*điện|santak|apc', h): return "UPS-SAN-500"
    if re.search(r'router|modem|switch|tplink|dlink|totolink|draytek|wifi|access\s*point', h): return "NET-WIFI-AC"
    if re.search(r'usb|thẻ\s*nhớ|micro\s*sd|kingston', h): return "USB-ST-32G"

    # --- Camera ---
    if re.search(r'camera.*wifi|imou|ezviz|c6n', h): return "CAM-WIFI-2M"
    if re.search(r'camera.*dome|ip.*dome', h): return "CAM-IP-DOME"
    if re.search(r'camera.*bullet|ip.*thân', h): return "CAM-IP-BUL"
    if re.search(r'đầu\s*ghi|dvr|nvr', h): return "CAM-DVR-4C"

    # --- Software ---
    if re.search(r'windows|office|kaspersky|antivirus|license|bản\s*quyền', h): return "SW-WIN-PRO"
    if re.search(r'lắp\s*đặt|công\s*lắp|sửa\s*chữa', h): return "SRV-INSTALL"

    return "OTH-GEN"


# ============================================================
# CATEGORY NAME LOOKUP
# ============================================================
CATEGORY_NAMES = {
    "PC-DELL-LAT": "Laptop DELL Latitude", "PC-DELL-VOS": "Laptop DELL Vostro",
    "PC-DELL-INS": "Laptop DELL Inspiron", "PC-DELL-XPS": "Laptop DELL XPS",
    "PC-ASU-VIVO": "Laptop ASUS VivoBook", "PC-ASU-ZEN": "Laptop ASUS ZenBook",
    "PC-ASU-EXP": "Laptop ASUS ExpertBook", "PC-ASU-ROG": "Laptop ASUS Gaming",
    "PC-LEN-TP": "Laptop Lenovo ThinkPad", "PC-LEN-IP": "Laptop Lenovo IdeaPad",
    "PC-LEN-V": "Laptop Lenovo V-Series", "PC-MSI-MOD": "Laptop MSI Modern",
    "PC-MSI-GF": "Laptop MSI Gaming", "PC-HP-PAV": "Laptop HP Pavilion",
    "PC-HP-PRO": "Laptop HP ProBook", "PC-HP-EL": "Laptop HP EliteBook",
    "PC-ACER-ASP": "Laptop ACER Aspire",
    "PC-DELL-OPT": "PC Dell OptiPlex", "PC-DELL-VOS-DT": "PC Dell Vostro Desktop",
    "PC-DELL-INS-DT": "PC Dell Inspiron Desktop", "PC-DELL-PRE": "PC Dell Precision",
    "PC-LEN-V-DT": "PC Lenovo Desktop", "PC-HP-DT": "PC HP Desktop",
    "PC-MSI-DT": "PC MSI Desktop",
    "PC-SYS-I7": "PC Lắp Ráp Core i7", "PC-SYS-I5": "PC Lắp Ráp Core i5",
    "PC-SYS-I3": "PC Lắp Ráp Core i3", "PC-SYS-G": "PC Lắp Ráp Celeron/Pentium",
    "PC-SYS-AMD": "PC Lắp Ráp AMD Ryzen",
    "PRN-CAN-LBP": "Máy In Canon Laser", "PRN-CAN-G": "Máy In Canon Phun",
    "PRN-HP-LJ": "Máy In HP LaserJet", "PRN-BRO-HL": "Máy In Brother Laser",
    "PRN-BRO-MFC": "Máy In Brother MFC", "PRN-EPS-L": "Máy In Epson L-Series",
    "PRN-EPS-LQ": "Máy In Epson Kim", "SCN-HP-SJ": "Máy Scanner",
    "LCD-DELL-27": "Màn Hình 27\"", "LCD-DELL-24": "Màn Hình 24\"",
    "LCD-DELL-22": "Màn Hình 21-23\"", "LCD-DELL-19": "Màn Hình 18-19\"",
    "INK-CAN-12A": "Mực Hộp/Cartridge", "INK-GEN-BOT": "Mực Đổ/Chai",
    "VT-PRN-ACC": "Vật Tư In (Drum/Gạt)",
    "SSD-128-256": "SSD 128-256GB", "SSD-500-1TB": "SSD 500GB-1TB",
    "HDD-WD-1TB": "HDD 1TB+", "RAM-D4-4G": "RAM 4GB",
    "RAM-D4-8G": "RAM 8GB", "RAM-D4-16G": "RAM 16GB", "RAM-D4-32G": "RAM 32GB",
    "MAIN-H-SER": "Mainboard", "VGA-NVI-GTX": "Card Đồ Họa",
    "PSU-GEN-500": "Nguồn Máy Tính", "CASE-GEN-OFF": "Case/Vỏ Máy",
    "MS-LOGI": "Chuột Logitech", "MS-RAPO": "Chuột Rapoo",
    "KB-LOGI": "Bàn Phím Logitech", "KB-OFF": "Bàn Phím Văn Phòng",
    "SPK-GEN-2.0": "Loa", "HSET-OFF": "Tai Nghe",
    "UPS-SAN-500": "Bộ Lưu Điện UPS", "NET-WIFI-AC": "Thiết Bị Mạng/WiFi",
    "USB-ST-32G": "USB/Thẻ Nhớ",
    "CAM-WIFI-2M": "Camera WiFi", "CAM-IP-DOME": "Camera IP Dome",
    "CAM-IP-BUL": "Camera IP Bullet", "CAM-DVR-4C": "Đầu Ghi Hình",
    "SW-WIN-PRO": "Phần Mềm Bản Quyền", "SRV-INSTALL": "Dịch Vụ Lắp Đặt",
    "OTH-GEN": "Hàng Hóa Khác",
}


# ============================================================
# MAIN LOGIC
# ============================================================
def fetch_data(engine, company_id, year):
    """Fetch hóa đơn list + detail, áp dụng ICT timezone"""
    print(f"  Querying ext_listhoadon for year {year}...")
    q_list = text("""
        SELECT "idServer", shdon,
            tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
            loaihd, tthai, tgtcthue, tgtthue, tgtttbso
        FROM ext_listhoadon
        WHERE "congtyId" = :cid
          AND tthai IN ('1','2','4','5')
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= :start
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < :end
    """)
    with engine.connect() as conn:
        df_list = pd.read_sql(q_list, conn, params={
            'cid': company_id,
            'start': f'{year}-01-01',
            'end': f'{year+1}-01-01'
        })
    print(f"    Found {len(df_list)} invoices")

    if df_list.empty:
        return pd.DataFrame(), pd.DataFrame()

    ids = df_list['idServer'].tolist()
    print(f"  Querying ext_detailhoadon...")
    # Batch query to avoid too-long IN clause
    all_details = []
    batch_size = 500
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i+batch_size]
        placeholders = ','.join([f"'{x}'" for x in batch])
        q_det = f"""
            SELECT "idhdonServer", ten, sluong, dgia, thtien
            FROM ext_detailhoadon
            WHERE "idhdonServer" IN ({placeholders})
        """
        with engine.connect() as conn:
            df_batch = pd.read_sql(text(q_det), conn)
        all_details.append(df_batch)
    
    df_detail = pd.concat(all_details, ignore_index=True) if all_details else pd.DataFrame()
    print(f"    Found {len(df_detail)} detail rows")
    return df_list, df_detail


def process_xnt(df_list, df_detail, year):
    """Tính XNT theo tháng, nhóm sản phẩm"""
    # Merge detail with list
    df = df_detail.merge(
        df_list[['idServer', 'tdlap_ict', 'loaihd', 'tgtcthue']],
        left_on='idhdonServer', right_on='idServer', how='left'
    )
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month

    # Lọc bỏ dịch vụ
    mask_service = df['ten'].apply(is_service_item)
    service_total = df.loc[mask_service, 'thtien'].sum()
    print(f"  Loại bỏ {mask_service.sum()} dòng dịch vụ (tổng = {service_total:,.0f})")
    df = df[~mask_service].copy()

    # Map sản phẩm → nhóm
    df['group'] = df['ten'].apply(map_item)
    df['group_name'] = df['group'].map(CATEGORY_NAMES).fillna('Hàng Hóa Khác')
    df['qty'] = df['sluong'].fillna(0).astype(float)
    df['value'] = df['thtien'].fillna(0).astype(float)

    # Tách nhập/xuất
    df_nhap = df[df['loaihd'] == 'muavao'].copy()
    df_xuat = df[df['loaihd'] == 'banra'].copy()

    # Tổng hợp theo tháng + nhóm
    all_groups = sorted(set(df['group'].unique()))
    
    result = {}  # {month: {group: {nhap_sl, nhap_vnd, xuat_sl, xuat_vnd}}}
    for m in range(1, 13):
        result[m] = {}
        for g in all_groups:
            mn = df_nhap[(df_nhap['month'] == m) & (df_nhap['group'] == g)]
            mx = df_xuat[(df_xuat['month'] == m) & (df_xuat['group'] == g)]
            result[m][g] = {
                'nhap_sl': mn['qty'].sum(),
                'nhap_vnd': mn['value'].sum(),
                'xuat_sl': mx['qty'].sum(),
                'xuat_vnd': mx['value'].sum(),
            }

    # Tính summary
    total_nhap = df_nhap['value'].sum()
    total_xuat = df_xuat['value'].sum()
    print(f"\n  === TỔNG KẾT NĂM {year} ===")
    print(f"  Tổng Nhập (VNĐ): {total_nhap:>20,.0f}")
    print(f"  Tổng Xuất (VNĐ): {total_xuat:>20,.0f}")

    return result, all_groups, total_nhap, total_xuat


def build_excel(result, all_groups, year, output_path):
    """Tạo file Excel XNT"""
    wb = Workbook()
    wb.remove(wb.active)

    # Styles
    header_font = Font(bold=True, size=11, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="2F5496")
    total_fill = PatternFill("solid", fgColor="D6E4F0")
    total_font = Font(bold=True, size=11)
    border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )
    num_fmt = '#,##0'
    num_fmt_vnd = '#,##0'

    headers = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm',
               'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)',
               'Nhập (SL)', 'Nhập (VNĐ)',
               'Xuất (SL)', 'Xuất (VNĐ)',
               'Giá Vốn', 'Xuất Theo Giá Vốn',
               'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
    col_widths = [5, 16, 35, 12, 18, 10, 18, 10, 18, 16, 18, 12, 18]

    running_qty = defaultdict(float)  # Tồn lũy kế theo số lượng
    running_val = defaultdict(float)  # Tồn lũy kế theo giá trị
    running_cogs = {}  # Giá vốn trung bình

    for m in range(1, 13):
        ws = wb.create_sheet(title=f"Tháng {m}")

        # Header row
        for c, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=c, value=h)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal='center', wrap_text=True)
            cell.border = border

        for c, w in enumerate(col_widths, 1):
            ws.column_dimensions[get_column_letter(c)].width = w

        row = 2
        month_data = result.get(m, {})
        
        # Sort groups by activity
        sorted_groups = sorted(all_groups, key=lambda g: (
            month_data.get(g, {}).get('nhap_vnd', 0) +
            month_data.get(g, {}).get('xuat_vnd', 0) +
            abs(running_val.get(g, 0))
        ), reverse=True)

        for idx, g in enumerate(sorted_groups, 1):
            d = month_data.get(g, {'nhap_sl': 0, 'nhap_vnd': 0, 'xuat_sl': 0, 'xuat_vnd': 0})

            ton_dau_sl = running_qty[g]
            ton_dau_vnd = running_val[g]

            nhap_sl = d['nhap_sl']
            nhap_vnd = d['nhap_vnd']
            xuat_sl = d['xuat_sl']
            xuat_vnd = d['xuat_vnd']

            # Giá vốn TB
            total_sl = ton_dau_sl + nhap_sl
            total_vnd = ton_dau_vnd + nhap_vnd
            if total_sl > 0:
                cogs = total_vnd / total_sl
            else:
                cogs = running_cogs.get(g, 0)
            running_cogs[g] = cogs

            xuat_cogs = cogs * xuat_sl

            ton_cuoi_sl = ton_dau_sl + nhap_sl - xuat_sl
            ton_cuoi_vnd = ton_dau_vnd + nhap_vnd - xuat_cogs

            running_qty[g] = ton_cuoi_sl
            running_val[g] = ton_cuoi_vnd

            gname = CATEGORY_NAMES.get(g, g)
            values = [idx, g, gname,
                      ton_dau_sl, ton_dau_vnd,
                      nhap_sl, nhap_vnd,
                      xuat_sl, xuat_vnd,
                      cogs, xuat_cogs,
                      ton_cuoi_sl, ton_cuoi_vnd]

            for c, v in enumerate(values, 1):
                cell = ws.cell(row=row, column=c, value=v)
                cell.border = border
                if c >= 4:
                    cell.number_format = num_fmt_vnd
                    cell.alignment = Alignment(horizontal='right')

            row += 1

        # Total row
        ws.cell(row=row, column=1, value='').border = border
        ws.cell(row=row, column=2, value='').border = border
        total_cell = ws.cell(row=row, column=3, value=f'TỔNG CỘNG THÁNG {m}')
        total_cell.font = total_font
        total_cell.fill = total_fill
        total_cell.border = border

        for c in range(4, 14):
            cell = ws.cell(row=row, column=c)
            col_letter = get_column_letter(c)
            cell.value = f'=SUM({col_letter}2:{col_letter}{row-1})'
            cell.number_format = num_fmt_vnd
            cell.font = total_font
            cell.fill = total_fill
            cell.border = border
            cell.alignment = Alignment(horizontal='right')

    # Summary sheet
    ws_sum = wb.create_sheet(title="Tổng Hợp 12 Tháng", index=0)
    sum_headers = ['Tháng', 'Tổng Nhập (VNĐ)', 'Tổng Xuất (VNĐ)', 'Nhập - Xuất']
    for c, h in enumerate(sum_headers, 1):
        cell = ws_sum.cell(row=1, column=c, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = border
        cell.alignment = Alignment(horizontal='center')
    ws_sum.column_dimensions['A'].width = 12
    ws_sum.column_dimensions['B'].width = 22
    ws_sum.column_dimensions['C'].width = 22
    ws_sum.column_dimensions['D'].width = 22

    for m in range(1, 13):
        r = m + 1
        md = result.get(m, {})
        nhap = sum(v.get('nhap_vnd', 0) for v in md.values())
        xuat = sum(v.get('xuat_vnd', 0) for v in md.values())
        ws_sum.cell(row=r, column=1, value=f"Tháng {m}").border = border
        ws_sum.cell(row=r, column=2, value=nhap).border = border
        ws_sum.cell(row=r, column=2).number_format = num_fmt_vnd
        ws_sum.cell(row=r, column=3, value=xuat).border = border
        ws_sum.cell(row=r, column=3).number_format = num_fmt_vnd
        ws_sum.cell(row=r, column=4, value=nhap - xuat).border = border
        ws_sum.cell(row=r, column=4).number_format = num_fmt_vnd

    # Total
    r = 14
    ws_sum.cell(row=r, column=1, value="TỔNG NĂM").font = total_font
    ws_sum.cell(row=r, column=1).fill = total_fill
    ws_sum.cell(row=r, column=1).border = border
    for c in range(2, 5):
        cell = ws_sum.cell(row=r, column=c)
        cl = get_column_letter(c)
        cell.value = f'=SUM({cl}2:{cl}13)'
        cell.font = total_font
        cell.fill = total_fill
        cell.border = border
        cell.number_format = num_fmt_vnd

    wb.save(output_path)
    print(f"\n  ✅ Saved: {output_path}")


def main():
    parser = argparse.ArgumentParser(description='Tạo báo cáo XNT chính xác')
    parser.add_argument('--year', type=int, default=2023, help='Năm báo cáo (default: 2023)')
    parser.add_argument('--company', type=str, default=DEFAULT_MST, help='MST công ty')
    parser.add_argument('--output', type=str, default=None, help='Output file path')
    parser.add_argument('--db', type=str, default=None, help='Database URI')
    args = parser.parse_args()

    db_uri = args.db or DB_URI
    company_id = COMPANY_MAP.get(args.company, args.company)
    output_path = args.output or os.path.join(OUTPUT_DIR, f"XNT_HuyVu_{args.year}.xlsx")

    print(f"=" * 60)
    print(f"BUILD XNT REPORT - NĂM {args.year}")
    print(f"  MST: {args.company} → ID: {company_id}")
    print(f"  Output: {output_path}")
    print(f"=" * 60)

    engine = create_engine(db_uri)
    df_list, df_detail = fetch_data(engine, company_id, args.year)

    if df_list.empty:
        print("  ❌ Không có dữ liệu!")
        sys.exit(1)

    result, all_groups, total_nhap, total_xuat = process_xnt(df_list, df_detail, args.year)
    build_excel(result, all_groups, args.year, output_path)

    print(f"\n{'=' * 60}")
    print(f"DONE! Tổng Nhập = {total_nhap:,.0f} VNĐ")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
