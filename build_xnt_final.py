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
                code = parts[2]
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
            
    return groups[0] if groups else {"code": "OTH-NA", "name": "Unknown"}


print(f"Loaded {len(groups)} groups.")
print("Querying database...")
conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()

query = """
    SELECT 
        to_char(h.tdlap, 'MM') as thang,
        to_char(h.tdlap, 'YYYY-MM') as yyyymm,
        to_char(h.tdlap, 'YYYY') as yyyy,
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
    WHERE h.nbmst='5900363291' OR h.nmmst='5900363291'
    ORDER BY h.tdlap ASC
"""
cur.execute(query)
rows = cur.fetchall()
print(f"Fetched {len(rows)} records (join of listhoadon and detailhoadon).")

raw_data = {}
unique_invoices = {}

for row in rows:
    (thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso,
     detail_id, ten, sluong, dgia, thtien, tthue, idServer) = row
     
    if not yyyymm:
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
        raw_data[yyyymm][grp_code] = {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0}
        
    s = sluong
    t = thtien
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

rolling_balance = {g["code"]: {"sl": 0, "tien": 0} for g in groups}

# Initial Balance config:
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
            "STT": stt,
            "Mã Nhóm": code,
            "Tên Nhóm Sản Phẩm": name,
            "Tồn Đầu Kỳ (SL)": dk_sl,
            "Tồn Đầu Kỳ (VNĐ)": dk_tien,
            "Nhập (SL)": nhap_sl,
            "Nhập (VNĐ)": nhap_tien,
            "Xuất (SL)": xuat_sl,
            "Xuất (VNĐ)": xuat_tien,
            "Tồn Cuối (SL)": ck_sl,
            "Tồn Cuối (VNĐ)": ck_tien
        })
        stt += 1

reports_by_year = {}
for m in months_timeline:
    y, mon = m.split('-')
    if y not in reports_by_year:
        reports_by_year[y] = {}
    reports_by_year[y][f"Thang_{mon}"] = monthly_reports[m]

out_dir = "docs/huyvu"

for y, sheets in reports_by_year.items():
    if int(y) != 2023:
        continue
        
    filename = f"{out_dir}/XNT_HuyVu_{y}.xlsx"
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        
        # 1. Monthly sheets
        for sheet_name, rows_data in sheets.items():
            if rows_data:
                df = pd.DataFrame(rows_data)
                sum_row = {"STT": "Tổng cộng", "Mã Nhóm": "", "Tên Nhóm Sản Phẩm": ""}
                for col in ["Tồn Đầu Kỳ (SL)", "Tồn Đầu Kỳ (VNĐ)", "Nhập (SL)", "Nhập (VNĐ)", "Xuất (SL)", "Xuất (VNĐ)", "Tồn Cuối (SL)", "Tồn Cuối (VNĐ)"]:
                    sum_row[col] = df[col].sum()
                df = pd.concat([df, pd.DataFrame([sum_row])], ignore_index=True)
            else:
                df = pd.DataFrame(columns=["STT", "Mã Nhóm", "Tên Nhóm Sản Phẩm", "Tồn Đầu Kỳ (SL)", "Tồn Đầu Kỳ (VNĐ)", "Nhập (SL)", "Nhập (VNĐ)", "Xuất (SL)", "Xuất (VNĐ)", "Tồn Cuối (SL)", "Tồn Cuối (VNĐ)"])
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        
        # 2. Hoadon sheet
        hoadon_agg = {}
        for inv in unique_invoices.values():
            if inv["yyyy"] == y:
                key = (inv["thang"], inv["loaihd"], inv["tthai"])
                if key not in hoadon_agg:
                    hoadon_agg[key] = {"Số lượng": 0, "Tổng giá tiền (VNĐ)": 0.0}
                hoadon_agg[key]["Số lượng"] += 1
                hoadon_agg[key]["Tổng giá tiền (VNĐ)"] += inv["tgtttbso"]
        
        hoadon_rows = []
        for (thang, loaihd, tthai), agg in hoadon_agg.items():
            hoadon_rows.append({
                "Tháng": thang,
                "Loại HD": "Bán ra" if loaihd == "banra" else "Mua vào",
                "Tình trạng (Mã)": tthai,
                "Số lượng": agg["Số lượng"],
                "Tổng giá tiền (VNĐ)": agg["Tổng giá tiền (VNĐ)"]
            })
        hoadon_rows.sort(key=lambda x: (x["Tháng"], x["Loại HD"], x["Tình trạng (Mã)"]))
        df_hd = pd.DataFrame(hoadon_rows, columns=["Tháng", "Loại HD", "Tình trạng (Mã)", "Số lượng", "Tổng giá tiền (VNĐ)"])
        if not df_hd.empty:
            sum_hd = {"Tháng": "Tổng cộng", "Loại HD": "", "Tình trạng (Mã)": "", "Số lượng": df_hd["Số lượng"].sum(), "Tổng giá tiền (VNĐ)": df_hd["Tổng giá tiền (VNĐ)"].sum()}
            df_hd = pd.concat([df_hd, pd.DataFrame([sum_hd])], ignore_index=True)
        df_hd.to_excel(writer, sheet_name="Hoadon", index=False)
        
        # 3. xnt12thang sheet
        xnt_12 = []
        stt_12 = 1
        
        first_m = f"{y}-01"
        last_m = f"{y}-12"
        first_m_dict = {row["Mã Nhóm"]: row for row in monthly_reports.get(first_m, [])}
        last_m_dict = {row["Mã Nhóm"]: row for row in monthly_reports.get(last_m, [])}
        
        year_months = [f"{y}-{m:02d}" for m in range(1, 13)]
        
        for g in groups:
            code = g["code"]
            name = g["name"]
            
            dk_sl = 0; dk_tien = 0
            if code in first_m_dict:
                dk_sl = first_m_dict[code]["Tồn Đầu Kỳ (SL)"]
                dk_tien = first_m_dict[code]["Tồn Đầu Kỳ (VNĐ)"]
            
            ck_sl = 0; ck_tien = 0
            if code in last_m_dict:
                ck_sl = last_m_dict[code]["Tồn Cuối (SL)"]
                ck_tien = last_m_dict[code]["Tồn Cuối (VNĐ)"]

            total_nhap_sl = sum(raw_data.get(m, {}).get(code, {}).get("nhap_sl", 0) for m in year_months)
            total_nhap_tien = sum(raw_data.get(m, {}).get(code, {}).get("nhap_tien", 0) for m in year_months)
            total_xuat_sl = sum(raw_data.get(m, {}).get(code, {}).get("xuat_sl", 0) for m in year_months)
            total_xuat_tien = sum(raw_data.get(m, {}).get(code, {}).get("xuat_tien", 0) for m in year_months)
            
            # Không bỏ qua dòng để luôn giữ 168 nhóm
            row_12 = {
                "STT": stt_12,
                "Mã Nhóm": code,
                "Tên Nhóm Sản Phẩm": name,
                "Tồn Đầu Năm (SL)": dk_sl,
                "Tồn Đầu Năm (VNĐ)": dk_tien,
                "Tổng Nhập (SL)": total_nhap_sl,
                "Tổng Nhập (VNĐ)": total_nhap_tien,
                "Tổng Xuất (SL)": total_xuat_sl,
                "Tổng Xuất (VNĐ)": total_xuat_tien,
                "Tồn Cuối Năm (SL)": ck_sl,
                "Tồn Cuối Năm (VNĐ)": ck_tien,
            }
            for i, m_k in enumerate(year_months, start=1):
                row_12[f"Tháng {i} Nhập (VNĐ)"] = raw_data.get(m_k, {}).get(code, {}).get("nhap_tien", 0)
                row_12[f"Tháng {i} Xuất (VNĐ)"] = raw_data.get(m_k, {}).get(code, {}).get("xuat_tien", 0)
                
            xnt_12.append(row_12)
            stt_12 += 1
            
        df_12 = pd.DataFrame(xnt_12)
        if not df_12.empty:
            sum_row12 = {"STT": "Tổng cộng"}
            for col in df_12.columns:
                if "VNĐ" in col or "(SL)" in col:
                    sum_row12[col] = df_12[col].sum()
            df_12 = pd.concat([df_12, pd.DataFrame([sum_row12])], ignore_index=True)
            
        df_12.to_excel(writer, sheet_name="xnt12thang", index=False)
            
    print(f"Generated {filename}")

print("Done compiling all sheets.")
