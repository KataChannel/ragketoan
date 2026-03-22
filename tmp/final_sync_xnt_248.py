import pandas as pd
import os
import re

# 1. Read the 248 Groups from the file
groups_file = "/chikiet/kata2025/ragketoan/tmp/groups_248.txt"
if not os.path.exists(groups_file):
    # Try to re-grep if file is somehow gone
    os.system(f"grep '| \\*\\*[A-Z]\\{{2,3\\}}-[0-9]\\{{3\\}}\\*\\*' /chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_danh_muc_san_pham.md > {groups_file}")

with open(groups_file, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Format: | STT | **CODE** | NAME | ...
group_list = []
for line in lines:
    parts = [p.strip() for p in line.split("|") if p.strip()]
    if len(parts) >= 3:
        code = parts[1].replace("**", "")
        name = parts[2]
        group_list.append({"code": code, "name": name})

# Helper for mapping HHP groups (133) to the New 248
def map_hhp_to_248(hhp_name, grp_list):
    hhp_low = hhp_name.lower()
    # Strategy: Match model keyword from 248 name with the HHP item name
    for g in grp_list:
        if "khác" in g["name"].lower(): continue
        model = g["name"].split(" - ")[-1].lower()
        if model and model in hhp_low:
            return g
            
    # Heuristic for Category if no direct model match
    cat_found = "Khác / Chưa phân loại"
    if any(k in hhp_low for k in ["pc", "máy tính", "laptop"]): cat_found = "Máy tính (PC/Laptop)"
    elif any(k in hhp_low for k in ["máy in", "mực", "chuột", "bàn phím"]): cat_found = "Thiết bị văn phòng"
    elif any(k in hhp_low for k in ["cam", "đầu ghi"]): cat_found = "Camera & An ninh"
    elif any(k in hhp_low for k in ["mạng", "wifi", "switch", "net"]): cat_found = "Mạng & Kết nối"
    elif any(k in hhp_low for k in ["linh kiện", "ram", "ssd", "ổ cứng"]): cat_found = "Linh kiện máy tính"
    elif any(k in hhp_low for k in ["màn hình", "lcd"]): cat_found = "Màn hình (Monitors)"
    elif any(k in hhp_low for k in ["thi công", "dịch vụ"]): cat_found = "Dịch vụ & Thi công"
    elif any(k in hhp_low for k in ["phần mềm", "win"]): cat_found = "Phần mềm"

    # Default to "Khác" group for that category
    for g in grp_list:
        if "khác" in g["name"].lower() and cat_found in g["name"]:
            return g
            
    return {"code": "OTH-XXX", "name": f"Khác / Chưa phân loại"}

# 2. Read the 2023 Data from Excel (133 HHP entries)
data_excel = "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu2023.xlsx"
df_2023 = pd.read_excel(data_excel, sheet_name='xnt12thang')
df_2023 = df_2023[df_2023['Mã - Tên Hàng'].notnull()]

# 3. Perform Mapping
mapped_2023 = []
for idx, row in df_2023.iterrows():
    hhp_item = str(row['Mã - Tên Hàng'])
    target_grp = map_hhp_to_248(hhp_item, group_list)
    mapped_2023.append({
        "maNhom": target_grp["code"],
        "tenNhom": target_grp["name"],
        "HHP_Item": hhp_item,
        "Nhập_SL": row.get('Nhập (SL)', 0),
        "Nhập_Tiền": row.get('Nhập (Tiền)', 0),
        "Xuất_SL": row.get('Xuất (SL)', 0),
        "Xuất_Tiền": row.get('Xuất (Tiền)', 0),
        "Đầu_Kỳ_SL": row.get('Đầu Kỳ (SL)', 0),
        "Đầu_Kỳ_Tiền": row.get('Đầu Kỳ (Tiền)', 0)
    })

mdf = pd.DataFrame(mapped_2023)

# Aggregate into the 248 Categories
agg_2023 = mdf.groupby(["maNhom", "tenNhom"]).agg({
    "HHP_Item": "nunique",
    "Đầu_Kỳ_SL": "sum",
    "Đầu_Kỳ_Tiền": "sum",
    "Nhập_SL": "sum",
    "Nhập_Tiền": "sum",
    "Xuất_SL": "sum",
    "Xuất_Tiền": "sum"
}).reset_index()

# Merge with full 248 list
full_df = pd.DataFrame(group_list).rename(columns={"code": "maNhom", "name": "tenNhom"})
final_xnt = pd.merge(full_df, agg_2023, on=["maNhom", "tenNhom"], how="left").fillna(0)
final_xnt["Cuối_Kỳ_SL"] = final_xnt["Đầu_Kỳ_SL"] + final_xnt["Nhập_SL"] - final_xnt["Xuất_SL"]
final_xnt["Cuối_Kỳ_Tiền"] = final_xnt["Đầu_Kỳ_Tiền"] + final_xnt["Nhập_Tiền"] - final_xnt["Xuất_Tiền"]

# 4. Generate Files
output_md = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.md"
output_xlsx = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx"

# Write Excel
with pd.ExcelWriter(output_xlsx) as writer:
    final_xnt.to_excel(writer, sheet_name='Summary_248_Groups', index=False)
    mdf.to_excel(writer, sheet_name='Mapping_Detail_HHP', index=False)

# Write MD
def vn_fmt(x): return f"{x:,.0f}".replace(',', '.') if isinstance(x, (int, float)) else str(x)

with open(output_md, "w", encoding="utf-8") as f:
    f.write("# Báo Cáo Tổng Hợp Xuất Nhập Tồn (XNT) Năm 2023 (248 Nhóm)\n\n")
    f.write("| STT | Mã Nhóm | Tên Nhóm Sản Phẩm | Nhập (SL) | Nhập (VNĐ) | Xuất (SL) | Xuất (VNĐ) | Tồn Cuối (SL) |\n")
    f.write("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |\n")
    for i, r in final_xnt.iterrows():
        f.write(f"| {i+1} | **{r['maNhom']}** | {r['tenNhom']} | {vn_fmt(r['Nhập_SL'])} | {vn_fmt(r['Nhập_Tiền'])} | {vn_fmt(r['Xuất_SL'])} | {vn_fmt(r['Xuất_Tiền'])} | {vn_fmt(r['Cuối_Kỳ_SL'])} |\n")

print(f"DONE: Excel has {len(final_xnt)} rows in Main sheet.")
