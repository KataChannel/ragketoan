import subprocess
import csv
import io
import re
import pandas as pd
import os

def run_query(sql):
    result = subprocess.run(
        ["psql", "-h", "localhost", "-U", "root", "-d", "ketoan", "--csv", "-c", sql],
        env={"PGPASSWORD": "password"},
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return pd.DataFrame()
    return pd.read_csv(io.StringIO(result.stdout))

# 1. Definitions for 248 groups
main_cats_def = {
    "Camera & An ninh": ["Camera", "Đầu ghi", "DVR", "NVR", "HIK", "Hikvision", "Kbvision", "Dahua", "Ezviz", "Imou", "CQS"],
    "Máy tính (PC/Laptop)": ["Máy tính", "PC", "Laptop", "Notebook", "Workstation", "Dell", "Asus", "HP", "Lenovo", "Acer", "Macbook", "Máy chủ"],
    "Linh kiện máy tính": ["CPU", "Main", "RAM", "VGA", "Card", "Nguồn", "Case", "Quạt", "SSD", "HDD", "Ổ cứng", "BBP", "BMC", "CPD"],
    "Mạng & Kết nối": ["Router", "Switch", "Wifi", "Modem", "Cáp mạng", "TPLink", "DLink", "Cisco"],
    "Thiết bị văn phòng": ["Máy in", "Mực", "Phím", "Chuột", "Bàn phím", "Scanner", "Photocopier", "BPK", "CTD"],
    "Phần mềm": ["Phần mềm", "Windows", "Office", "Microsoft", "Antivirus"],
    "Dịch vụ & Thi công": ["Thi công", "Lắp đặt", "Sửa chữa", "Dịch vụ", "Bảo trì", "Vận chuyển"],
    "Màn hình (Monitors)": ["Màn hình", "Monitor", "LCD", "MHM"],
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
    name_low = str(name).lower()
    for cat, keywords in main_cats_def.items():
        for kw in keywords:
            if kw.lower() in name_low: return cat
    return "Khác / Chưa phân loại"

model_regex = re.compile(r'\b[A-Z0-9-]{3,}\b')

# 2. Source from detailhoadon for 2023 for Huy Vu
mst_huyvu = '5900363291'
sql = f"""
SELECT d.ten as "tenHang", d.sluong as sl, d.thtien, l.nbmst, l.nmmst
FROM ext_detailhoadon d
JOIN ext_listhoadon l ON d."idhdonServer" = l."idServer"
WHERE (l.nbmst = '{mst_huyvu}' OR l.nmmst = '{mst_huyvu}')
  AND l.tdlap >= '2023-01-01' AND l.tdlap < '2024-01-01'
  AND l.tthai = '1';
"""

df = run_query(sql)
if df.empty:
    print("Không tìm thấy dữ liệu hóa đơn 2023.")
    exit()

df["sl"] = pd.to_numeric(df["sl"], errors='coerce').fillna(0)
df["thtien"] = pd.to_numeric(df["thtien"], errors='coerce').fillna(0)

def assign_group_logic(ten):
    mcat = get_main_cat(ten)
    models = model_regex.findall(str(ten))
    best_model = ""
    for m in models:
        # Avoid common markers
        if m in ["1TB", "2TB", "4GB", "8GB", "USB", "SSD", "HDD", "RAM", "VGA", "CPU", "MAIN", "CASE", "QUAT", "DDR4", "DDR5", "PCI"]:
            continue
        best_model = m
        break
    if best_model:
        return f"{mcat} - {best_model.strip('-')}"
    return f"{mcat} - Khác"

df["group_tmp"] = df["tenHang"].apply(assign_group_logic)

# Frequency analysis to pick Top 240
group_counts = df["group_tmp"].value_counts()
top_240 = group_counts.head(240).index.tolist()

def finalize_group_name(grp, ten):
    if grp in top_240 and not grp.endswith(" - Khác"): return grp
    mcat = get_main_cat(ten)
    return f"{mcat} - Khác"

df["final_group"] = df.apply(lambda r: finalize_group_name(r["group_tmp"], r["tenHang"]), axis=1)

# Sort and assign codes
distinct_groups = sorted(df["final_group"].unique())
group_to_code = {}
prefix_counters = {p: 0 for p in cat_to_prefix.values()}
for grp in distinct_groups:
    mcat = grp.split(" - ")[0]
    prefix = cat_to_prefix.get(mcat, "OTH")
    prefix_counters[prefix] += 1
    group_to_code[grp] = f"{prefix}-{prefix_counters[prefix]:03d}"

df["maNhom"] = df["final_group"].map(group_to_code)

# 3. Aggregation
df["type"] = df.apply(lambda r: "NHAP" if r["nmmst"] == mst_huyvu else "XUAT", axis=1)

xnt = df.groupby(["maNhom", "final_group"]).apply(lambda x: pd.Series({
    "Unique_Items": x["tenHang"].nunique(),
    "Nhap_SL": x[x["type"] == "NHAP"]["sl"].sum(),
    "Nhap_Tien": x[x["type"] == "NHAP"]["thtien"].sum(),
    "Xuat_SL": x[x["type"] == "XUAT"]["sl"].sum(),
    "Xuat_Tien": x[x["type"] == "XUAT"]["thtien"].sum()
})).reset_index()

xnt["TonCuoi_SL"] = xnt["Nhap_SL"] - xnt["Xuat_SL"]
xnt["TonCuoi_Tien"] = xnt["Nhap_Tien"] - xnt["Xuat_Tien"]

# Formatting
def vn_fmt(x): return f"{x:,.0f}".replace(',', '.')

output_md = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.md"

with open(output_md, "w", encoding="utf-8") as f:
    f.write("# Báo Cáo Tổng Hợp Xuất Nhập Tồn (XNT) Theo 248 Nhóm - Năm 2023\n\n")
    f.write("### Công Ty TNHH Huy Vũ (MST: 5900363291)\n\n")
    f.write("| STT | Mã Nhóm | Tên Nhóm Sản Phẩm | Số Mã Hàng | Nhập (SL) | Nhập (VNĐ) | Xuất (SL) | Xuất (VNĐ) | Tồn Cuối (SL) | Tồn Cuối (VNĐ) |\n")
    f.write("| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n")
    for i, r in xnt.iterrows():
        f.write(f"| {i+1} | **{r['maNhom']}** | {r['final_group']} | {int(r['Unique_Items'])} | {vn_fmt(r['Nhap_SL'])} | {vn_fmt(r['Nhap_Tien'])} | {vn_fmt(r['Xuat_SL'])} | {vn_fmt(r['Xuat_Tien'])} | {vn_fmt(r['TonCuoi_SL'])} | {vn_fmt(r['TonCuoi_Tien'])} |\n")
    
    f.write(f"\n\n---\n*Ghi chú: 'Tồn Cuối' đại diện cho chênh lệch Nhập-Xuất trong năm 2023. Giả định đầu kỳ là 0. - {pd.Timestamp.now()}*")

print("Đã tạo báo cáo tại:", output_md)
