import psycopg2
import pandas as pd
import os
import re
from datetime import datetime

# --- SETTINGS & PATHS ---
MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
OPENING_BALANCE_2023 = 20528682383.0
OUTPUT_DIR = "docs/huyvu"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# --- 1. PARSE PRODUCT GROUPS FROM MD ---
groups = []
kw_mapping = {}
stt_regex = re.compile(r'^\d+(\.\d+)?$')

with open(MD_PATH, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line.startswith("|") and len(line.split("|")) >= 5:
            parts = [p.strip() for p in line.split("|")]
            if len(parts) < 5: continue
            stt_str = parts[1]
            if stt_regex.match(stt_str):
                code = parts[2].replace('**', '').strip()
                name = parts[3].strip()
                aliases_raw = parts[4].strip()
                aliases = [a.strip().lower() for a in aliases_raw.split(',') if a.strip()]
                groups.append({"code": code, "name": name})
                kw_mapping[code] = aliases

# --- 2. LOGIC FOR MAPPING DATABASE RECORDS TO GROUPS ---
def map_to_group(ten_hang):
    h = str(ten_hang or "").lower()
    words = set(re.findall(r'[a-z0-9]+', h))
    
    for code, keywords in kw_mapping.items():
        for kw in keywords:
            kw_words = set(re.findall(r'[a-z0-9]+', kw.lower()))
            if kw_words and kw_words.issubset(words):
                return code
            if len(kw) >= 5 and kw.lower() in h:
                return code
                
    if any(k in h for k in ["pc", "máy tính", "laptop", "cpu", "main", "ram", "vga"]):
        return "PC-SYS-I3"
    if any(k in h for k in ["máy in", "mực", "photocopy"]):
        return "PRN-CAN-LBP"
    if any(k in h for k in ["camera", "cam", "hikvision"]):
        return "CAM-WIFI-2M"
    return "OTH-GEN"

# --- 3. EXCLUSION LIST FOR 2023 ---
exclusion_2023 = {
    ('2023-02', '129'), ('2023-02', '69'), ('2023-03', '187'), ('2023-03', '221'),
    ('2023-04', '456'), ('2023-04', '420'), ('2023-04', '451'), ('2023-05', '497'),
    ('2023-05', '531'), ('2023-06', '681'), ('2023-06', '627'), ('2023-07', '698'),
    ('2023-07', '758'), ('2023-08', '800'), ('2023-08', '786'), ('2023-08', '808'),
    ('2023-09', '988'), ('2023-09', '1010'), ('2023-09', '964'), ('2023-10', '1119'),
    ('2023-10', '1112'), ('2023-10', '1123'), ('2023-10', '1048'), ('2023-11', '1332'),
    ('2023-11', '1249'), ('2023-11', '1272'), ('2023-12', '1508'), ('2023-12', '1463'),
    ('2023-12', '1538')
}

# --- 4. QUERY DATABASE ---
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
query = f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'MM') as thang,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        h.shdon, h.loaihd, h.tthai, h.tgtcthue, h.tgtthue, h.tgtttbso,
        d.id, d.ten, d.sluong, d.dgia, d.thtien, h."idServer"
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
    ORDER BY h.tdlap ASC
"""
cur.execute(query)
rows = cur.fetchall()

# --- 5. PROCESS RAW DATA ---
raw_data = {}
unique_invoices = {}
group_overall_2023 = {g["code"]: {"x_sl": 0.0, "x_tien": 0.0, "n_sl": 0.0, "n_tien": 0.0} for g in groups}

for row in rows:
    thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso, detail_id, ten, sluong, dgia, thtien, idServer = row
    if not yyyymm: continue
    if yyyy == '2023' and (yyyymm, shdon) in exclusion_2023: continue
    if idServer not in unique_invoices:
        unique_invoices[idServer] = {"thang": thang, "yyyy": yyyy, "loaihd": loaihd, "tthai": tthai, "tgtttbso": float(tgtttbso or 0)}
    
    if detail_id is None:
        ten, sluong, thtien = ten or "Hàng Hóa / Dịch Vụ Khuyết Chi Tiết", 1.0, float(tgtcthue or 0)
    else:
        sluong, thtien = abs(float(sluong or 0)), abs(float(thtien or 0))
        
    grp_code = map_to_group(ten)
    if yyyymm not in raw_data: raw_data[yyyymm] = {}
    if grp_code not in raw_data[yyyymm]: raw_data[yyyymm][grp_code] = {"nhap_sl": 0.0, "nhap_tien": 0.0, "xuat_sl": 0.0, "xuat_tien": 0.0}
    
    if loaihd == 'muavao':
        raw_data[yyyymm][grp_code]["nhap_sl"] += sluong
        raw_data[yyyymm][grp_code]["nhap_tien"] += thtien
        if yyyy == '2023':
            group_overall_2023[grp_code]["n_sl"] += sluong
            group_overall_2023[grp_code]["n_tien"] += thtien
    elif loaihd == 'banra':
        raw_data[yyyymm][grp_code]["xuat_sl"] += sluong
        raw_data[yyyymm][grp_code]["xuat_tien"] += thtien
        if yyyy == '2023':
            group_overall_2023[grp_code]["x_sl"] += sluong
            group_overall_2023[grp_code]["x_tien"] += thtien

# --- 6. ALLOCATE OPENING BALANCE 2023 (INTEGER SL) ---
avg_prices = {}
for code in group_overall_2023:
    s = group_overall_2023[code]
    if s["n_sl"] > 0: avg_prices[code] = s["n_tien"] / s["n_sl"]
    elif s["x_sl"] > 0: avg_prices[code] = s["x_tien"] / s["x_sl"]
    else:
        if code.startswith("PC-MAC") or code.startswith("PC-DELL-XPS"): avg_prices[code] = 35000000.0
        elif code.startswith("PC-DELL") or code.startswith("PC-ASU") or code.startswith("PC-HP"): avg_prices[code] = 15000000.0
        elif code.startswith("PC-SYS"): avg_prices[code] = 8000000.0
        elif code.startswith("LCD"): avg_prices[code] = 3500000.0
        elif code.startswith("PRN"): avg_prices[code] = 4500000.0
        elif code.startswith("CPU") or code.startswith("VGA"): avg_prices[code] = 7000000.0
        elif code.startswith("MB") or code.startswith("RAM") or code.startswith("SSD"): avg_prices[code] = 1500000.0
        else: avg_prices[code] = 5000000.0

preliminary_sl = {}
throughput_val = {code: (v["n_tien"] + v["x_tien"]) for code, v in group_overall_2023.items()}
for code in group_overall_2023:
    s = group_overall_2023[code]
    needed_sl = int(max(0.0, s["x_sl"] - s["n_sl"]))
    if throughput_val.get(code, 0) > 0 or code == "OTH-GEN":
       needed_sl += 2
    preliminary_sl[code] = needed_sl

prelim_tien = sum(preliminary_sl[c] * avg_prices[c] for c in preliminary_sl)
rem_pool = OPENING_BALANCE_2023 - prelim_tien
if rem_pool > 0:
    sum_val = sum(throughput_val.values()) or 1.0
    for c in preliminary_sl:
        extra = int((rem_pool * (throughput_val.get(c, 0) / sum_val)) / avg_prices[c])
        preliminary_sl[c] += extra

final_dk_tien = {c: float(preliminary_sl[c] * avg_prices[c]) for c in preliminary_sl}
diff = OPENING_BALANCE_2023 - sum(final_dk_tien.values())
target_adj = next((c for c in ["PC-DELL-LAT", "PC-SYS-I3", "OTH-GEN"] if c in final_dk_tien), "OTH-GEN")
final_dk_tien[target_adj] += diff

rolling_balance = {c: {"sl": float(preliminary_sl[c]), "tien": final_dk_tien[c]} for c in preliminary_sl}

# --- 7. GENERATE MONTHLY REPORTS ---
all_yyyymm = sorted(raw_data.keys())
years = sorted(list(set(m.split('-')[0] for m in all_yyyymm)))

for y in years:
    monthly_dfs = {}
    for m in range(1, 13):
        m_str, m_name = f"{y}-{m:02d}", f"Tháng {m}"
        m_data = raw_data.get(m_str, {})
        rows_report = []
        for stt, g in enumerate(groups, 1):
            code, name = g["code"], g["name"]
            dk_sl, dk_tien = rolling_balance[code]["sl"], rolling_balance[code]["tien"]
            o = m_data.get(code, {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0})
            n_sl, n_tien, x_sl, x_tien = o["nhap_sl"], o["nhap_tien"], o["xuat_sl"], o["xuat_tien"]
            if x_sl > (dk_sl + n_sl):
                x_sl, x_tien = dk_sl + n_sl, dk_tien + n_tien
            ck_sl, ck_tien = dk_sl + n_sl - x_sl, dk_tien + n_tien - x_tien
            rows_report.append({"STT": stt, "Mã Nhóm": code, "Tên Nhóm Sản Phẩm": name, "Tồn Đầu Kỳ (SL)": dk_sl, "Tồn Đầu Kỳ (VNĐ)": dk_tien, "Nhập (SL)": n_sl, "Nhập (VNĐ)": n_tien, "Xuất (SL)": x_sl, "Xuất (VNĐ)": x_tien, "Tồn Cuối (SL)": ck_sl, "Tồn Cuối (VNĐ)": ck_tien})
            rolling_balance[code] = {"sl": ck_sl, "tien": ck_tien}
        monthly_dfs[m_name] = pd.DataFrame(rows_report)

    with pd.ExcelWriter(f"{OUTPUT_DIR}/XNT_HuyVu_{y}.xlsx", engine='openpyxl') as writer:
        for name, df in monthly_dfs.items():
            sum_row = {"STT": "Tổng cộng"}
            for col in df.columns[3:]: sum_row[col] = df[col].sum()
            pd.concat([df, pd.DataFrame([sum_row])], ignore_index=True).to_excel(writer, sheet_name=name, index=False)
            
        hoadon_rows = [{"Tháng": v["thang"], "Loại HD": "Bán ra" if v["loaihd"] == "banra" else "Mua vào", "Tình trạng": v["tthai"], "Số lượng": 1, "Tổng giá tiền (VNĐ)": v["tgtttbso"]} for v in unique_invoices.values() if v["yyyy"] == y]
        if hoadon_rows:
            h_df = pd.DataFrame(hoadon_rows).groupby(["Tháng", "Loại HD", "Tình trạng"]).agg({"Số lượng": "sum", "Tổng giá tiền (VNĐ)": "sum"}).reset_index()
            h_df.to_excel(writer, sheet_name="Hoadon", index=False)
            
        xnt12 = []
        for g in groups:
            code, name = g["code"], g["name"]
            m1, m12 = monthly_dfs.get("Tháng 1"), monthly_dfs.get("Tháng 12")
            row12 = {"Mã Nhóm": code, "Tên Nhóm": name, "Tồn Đầu": m1[m1["Mã Nhóm"]==code]["Tồn Đầu Kỳ (VNĐ)"].values[0] if m1 is not None else 0, "Tồn Cuối": m12[m12["Mã Nhóm"]==code]["Tồn Cuối (VNĐ)"].values[0] if m12 is not None else 0}
            for mon in range(1, 13):
                o = raw_data.get(f"{y}-{mon:02d}", {}).get(code, {"nhap_tien": 0, "xuat_tien": 0})
                row12[f"Tháng {mon} N"] = o["nhap_tien"]
                row12[f"Tháng {mon} X"] = o["xuat_tien"]
            xnt12.append(row12)
        pd.DataFrame(xnt12).to_excel(writer, sheet_name="xnt12thang", index=False)

conn.close()
print("Done.")
