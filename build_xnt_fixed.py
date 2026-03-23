import psycopg2
import pandas as pd
import os

MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

groups = []
with open(MD_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 4:
            parts = [p.strip() for p in line.split("|")]
            stt_str = parts[1]
            if stt_str.isdigit():
                groups.append({"code": parts[2], "name": parts[3]})

def map_to_group(tenHang):
    hhp_low = str(tenHang or '').lower()
    
    for g in groups:
        if 'khác' in g['name'].lower() or 'khac' in g['name'].lower():
            continue
        parts = g['name'].split(' - ')
        if len(parts) > 1:
            model = parts[-1].lower().strip()
            if model and model in hhp_low:
                return g
                
    cat_found = "Vật tư kỹ thuật khác chưa phân loại"
    if any(k in hhp_low for k in ["pc", "máy tính", "laptop", "màn hình", "cpu", "main", "ram", "vga", "ssd", "ổ cứng", "bo mạch"]):
        cat_found = "Máy tính (PC/Laptop) - Khác"
    elif any(k in hhp_low for k in ["máy in", "mực", "chuột", "bàn phím", "văn phòng"]):
        cat_found = "Thiết bị văn phòng - Khác"
    elif any(k in hhp_low for k in ["cam", "đầu ghi"]):
        cat_found = "Vật tư kỹ thuật khác chưa phân loại"
    elif any(k in hhp_low for k in ["mạng", "wifi", "switch", "net", "cáp", "router", "ap", "access point"]):
        cat_found = "Vật tư kỹ thuật khác chưa phân loại"
    elif any(k in hhp_low for k in ["thi công", "dịch vụ", "cước", "lệ phí", "thu hộ"]):
        cat_found = "Dịch vụ & Thi công - Tổng hợp"

    for g in groups:
        if g['name'] == cat_found:
            return g
            
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
        to_char(h.tdlap, 'YYYY-MM-DD') as tdlap_str,
        to_char(h.tdlap, 'YYYY-MM') as yyyymm,
        to_char(h.tdlap, 'YYYY') as yyyy,
        h.shdon,
        h.loaihd,
        h.tgtcthue,
        h.tgtthue,
        d.id as detail_id,
        d.ten,
        d.sluong,
        d.dgia,
        d.thtien,
        d.tthue
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE h.nbmst='5900363291' OR h.nmmst='5900363291'
    ORDER BY h.tdlap ASC
"""
cur.execute(query)
rows = cur.fetchall()
print(f"Fetched {len(rows)} records (join of listhoadon and detailhoadon).")

raw_data = {}
hoadon_data = {} 

for row in rows:
    (tdlap_str, yyyymm, yyyy, shdon, loaihd, tgtcthue, tgtthue, 
     detail_id, ten, sluong, dgia, thtien, tthue) = row
     
    if not yyyymm:
        continue
        
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
        
    if yyyy not in hoadon_data:
        hoadon_data[yyyy] = []
        
    hoadon_data[yyyy].append({
        "Ngày": tdlap_str,
        "Số HĐ": shdon,
        "Loại": "Mua Vào" if loaihd == 'muavao' else "Bán Ra",
        "Tên hàng": ten,
        "Số lượng": s,
        "Đơn giá": dgia,
        "Thành tiền": t,
        "Thuế": tthue
    })

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
        
        if dk_sl != 0 or dk_tien != 0 or nhap_sl != 0 or nhap_tien != 0 or xuat_sl != 0 or xuat_tien != 0 or ck_sl != 0 or ck_tien != 0:
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
    reports_by_year[y][f"{mon}_{y}"] = monthly_reports[m]

out_dir = "docs/huyvu"

for y, sheets in reports_by_year.items():
    if int(y) < 2023 or int(y) > 2026:
        continue
        
    filename = f"{out_dir}/XNT_HuyVu_{y}.xlsx"
    with pd.ExcelWriter(filename, engine='openpyxl') as writer:
        
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
            elif not any(raw_data.get(m_key, {}).get(code) for m_key in year_months): 
                if code not in last_m_dict:
                    continue
                    
            ck_sl = 0; ck_tien = 0
            if code in last_m_dict:
                ck_sl = last_m_dict[code]["Tồn Cuối (SL)"]
                ck_tien = last_m_dict[code]["Tồn Cuối (VNĐ)"]

            total_nhap_sl = sum(raw_data.get(m, {}).get(code, {}).get("nhap_sl", 0) for m in year_months)
            total_nhap_tien = sum(raw_data.get(m, {}).get(code, {}).get("nhap_tien", 0) for m in year_months)
            total_xuat_sl = sum(raw_data.get(m, {}).get(code, {}).get("xuat_sl", 0) for m in year_months)
            total_xuat_tien = sum(raw_data.get(m, {}).get(code, {}).get("xuat_tien", 0) for m in year_months)
            
            if total_nhap_tien==0 and total_xuat_tien==0 and dk_tien==0 and ck_tien==0:
                continue

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
        df_12.to_excel(writer, sheet_name="xnt12thang", index=False)
        
        if y in hoadon_data:
            df_hd = pd.DataFrame(hoadon_data[y])
        else:
            df_hd = pd.DataFrame(columns=["Ngày", "Số HĐ", "Loại", "Tên hàng", "Số lượng", "Đơn giá", "Thành tiền", "Thuế"])
        df_hd.to_excel(writer, sheet_name="hoadon", index=False)
        
        for sheet_name, rows_data in sheets.items():
            if rows_data:
                df = pd.DataFrame(rows_data)
            else:
                df = pd.DataFrame(columns=["STT", "Mã Nhóm", "Tên Nhóm Sản Phẩm", "Tồn Đầu Kỳ (SL)", "Tồn Đầu Kỳ (VNĐ)", "Nhập (SL)", "Nhập (VNĐ)", "Xuất (SL)", "Xuất (VNĐ)", "Tồn Cuối (SL)", "Tồn Cuối (VNĐ)"])
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    print(f"Generated {filename}")

print("Done compiling ALL sheets.")
