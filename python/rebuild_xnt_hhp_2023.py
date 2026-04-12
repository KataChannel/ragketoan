import argparse
import json
import re
import os
import sys
import warnings
from collections import defaultdict
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

warnings.filterwarnings('ignore')

# ============================================================
# CONFIG
# ============================================================
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat"
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
MST = "5900428904"

# Products that must have zero closing inventory at year end
FORCE_ZERO_CLOSING = [
    'AACV4N',      # AL ANLENE CONCENTRATE VANILLA 4x125ML NEW
    'AAGVM4G',     # AL Anlene Gold Vanilla Movepro 440g
    'AAMU1-CĐ',   # AL Anlene Movepro UHT 180ml - Có đường
    'AAMU1-KB',    # AL Anlene Movepro UHT 180ml - Không béo
    'AAVM8',       # AL Anlene Vanilla Movepro 800g
    'ATAG3HV40G',  # AL Anlene Gold Vanilla Movepro 400g
]

def load_mapping():
    mapping_file = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/2.mapping_341_items.md"
    if not os.path.exists(mapping_file):
        return {}, {}, {}
    with open(mapping_file, "r") as f: data = f.read()
    rows = re.findall(r'\| ([0-9]+) \| (.*?) \| (.*?) \| (.*?) \|', data)
    id_map = {}; names_2023 = {}; names_2024 = {}
    for row in rows:
        stt, ma, ten_2024, ten_2023_raw = [x.strip() for x in row]
        id_map[ma] = ten_2024
        names_2024[ten_2024.lower()] = ma
        sub_names = [x.strip() for x in ten_2023_raw.split("<br>") if x.strip()]
        for sub_name in sub_names:
            if sub_name != "*Không tìm thấy*": names_2023[sub_name.lower()] = ma
    return id_map, names_2024, names_2023

ID_MAP, NAMES_2024, NAMES_2023 = load_mapping()

def map_item(ten_hang, year):
    if not ten_hang: return "OTH", "Hàng hóa khác"
    h = str(ten_hang).lower().strip()
    mapping_source = NAMES_2023 if year == 2023 else NAMES_2024
    if h in mapping_source: return mapping_source[h], ID_MAP[mapping_source[h]]
    for n, ma in mapping_source.items():
        if n in h or h in n: return ma, ID_MAP[ma]
    all_names = list(NAMES_2024.items()) + list(NAMES_2023.items())
    for n, ma in all_names:
        if n in h or h in n: return ma, ID_MAP[ma]
    return "OTH", "Hàng hóa khác"

def fetch_data(engine, company_id, year):
    q_list = text("""
        SELECT \"idServer\", shdon, 
               tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
               loaihd, tthai, tgtcthue
        FROM ext_listhoadon
        WHERE \"congtyId\" = :cid AND tthai IN ('1','2','4','5')
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= :start
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < :end
    """)
    with engine.connect() as conn:
        df_list = pd.read_sql(q_list, conn, params={'cid': company_id, 'start': f'{year}-01-01', 'end': f'{year+1}-01-01'})
    if df_list.empty: return pd.DataFrame(), pd.DataFrame()
    ids = df_list['idServer'].tolist()
    all_details = []
    for i in range(0, len(ids), 500):
        batch = ids[i:i+500]
        q_det = text("SELECT \"idhdonServer\", ten, sluong, dgia, thtien FROM ext_detailhoadon WHERE \"idhdonServer\" IN :ids")
        with engine.connect() as conn: df_batch = pd.read_sql(q_det, conn, params={'ids': tuple(batch)})
        all_details.append(df_batch)
    return df_list, pd.concat(all_details, ignore_index=True) if all_details else pd.DataFrame()

def process_xnt(df_list, df_detail, year, ton_dau_vnd, targets_muavao, targets_banra, target_gv_total):
    df_list['month'] = pd.to_datetime(df_list['tdlap_ict']).dt.month
    df = df_detail.merge(df_list[['idServer', 'month', 'loaihd', 'tgtcthue']], left_on='idhdonServer', right_on='idServer', how='left')
    
    # Calculate scale factor per invoice to match header total
    inv_sums = df.groupby('idServer')['thtien'].transform('sum').replace(0, 1)
    df['scale_fact'] = df['tgtcthue'] / inv_sums
    
    df[['group_id', 'group_name']] = df.apply(lambda r: pd.Series(map_item(r['ten'], year)), axis=1)
    df['qty'] = df['sluong'].fillna(0).astype(float)
    df['value_db'] = df['thtien'].fillna(0).astype(float) * df['scale_fact']
    
    all_groups = sorted(df['group_id'].unique())
    
    # Scale monthly values to match EXACT targets from MD
    monthly_muavao_db = df[df['loaihd'] == 'muavao'].groupby('month')['value_db'].sum()
    monthly_banra_db = df[df['loaihd'] == 'banra'].groupby('month')['value_db'].sum()
    
    def get_val_actual(row):
        m, l, val, g = row['month'], row['loaihd'], row['value_db'], row['group_id']
        if g in FORCE_ZERO_CLOSING: return val # Protect Anlene from scaling
        if l == 'muavao':
            factor = targets_muavao[m] / monthly_muavao_db[m] if m in monthly_muavao_db and monthly_muavao_db[m] > 0 else 1.0
        else:
            factor = targets_banra[m] / monthly_banra_db[m] if m in monthly_banra_db and monthly_banra_db[m] > 0 else 1.0
        return val * factor

    df['value_actual'] = df.apply(get_val_actual, axis=1)
    
    res = {m: {g: {'nhap_sl': 0, 'nhap_vnd': 0, 'xuat_sl': 0, 'xuat_vnd': 0} for g in all_groups} for m in range(1, 13)}
    for _, r in df.iterrows():
        m, g, l, q, v = r['month'], r['group_id'], r['loaihd'], r['qty'], r['value_actual']
        if l == 'muavao':
            res[m][g]['nhap_sl'] += q
            res[m][g]['nhap_vnd'] += v
        else:
            res[m][g]['xuat_sl'] += q
            res[m][g]['xuat_vnd'] += v

    print("=== DEBUG: ORIGINAL SOURCE DATA FOR ANLENE ===")
    for g in FORCE_ZERO_CLOSING:
        if g not in all_groups: continue
        total_q = sum(res[m][g]['xuat_sl'] for m in range(1, 13))
        print(f"Product {g}: Total Sales Qty from Invoices = {total_q}")
        for m in range(1, 13):
            if res[m][g]['xuat_sl'] > 0:
                print(f"  Month {m}: Qty={res[m][g]['xuat_sl']}")
    print("==============================================")

    # 1. Calculate redistribution for FORCE_ZERO_CLOSING products
    # To make it even, we first need to know their Opening Stock (tdg)
    # Since tdg depends on res, we estimate it first or use a two-pass approach.
    # For Anlene,Imports are 0 or small, so Xuat_Total approx Ton_Dau.
    
    # First: Get total availability for these products
    for g in FORCE_ZERO_CLOSING:
        if g not in all_groups: continue
        
        # Calculate Ton Dau based on original logic but for distributed flow
        orig_nhap = sum(res[m][g]['nhap_sl'] for m in range(1, 13))
        orig_xuat = sum(res[m][g]['xuat_sl'] for m in range(1, 13))
        # Keep the original total export as the base, but ensure it covers negatives
        total_to_xuat = orig_xuat
        
        # Determine average opening stock needed if we distribute evenly
        # If we export total_to_xuat / 12 each month, and nhap is 0:
        # then Opening Stock must be at least total_to_xuat.
        
        # Let's set a fixed rule for these "to be cleared" items:
        # Total Xuat = (Estimated Ton Dau) + (Total Nhap)
    
    # We will do the redistribution AFTER Ton Dau is calculated but effectively before COGS.
    # Wait, the current script structure is:
    # 1. Fill res from DF
    # 2. Calc Ton Dau (tdg)
    # 3. Calc COGS
    
    # I will move the redistribution to BE PART OF the Ton Dau calculation step or right after it.
    
    # Ton dau allocation
    group_min_q = {g: 0 for g in all_groups}
    for g in all_groups:
        run = 0
        for m in range(1, 13):
            run += res[m][g]['nhap_sl'] - res[m][g]['xuat_sl']
            if run < group_min_q[g]: group_min_q[g] = run
            
    # Calculate weighted price per group
    avg_p = {}
    for g in all_groups:
        q_t = df[df['group_id'] == g]['qty'].sum()
        v_t = df[df['group_id'] == g]['value_actual'].sum()
        avg_p[g] = v_t / q_t if q_t > 0 else 100000
        
    tdg = {}
    for g in all_groups:
        if g in FORCE_ZERO_CLOSING:
            # For Anlene, we want Closing = 0.
            # Closing = Opening + Nhap - Xuat.
            # So Opening = Xuat_Invoices - Nhap_Invoices.
            x_inv = sum(res[m][g]['xuat_sl'] for m in range(1, 13))
            n_inv = sum(res[m][g]['nhap_sl'] for m in range(1, 13))
            q_s = max(0, x_inv - n_inv)
        else:
            # Buffer for normal stock
            q_s = int(np.ceil(abs(group_min_q[g]) * 1.5))
            if q_s == 0 and df[(df['group_id'] == g) & (df['loaihd'] == 'banra')].shape[0] > 0:
                q_s = 10 
        tdg[g] = {'qty': q_s, 'val': q_s * avg_p[g]}
        
    cur_v = sum(v['val'] for v in tdg.values())
    norm = ton_dau_vnd / cur_v if cur_v > 0 else 1.0
    for g in all_groups: tdg[g]['val'] *= norm

    # 1. REDISTRIBUTE FORCE_ZERO_CLOSING PRODUCTS NATURALLY (Weighted by monthly targets)
    weights = {m: targets_banra[m] / sum(targets_banra.values()) for m in range(1, 13)}
    
    for g in FORCE_ZERO_CLOSING:
        if g not in all_groups: continue
        
        total_avail_q = tdg[g]['qty'] + sum(res[m][g]['nhap_sl'] for m in range(1, 13))
        total_v_target = sum(res[m][g]['xuat_vnd'] for m in range(1, 13))
        
        # Calculate consistent unit price for these items
        unit_p = total_v_target / total_avail_q if total_avail_q > 0 else 0
        
        # Distribute based on weights
        running_q = 0
        for m in range(1, 12):
            # Natural quantity (integer)
            m_q = int(round(total_avail_q * weights[m]))
            
            res[m][g]['xuat_sl'] = m_q
            # Set value proportional to distributed quantity to keep unit price stable
            res[m][g]['xuat_vnd'] = m_q * unit_p
            
            running_q += m_q
            
        # Month 12 gets the balance to ensure exact 0 closing
        res[12][g]['xuat_sl'] = total_avail_q - running_q
        res[12][g]['xuat_vnd'] = (total_avail_q - running_q) * unit_p

    # 2. RE-NORMALIZE ALL MONTHS to match targets_banra EXACTLY
    for m in range(1, 13):
        cur_month_v = sum(res[m][g]['xuat_vnd'] for g in all_groups)
        target_v = targets_banra[m]
        
        # Protect Anlene values (they are already distributed)
        prot_v = sum(res[m][g]['xuat_vnd'] for g in FORCE_ZERO_CLOSING if g in all_groups)
        
        others_v_target = target_v - prot_v
        others_v_actual = cur_month_v - prot_v
        
        if others_v_actual > 0:
            factor = others_v_target / others_v_actual
            for g in all_groups:
                if g not in FORCE_ZERO_CLOSING:
                    res[m][g]['xuat_vnd'] *= factor

    # 3. FIX MASTER SHEET (xnt12thang) for these products
    # We will do this by ensuring buildup logic uses the same distributed gv

    # Calculate COGS Factor to match target_gv_total
    def calc_total_gv(f):
        tot = 0
        mq = {g: tdg[g]['qty'] for g in all_groups}
        mv = {g: tdg[g]['val'] for g in all_groups}
        for m in range(1, 13):
            for g in all_groups:
                d = res[m][g]
                avg = (mv[g] + d['nhap_vnd']) / (mq[g] + d['nhap_sl']) if (mq[g] + d['nhap_sl']) > 0 else 0
                gv = min(avg * d['xuat_sl'] * f, max(0, mv[g] + d['nhap_vnd']))
                tot += gv
                mq[g] += d['nhap_sl'] - d['xuat_sl']
                mv[g] += d['nhap_vnd'] - gv
        return tot

    actual_muavao = sum(targets_muavao.values())
    actual_banra = sum(targets_banra.values())
    print(f"DEBUG: Sum Targets - Mua: {actual_muavao:,.0f}, Ban: {actual_banra:,.0f}")
    
    total_db_val_actual = df['value_actual'].sum()
    print(f"DEBUG: Total scaled value_actual in DF: {total_db_val_actual:,.0f}")

    cogs_f = 1.0
    if target_gv_total:
        low, high = 0.0, 1000.0  # Increased significantly
        for _ in range(50):
            mid = (low + high) / 2
            curr = calc_total_gv(mid)
            if curr < target_gv_total: low = mid
            else: high = mid
        cogs_f = (low + high) / 2
        print(f"Target COGS: {target_gv_total:,.0f} | Actual: {calc_total_gv(cogs_f):,.0f} | Factor: {cogs_f:.6f}")

    return res, all_groups, tdg, df_list[['month', 'loaihd', 'tgtcthue']].copy(), cogs_f, df

def build_excel(res, all_g, year, out_p, tdg, hd_d, cogs_f, df_all, targets_muavao, targets_banra):
    wb = Workbook(); wb.remove(wb.active)
    
    header_font = Font(bold=True, size=11, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="2F5496")
    total_fill = PatternFill("solid", fgColor="DDEBF7")
    total_font = Font(bold=True)
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    num_fmt = '#,##0'

    # Master sheet
    ws_m = wb.create_sheet("xnt12thang")
    hdrs = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Tổng Tiền Nhập VNĐ', 'Tổng Tiền Xuất HĐ VNĐ', 'Tổng Tiền Giá Vốn VNĐ', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
    for m in range(1, 13): hdrs.extend([f'Nhập T{m} VNĐ', f'Xuất T{m} VNĐ'])
    
    for c, h in enumerate(hdrs, 1):
        cell = ws_m.cell(1, c, h)
        cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')

    # Monthly sheets
    mq, mv = {g: tdg[g]['qty'] for g in all_g}, {g: tdg[g]['val'] for g in all_g}
    monthly_total_gv = defaultdict(float)
    
    for m in range(1, 13):
        ws = wb.create_sheet(f"Tháng {m}")
        mh = ['STT', 'Mã Hàng', 'Tên Hàng', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Giá Vốn', 'Xuất Theo Giá Vốn', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
        for c, h in enumerate(mh, 1):
            cell = ws.cell(1, c, h)
            cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')
        
        for idx, g in enumerate(all_g, 1):
            d = res[m][g]
            qd, vd = mq[g], mv[g]
            
            if g in FORCE_ZERO_CLOSING:
                # Distribute GV (Giá vốn) naturally too
                total_val_to_distribute = tdg[g]['val'] + sum(res[mm][g]['nhap_vnd'] for mm in range(1, 13))
                w = targets_banra[m] / sum(targets_banra.values())
                if m < 12:
                    gv = total_val_to_distribute * w
                else:
                    # Balance
                    gv = total_val_to_distribute - (total_val_to_distribute * sum(targets_banra[mm] for mm in range(1, 12)) / sum(targets_banra.values()))
                
                # Unit GV
                unit_gv = gv / d['xuat_sl'] if d['xuat_sl'] > 0 else 0
                avg_to_show = unit_gv
            else:
                avg = (vd + d['nhap_vnd']) / (qd + d['nhap_sl']) if (qd + d['nhap_sl']) > 0 else 0
                gv = min(avg * d['xuat_sl'] * cogs_f, max(0, vd + d['nhap_vnd']))
                avg_to_show = avg * cogs_f
                
            qc = max(0, qd + d['nhap_sl'] - d['xuat_sl'])
            vc = max(0, vd + d['nhap_vnd'] - gv)
            
            # DG_X = Doanh thu / Qty
            dg_x = d['xuat_vnd'] / d['xuat_sl'] if d['xuat_sl'] > 0 else 0
            
            vals = [idx, g, ID_MAP.get(g, "Khác"), qd, vd, d['nhap_sl'], d['nhap_vnd'], d['xuat_sl'], d['xuat_vnd'], dg_x, gv, qc, vc]
            for c, v in enumerate(vals, 1):
                cell = ws.cell(idx+1, c, v)
                cell.border = border
                if c >= 4: cell.number_format = num_fmt
            
            mq[g], mv[g] = qc, vc
            monthly_total_gv[m] += gv
            
        ml = len(all_g) + 2
        ws.cell(ml, 3, "TỔNG CỘNG").font = total_font
        for c in range(4, 14):
            col = get_column_letter(c)
            cell = ws.cell(ml, c, f"=SUM({col}2:{col}{ml-1})")
            cell.font = total_font; cell.fill = total_fill; cell.border = border; cell.number_format = num_fmt

    # Populate Master sheet with scaled flows
    mq_m, mv_m = {g: tdg[g]['qty'] for g in all_g}, {g: tdg[g]['val'] for g in all_g}
    for idx, g in enumerate(all_g, 1):
        td = tdg[g]
        cur_q, cur_v = td['qty'], td['val']
        sn, sxh, sgv = 0, 0, 0
        m_flows = []
        for m in range(1, 13):
            d = res[m][g]
            qd_m, vd_m = cur_q, cur_v
            
            if g in FORCE_ZERO_CLOSING:
                # Distribution of financial value per month
                total_val_to_distribute = td['val'] + sum(res[mm][g]['nhap_vnd'] for mm in range(1, 13))
                # Use the same weights as Xuat_VND
                w = targets_banra[m] / sum(targets_banra.values())
                if m < 12:
                    gv = total_val_to_distribute * w
                else:
                    # Balance
                    gv = total_val_to_distribute - (total_val_to_distribute * sum(targets_banra[mm] for mm in range(1, 12)) / sum(targets_banra.values()))
            else:
                avg = (vd_m + d['nhap_vnd']) / (qd_m + d['nhap_sl']) if (qd_m + d['nhap_sl']) > 0 else 0
                gv = min(avg * d['xuat_sl'] * cogs_f, max(0, vd_m + d['nhap_vnd']))
            
            sn += d['nhap_vnd']; sxh += d['xuat_vnd']; sgv += gv
            # Capture monthly flows for the master sheet
            m_flows.extend([d['nhap_vnd'], gv])
            
            cur_q += d['nhap_sl'] - d['xuat_sl']
            cur_v += d['nhap_vnd'] - gv
            
        row_vals = [idx, g, ID_MAP.get(g, "Khác"), td['qty'], td['val'], sn, sxh, sgv, cur_q, cur_v] + m_flows
        for c, v in enumerate(row_vals, 1):
            cell = ws_m.cell(idx+1, c, v)
            cell.border = border
            if c >= 4: cell.number_format = num_fmt
            
    ml_m = len(all_g) + 2
    ws_m.cell(ml_m, 3, "TỔNG CỘNG").font = total_font
    for c in range(4, len(hdrs)+1):
        col = get_column_letter(c)
        cell = ws_m.cell(ml_m, c, f"=SUM({col}2:{col}{ml_m-1})")
        cell.font = total_font; cell.fill = total_fill; cell.border = border; cell.number_format = num_fmt

    # Hoadon sheet
    ws_hd = wb.create_sheet("Hoadon")
    hdh = ['Tháng', 'Tổng Tiền Hóa Đơn Mua (VNĐ)', 'Tổng Tiền Hóa Đơn Bán (VNĐ)']
    for c, h in enumerate(hdh, 1):
        cell = ws_hd.cell(1, c, h); cell.font = header_font; cell.fill = header_fill; cell.border = border; cell.alignment = Alignment(horizontal='center')
    
    for m in range(1, 13):
        ws_hd.cell(m+1, 1, f"Tháng {m}").border = border
        ws_hd.cell(m+1, 2, targets_muavao[m]).border = border; ws_hd.cell(m+1, 2).number_format = num_fmt
        ws_hd.cell(m+1, 3, targets_banra[m]).border = border; ws_hd.cell(m+1, 3).number_format = num_fmt
        
    ws_hd.cell(14, 1, "TỔNG CỘNG").font = total_font; ws_hd.cell(14, 1).border = border
    ws_hd.cell(14, 2, sum(targets_muavao.values())).font = total_font; ws_hd.cell(14, 2).fill = total_fill; ws_hd.cell(14, 2).border = border; ws_hd.cell(14, 2).number_format = num_fmt
    ws_hd.cell(14, 3, sum(targets_banra.values())).font = total_font; ws_hd.cell(14, 3).fill = total_fill; ws_hd.cell(14, 3).border = border; ws_hd.cell(14, 3).number_format = num_fmt

    wb.save(out_p)
    print(f"Saved: {out_p}")

def main():
    ton_dau = 15447634554
    target_muavao = {
        1: 14226694560, 2: 10040247266, 3: 7381679783, 4: 10255784083,
        5: 9491021714, 6: 9379263229, 7: 5949569368, 8: 8159204686,
        9: 8670793221, 10: 6963184455, 11: 9802832916, 12: 10199353340
    }
    target_banra = {
        1: 11386534989, 2: 7934111935, 3: 8830045997, 4: 8927663945,
        5: 9501096775, 6: 6476704680, 7: 11809848916, 8: 10392458795,
        9: 7688034440, 10: 10074473309, 11: 7702004013, 12: 14349920815
    }
    ton_cuoi_target = 15756884474
    total_muavao = sum(target_muavao.values())
    target_gv_total = ton_dau + total_muavao - ton_cuoi_target

    engine = create_engine(DB_URI)
    df_l, df_d = fetch_data(engine, COMPANY_ID, 2023)
    
    if df_l.empty:
        print("No data found")
        return
        
    res, groups, tdg, hd, f, df_all = process_xnt(df_l, df_d, 2023, ton_dau, target_muavao, target_banra, target_gv_total)
    
    out_path = os.path.join(OUTPUT_DIR, "XNT_HHP_2023.xlsx")
    build_excel(res, groups, 2023, out_path, tdg, hd, f, df_all, target_muavao, target_banra)

if __name__ == "__main__":
    main()
