import subprocess
import csv
import io
import re
from collections import Counter

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

rows = run_query(sql)
total_items = len(rows)

main_cats_def = {
    "Camera & An ninh": ["Camera", "Đầu ghi", "DVR", "NVR", "HIK", "Hikvision", "Kbvision", "Dahua", "Ezviz", "Imou", "CQS"],
    "Máy tính (PC/Laptop)": ["Máy tính", "PC", "Laptop", "Notebook", "Workstation", "Dell", "Asus", "HP", "Lenovo", "Acer", "Macbook", "Máy chủ"],
    "Linh kiện máy tính": ["CPU", "Main", "RAM", "VGA", "Card", "Nguồn", "Case", "Quạt", "SSD", "HDD", "Ổ cứng", "BBP", "BMC", "CPD"],
    "Mạng & Kết nối": ["Router", "Switch", "Wifi", "Modem", "Cáp mạng", "TPLink", "DLink", "Cisco"],
    "Thiết bị văn phòng": ["Máy in", "Mực", "Phím", "Chuột", "Bàn phím", "Scanner", "Photocopier", "BPK", "CTD"],
    "Phần mềm": ["Phần mềm", "Windows", "Office", "Microsoft", "Antivirus"],
    "Dịch vụ & Thi công": ["Thi công", "Lắp đặt", "Sửa chữa", "Dịch vụ", "Bảo trì", "Vận chuyển"],
    "Màn hình (Monitors)": ["Màn hình", "Monitor", "LCD", "MHM"],
    "Khác / Chưa phân loại": []
}

cat_to_prefix = {
    "Camera & An ninh": "CAM",
    "Máy tính (PC/Laptop)": "PC",
    "Linh kiện máy tính": "LNK",
    "Mạng & Kết nối": "NET",
    "Thiết bị văn phòng": "VP",
    "Phần mềm": "SW",
    "Dịch vụ & Thi công": "SRV",
    "Màn hình (Monitors)": "MON",
    "Khác / Chưa phân loại": "OTH"
}

def get_main_cat(name):
    name_low = name.lower()
    for cat, keywords in main_cats_def.items():
        if not keywords: continue
        for kw in keywords:
            if kw.lower() in name_low: return cat
    return "Khác / Chưa phân loại"

model_regex = re.compile(r'\b[A-Z0-9-]{3,}\b')
group_counts_detailed = Counter()
main_cat_counts = Counter()
item_mapping = []

for r in rows:
    ma, ten = r[0], r[1]
    mcat = get_main_cat(ten)
    main_cat_counts[mcat] += 1
    models = model_regex.findall(ten)
    best_model = ""
    for m in models:
        if m in ["1TB", "2TB", "4GB", "8GB", "USB", "SSD", "HDD", "RAM", "VGA", "CPU", "MAIN", "CASE", "QUAT"]: continue
        best_model = m
        break
    if best_model:
        grp = f"{mcat} - {best_model.strip('-')}"
    else:
        words = ten.split()
        grp = f"{mcat} - {' '.join(words[:2]).strip('-')}" if len(words) >= 2 else f"{mcat} - General"
    group_counts_detailed[grp] += 1
    item_mapping.append((ten, grp))

top_380 = [g for g, c in group_counts_detailed.most_common(380)]
top_set = set(top_380)

final_detailed_report = Counter()
for ten, grp in item_mapping:
    if grp in top_set:
        final_detailed_report[grp] += 1
    else:
        mcat = get_main_cat(ten)
        final_detailed_report[f"{mcat} - Khác"] += 1

output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md"

with open(output_path, "w", encoding="utf-8") as f:
    f.write("# Tổng Hợp Danh Mục & Phân Loại Sản Phẩm Huy Vũ (2023 - 2026)\n\n")
    
    f.write("## 1. Thống kê tổng quan\n")
    f.write(f"- **Tổng số lượng mặt hàng**: Hệ thống ghi nhận tổng cộng **{total_items:,}** mặt hàng duy nhất đã phát sinh giao dịch.\n")
    f.write(f"- **Số lượng nhóm chi tiết (Model)**: Đã tối ưu và gom thành **{len(final_detailed_report)}** nhóm (đáp ứng điều kiện dưới 400 nhóm).\n\n")
    
    f.write("## 2. Phân loại theo 9 Nhóm chính\n")
    f.write("| Nhóm Chính | Số lượng mặt hàng | Tỷ trọng | Mã Tiền Tố |\n")
    f.write("| :--- | :---: | :---: | :---: |\n")
    for cat, prefix in cat_to_prefix.items():
        count = main_cat_counts[cat]
        percent = (count / total_items) * 100
        f.write(f"| {cat} | {count:,} | {percent:.1f}% | {prefix} |\n")
    
    f.write("\n## 3. Đề xuất phân nhóm nhỏ (Strategic Sub-categories)\n")
    f.write("Dựa trên thực tế kinh doanh, đề xuất chia 9 nhóm trên thành **25-30 nhóm chiến lược** để tối ưu quản lý kho.\n\n")
    
    f.write("## 4. Bảng Đề Xuất Mã Nhóm Chi Tiết (388 Nhóm)\n")
    f.write("| STT | Mã Nhóm Đề Xuất | Tên Nhóm Chi Tiết (Model) | Số lượng mã hàng |\n")
    f.write("| :--- | :--- | :--- | :---: |\n")
    
    sorted_groups = sorted(final_detailed_report.items(), key=lambda x: x[0])
    prefix_counters = {p: 0 for p in cat_to_prefix.values()}
    
    idx = 1
    for grp, count in sorted_groups:
        cat_of_grp = grp.split(" - ")[0]
        prefix = cat_to_prefix.get(cat_of_grp, "OTH")
        prefix_counters[prefix] += 1
        suggested_code = f"{prefix}-{prefix_counters[prefix]:03d}"
        f.write(f"| {idx} | **{suggested_code}** | {grp} | {count:,} |\n")
        idx += 1

print("Final report with codes generated.")
