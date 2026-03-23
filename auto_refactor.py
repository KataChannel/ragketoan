import psycopg2
import pandas as pd
import re
import os

from build_xnt_final import map_to_group, groups

MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()
query = """
    SELECT d.ten, COUNT(d.id), SUM(d.sluong), SUM(d.thtien)
    FROM ext_listhoadon h
    JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='5900363291' OR h.nmmst='5900363291')
    AND EXTRACT(YEAR FROM h.tdlap) = 2023
    GROUP BY d.ten
"""
cur.execute(query)
rows = cur.fetchall()

# Count active groups
mapped_groups_count = {g['code']: 0 for g in groups}
for ten, count, sluong, thtien in rows:
    grp = map_to_group(ten)
    mapped_groups_count[grp['code']] += count

active_groups = [g for g in groups if mapped_groups_count[g['code']] > 0]

new_groups = [
    {"code": "IT-001", "name": "Màn hình máy tính & Tivi", "aliases": "màn hình, tivi, lcd, monitor, display"},
    {"code": "IT-002", "name": "Ổ cứng & Lưu trữ hệ thống", "aliases": "ổ cứng, ssd, hdd, lưu trữ, western digital"},
    {"code": "IT-003", "name": "Máy quét văn bản (Scanner)", "aliases": "máy quét, scanner, scanjet"},
    {"code": "VP-050", "name": "Nội thất & Thiết bị văn phòng", "aliases": "ghế, nệm, giường, kệ mica, bàn, đệm, tủ"},
    {"code": "OTH-085", "name": "Thiết bị liên lạc vô tuyến", "aliases": "bộ đàm, kenwood, motorola"},
    {"code": "FI-001", "name": "Giao dịch tài chính & Tín dụng", "aliases": "thu lại, tín dụng, trích thu tiền vay, lãi suất"}
]

# Write back to MD
with open(MD_PATH, "r", encoding="utf-8") as f:
    orig_lines = f.readlines()

new_lines = [
    "# DANH MỤC NHÓM SẢN PHẨM (KẾ TOÁN)",
    "",
    "Dưới đây là danh mục các nhóm sản phẩm có phát sinh giao dịch thực tế trong năm 2023, đã được tối ưu độ sạch dữ liệu (bỏ đi các nhóm 0 phát sinh và gộp các mặt hàng phổ biến thoát khỏi nhóm Khác).",
    "",
    "| STT | Mã Nhóm (Đại diện) | Tên Nhóm Sản Phẩm | Từ khóa tương đồng (Alias) |",
    "|:---:|:-------------------|:-------------------|:---------------------------|"
]

# We need to preserve the aliases that we generated previously in update_danh_muc.py
# If we read from the current file we can extract the existing aliases
existing_aliases = {}
for line in orig_lines:
    parts = line.split("|")
    if len(parts) >= 5:
        stt = parts[1].strip()
        if stt.isdigit():
            existing_aliases[parts[2].strip()] = parts[4].strip()

stt = 1
for g in active_groups:
    code = g['code']
    name = g['name']
    alias = existing_aliases.get(code, name.split('-')[-1].strip())
    new_lines.append(f"| {stt} | {code} | {name} | {alias} |")
    stt += 1

for g in new_groups:
    new_lines.append(f"| {stt} | {g['code']} | {g['name']} | {g['aliases']} |")
    stt += 1

with open(MD_PATH, "w", encoding="utf-8") as f:
    for nl in new_lines:
        f.write(nl + "\n")

print("Generated new DANH_MUC.md with", stt-1, "groups.")

# Refactoring build_xnt_final.py to use dynamic aliases from MD
with open("build_xnt_final.py", "r", encoding="utf-8") as f:
    script_content = f.read()

# Replace the loading part to also load aliases
new_load_logic = '''
groups = []
kw_mapping = {}
with open(MD_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 5:
            parts = [p.strip() for p in line.split("|")]
            stt_str = parts[1]
            if stt_str.isdigit():
                code = parts[2]
                name = parts[3]
                aliases_raw = parts[4]
                aliases = [a.strip().lower() for a in aliases_raw.split(',') if a.strip()]
                groups.append({"code": code, "name": name})
                kw_mapping[code] = aliases
'''
# Using regex to replace the old loading logic
import re
script_content = re.sub(r'groups\s*=\s*\[\]\nwith open\(MD_PATH.*?groups\.append\(\{"code": parts\[2\], "name": parts\[3\]\}\)', new_load_logic.strip(), script_content, flags=re.DOTALL)

# Refactor map_to_group body
new_map_to_group = '''def map_to_group(tenHang):
    hhp_low = str(tenHang or '').lower()
    norm_ten = re.sub(r'[^a-z0-9]', '', hhp_low)
    words = set(re.findall(r'[a-z0-9]+', hhp_low))
    
    # 1. Match based on MD aliases
    for code, keywords in kw_mapping.items():
        # strict alias matching
        for kw in keywords:
            # using exact substring match or word match
            kw_words = set(re.findall(r'[a-z0-9]+', kw.lower()))
            if kw_words and kw_words.issubset(words):
                for g in groups:
                    if g['code'] == code:
                        return g
            norm_kw = re.sub(r'[^a-z0-9]', '', kw.lower())
            if norm_kw and len(norm_kw) >= 4 and norm_kw in norm_ten:
                for g in groups:
                    if g['code'] == code:
                        return g

    # 2. General logic fallback to "Khác"
    cat_found = "Vật tư kỹ thuật khác chưa phân loại"
    if any(k in hhp_low for k in ["pc", "máy tính", "laptop", "cpu", "main", "ram", "vga", "bo mạch", "desktop"]):
        cat_found = "Máy tính (PC/Laptop) - Khác"
    elif any(k in hhp_low for k in ["máy in", "mực", "chuột", "bàn phím", "văn phòng", "máy photo", "giấy", "bút", "kẹp", "bìa", "băng dính"]):
        cat_found = "Thiết bị văn phòng - Khác"
    elif any(k in hhp_low for k in ["cam", "đầu ghi", "hikvision", "kbone", "imou", "ezviz", "camera"]):
        cat_found = "Thiết bị Ghi hình & Hội nghị kỹ thuật số"
    elif any(k in hhp_low for k in ["thi công", "dịch vụ", "cước", "lệ phí"]):
        cat_found = "Dịch vụ & Thi công - Tổng hợp"

    for g in groups:
        if g['name'] == cat_found:
            return g
    
    # fallback directly to OTH-017 if exists
    for g in groups:
        if g['code'] == 'OTH-017':
            return g
            
    return groups[0] if groups else {"code": "OTH-NA", "name": "Unknown"}'''

script_content = re.sub(r'def map_to_group\(tenHang\):.*?(?=\nprint\(f"Loaded)', new_map_to_group + "\n\n", script_content, flags=re.DOTALL)

with open("build_xnt_final.py", "w", encoding="utf-8") as f:
    f.write(script_content)

print("Refactored build_xnt_final.py")
