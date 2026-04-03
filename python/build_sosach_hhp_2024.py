import pandas as pd
import duckdb
import os
import glob
import re
import json
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
YEAR = 2024
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024"
PREV_XNT = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/XNT_HHP_2023_FINAL.xlsx"
PREV_LEDGER = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/NKC_HHP_2023_FINAL.xlsx"
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sao kê VTB 2024"
MAPPING_FILE = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/2.mapping_341_items.md"

# ------------------------------------------------------------
# 1. FETCH DOCUMENTS
# ------------------------------------------------------------
def fetch_invoices():
    print("  - Fetching invoices from DB...")
    con = duckdb.connect()
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{DB_URL}' AS db (TYPE POSTGRES);")
    q = f"""
        SELECT (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE as date,
               h.shdon as no, h.loaihd as type, d.ten as item, d.sluong as qty, d.thtien as amt, d.tthue as tax, h.nmten as entity
        FROM db.ext_listhoadon h JOIN db.ext_detailhoadon d ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}' AND h.tthai IN ('1','2','4','5') AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = {YEAR}
    """
    return con.execute(q).df()

def fetch_bank():
    print("  - Processing bank statements...")
    files = glob.glob(os.path.join(BANK_DIR, "*.xls"))
    all_tx = []
    for f in files:
        fname = os.path.basename(f)
        try:
            # Probe header row
            df_probe = pd.read_excel(f, header=None, nrows=35)
            h_row = -1
            for i, row in df_probe.iterrows():
                rs = " ".join([str(x) for x in row.values]).upper()
                if 'NGÀY PHÁT SINH' in rs or 'NGÀY GIAO DỊCH' in rs:
                    h_row = i; break
            if h_row == -1: h_row = 23
            df = pd.read_excel(f, skiprows=h_row)
            m = {}
            for col in df.columns:
                c = str(col).upper()
                if 'NGÀY' in c: m[col] = 'date'
                elif 'DIỄN GIẢI' in c or 'NỘI DUNG' in c: m[col] = 'desc'
                elif 'GHI NỢ' in c or 'DEBIT' in c: m[col] = 'db'
                elif 'GHI CÓ' in c or 'CREDIT' in c: m[col] = 'cr'
            df = df.rename(columns=m)
            df = df.dropna(subset=['date'])
            df['date'] = pd.to_datetime(df['date'].astype(str).str.split().str[0], errors='coerce', dayfirst=True)
            df = df[df['date'].dt.year == YEAR]
            for c in ['db', 'cr']: df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
            all_tx.append(df[['date', 'desc', 'db', 'cr']])
        except: pass
    return pd.concat(all_tx).sort_values('date') if all_tx else pd.DataFrame(columns=['date','desc','db','cr'])

# ------------------------------------------------------------
# 2. GENERATE LEDGER (NKC/SCT)
# ------------------------------------------------------------
def build_ledger(df_inv, df_bank):
    print("  - Building Ledger parts...")
    if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
    
    # Opening Balances
    prev_cdps = pd.read_excel(PREV_LEDGER, sheet_name='CDPS')
    prev_cdps['Tên Tài Khoản'] = prev_cdps['Tên Tài Khoản'].astype(str).str.replace(r'\.0$', '', regex=True)
    open_b = {r['Tên Tài Khoản']: {'no': r['Dư Cuối Nợ'], 'co': r['Dư Cuối Có']} for _, r in prev_cdps.iterrows()}
    
    entries = []
    # Process Invoices
    for _, r in df_inv.iterrows():
        dt, no, item, amt, tax = r['date'], r['no'], r['item'], r['amt'], r['tax']
        if r['type'] == 'banra':
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Bán: {item}", 'TK Nợ': '131', 'TK Có': '5111', 'L': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': "Thuế ĐR", 'TK Nợ': '131', 'TK Có': '3331', 'L': 'INV', 'Tiền': tax})
        else:
            acc = '1561' if not any(x in str(item).upper() for x in ["PHÍ","QUẢNG","VẬN CHUYỂN","LƯƠNG"]) else '642'
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Mua: {item}", 'TK Nợ': acc, 'TK Có': '331', 'L': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': "Thuế ĐV", 'TK Nợ': '1331', 'TK Có': '331', 'L': 'INV', 'Tiền': tax})
    
    # Process Bank
    for _, r in df_bank.iterrows():
        dt, ds, db, cr = r['date'], r['desc'], r['db'], r['cr']
        if cr > 0: entries.append({'Ngày': dt, 'Số CT': 'BC', 'Diễn giải': f"GBC: {ds}", 'TK Nợ': '112', 'TK Có': '131', 'L': 'BNK', 'Tiền': cr})
        if db > 0:
            cr_acc = '331' if not any(x in str(ds).upper() for x in ["LÃI","PHÍ","LƯƠNG"]) else ('635' if 'LÃI' in str(ds).upper() else '642')
            entries.append({'Ngày': dt, 'Số CT': 'BN', 'Diễn giải': f"GBN: {ds}", 'TK Nợ': cr_acc, 'TK Có': '112', 'L': 'BNK', 'Tiền': db})
    
    # Force entries to use string accounts
    df_nkc = pd.DataFrame(entries)
    df_nkc['TK Nợ'] = df_nkc['TK Nợ'].astype(str).str.replace(r'\.0$', '', regex=True)
    df_nkc['TK Có'] = df_nkc['TK Có'].astype(str).str.replace(r'\.0$', '', regex=True)
    df_nkc = df_nkc.sort_values(['Ngày', 'L'])
    
    acc_list = sorted(set(df_nkc['TK Nợ']) | set(df_nkc['TK Có']) | set(open_b.keys()))
    cdps = []
    
    sct_path = os.path.join(OUTPUT_DIR, "SCT_HHP_2024_FINAL.xlsx")
    with pd.ExcelWriter(sct_path, engine='openpyxl') as wr:
        for acc in acc_list:
            df_acc = df_nkc[(df_nkc['TK Nợ']==acc)|(df_nkc['TK Có']==acc)].copy()
            df_acc['Đối ứng'] = df_acc.apply(lambda r: r['TK Có'] if r['TK Nợ']==acc else r['TK Nợ'], axis=1)
            df_acc['Nợ'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Nợ']==acc else 0, axis=1)
            df_acc['Có'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Có']==acc else 0, axis=1)
            b = open_b.get(acc, {'no':0, 'co':0}); opn, opc = b['no'], b['co']
            psn, psc = df_acc['Nợ'].sum(), df_acc['Có'].sum()
            edn, edc = max(opn+psn-opc-psc,0), max(opc+psc-opn-psn,0)
            cdps.append({'Tên Tài Khoản':acc, 'Dư Đầu Nợ':opn, 'Dư Đầu Có':opc, 'Phát Sinh Nợ':psn, 'Phát Sinh Có':psc, 'Dư Cuối Nợ':edn, 'Dư Cuối Có':edc})
            df_o = df_acc[['Ngày', 'Số CT', 'Diễn giải', 'Đối ứng', 'Nợ', 'Có']]
            if opn+opc>0: df_o = pd.concat([pd.DataFrame([{'Diễn giải':'SỐ DƯ ĐẦU KỲ','Nợ':opn,'Có':opc}]), df_o], ignore_index=True)
            df_o = pd.concat([df_o, pd.DataFrame([{'Diễn giải':'CỘNG PHÁT SINH','Nợ':psn,'Có':psc},{'Diễn giải':'SỐ DƯ CUỐI KỲ','Nợ':edn,'Có':edc}])], ignore_index=True)
            df_o.to_excel(wr, sheet_name=f"CT_{acc}"[:31], index=False)
            
    nkc_p = os.path.join(OUTPUT_DIR, "NKC_HHP_2024_FINAL.xlsx")
    with pd.ExcelWriter(nkc_p, engine='openpyxl') as wr:
        df_nkc.to_excel(wr, sheet_name="NKC", index=False)
        pd.DataFrame(cdps).to_excel(wr, sheet_name="CDPS", index=False)
    print(f"✅ Ledger 2024 Complete.")

# ------------------------------------------------------------
# 3. BUILD XNT (MONTHLY)
# ------------------------------------------------------------
def build_xnt(df_inv):
    print("  - Building XNT 2024 Monthly...")
    # Load 2023 Ending for 2024 Opening
    df_p = pd.read_excel(PREV_XNT, sheet_name='Thang 12')
    df_p = df_p[df_p['Tên Hàng'].notna() & (df_p['Tên Hàng'] != 'TỔNG CỘNG')]
    inv_o = {r['Tên Hàng']: {'q': r['Tồn Cuối (SL)'], 'v': r['Tồn Cuối (VNĐ)']} for _, r in df_p.iterrows()}
    
    # Mapping
    map_data = {}
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f: txt = f.read()
        m_pat = re.compile(r'\|\s*\d+\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
        for l in txt.split('\n'):
            m = m_pat.search(l)
            if m:
                ma, t23 = m.group(1).strip(), m.group(3).strip()
                if ma == "Mã Hàng (2024)": continue
                for n in [x.strip().upper() for x in t23.split('<br>')]:
                    if n and n != "*KHÔNG TÌM THẤY*": map_data[n] = ma

    df_inv['MaHang'] = df_inv['item'].str.upper().map(map_data).fillna('MISC')
    df_inv['date'] = pd.to_datetime(df_inv['date'])
    df_inv['month'] = df_inv['date'].dt.month
    
    # OPTIMIZATION: Aggregate once
    agg_inv = df_inv.groupby(['item', 'month', 'type']).agg({'qty': 'sum', 'amt': 'sum'}).to_dict('index')

    xnt_p = os.path.join(OUTPUT_DIR, "XNT_HHP_2024_FINAL.xlsx")
    with pd.ExcelWriter(xnt_p, engine='openpyxl') as wr:
        q_c = {k: v['q'] for k, v in inv_o.items()}
        v_c = {k: v['v'] for k, v in inv_o.items()}
        
        items_total_cogs = {k: 0.0 for k in inv_o.keys()}
        
        # Gather all items ever existed
        all_items = sorted(set(inv_o.keys()) | set(df_inv['item']))

        for m in range(1, 13):
            mlist = []
            for item in all_items:
                o_q = q_c.get(item, 0); o_v = v_c.get(item, 0)
                
                # Faster lookup using optimized dict
                n_data = agg_inv.get((item, m, 'muavao'), {'qty': 0, 'amt': 0})
                n_q = n_data['qty']; n_v = n_data['amt']
                
                x_data = agg_inv.get((item, m, 'banra'), {'qty': 0, 'amt': 0})
                x_q = x_data['qty']
                
                # Average Price
                avg_p = (o_v + n_v) / (o_q + n_q) if (o_q + n_q) > 0 else 0
                x_v = x_q * avg_p
                
                c_q = o_q + n_q - x_q
                c_v = o_v + n_v - x_v
                
                # Update carry-overs
                q_c[item] = c_q; v_c[item] = c_v
                if item in items_total_cogs: items_total_cogs[item] += x_v
                else: items_total_cogs[item] = x_v
                
                mlist.append({'Tên Hàng': item, 'Tồn Đầu (SL)': o_q, 'Tồn Đầu (VNĐ)': o_v, 'Nhập (SL)': n_q, 'Nhập (VNĐ)': n_v, 'Xuất (SL)': x_q, 'Giá Vốn': avg_p, 'Xuất Theo Giá Vốn': x_v, 'Tồn Cuối (SL)': c_q, 'Tồn Cuối (VNĐ)': c_v})
            
            df_out = pd.DataFrame(mlist)
            # Add Total
            t = df_out.sum(numeric_only=True); t['Tên Hàng'] = 'TỔNG CỘNG'
            pd.concat([df_out, pd.DataFrame([t])], ignore_index=True).to_excel(wr, sheet_name=f"Thang {m}", index=False)
            
        # Summary
        summary = []
        for item in all_items:
            # Re-sum for summary from agg_inv dict
            total_n_q = sum(agg_inv.get((item, m, 'muavao'), {'qty':0})['qty'] for m in range(1,13))
            total_x_q = sum(agg_inv.get((item, m, 'banra'), {'qty':0})['qty'] for m in range(1,13))
            
            o_info = inv_o.get(item, {'q':0, 'v':0})
            summary.append({'Tên Hàng': item, 'Tồn Đầu': o_info['q'], 'Nhập': total_n_q, 'Xuất': total_x_q, 'X_COGS': items_total_cogs.get(item, 0), 'Tồn Cuối': q_c.get(item, 0)})
        df_sum = pd.DataFrame(summary)
        t = df_sum.sum(numeric_only=True); t['Tên Hàng'] = 'TỔNG CỘNG'
        pd.concat([df_sum, pd.DataFrame([t])], ignore_index=True).to_excel(wr, sheet_name="xnt12thang", index=False)
    print(f"✅ XNT 2024 Complete.")

if __name__ == "__main__":
    df_i = fetch_invoices()
    df_b = fetch_bank()
    build_ledger(df_i, df_b)
    build_xnt(df_i)
