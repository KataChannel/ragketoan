import psycopg2
import pandas as pd
import os
import re
from datetime import datetime

# Paths
MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"
OUT_DIR = "docs/huyvu"
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TIN_COMPANY = '5900363291'
OPENING_BALANCE_2023 = 20528682383.0

def load_categories():
    groups = []
    kw_mapping = {}
    with open(MD_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("|") and len(line.split("|")) >= 5:
                parts = [p.strip() for p in line.split("|")]
                stt_str = parts[1]
                if stt_str.isdigit():
                    code = parts[2].replace("**", "") # Remove bold markdown
                    name = parts[3]
                    aliases_raw = parts[4]
                    aliases = [a.strip().lower() for a in aliases_raw.split(',') if a.strip()]
                    groups.append({"code": code, "name": name})
                    kw_mapping[code] = aliases
    return groups, kw_mapping

def map_to_group(tenHang, groups, kw_mapping):
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

    # 2. General logic fallback to "Khác"
    # Mapping logic from DANH_MUC_NHOM_SAN_PHAM.md
    if any(k in hhp_low for k in ["pc", "máy tính", "laptop", "cpu", "main", "ram", "vga", "bo mạch", "desktop"]):
        code_found = "PC-057" # Default PC Desktop/System
    elif any(k in hhp_low for k in ["máy in", "mực", "chuột", "bàn phím", "văn phòng", "máy photo", "giấy", "bút", "kẹp", "bìa", "băng dính"]):
        code_found = "VP-049" # Office equipment
    elif any(k in hhp_low for k in ["cam", "đầu ghi", "hikvision", "kbone", "imou", "ezviz", "camera"]):
        code_found = "CAM-001" # Camera
    elif any(k in hhp_low for k in ["thi công", "dịch vụ", "cước", "lệ phí"]):
        code_found = "SRV-001" # Service
    else:
        code_found = "OTH-017" # Other

    for g in groups:
        if g['code'] == code_found:
            return g
            
    return groups[-1] if groups else {"code": "OTH-NA", "name": "Unknown"}

def process_data():
    groups, kw_mapping = load_categories()
    print(f"Loaded {len(groups)} groups.")

    print("Querying database...")
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()

    query = f"""
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
        WHERE (h.nbmst='{TIN_COMPANY}' OR h.nmmst='{TIN_COMPANY}')
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
        else:
            sluong = float(sluong or 0)
            thtien = float(thtien or 0)
            
        grp = map_to_group(ten, groups, kw_mapping)
        grp_code = grp["code"]
        
        if yyyymm not in raw_data:
            raw_data[yyyymm] = {}
            
        if grp_code not in raw_data[yyyymm]:
            raw_data[yyyymm][grp_code] = {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0}
            
        if loaihd == 'muavao':
            raw_data[yyyymm][grp_code]["nhap_sl"] += sluong
            raw_data[yyyymm][grp_code]["nhap_tien"] += thtien
        elif loaihd == 'banra':
            raw_data[yyyymm][grp_code]["xuat_sl"] += sluong
            raw_data[yyyymm][grp_code]["xuat_tien"] += thtien

    all_months = sorted(list(raw_data.keys()))
    if not all_months:
        print("No data found!")
        exit(0)

    # Prepare timeline across years
    start_y = 2023
    end_y = max(int(m.split('-')[0]) for m in all_months)
    
    # We always report up to current or next year if needed, here we go until data ends
    years_to_process = range(start_y, end_y + 1)
    
    # State management for stock
    # rolling_balance[code] = {'sl': current_sl, 'tien': current_tien}
    current_rolling_balance = {g["code"]: {"sl": 0, "tien": 0} for g in groups}
    
    # --- Reasonable Opening Balance Distribution 2023 ---
    # To make it 'hợp lý', we distribute based on the weight of activity in the dataset
    group_weights = {g["code"]: 0 for g in groups}
    total_market_val = 0
    for item in rows:
        ten_hang = item[10] # d.ten
        th_tien = item[13]  # d.thtien
        grp_obj = map_to_group(ten_hang, groups, kw_mapping)
        code = grp_obj["code"]
        val = abs(float(th_tien or 0))
        if code in group_weights:
            group_weights[code] += val
            total_market_val += val
            
    # If no data yet, use flat distribution, otherwise use weighted
    amount_distributed = 0
    if total_market_val > 0:
        for g in groups:
            # Formula: (Weight Ratio * Total Opening) + small base to ensure no zeros
            # Base amount: 1M VNĐ per group
            base_amt = 1_000_000 
            weight_ratio = group_weights[g["code"]] / total_market_val
            group_amt = base_amt + (weight_ratio * (OPENING_BALANCE_2023 - (len(groups) * base_amt)))
            
            current_rolling_balance[g["code"]]["sl"] = 1.0
            current_rolling_balance[g["code"]]["tien"] = group_amt
            amount_distributed += group_amt
    else:
        # Fallback to even distribution
        avg = OPENING_BALANCE_2023 / len(groups)
        for g in groups:
            current_rolling_balance[g["code"]]["sl"] = 1.0
            current_rolling_balance[g["code"]]["tien"] = avg
            amount_distributed += avg
    
    # Adjust last group for rounding
    if groups:
        diff = OPENING_BALANCE_2023 - amount_distributed
        current_rolling_balance[groups[-1]["code"]]["tien"] += diff
    # ---------------------------------------------------

    for year in years_to_process:
        year_str = str(year)
        filename = f"{OUT_DIR}/XNT_HuyVu_{year}.xlsx"
        
        # Monthly data for this year
        year_months = [f"{year:04d}-{m:02d}" for m in range(1, 13)]
        
        monthly_reports = {}
        
        for m in year_months:
            monthly_reports[m] = []
            m_data = raw_data.get(m, {})
            
            stt = 1
            for g in groups:
                code = g["code"]
                name = g["name"]
                
                o_data = m_data.get(code, {"nhap_sl": 0, "nhap_tien": 0, "xuat_sl": 0, "xuat_tien": 0})
                dk_sl = current_rolling_balance[code]["sl"]
                dk_tien = current_rolling_balance[code]["tien"]
                
                nhap_sl = o_data["nhap_sl"]
                nhap_tien = o_data["nhap_tien"]
                xuat_sl = o_data["xuat_sl"]
                xuat_tien = o_data["xuat_tien"]
                
                ck_sl = dk_sl + nhap_sl - xuat_sl
                ck_tien = dk_tien + nhap_tien - xuat_tien
                
                # Requirements: No negative values
                if ck_sl < 0: ck_sl = 0
                if ck_tien < 0: ck_tien = 0
                
                # Update rolling state
                current_rolling_balance[code]["sl"] = ck_sl
                current_rolling_balance[code]["tien"] = ck_tien
                
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

        print(f"Generating file: {filename}")
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            
            # 1. Monthly sheets (Months 1-12)
            for m in year_months:
                sheet_name = f"Thang_{m.split('-')[1]}"
                rows_data = monthly_reports[m]
                df = pd.DataFrame(rows_data)
                
                if not df.empty:
                    sum_row = {"STT": "Tổng cộng", "Mã Nhóm": "", "Tên Nhóm Sản Phẩm": ""}
                    for col in ["Tồn Đầu Kỳ (SL)", "Tồn Đầu Kỳ (VNĐ)", "Nhập (SL)", "Nhập (VNĐ)", "Xuất (SL)", "Xuất (VNĐ)", "Tồn Cuối (SL)", "Tồn Cuối (VNĐ)"]:
                        sum_row[col] = df[col].sum()
                    df = pd.concat([df, pd.DataFrame([sum_row])], ignore_index=True)
                
                df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # 2. Hoadon sheet
            hoadon_agg = {}
            for inv in unique_invoices.values():
                if inv["yyyy"] == year_str:
                    key = (inv["thang"], inv["loaihd"], inv["tthai"])
                    if key not in hoadon_agg:
                        hoadon_agg[key] = {"Số lượng": 0, "Tổng giá tiền (VNĐ)": 0.0}
                    hoadon_agg[key]["Số lượng"] += 1
                    hoadon_agg[key]["Tổng giá tiền (VNĐ)"] += inv["tgtttbso"]
            
            hoadon_rows = []
            for (th_val, loai_val, tthai_val), agg in hoadon_agg.items():
                hoadon_rows.append({
                    "Tháng": th_val,
                    "Loại HD": "Bán ra" if loai_val == "banra" else "Mua vào",
                    "Tình trạng (Mã)": tthai_val,
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
            
            first_mo = f"{year}-01"
            last_mo = f"{year}-12"
            
            for g in groups:
                code = g["code"]
                name = g["name"]
                
                # Head of year (Opening 01)
                dk_year_sl = 0; dk_year_tien = 0
                for row_m in monthly_reports[first_mo]:
                    if row_m["Mã Nhóm"] == code:
                        dk_year_sl = row_m["Tồn Đầu Kỳ (SL)"]
                        dk_year_tien = row_m["Tồn Đầu Kỳ (VNĐ)"]
                        break
                
                # End of year (Closing 12)
                ck_year_sl = 0; ck_year_tien = 0
                for row_m in monthly_reports[last_mo]:
                    if row_m["Mã Nhóm"] == code:
                        ck_year_sl = row_m["Tồn Cuối (SL)"]
                        ck_year_tien = row_m["Tồn Cuối (VNĐ)"]
                        break

                total_nhap_sl_y = sum(raw_data.get(m_k, {}).get(code, {}).get("nhap_sl", 0) for m_k in year_months)
                total_nhap_tien_y = sum(raw_data.get(m_k, {}).get(code, {}).get("nhap_tien", 0) for m_k in year_months)
                total_xuat_sl_y = sum(raw_data.get(m_k, {}).get(code, {}).get("xuat_sl", 0) for m_k in year_months)
                total_xuat_tien_y = sum(raw_data.get(m_k, {}).get(code, {}).get("xuat_tien", 0) for m_k in year_months)
                
                row_12 = {
                    "STT": stt_12,
                    "Mã Nhóm": code,
                    "Tên Nhóm Sản Phẩm": name,
                    "Tồn Đầu Năm (SL)": dk_year_sl,
                    "Tồn Đầu Năm (VNĐ)": dk_year_tien,
                    "Tổng Nhập (SL)": total_nhap_sl_y,
                    "Tổng Nhập (VNĐ)": total_nhap_tien_y,
                    "Tổng Xuất (SL)": total_xuat_sl_y,
                    "Tổng Xuất (VNĐ)": total_xuat_tien_y,
                    "Tồn Cuối Năm (SL)": ck_year_sl,
                    "Tồn Cuối Năm (VNĐ)": ck_year_tien,
                }
                # Optional details for months
                for i_m in range(1, 13):
                    m_key = f"{year:04d}-{i_m:02d}"
                    row_12[f"Tháng {i_m} Nhập (VNĐ)"] = raw_data.get(m_key, {}).get(code, {}).get("nhap_tien", 0)
                    row_12[f"Tháng {i_m} Xuất (VNĐ)"] = raw_data.get(m_key, {}).get(code, {}).get("xuat_tien", 0)
                    
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

    print("Master compilation complete.")

if __name__ == "__main__":
    process_data()
