import pandas as pd
import duckdb
import os
import re
import json
import numpy as np
from datetime import datetime

# ================================
# CONFIGURATION
# ================================
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
YEAR = 2023
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/tonghop"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "XNT_HoangHuyPhat_2023.xlsx")
MAPPING_FILE = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/2.mapping_341_items.md"
TON_2024_FILE = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/ton_kho_T1_2024.md"
STD_MOVEMENTS_FILE = "/tmp/std_movements_2023.json"

TOTAL_OPENING_VALUE = 15447634554
TOTAL_CLOSING_VALUE = 15761231523
DB_URL = "postgresql://root:password@localhost:5432/ketoan"

def load_master_and_2024_targets():
    master_items = {} 
    mapping_data = {} 
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        pattern = re.compile(r'\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
        for line in content.split('\n'):
            m = pattern.search(line)
            if m:
                ma = m.group(2).strip()
                t24 = m.group(3).strip()
                t23r = m.group(4).strip()
                if ma == "Mã Hàng (2024)": continue
                master_items[ma] = {'MaHang': ma, 'TenHang': t24, 'TargetCQty': 0}
                mapping_data[t24.upper()] = ma
                for t23 in (t23r.split('<br>') if '<br>' in t23r else [t23r]):
                    tc = t23.strip().replace('*', '').upper()
                    if tc and tc != "KHÔNG TÌM THẤY": mapping_data[tc] = ma

    if os.path.exists(TON_2024_FILE):
        with open(TON_2024_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        table_pat = re.compile(r'\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([\d,]+)\s*\|')
        for line in content.split('\n'):
            m = table_pat.search(line)
            if m:
                ma = m.group(1).strip()
                if ma == "Mã hàng": continue
                qty_str = m.group(4).replace(',', '').strip()
                try: 
                    qty = int(qty_str)
                    if ma in master_items:
                        master_items[ma]['TargetCQty'] = qty
                except: pass
    return pd.DataFrame(list(master_items.values())), mapping_data

def build_xnt():
    master_df, mapping_data = load_master_and_2024_targets()
    std_movements = {}
    if os.path.exists(STD_MOVEMENTS_FILE):
        with open(STD_MOVEMENTS_FILE, 'r', encoding='utf-8') as f:
            std_movements = json.load(f)

    con = duckdb.connect()
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{DB_URL}' AS db (TYPE POSTGRES);")

    q = f"""
        SELECT h.loaihd, (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as tdlap_ict,
               d.ten, d.sluong, d.thtien
        FROM db.ext_listhoadon h
        JOIN db.ext_detailhoadon d ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}' AND h.tthai IN ('1','2','4','5')
        AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = {YEAR}
    """
    df_raw = con.execute(q).df()
    df_raw['Tháng'] = df_raw['tdlap_ict'].dt.month
    
    # Fuzzy mapping
    def get_ma(tn):
        tu = str(tn).upper()
        if tu in mapping_data: return mapping_data[tu]
        for t_map, ma in mapping_data.items():
            if t_map in tu: return ma
        return master_df.iloc[0]['MaHang']
    df_raw['MaHang'] = df_raw['ten'].apply(get_ma)
    
    # Pre-generate m_agg with full index to avoid slow concat
    full_idx = master_df['MaHang'].unique()
    # Define columns for m_agg
    m_cols = []
    for m in range(1, 13):
        for val in ['sluong', 'thtien']:
            for loai in ['muavao', 'banra']:
                m_cols.append((val, m, loai))
    m_agg = pd.DataFrame(0.0, index=full_idx, columns=pd.MultiIndex.from_tuples(m_cols))

    # Fill from DB initially
    db_pivot = df_raw.pivot_table(index='MaHang', columns=['Tháng', 'loaihd'], values=['sluong', 'thtien'], aggfunc='sum', fill_value=0)
    for col in db_pivot.columns:
        if col in m_agg.columns:
            m_agg.loc[db_pivot.index, col] = db_pivot[col]

    # REASONABLE ADJUSTMENT: OVERRIDE WITH STANDARD QUANTITY MOVEMENTS
    for ma, months in std_movements.items():
        if ma not in m_agg.index: continue
        for m_str, data in months.items():
            m = int(m_str)
            # Implied price per month
            v_m = m_agg.at[ma, ('sluong', m, 'muavao')]
            v_b = m_agg.at[ma, ('sluong', m, 'banra')]
            p_m = m_agg.at[ma, ('thtien', m, 'muavao')] / v_m if v_m != 0 else 0.0
            p_b = m_agg.at[ma, ('thtien', m, 'banra')] / v_b if v_b != 0 else 0.0
            
            m_agg.at[ma, ('sluong', m, 'muavao')] = data['nhap']
            m_agg.at[ma, ('sluong', m, 'banra')] = data['xuat']
            # Re-estimate if we have price, else 0 (will be handled by weighted price later)
            m_agg.at[ma, ('thtien', m, 'muavao')] = data['nhap'] * p_m
            m_agg.at[ma, ('thtien', m, 'banra')] = data['xuat'] * p_b

    # Aggregates for summary
    summary_data = []
    for ma in full_idx:
        n_qty = sum(m_agg.at[ma, ('sluong', m, 'muavao')] for m in range(1, 13))
        x_qty = sum(m_agg.at[ma, ('sluong', m, 'banra')] for m in range(1, 13))
        n_amt = sum(m_agg.at[ma, ('thtien', m, 'muavao')] for m in range(1, 13))
        # Total
        summary_data.append({'MaHang': ma, 'sluong_muavao': n_qty, 'sluong_banra': x_qty, 'thtien_muavao': n_amt})
    summary = master_df.merge(pd.DataFrame(summary_data), on='MaHang')

    # SOLVER (Rule 7)
    results = []
    for idx, row in summary.iterrows():
        ma = row['MaHang']
        d_qty_from_target = row['TargetCQty'] + row['sluong_banra'] - row['sluong_muavao']
        max_deficit = 0
        curr = 0
        for m in range(1, 13):
            curr += (m_agg.at[ma, ('sluong', m, 'muavao')] - m_agg.at[ma, ('sluong', m, 'banra')])
            max_deficit = max(max_deficit, -curr)
        summary.at[idx, 'D_Qty'] = int(max(d_qty_from_target, max_deficit, 0))

    # Pricing & Valuation (Rule 1)
    summary['EstP'] = (summary['thtien_muavao'] / summary['sluong_muavao'].replace(0, 1)).replace(0, 20000)
    summary.loc[summary['EstP'] <= 0, 'EstP'] = 20000
    summary['D_Amt'] = (summary['D_Qty'] * summary['EstP'])
    
    cur_total_d = summary['D_Amt'].sum()
    if cur_total_d > 0:
        summary['D_Amt'] = (summary['D_Amt'] / cur_total_d) * TOTAL_OPENING_VALUE
    else:
        summary['D_Amt'] = TOTAL_OPENING_VALUE / len(summary)
    
    # Fix opening total exactly
    diff = TOTAL_OPENING_VALUE - summary['D_Amt'].sum()
    summary.at[0, 'D_Amt'] += diff
    summary['FinalAvgP'] = (summary['D_Amt'] + summary['thtien_muavao']) / (summary['D_Qty'] + summary['sluong_muavao']).replace(0, 1)

    # Iterative negative removal for value (Rule 7 Value)
    for _ in range(5):
        any_neg = False
        for idx, row in summary.iterrows():
            ma = row['MaHang']
            ap = row['FinalAvgP']
            cv = row['D_Amt']
            min_v = 0
            for m in range(1, 13):
                cv += (m_agg.at[ma, ('thtien', m, 'muavao')] - m_agg.at[ma, ('sluong', m, 'banra')] * ap)
                min_v = min(min_v, cv)
            if min_v < -0.01:
                summary.at[idx, 'D_Amt'] += abs(min_v) + 1000
                any_neg = True
        total_d = summary['D_Amt'].sum()
        summary['D_Amt'] = (summary['D_Amt'] / total_d) * TOTAL_OPENING_VALUE
        summary['FinalAvgP'] = (summary['D_Amt'] + summary['thtien_muavao']) / (summary['D_Qty'] + summary['sluong_muavao']).replace(0, 1)
        if not any_neg: break

    # Excel Generation
    with pd.ExcelWriter(OUTPUT_FILE, engine='openpyxl') as writer:
        q_c = summary.set_index('MaHang')['D_Qty'].to_dict()
        v_c = summary.set_index('MaHang')['D_Amt'].to_dict()
        p_c = summary.set_index('MaHang')['FinalAvgP'].to_dict()
        total_cogs_per_item = {ma: 0.0 for ma in full_idx}

        for m in range(1, 13):
            # Monthly rows
            mlist = []
            for ma in full_idx:
                row_sum = summary[summary['MaHang'] == ma].iloc[0]
                n_qty = m_agg.at[ma, ('sluong', m, 'muavao')]
                n_amt = m_agg.at[ma, ('thtien', m, 'muavao')]
                x_qty = m_agg.at[ma, ('sluong', m, 'banra')]
                mlist.append({
                    'Tên Hàng': row_sum['TenHang'],
                    'MaHang': ma,
                    'Tồn Đầu Kỳ (SL)': q_c[ma],
                    'Tồn Đầu Kỳ (VNĐ)': v_c[ma],
                    'Nhập (SL)': n_qty,
                    'Nhập (VNĐ)': n_amt,
                    'Xuất (SL)': x_qty,
                    'Giá Vốn': p_c[ma],
                    'Xuất Theo Giá Vốn': round(x_qty * p_c[ma], 2),
                })
            df_m = pd.DataFrame(mlist)
            df_m['Tồn Cuối (SL)'] = df_m['Tồn Đầu Kỳ (SL)'] + df_m['Nhập (SL)'] - df_m['Xuất (SL)']
            df_m['Tồn Cuối (VNĐ)'] = df_m['Tồn Đầu Kỳ (VNĐ)'] + df_m['Nhập (VNĐ)'] - df_m['Xuất Theo Giá Vốn']
            
            # Update carry-overs
            q_c = df_m.set_index('MaHang')['Tồn Cuối (SL)'].to_dict()
            v_c = df_m.set_index('MaHang')['Tồn Cuối (VNĐ)'].to_dict()
            for ma, cogs in zip(df_m['MaHang'], df_m['Xuất Theo Giá Vốn']):
                total_cogs_per_item[ma] += cogs
            
            # Formatted month sheet
            # Remove helper col MaHang
            df_m_out = df_m.drop(columns=['MaHang'])
            ts = df_m_out.sum(numeric_only=True); ts['Tên Hàng'] = 'TỔNG CỘNG'
            pd.concat([df_m_out, pd.DataFrame([ts])], ignore_index=True).to_excel(writer, sheet_name=f"Thang {m}", index=False)

        # Summary 12 months
        summary['X_COGS'] = summary['MaHang'].map(total_cogs_per_item)
        x12 = summary[['TenHang', 'D_Qty', 'sluong_muavao', 'sluong_banra', 'X_COGS']].copy()
        x12.columns = ['TenHang', 'Tồn Đầu', 'Nhập', 'Xuất', 'X_COGS']
        ts = x12.sum(numeric_only=True); ts['TenHang'] = 'TỔNG CỘNG'
        pd.concat([x12, pd.DataFrame([ts])], ignore_index=True).to_excel(writer, sheet_name="xnt12thang", index=False)

    print(f"✅ Final Adjusted XNT Complete!")

if __name__ == "__main__":
    build_xnt()
