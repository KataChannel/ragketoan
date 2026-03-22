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

print("Fetching products...")
rows = run_query(sql)

main_cats = {
    "Camera & Security": ["Camera", "Đầu ghi", "DVR", "NVR", "HIK", "Hikvision", "Kbvision", "Dahua", "Ezviz", "Imou", "CQS"],
    "Máy tính (PC/Laptop)": ["Máy tính", "PC", "Laptop", "Notebook", "Workstation", "Dell", "Asus", "HP", "Lenovo", "Acer", "Macbook", "Máy chủ"],
    "Linh kiện máy tính": ["CPU", "Main", "RAM", "VGA", "Card", "Nguồn", "Case", "Quạt", "SSD", "HDD", "Ổ cứng", "BBP", "BMC", "CPD"],
    "Mạng & Kết nối": ["Router", "Switch", "Wifi", "Modem", "Cáp mạng", "TPLink", "DLink", "Cisco"],
    "Thiết bị văn phòng": ["Máy in", "Mực", "Phím", "Chuột", "Bàn phím", "Scanner", "Photocopier", "BPK", "CTD"],
    "Phần mềm": ["Phần mềm", "Windows", "Office", "Microsoft", "Antivirus"],
    "Dịch vụ & Thi công": ["Thi công", "Lắp đặt", "Sửa chữa", "Dịch vụ", "Bảo trì", "Vận chuyển"],
    "Khác / Chưa phân loại": []
}

def get_main_cat(name):
    name_low = name.lower()
    for cat, keywords in main_cats.items():
        if not keywords: continue
        for kw in keywords:
            if kw.lower() in name_low: return cat
    return "Khác / Chưa phân loại"

# Extract Potential Model words
# Looks for uppercase alphanumeric patterns like H61, DS-xxxx, L805, etc.
model_regex = re.compile(r'\b[A-Z0-9-]{3,}\b')

group_counts = Counter()
item_mapping = []

for r in rows:
    if len(r) < 2: continue
    ma, ten = r[0], r[1]
    cat = get_main_cat(ten)
    
    # Try to find a model/pattern
    models = model_regex.findall(ten)
    best_model = ""
    # We prefer some brand-like words or the first alphanumeric pattern
    for m in models:
        # Ignore common long words that aren't models if any? But 3+ chars alphanumeric is usually a model.
        # Skip units like 8GB, 1TB? 
        if m in ["1TB", "2TB", "4GB", "8GB", "USB", "SSD", "HDD", "RAM", "VGA", "CPU", "MAIN", "CASE", "QUAT"]:
            continue
        best_model = m
        break
    
    # Define group name
    if best_model:
        group_name = f"{cat} - {best_model.strip('-')}"
    else:
        # If no model found, just group by first 2 words if possible
        words = ten.split()
        if len(words) >= 2:
            group_name = f"{cat} - {' '.join(words[:2]).strip('-')}"
        else:
            group_name = f"{cat} - General"
            
    group_counts[group_name] += 1
    item_mapping.append((ma, ten, group_name))

# Keep top 380 groups to ensure total is well under 400
top_groups_tup = group_counts.most_common(380)
final_groups = set([g for g, count in top_groups_tup])

# Consolidate others
report_data = Counter()
for ma, ten, grp in item_mapping:
    if grp in final_groups:
        report_data[grp] += 1
    else:
        main_cat = get_main_cat(ten)
        report_data[f"{main_cat} - Khác"] += 1

output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md"

with open(output_path, "w", encoding="utf-8") as f:
    f.write("# Tổng Hợp Danh Mục & Phân Loại Mặt Hàng (Theo Model)\n\n")
    f.write(f"Phân tích hệ thống **{len(rows):,}** mặt hàng, đã gom thành **{len(report_data):,}** nhóm chi tiết (Cấp Model/Nhãn hiệu).\n\n")
    f.write("## 1. Top 50 nhóm mặt hàng có số lượng mã lớn nhất\n")
    f.write("| Nhóm Chi Tiết (Model/Mô tả) | Số lượng mã hàng |\n")
    f.write("| :--- | :---: |\n")
    
    for grp, count in report_data.most_common(50):
        f.write(f"| {grp} | {count:,} |\n")
    
    f.write("\n## 2. Toàn bộ danh sách phân nhóm (Dưới 400 nhóm)\n")
    # Group by Main Category for readability
    sorted_groups = sorted(report_data.items(), key=lambda x: x[0])
    current_cat = ""
    for grp, count in sorted_groups:
        cat_of_grp = grp.split(" - ")[0]
        if cat_of_grp != current_cat:
            current_cat = cat_of_grp
            f.write(f"\n### {current_cat}\n")
        f.write(f"- **{grp.replace(current_cat + ' - ', '')}**: {count:,} mã\n")

print(f"Report generated at {output_path}")
