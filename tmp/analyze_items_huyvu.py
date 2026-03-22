import subprocess
import csv
import io
import re

def run_query(sql):
    result = subprocess.run(
        ["psql", "-h", "localhost", "-U", "root", "-d", "ketoan", "--csv", "-c", sql],
        env={"PGPASSWORD": "password"},
        capture_output=True,
        text=True
    )
    if result.returncode != 0: return []
    f = io.StringIO(result.stdout)
    reader = csv.reader(f)
    next(reader) 
    return list(reader)

sql = """
SELECT DISTINCT "maHang", "tenHang"
FROM ext_tonghop
WHERE ("nbmst" = '5900363291' OR "nmmst" = '5900363291')
  AND tdlap >= '2023-01-01'
"""

print("Fetching unique products...")
rows = run_query(sql)

categories = {
    "Camera & Thiết bị an ninh": ["Camera", "Đầu ghi", "DVR", "NVR", "Hikvision", "Kbvision", "Dahua", "Ezviz", "Imou", "CQS", "HIK"],
    "Máy tính (PC/Laptop)": ["Máy tính", "PC", "Laptop", "Workstation", "Dell", "Asus", "HP", "Lenovo", "Acer", "Macbook"],
    "Linh kiện máy tính (Components)": ["CPU", "Main", "RAM", "VGA", "Card", "Nguồn", "Case", "Quạt", "Cooler", "SSD", "HDD", "Ổ cứng", "BBP", "BMC", "CPD"],
    "Mạng & Kết nối": ["Router", "Switch", "Wifi", "Modem", "Cáp mạng", "Patch", "Modul", "TPLink", "DLink", "Cisco", "Mikrotik"],
    "Màn hình (Monitors)": ["Màn hình", "Monitor", "LCD", "MHM"],
    "Thiết bị văn phòng": ["Máy in", "Mực", "Phím", "Chuột", "Bàn phím", "Scanner", "Photocopier", "BPK", "CTD"],
    "Phần mềm (Software)": ["Phần mềm", "Windows", "Office", "Microsoft", "Antivirus", "Subscription", "License"],
    "Dịch vụ & Thi công": ["Thi công", "Lắp đặt", "Sửa chữa", "Dịch vụ", "Bảo trì", "Vận chuyển", "Cài đặt"],
    "Khác / Chưa phân loại": []
}

def get_category(name):
    name_low = name.lower()
    for cat, keywords in categories.items():
        if not keywords: continue
        for kw in keywords:
            if kw.lower() in name_low:
                return cat
    return "Khác / Chưa phân loại"

report_data = {cat: 0 for cat in categories}
total_items = len(rows)

for r in rows:
    if len(r) < 2: continue
    ma, ten = r[0], r[1]
    cat = get_category(ten)
    report_data[cat] += 1

output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md"

with open(output_path, "w", encoding="utf-8") as f:
    f.write("# Tổng Hợp Danh Mục Mặt Hàng Công Ty Huy Vũ (2023 - 2026)\n\n")
    f.write(f"Dựa trên phân tích toàn bộ **{total_items:,}** mặt hàng đã phát sinh từ 01/01/2023 đến 01/01/2026.\n\n")
    
    f.write("## 1. Thống kê tổng quan\n")
    f.write(f"- **Tổng số lượng mặt hàng (duy nhất)**: {total_items:,}\n")
    f.write(f"- **Số nhóm đề xuất**: {len(categories)}\n\n")
    
    f.write("## 2. Phân nhóm mặt hàng\n")
    f.write("| Nhóm Mặt Hàng | Số lượng mặt hàng | Tỷ lệ |\n")
    f.write("| :--- | :---: | :---: |\n")
    
    sorted_cats = sorted(report_data.items(), key=lambda x: x[1], reverse=True)
    for cat, count in sorted_cats:
        percent = (count / total_items) * 100 if total_items > 0 else 0
        f.write(f"| {cat} | {count:,} | {percent:.1f}% |\n")
        
    f.write("\n## 3. Top từ khóa định danh chính\n")
    for cat, keywords in categories.items():
        if keywords:
            f.write(f"- **{cat}**: {', '.join(keywords[:10])}...\n")

print(f"Report generated at {output_path}")
