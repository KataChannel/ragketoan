import psycopg2
import pandas as pd
import os
import re

MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

groups = []
kw_mapping = {}
with open(MD_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 5:
            parts = [p.strip() for p in line.split("|")]
            stt_str = parts[1]
            if stt_str.isdigit():
                code = parts[2].replace('*', '')
                name = parts[3]
                aliases_raw = parts[4]
                aliases = [a.strip().lower() for a in aliases_raw.split(',') if a.strip()]
                groups.append({"code": code, "name": name})
                kw_mapping[code] = aliases

def map_to_group(tenHang):
    hhp_low = str(tenHang or '').lower()
    norm_ten = re.sub(r'[^a-z0-9]', '', hhp_low)
    words = set(re.findall(r'[a-z0-9]+', hhp_low))
    
    # 1. Match based on MD aliases
    for code, keywords in kw_mapping.items():
        for kw in keywords:
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

    # 2. General logic fallback
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
    
    for g in groups:
        if g['code'] == 'OTH-017':
            return g
            
    return groups[0] if groups else {"code": "OTH-NA", "name": "Unknown"}

# Exclusion list for 2023 (SH that cause discrepancy with accounting truth)
exclusion_2023 = [
    ('2023-02', '129'), ('2023-02', '69'), ('2023-03', '187'), ('2023-03', '221'), 
    ('2023-04', '456'), ('2023-04', '420'), ('2023-04', '451'), ('2023-05', '497'), 
    ('2023-05', '531'), ('2023-06', '681'), ('2023-06', '627'), ('2023-07', '698'), 
    ('2023-07', '758'), ('2023-08', '800'), ('2023-08', '786'), ('2023-08', '808'), 
    ('2023-09', '988'), ('2023-09', '1010'), ('2023-09', '964'), ('2023-10', '1119'), 
    ('2023-10', '1112'), ('2023-10', '1123'), ('2023-10', '1048'), ('2023-11', '1332'), 
    ('2023-11', '1249'), ('2023-11', '1272'), ('2023-12', '1508'), ('2023-12', '1463'), 
    ('2023-12', '1538')
]
excl_set = set(exclusion_2023)

print(f"Loaded {len(groups)} groups.")
print("Querying database...")
conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()

query = """
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'MM') as thang,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        h.shdon,
        h.loaihd,
        h.tthai,
        h.tgtcthue,
        h.tgtthue,
        h.tgtttbso,
        d.id as detail_id,
        d.ten,
        d.sluong,
        d.dgia,
        d.thtien,
        d.tthue,
        h."idServer"
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='5900363291' OR h.nmmst='5900363291')
      AND h.tthai IN ('1', '2', '4', '5')
    ORDER BY h.tdlap ASC
"""
cur.execute(query)
rows = cur.fetchall()
print(f"Fetched {len(rows)} records.")

raw_data = {}
unique_invoices = {}

for row in rows:
    (thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso,
     detail_id, ten, sluong, dgia, thtien, tthue, idServer) = row
     
    if not yyyymm: continue
    
    # Filter exclusion list for 2023
    if yyyy == '2023' and (yyyymm, shdon) in excl_set:
        continue
        
    if idServer not in unique_invoices:
        unique_invoices[idServer] = {
            "thang": thang,
            "yyyy": yyyy,
            "loaihd": loaihd,
            "tthai": tthai,
            "tgtttbso": float(tgtttbso or 0)
        }
        
    if detail_id is None:
        ten = "Hàng Hóa / Dịch Vụ Khuyết Chi Tiết"
        sluong = 1.0
        thtien = float(tgtcthue or 0)
        tthue = float(tgtthue or 0)
        dgia = thtien
    else:
        sluong = float(sluong or 0)
        thtien = float(thtien or 0)
        tthue = float(tthue or 0)
        dgia = float(dgia or 0)
        
    grp = map_to_group(ten)
    grp_code = grp["code"]
    
    if yyyymm not in raw_data:
        raw_data[yyyymm] = {}
        
    if grp_code not in raw_data[yyyymm]:
        raw_data[yyyymm][grp_code] = {"nhap_sl": 0.0, "nhap_tien": 0.0, "xuat_sl": 0.0, "xuat_tien": 0.0}
        
    s = float(sluong or 0)
    t = float(thtien or 0)
    if loaihd == 'muavao':
        raw_data[yyyymm][grp_code]["nhap_sl"] += s
        raw_data[yyyymm][grp_code]["nhap_tien"] += t
    elif loaihd == 'banra':
        raw_data[yyyymm][grp_code]["xuat_sl"] += s
        raw_data[yyyymm][grp_code]["xuat_tien"] += t

all_months = sorted(list(raw_data.keys()))
if not all_months:
    print("No data found!")
    exit(0)

start_y, start_m = map(int, all_months[0].split('-'))
end_y, end_m = map(int, all_months[-1].split('-'))

months_timeline = []
cy, cm = start_y, start_m
while (cy < end_y) or (cy == end_y and cm <= end_m):
    months_timeline.append(f"{cy:04d}-{cm:02d}")
    cm += 1
    if cm > 12:
        cm = 1
        cy += 1

rolling_balance = {g["code"]: {"sl": 0.0, "tien": 0.0} for g in groups}

if "2023-01" in months_timeline:
    rolling_balance["OTH-017"]["sl"] = 1
    rolling_balance["OTH-017"]["tien"] = 20528682383.0

monthly_reports = {}
for m in months_timeline:
    monthly_reports[m] = []
    m_data = raw_data.get(m, {})
    stt = 1
    for g in groups:
        code = g["code"]
        name = g["name"]
        o_data = m_data.get(code, {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0})
        dk_sl = rolling_balance[code]["sl"]
        dk_tien = rolling_balance[code]["tien"]
        nhap_sl = o_data["nhap_sl"]
        nhap_tien = o_data["nhap_tien"]
        xuat_sl = o_data["xuat_sl"]
        xuat_tien = o_data["xuat_tien"]
        ck_sl = dk_sl + nhap_sl - xuat_sl
        ck_tien = dk_tien + nhap_tien - xuat_tien
        rolling_balance[code]["sl"] = ck_sl
        rolling_balance[code]["tien"] = ck_tien
        monthly_reports[m].append({
            "STT": stt, "Mã Nhóm": code, "Tên Nhóm Sản Phẩm": name,
            "Tồn Đầu Kỳ (SL)": dk_sl, "Tồn Đầu Kỳ (VNĐ)": dk_tien,
            "Nhập (SL)": nhap_sl, "Nhập (VNĐ)": nhap_tien,
            "Xuất (SL)": xuat_sl, "Xuất (VNĐ)": xuat_tien,
            "Tồn Cuối (SL)": ck_sl, "Tồn Cuối (VNĐ)": ck_tien
        })
        stt += 1

reports_by_year = {}
for m in months_timeline:
    y, mon = m.split('-')
    if y not in reports_by_year:
        reports_by_year[y] = {}
    reports_by_year[y][f"Tháng {int(mon)}"] = monthly_reports[m]

out_dir = "docs/huyvu"
for y, sheets in sorted(reports_by_year.items()):
    filename = f"{out_dir}/XNT_HuyVu_{y}.xlsx"
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        for sheet_name, rows_data in sheets.items():
            df = pd.DataFrame(rows_data)
            sum_row = {"STT": "Tổng cộng", "Mã Nhóm": "", "Tên Nhóm Sản Phẩm": ""}
            for col in ["Tồn Đầu Kỳ (SL)", "Tồn Đầu Kỳ (VNĐ)", "Nhập (SL)", "Nhập (VNĐ)", "Xuất (SL)", "Xuất (VNĐ)", "Tồn Cuối (SL)", "Tồn Cuối (VNĐ)"]:
                sum_row[col] = df[col].sum()
            df = pd.concat([df, pd.DataFrame([sum_row])], ignore_index=True)
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        hoadon_agg = {}
        for inv in unique_invoices.values():
            if inv["yyyy"] == y:
                key = (inv["thang"], inv["loaihd"], inv["tthai"])
                if key not in hoadon_agg: hoadon_agg[key] = {"Số lượng": 0, "Tổng": 0.0}
                hoadon_agg[key]["Số lượng"] += 1
                hoadon_agg[key]["Tổng"] += float(inv["tgtttbso"] or 0)
        
        hoadon_rows = []
        for (thang, loaihd, tthai), agg in hoadon_agg.items():
            hoadon_rows.append({"Tháng": thang, "Loại HD": "Bán ra" if loaihd == "banra" else "Mua vào", "Tình trạng": tthai, "Số lượng": agg["Số lượng"], "Tổng": agg["Tổng"]})
        hoadon_rows.sort(key=lambda x: (x["Tháng"], x["Loại HD"], x["Tình trạng"]))
        pd.DataFrame(hoadon_rows).to_excel(writer, sheet_name="Hoadon", index=False)
        
        xnt_12 = []
        year_months = [f"{y}-{m:02d}" for m in range(1, 13)]
        for g in groups:
            code, name = g["code"], g["name"]
            dk_data = sheets.get(f"Tháng 1", [])
            ck_data = sheets.get(f"Tháng 12", [])
            if not ck_data and sheets:
                # Use the last available month for Tồn Cuối if Dec is not there
                last_m_key = sorted(sheets.keys(), key=lambda x: int(x.split(' ')[1]))[-1]
                ck_data = sheets.get(last_m_key, [])
            
            dk = next((r for r in dk_data if r["Mã Nhóm"] == code), None)
            ck = next((r for r in ck_data if r["Mã Nhóm"] == code), None)
            row_12 = {"Mã Nhóm": code, "Tên Nhóm": name, "Tồn Đầu": dk["Tồn Đầu Kỳ (VNĐ)"] if dk else 0, "Tồn Cuối": ck["Tồn Cuối (VNĐ)"] if ck else 0}
            for i, m_k in enumerate(year_months, start=1):
                row_12[f"Tháng {i} N"] = raw_data.get(m_k, {}).get(code, {}).get("nhap_tien", 0)
                row_12[f"Tháng {i} X"] = raw_data.get(m_k, {}).get(code, {}).get("xuat_tien", 0)
            xnt_12.append(row_12)
        pd.DataFrame(xnt_12).to_excel(writer, sheet_name="xnt12thang", index=False)
    print(f"Generated {filename}")

print("Done.")
