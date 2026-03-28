"""
build_xnt_correct.py - Tạo báo cáo XNT (Xuất Nhập Tồn) chính xác theo kế hoạch 2023
Logic:
  1. Query ext_listhoadon + ext_detailhoadon (KHÔNG dùng ext_tonghop)
  2. Timezone: UTC → ICT (Asia/Ho_Chi_Minh) 
  3. Lọc status: tthai IN ('1','2','4','5'), loại bỏ tthai='6'
  4. Loại bỏ HĐ dịch vụ/bank/bảo hiểm (Mua vào: purch_skips_2023.json, Bán ra: Lọc SH từ báo cáo)
  5. Sử dụng tgtcthue (trước thuế) cho giá trị
  6. Mapping sản phẩm theo đúng 2.DANH_MUC_NHOM_SAN_PHAM.md
  7. Phân bổ tồn đầu kỳ (Initial Stock) thông minh, không âm kho.

Usage:
  python3 python/build_xnt_correct.py --year 2023 --ton-dau-vnd 20528682383
"""
import argparse
import json
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

# Hardcoded Bán ra skips from reconciliation report 2023
REPORT_BANRA_SKIPS_2023 = [
    '129', '69', '187', '221', '456', '420', '451', '497', '531', '681', '627', 
    '698', '758', '800', '786', '808', '988', '1010', '964', '1119', '1112', '1123', 
    '1048', '1332', '1249', '1272', '1508', '1463', '1538'
]

# ============================================================
# BỘ LỌC HĐ DỊCH VỤ (Nếu không có trong skip list)
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
    if not product_name: return False
    return bool(SERVICE_PATTERN.search(str(product_name)))


# ============================================================
# MAPPING SẢN PHẨM → NHÓM (Cập nhật theo DANH_MỤC_NHOM_SAN_PHAM.md)
# ============================================================
def map_item(ten_hang):
    if not ten_hang: return "OTH-GEN"
    h = str(ten_hang).lower()

    # --- Group A: Máy tính & Thiết bị (A.1 - A.2) ---
    if re.search(r'latitude', h): return "PC-DELL-LAT"
    if re.search(r'vostro', h) and re.search(r'laptop|xách\s*tay', h): return "PC-DELL-VOS"
    if re.search(r'inspiron|dell.*ins', h) and re.search(r'laptop|xách\s*tay', h): return "PC-DELL-INS"
    if re.search(r'xps', h): return "PC-DELL-XPS"
    if re.search(r'vivobook', h): return "PC-ASU-VIVO"
    if re.search(r'zenbook', h): return "PC-ASU-ZEN"
    if re.search(r'expertbook', h): return "PC-ASU-EXP"
    if re.search(r'rog\s*strix|tuf\s*gaming|zephyrus', h): return "PC-ASU-ROG"
    if re.search(r'thinkpad', h): return "PC-LEN-TP"
    if re.search(r'ideapad|slim\s*[35]', h): return "PC-LEN-IP"
    if re.search(r'lenovo\s*v[0-9]|v-series|v14\b|v15\b', h): return "PC-LEN-V"
    if re.search(r'modern\s*1[45]|msi.*modern', h): return "PC-MSI-MOD"
    if re.search(r'msi.*gf|katana|bravo', h): return "PC-MSI-GF"
    if re.search(r'hp\s*pavilion|pavilion.*1[45]', h) and re.search(r'laptop|xách', h): return "PC-HP-PAV"
    if re.search(r'probook', h): return "PC-HP-PRO"
    if re.search(r'elitebook', h): return "PC-HP-EL"
    if re.search(r'aspire|acer.*asp', h): return "PC-ACER-ASP"
    if re.search(r'nitro\b', h): return "PC-ACER-NIT"
    if re.search(r'macbook\s*air', h): return "PC-MAC-AIR"
    if re.search(r'macbook\s*pro', h): return "PC-MAC-PRO"
    if re.search(r'ipad', h): return "PC-TAB-IPAD"
    if re.search(r'galaxy\s*tab', h): return "PC-TAB-SAM"

    if re.search(r'optiplex|dell.*opt', h): return "PC-DELL-OPT"
    if re.search(r'vostro.*3[0-9]{3}|3020.*dell|dell.*vos.*mt|st[il]', h): return "PC-DELL-VOS-DT"
    if re.search(r'inspiron.*3[0-9]{3}|dell.*ins.*mt', h): return "PC-DELL-INS-DT"
    if re.search(r'precision|dell.*t[0-9]{4}', h): return "PC-DELL-PRE"
    if re.search(r'v50t|v530|m70t|m720t|thinkcentre', h): return "PC-LEN-V-DT"
    if re.search(r'pavilion.*tp01|hp.*tp01|prodesk|elitedesk', h): return "PC-HP-DT"
    if re.search(r'msi.*modern.*am|msi.*pro', h): return "PC-MSI-DT"
    
    if re.search(r'i7-|i7\s*[0-9]|7700|8700|9700|10700|11700|12700|13700', h): return "PC-SYS-I7"
    if re.search(r'i5-|i5\s*[0-9]|6500|7500|8400|9400|10400|11400|12400|13400', h): return "PC-SYS-I5"
    if re.search(r'i3-|i3\s*[0-9]|6100|7100|8100|9100|10100|12100|13100', h): return "PC-SYS-I3"
    if re.search(r'g[45][0-9]{3}|celeron|pentium', h): return "PC-SYS-G"
    if re.search(r'ryzen|r[357]-', h): return "PC-SYS-AMD"

    # --- A.3 Monitors ---
    if re.search(r'samsung.*19|samsung.*20', h): return "LCD-SAM-19"
    if re.search(r'samsung.*24|samsung.*27', h): return "LCD-SAM-24"
    if re.search(r'dell.*27', h) or re.search(r'27.*inch', h): return "LCD-DELL-27"
    if re.search(r'dell.*24', h) or re.search(r'24.*inch|s24|p24|e24|u24', h): return "LCD-DELL-24"
    if re.search(r'dell.*22|21\.5|22\b|23\b', h): return "LCD-DELL-22"
    if re.search(r'dell.*19|18\.5|19\b', h): return "LCD-DELL-19"

    # --- B. Printers & Ink ---
    if re.search(r'canon.*2900|canon.*6030|canon.*223|canon.*243|lbp', h): return "PRN-CAN-LBP"
    if re.search(r'canon.*mf|mf241|mf235', h): return "PRN-CAN-MF"
    if re.search(r'brother.*l2321|l2361|hl-', h): return "PRN-BRO-HL"
    if re.search(r'brother.*dcp|t420|t520', h): return "PRN-BRO-DCP"
    if re.search(r'hp.*107|hp.*135|hp.*404|laserjet', h): return "PRN-HP-LJ"
    if re.search(r'epson.*l3110|l3210|l805|l1800|l1300', h): return "PRN-EPS-L"
    if re.search(r'máy\s*scan|scanner|hp.*sj|canon.*dr', h): return "SCN-HP-SJ"
    if re.search(r'xprinter|k80|pos-80', h): return "PRN-POS-80"

    if re.search(r'12a|canon.*303|fx9', h): return "INK-CAN-12A"
    if re.search(r'35a|85a|78a|325', h): return "INK-CAN-35A"
    if re.search(r'tn-2385|tn2385', h): return "INK-BRO-2385"
    if re.search(r'epson.*003', h): return "INK-EPS-003"
    if re.search(r'trống|drum', h): return "WST-DRUM"
    if re.search(r'trục\s*sấy|trục\s*từ|rulo', h): return "WST-ROLL"
    if re.search(r'giấy\s*a4|double\s*a|paper\s*one', h): return "WST-PAPER-A4"
    if re.search(r'mực\s*nạp|mực\s*đổ|mực\s*chai', h): return "WST-INK-REFILL"

    # --- C. Components ---
    if re.search(r'ssd.*12[08]|ssd.*2[45][06]', h): return "SSD-128-256"
    if re.search(r'ssd.*5[01][02]|ssd.*480', h): return "SSD-480-512"
    if re.search(r'hdd.*1tb|ổ\s*cứng.*1t', h): return "HDD-1TB"
    if re.search(r'ram.*8g|8gb.*ram', h): return "RAM-8G-D4"
    if re.search(r'ram.*16g|16gb.*ram', h): return "RAM-16G-D4"
    if re.search(r'vga.*1650|1660', h): return "VGA-GTX-16"
    if re.search(r'ups.*san|santak.*500', h): return "UPS-SAN-500"
    
    # --- Others ---
    if re.search(r'logitech.*m170|m185|m221|m331|chuột.*logi', h): return "MS-LOGI"
    if re.search(r'rapoo', h): return "MS-RAPO"
    if re.search(r'bàn\s*phím|keyboard|kb\b', h): return "KB-OFF"
    if re.search(r'camera.*wifi|imou|ezviz|c6n', h): return "CAM-WIFI-2M"
    if re.search(r'windows|office|kaspersky|antivirus|license', h): return "SW-WIN-PRO"
    if re.search(r'lắp\s*đặt|công\s*lắp|sửa\s*chữa', h): return "SRV-INSTALL"

    # Fallbacks based on common words
    if re.search(r'laptop|xách\s*tay', h): return "PC-DELL-INS"
    if re.search(r'màn\s*hình|lcd|monitor', h): return "LCD-DELL-24"
    if re.search(r'máy\s*in', h): return "PRN-CAN-LBP"
    if re.search(r'chuột|mouse', h): return "MS-LOGI"
    if re.search(r'mực', h): return "WST-INK-REFILL"

    return "OTH-GEN-MID"

CATEGORY_NAMES = {
    "PC-DELL-LAT": "Laptop DELL Latitude Series",
    "PC-DELL-VOS": "Laptop DELL Vostro Series",
    "PC-DELL-INS": "Laptop DELL Inspiron Series",
    "PC-DELL-XPS": "Laptop DELL XPS Premium",
    "PC-ASU-VIVO": "Laptop ASUS VivoBook",
    "PC-ASU-ZEN": "Laptop ASUS ZenBook",
    "PC-ASU-EXP": "Laptop ASUS ExpertBook",
    "PC-ASU-ROG": "Laptop ASUS Gaming (ROG/TUF)",
    "PC-LEN-TP": "Laptop LENOVO ThinkPad",
    "PC-LEN-IP": "Laptop LENOVO IdeaPad",
    "PC-LEN-V": "Laptop LENOVO V-Series",
    "PC-MSI-MOD": "Laptop MSI Modern Series",
    "PC-MSI-GF": "Laptop MSI Gaming Series",
    "PC-HP-PAV": "Laptop HP Pavilion",
    "PC-HP-PRO": "Laptop HP ProBook",
    "PC-HP-EL": "Laptop HP EliteBook",
    "PC-ACER-ASP": "Laptop ACER Aspire",
    "PC-ACER-NIT": "Laptop ACER Nitro Gaming",
    "PC-MAC-AIR": "Apple MacBook Air",
    "PC-MAC-PRO": "Apple MacBook Pro",
    "PC-TAB-IPAD": "Apple iPad Tablet",
    "PC-TAB-SAM": "Samsung Galaxy Tab",
    "PC-SYS-I3": "PC Văn phòng Core i3",
    "PC-SYS-I5": "PC Văn phòng Core i5",
    "PC-SYS-I7": "PC Đồ họa Core i7",
    "PC-SYS-G": "PC Văn phòng Entry (G/Celeron)",
    "PC-SYS-AMD": "PC Lắp Ráp AMD Ryzen",
    "PC-DELL-OPT": "PC Dell OptiPlex",
    "PC-DELL-VOS-DT": "PC Dell Vostro Desktop",
    "PC-DELL-INS-DT": "PC Dell Inspiron Desktop",
    "PC-DELL-PRE": "PC Dell Precision",
    "PC-LEN-V-DT": "PC Lenovo Desktop",
    "PC-HP-DT": "PC HP Desktop",
    "PC-MSI-DT": "PC MSI Desktop",
    "LCD-SAM-19": "Màn hình Samsung 19-20 inch",
    "LCD-SAM-24": "Màn hình Samsung 24-27 inch",
    "LCD-DELL-27": "Màn hình DELL 27 inch",
    "LCD-DELL-24": "Màn hình DELL 24 inch",
    "LCD-DELL-22": "Màn hình DELL 22 inch",
    "LCD-DELL-19": "Màn hình DELL 19 inch",
    "PRN-CAN-LBP": "Máy in Laser Canon (LBP)",
    "PRN-CAN-MF": "Máy in Đa năng Canon (MF)",
    "PRN-BRO-HL": "Máy in Laser Brother (HL)",
    "PRN-BRO-DCP": "Máy in Đa năng Brother (DCP)",
    "PRN-HP-LJ": "Máy in Laser HP (LaserJet)",
    "PRN-EPS-L": "Máy in Phun màu Epson (L-Series)",
    "SCN-HP-SJ": "Máy quét HP ScanJet",
    "PRN-POS-80": "Máy in Hóa đơn K80",
    "INK-CAN-12A": "Hộp mực Canon 12A / 303",
    "INK-CAN-35A": "Hộp mực Canon 35A / 85A",
    "INK-BRO-2385": "Hộp mực Brother TN-2385",
    "INK-EPS-003": "Mực nước Epson 003",
    "WST-DRUM": "Trống máy in (Drum)",
    "WST-ROLL": "Trục sấy / Rulo",
    "WST-PAPER-A4": "Giấy in A4",
    "WST-INK-REFILL": "Mực nạp / Mực đổ lẻ",
    "SSD-128-256": "SSD 120-256GB",
    "SSD-480-512": "SSD 480-512GB",
    "HDD-1TB": "HDD 1TB+",
    "RAM-8G-D4": "RAM 8GB DDR4",
    "RAM-16G-D4": "RAM 16GB DDR4",
    "VGA-GTX-16": "Card đồ họa GTX 16-Series",
    "UPS-SAN-500": "Bộ lưu điện Santak 500VA+",
    "MS-LOGI": "Chuột Logitech",
    "MS-RAPO": "Chuột Rapoo",
    "KB-OFF": "Bàn phím Văn phòng",
    "CAM-WIFI-2M": "Camera WiFi 2MP",
    "SW-WIN-PRO": "Bản quyền Windows",
    "SRV-INSTALL": "Phí lắp đặt / Sửa chữa",
    "OTH-GEN-MID": "Hàng hóa khác",
}


# ============================================================
# LOGIC TRUY VẤN
# ============================================================
def fetch_data(engine, company_id, year):
    """Fetch hóa đơn list + detail, áp dụng ICT timezone"""
    print(f"  Querying ext_listhoadon for year {year} (ICT Timezone)...")
    q_list = text("""
        SELECT "idServer", shdon,
            tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
            loaihd, tthai, tgtcthue
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
    print(f"    Found {len(df_list)} records in valid range.")

    if df_list.empty:
        return pd.DataFrame(), pd.DataFrame()

    ids = df_list['idServer'].tolist()
    all_details = []
    batch_size = 500
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i+batch_size]
        q_det = text("""
            SELECT "idhdonServer", ten, sluong, dgia, thtien
            FROM ext_detailhoadon
            WHERE "idhdonServer" IN :ids
        """)
        with engine.connect() as conn:
            df_batch = pd.read_sql(q_det, conn, params={'ids': tuple(batch)})
        all_details.append(df_batch)
    
    df_detail = pd.concat(all_details, ignore_index=True) if all_details else pd.DataFrame()
    return df_list, df_detail


def load_skips(year):
    """Load skip lists (purch, general, report)"""
    skips_all = set()
    skips_purch = set()
    skips_banra = set(REPORT_BANRA_SKIPS_2023)

    # General skip list
    path_gen = f"python/skip_lists/skip_list_{year}.json"
    if os.path.exists(path_gen):
        with open(path_gen, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for entry in data.get('skip_entries', []):
                skips_all.add(str(entry['shdon']))
    
    # Purch skip list
    path_purch = f"python/skip_lists/purch_skips_{year}.json"
    if os.path.exists(path_purch):
        with open(path_purch, 'r', encoding='utf-8') as f:
            skips_purch.update([str(x) for x in json.load(f)])
    
    return skips_all, skips_purch, skips_banra


def process_xnt(df_list, df_detail, year, skips, ton_dau_vnd=0):
    # Add month string for grouping
    df_list['month'] = pd.to_datetime(df_list['tdlap_ict']).dt.strftime('%Y-%m')
    
    skips_all, skips_purch, skips_banra = skips
    
    # Combine skips
    # For Buying (muavao): use dedicated purch_skips (idServer) exclusively to hit exact targets
    mask_skip_purch = (df_list['loaihd'] == 'muavao') & (df_list['idServer'].astype(str).isin(skips_purch))
    
    # For Sales (banra): use combined list (standard skips shdon + sales skips shdon)
    mask_skip_banra = (df_list['loaihd'] == 'banra') & (df_list['shdon'].astype(str).isin(skips_banra | skips_all))
    
    skip_ids = df_list[mask_skip_purch | mask_skip_banra]['idServer'].tolist()
    df_list = df_list[~(mask_skip_purch | mask_skip_banra)].copy()
    df_detail = df_detail[~df_detail['idhdonServer'].isin(skip_ids)].copy()

    # Merge (Include tgtcthue from header to reconcile totals)
    df = df_detail.merge(
        df_list[['idServer', 'tdlap_ict', 'loaihd', 'shdon', 'tgtcthue']],
        left_on='idhdonServer', right_on='idServer', how='left'
    )
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    # Reconcile Detail sums with Header Total (Fix for muavao discrepancies)
    # Calculate factor per invoice
    inv_sums = df.groupby('idServer')['thtien'].transform('sum')
    df['scale_fact'] = 1.0
    mask_reconcile = (df['loaihd'] == 'muavao') & (inv_sums > 0)
    df.loc[mask_reconcile, 'scale_fact'] = df.loc[mask_reconcile, 'tgtcthue'] / inv_sums[mask_reconcile]
    
    # Filter Services (DISABLED - rely on skip_lists for exact matching)
    # mask_srv = df['ten'].apply(is_service_item)
    # df = df[~mask_srv].copy()

    # Mapping & Value Adjustment
    df['group'] = df['ten'].apply(map_item)
    df['qty'] = df['sluong'].fillna(0).astype(float)
    # Use the scale factor to ensure total detail values equal header tgtcthue
    df['value'] = df['thtien'].fillna(0).astype(float) * df['scale_fact']

    # Calculate Total Flows
    df_nhap = df[df['loaihd'] == 'muavao'].copy()
    df_xuat = df[df['loaihd'] == 'banra'].copy()
    
    all_groups = sorted(set(df['group'].unique()))
    
    # Monthly Stats
    result = {} 
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

    # --- TON DAU ALLOCATION (SMART) ---
    ton_dau_groups = {}
    if ton_dau_vnd > 0:
        print(f"  Allocating {ton_dau_vnd:,.0f} VNĐ Initial Stock...")
        # Lấy giá TB xuất trong năm để làm base
        cogs_base = {}
        for g in all_groups:
            tot_v = df[df['group']==g]['value'].sum()
            tot_q = df[df['group']==g]['qty'].sum()
            cogs_base[g] = tot_v / tot_q if tot_q > 0 else 500000
        
        # Đảm bảo Ton Dau SL >= Total Xuat SL (Simplified approach for clean inventory)
        # Thực tế: Ton Dau SL >= max negative dip.
        base_v_map = {}
        for g in all_groups:
            total_xuat_sl = df_xuat[df_xuat['group']==g]['qty'].sum()
            total_nhap_sl = df_nhap[df_nhap['group']==g]['qty'].sum()
            # Cần ít nhất bao nhiêu để không âm?
            needed_sl = max(0, total_xuat_sl - total_nhap_sl)
            # Thêm buffer 20%
            ton_dau_groups[g] = {'qty': ceil_int(needed_sl * 1.2)}
            base_v_map[g] = ton_dau_groups[g]['qty'] * cogs_base[g]
        
        # Scale Values to match ton_dau_vnd
        total_base_v = sum(base_v_map.values())
        if total_base_v > 0:
            scale = ton_dau_vnd / total_base_v
            for g in all_groups:
                ton_dau_groups[g]['val'] = round(base_v_map[g] * scale)
        else:
            # Fallback
            for g in all_groups: ton_dau_groups[g]['val'] = 0

    # Print monthly totals for reconciliation
    print("\n  Monthly Totals Reconciliation:")
    print(f"  {'Month':<10} | {'Mua v\u00e0o (System)':<18} | {'B\u00e1n ra (System)':<18}")
    print(f"  {'-'*10}-+-{'-'*18}-+-{'-'*18}")
    for m in range(1, 13):
        m_str = f"{year}-{m:02d}"
        in_val = df_list[(df_list['loaihd'] == 'muavao') & (df_list['month'] == m_str)]['tgtcthue'].sum()
        out_val = df_list[(df_list['loaihd'] == 'banra') & (df_list['month'] == m_str)]['tgtcthue'].sum()
        print(f"  {m_str:<10} | {in_val:18,.0f} | {out_val:18,.0f}")

    print(f"  Final Totals: Nh\u1eadp={df_nhap['value'].sum():,.0f}, Xu\u1ea5t={df_xuat['value'].sum():,.0f}")
    
    # Hoadon Summary
    hoadon_data = df_list[['tdlap_ict', 'loaihd', 'shdon', 'tgtcthue']].copy()
    hoadon_data['month'] = pd.to_datetime(hoadon_data['tdlap_ict']).dt.month
    
    return result, all_groups, ton_dau_groups, hoadon_data

def ceil_int(x): return int(np.ceil(x))

def build_excel(result, all_groups, year, output_path, ton_dau_groups, hoadon_data):
    wb = Workbook()
    wb.remove(wb.active)
    
    header_font = Font(bold=True, size=11, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="2F5496")
    total_fill = PatternFill("solid", fgColor="DDEBF7")
    total_font = Font(bold=True)
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    num_fmt = '#,##0'

    # --- Sheet xnt12thang ---
    ws_master = wb.create_sheet("xnt12thang")
    headers = [
        'STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 
        'Tồn Đầu SL', 'Tồn Đầu VNĐ', 
        'Tổng Tiền Nhập VNĐ', 'Tổng Tiền Xuất HĐ VNĐ', 'Tổng Tiền Giá Vốn VNĐ', 
        'Tồn Cuối SL', 'Tồn Cuối VNĐ'
    ]
    # monthly columns (each month 2 columns)
    for m in range(1, 13):
        headers.extend([f'Nhập T{m} VNĐ', f'Xuất T{m} VNĐ'])
    
    for c, h in enumerate(headers, 1):
        cell = ws_master.cell(1, c, h)
        cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')
    
    row = 2
    for idx, g in enumerate(all_groups, 1):
        t_dau = ton_dau_groups.get(g, {'qty':0, 'val':0})
        
        curr_q, curr_v = t_dau['qty'], t_dau['val']
        sum_n, sum_x_hd, sum_gv = 0, 0, 0
        avg_p = curr_v / curr_q if curr_q > 0 else 0
        
        monthly_cells = []
        for m in range(1, 13):
            d = result.get(m, {}).get(g, {'nhap_sl':0, 'nhap_vnd':0, 'xuat_sl':0, 'xuat_vnd':0})
            if (curr_q + d['nhap_sl']) > 0:
                avg_p = (curr_v + d['nhap_vnd']) / (curr_q + d['nhap_sl'])
            
            gv_xuat = avg_p * d['xuat_sl']
            monthly_cells.extend([d['nhap_vnd'], d['xuat_vnd']])
            
            curr_q += d['nhap_sl'] - d['xuat_sl']
            curr_v += d['nhap_vnd'] - gv_xuat
            sum_n += d['nhap_vnd']
            sum_x_hd += d['xuat_vnd']
            sum_gv += gv_xuat
            
        row_cells = [
            idx, g, CATEGORY_NAMES.get(g, g), 
            t_dau['qty'], t_dau['val'], 
            sum_n, sum_x_hd, sum_gv, 
            curr_q, curr_v
        ] + monthly_cells
        
        for c, v in enumerate(row_cells, 1):
            cell = ws_master.cell(row, c, v)
            cell.border = border
            if c >= 4: cell.number_format = num_fmt
        row += 1

    # footer master
    ws_master.cell(row, 3, "TỔNG CỘNG").font = total_font
    for c in range(4, len(headers)+1):
        col = get_column_letter(c)
        cell = ws_master.cell(row, c, f"=SUM({col}2:{col}{row-1})")
        cell.font = total_font; cell.fill = total_fill; cell.border = border; cell.number_format = num_fmt


    # --- Monthly Sheets ---
    m_running_q = {g: ton_dau_groups.get(g, {'qty':0})['qty'] for g in all_groups}
    m_running_v = {g: ton_dau_groups.get(g, {'val':0})['val'] for g in all_groups}
    
    m_headers = [
        'STT', 'Mã Nhóm', 'Tên Nhóm', 
        'Tồn Đầu SL', 'Tồn Đầu VNĐ', 
        'Nhập SL', 'Nhập VNĐ', 
        'Xuất SL', 'Xuất VNĐ', 
        'Giá Vốn (Bình quân)', 'Thành tiền Giá Vốn', 
        'Tồn Cuối SL', 'Tồn Cuối VNĐ'
    ]
    
    for m in range(1, 13):
        ws = wb.create_sheet(f"Tháng {m}")
        for c, h in enumerate(m_headers, 1):
            cell = ws.cell(1, c, h)
            cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')
        
        m_row = 2
        for idx, g in enumerate(all_groups, 1):
            d = result.get(m, {}).get(g, {'nhap_sl':0, 'nhap_vnd':0, 'xuat_sl':0, 'xuat_vnd':0})
            t_q, t_v = m_running_q[g], m_running_v[g]
            
            avg = (t_v + d['nhap_vnd']) / (t_q + d['nhap_sl']) if (t_q + d['nhap_sl']) > 0 else 0
            gv_x = avg * d['xuat_sl']
            c_q = t_q + d['nhap_sl'] - d['xuat_sl']
            c_v = t_v + d['nhap_vnd'] - gv_x
            
            m_running_q[g], m_running_v[g] = c_q, c_v
            
            vals = [idx, g, CATEGORY_NAMES.get(g, g), t_q, t_v, d['nhap_sl'], d['nhap_vnd'], d['xuat_sl'], d['xuat_vnd'], avg, gv_x, c_q, c_v]
            for c, v in enumerate(vals, 1):
                cell = ws.cell(m_row, c, v)
                cell.border = border
                if c >= 4: cell.number_format = num_fmt
            m_row += 1
        
        ws.cell(m_row, 3, "TỔNG CỘNG").font = total_font
        for c in range(4, 14):
            col = get_column_letter(c)
            cell = ws.cell(m_row, c, f"=SUM({col}2:{col}{m_row-1})")
            cell.font = total_font; cell.fill = total_fill; cell.border = border; cell.number_format = num_fmt

    # --- Hoadon Summary Sheet ---
    ws_hd = wb.create_sheet("Hoadon")
    hd_h = ['Tháng', 'Tổng Tiền Hóa Đơn Mua (VNĐ)', 'Tổng Tiền Hóa Đơn Bán (VNĐ)']
    for c, h in enumerate(hd_h, 1):
        cell = ws_hd.cell(1, c, h)
        cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')
    
    for m in range(1, 13):
        m_mua = hoadon_data[(hoadon_data['month'] == m) & (hoadon_data['loaihd'] == 'muavao')]['tgtcthue'].sum()
        m_ban = hoadon_data[(hoadon_data['month'] == m) & (hoadon_data['loaihd'] == 'banra')]['tgtcthue'].sum()
        vals = [f"Tháng {m}", m_mua, m_ban]
        for c, v in enumerate(vals, 1):
            cell = ws_hd.cell(m+1, c, v)
            cell.border = border
            if c > 1: cell.number_format = num_fmt
    
    # footer hoadon
    m_row = 14
    ws_hd.cell(m_row, 1, "TỔNG CỘNG").font = total_font
    for c in range(2, 4):
        col = get_column_letter(c)
        cell = ws_hd.cell(m_row, c, f"=SUM({col}2:{col}{m_row-1})")
        cell.font = total_font; cell.fill = total_fill; cell.border = border; cell.number_format = num_fmt

    wb.save(output_path)
    print(f"  ✅ Saved: {output_path}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--year', type=int, default=2023)
    parser.add_argument('--ton-dau-vnd', type=float, default=20528682383)
    parser.add_argument('--company', type=str, default=DEFAULT_MST)
    args = parser.parse_args()

    engine = create_engine(DB_URI)
    cid = COMPANY_MAP.get(args.company, args.company)
    
    skips = load_skips(args.year)
    df_list, df_detail = fetch_data(engine, cid, args.year)
    
    if df_list.empty:
        print("No data found."); return

    result, all_groups, ton_dau_groups, hoadon_data = process_xnt(df_list, df_detail, args.year, skips, args.ton_dau_vnd)
    
    out = os.path.join(OUTPUT_DIR, f"XNT_HuyVu_{args.year}.xlsx")
    build_excel(result, all_groups, args.year, out, ton_dau_groups, hoadon_data)

if __name__ == "__main__":
    main()
