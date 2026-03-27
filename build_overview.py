import psycopg2
import pandas as pd
from collections import defaultdict
import os
import re

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
HUY_VU_MST = "5900363291"
OUTPUT_FILE = "/chikiet/kata2025/ragketoan/docs/huyvu/overview.md"

def map_item(ten_hang):
    if not ten_hang: return "OTHER"
    h = str(ten_hang).lower()
    if re.search(r'optiplex|ins.*3910|mt.*3910|3000.*dell|vostro|laptop|thinkpad', h): return "PC/LAPTOP"
    if re.search(r'canon|hp\s*laser|brother|epson|mực|cartridge|drum', h): return "PRINTER/INK"
    if re.search(r'lcm|lcd|monitor|màn\s*hình', h): return "MONITOR"
    if re.search(r'ssd|hdd|ram|main|vga|psu|case|nguồn', h): return "COMPONENTS"
    if re.search(r'camera|imou|c6n|đầu\s*ghi', h): return "SECURITY"
    return "OTHER"

print("Querying database for overview...")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f'SELECT nam, "tenHang", "soLuongNhap", "soLuongXuat", "giaTriNhap", "giaTriXuat" FROM ext_tonghop WHERE "congtyMst" = \'{HUY_VU_MST}\'')
raw_data = cur.fetchall()
conn.close()

# summary[year][cat]
summary = defaultdict(lambda: defaultdict(lambda: {"n_qty": 0, "x_qty": 0, "n_val": 0, "x_val": 0}))

for y, ten, n_q, x_q, n_v, x_v in raw_data:
    cat = map_item(ten)
    summary[y][cat]["n_qty"] += float(n_q or 0)
    summary[y][cat]["x_qty"] += float(x_q or 0)
    summary[y][cat]["n_val"] += float(n_v or 0)
    summary[y][cat]["x_val"] += float(x_v or 0)

content = ["# Tổng quan Kinh doanh Huy Vũ (2023 - 2026)", ""]
for y in sorted(summary.keys()):
    content.append(f"## Năm {y}")
    content.append("| Nhóm Ngành | Nhập (SL) | Xuất (SL) | Nhập (GT) | Xuất (GT) |")
    content.append("| :--- | :---: | :---: | :---: | :---: |")
    for cat in sorted(summary[y].keys()):
        s = summary[y][cat]
        content.append(f"| {cat} | {s['n_qty']:,.0f} | {s['x_qty']:,.0f} | {s['n_val']:,.0f} | {s['x_val']:,.0f} |")
    content.append("")

with open(OUTPUT_FILE, "w") as f:
    f.write("\n".join(content))

print(f"Generated: {OUTPUT_FILE}")
