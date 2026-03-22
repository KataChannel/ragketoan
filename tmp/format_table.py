import re

file_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Category to Prefix mapping (based on the previous step)
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

# Find Section 4 and extract all groups
# Structure: ### Category\n- **Model**: Count...
section_4_start = content.find("## 4. Danh sách")
if section_4_start == -1:
    print("Could not find section 4")
    exit()

header = content[:section_4_start]
# We want to keep Section 1, 2, 3 as they are, but update Section 4.

# Extract lines from Section 4
lines = content[section_4_start:].split("\n")
table_rows = []
current_cat = ""
prefix_counters = {p: 0 for p in cat_to_prefix.values()}

idx = 1
for line in lines:
    cat_match = re.match(r"^### (.*)", line)
    if cat_match:
        current_cat = cat_match.group(1).strip()
        continue
    
    group_match = re.search(r"^- \*\*(.*)\*\*: (.*) mã hàng", line)
    if group_match:
        model = group_match.group(1).strip()
        count = group_match.group(2).strip()
        
        prefix = cat_to_prefix.get(current_cat, "OTH")
        prefix_counters[prefix] += 1
        suggested_code = f"{prefix}-{prefix_counters[prefix]:03d}"
        
        table_rows.append(f"| {idx} | **{suggested_code}** | {current_cat} - {model} | {count} |")
        idx += 1

# Generate New Section 4
new_section_4 = "## 4. Bảng Đề Xuất Mã Nhóm Chi Tiết (389 Nhóm)\n\n"
new_section_4 += "| STT | Mã Nhóm Đề Xuất | Tên Nhóm Chi Tiết (Model) | Số lượng mã hàng |\n"
new_section_4 += "| :--- | :--- | :--- | :---: |\n"
new_section_4 += "\n".join(table_rows)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(header + new_section_4)

print("Report updated with table.")
