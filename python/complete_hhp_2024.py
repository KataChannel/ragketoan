import pandas as pd
import duckdb
import os
import glob
import json
import re
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

# ------------------------------------------------------------
# 1. DATABASE EXTRACTION
# ------------------------------------------------------------
def fetch_invoices():
    print("  - Fetching invoices from DB...")
    con = duckdb.connect()
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{DB_URL}' AS db (TYPE POSTGRES);")
    
    query = f"""
        SELECT 
            (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE as date,
            h.shdon as invoice_no,
            h.loaihd as type,
            d.ten as detail,
            d.sluong as qty,
            d.thtien as amount,
            d.tthue as tax,
            h.nmten as customer_vendor
        FROM db.ext_listhoadon h
        JOIN db.ext_detailhoadon d ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}'
        AND h.tthai IN ('1','2','4','5')
        AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = {YEAR}
    """
    df = con.execute(query).df()
    return df

# ------------------------------------------------------------
# 2. BANK STATEMENT EXTRACTION
# ------------------------------------------------------------
def fetch_bank_statements():
    BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sao kê VTB 2024"
    print(f"  - Looking for bank statements in: {BANK_DIR}")
    files = glob.glob(os.path.join(BANK_DIR, "*.xls"))
    print(f"  - Found {len(files)} bank files.")
    all_trans = []
    
    for f in files:
        fname = os.path.basename(f)
        try:
            # Vietinbank 2024 format often has headers near row 10-12
            df_probe = pd.read_excel(f, header=None, nrows=25)
            header_row = -1
            for i, row in df_probe.iterrows():
                row_str = " ".join([str(x) for x in row.values]).upper()
                if ('NGÀY' in row_str or 'CHỨNG TỪ' in row_str) and \
                   ('DIỄN GIẢI' in row_str or 'NỘI DUNG' in row_str):
                    header_row = i
                    break
            
            if header_row == -1: header_row = 12
                
            df = pd.read_excel(f, skiprows=header_row)
            col_map = {}
            for col in df.columns:
                c = str(col).upper().strip()
                v0 = str(df[col].iloc[0]).upper() if not df[col].empty else ""
                if 'NGÀY' in c: col_map[col] = 'date'
                elif 'DIỄN GIẢI' in c or 'NỘI DUNG' in c: col_map[col] = 'desc'
                elif 'THU' in c or 'GHI CÓ' in c or 'THU' in v0: col_map[col] = 'credit'
                elif 'CHI' in c or 'GHI NỢ' in c or 'CHI' in v0: col_map[col] = 'debit'
                elif 'SỐ TIỀN' in c and ('NHẢ' not in c):
                    if 'CÓ' in c: col_map[col] = 'credit'
                    elif 'NỢ' in c: col_map[col] = 'debit'

            df = df.rename(columns=col_map)
            df = df.dropna(subset=['date'])
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            df = df[df['date'].dt.year == YEAR]
            
            for c in ['debit', 'credit']:
                if c in df.columns: df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
            
            if 'credit' not in df.columns: df['credit'] = 0
            if 'debit' not in df.columns: df['debit'] = 0
            
            all_trans.append(df[['date', 'desc', 'debit', 'credit']])
            print(f"    - Added {len(df)} from {fname}")
        except Exception as e: print(f"    - Error {fname}: {e}")
            
    return pd.concat(all_trans).sort_values('date') if all_trans else pd.DataFrame(columns=['date', 'desc', 'debit', 'credit'])

# ------------------------------------------------------------
# 3. BUILD BOOKS
# ------------------------------------------------------------
def generate_books():
    print(f"🚀 Starting automation for HHP {YEAR}...")
    if not os.path.exists(OUTPUT_DIR): os.makedirs(OUTPUT_DIR)
    
    invoices = fetch_invoices()
    bank = fetch_bank_statements()
    
    # 3.1 Load Opening Balances from 2023
    print("  - Loading opening balances from 2023...")
    prev_cdps = pd.read_excel(PREV_LEDGER, sheet_name='CDPS')
    opening_bals = {}
    for _, row in prev_cdps.iterrows():
        acc = str(row['Tên Tài Khoản'])
        opening_bals[acc] = {'no': row['Dư Cuối Nợ'], 'co': row['Dư Cuối Có']}
    
    # Opening Inventory (1561)
    df_prev_xnt = pd.read_excel(PREV_XNT, sheet_name='Thang 12')
    # Filter only relevant items (rows that have 'Tên Hàng')
    df_prev_xnt = df_prev_xnt[df_prev_xnt['Tên Hàng'].notna() & (df_prev_xnt['Tên Hàng'] != 'TỔNG CỘNG')]
    opening_inv = df_prev_xnt.set_index('Tên Hàng')[['Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']].to_dict('index')

    entries = []
    
    # Process Invoices
    for _, row in invoices.iterrows():
        dt, no, desc, amt, tax = row['date'], row['invoice_no'], row['detail'], row['amount'], row['tax']
        if row['type'] == 'banra':
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Bán hàng: {desc}", 'TK Nợ': '131', 'TK Có': '5111', 'Tạo': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Thuế ĐR HĐ {no}", 'TK Nợ': '131', 'TK Có': '3331', 'Tạo': 'INV', 'Tiền': tax})
        else:
            acc_dr = '1561'
            if any(x in str(desc).upper() for x in ["PHÍ", "QUẢNG CÁO", "DỊCH VỤ", "VẬN CHUYỂN", "LƯƠNG"]): acc_dr = '642'
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Mua vào: {desc}", 'TK Nợ': acc_dr, 'TK Có': '331', 'Tạo': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Thuế ĐV HĐ {no}", 'TK Nợ': '1331', 'TK Có': '331', 'Tạo': 'INV', 'Tiền': tax})

    # Process Bank
    for _, row in bank.iterrows():
        dt, desc, db, cr = row['date'], row['desc'], row['debit'], row['credit']
        if cr > 0: entries.append({'Ngày': dt, 'Số CT': 'BC', 'Diễn giải': f"GBC: {desc}", 'TK Nợ': '112', 'TK Có': '131', 'Tạo': 'BNK', 'Tiền': cr})
        if db > 0:
            cr_acc = '331'
            if any(x in str(desc).upper() for x in ["LÃI", "PHÍ", "LƯƠNG"]): cr_acc = '635' if 'LÃI' in str(desc).upper() else '642'
            entries.append({'Ngày': dt, 'Số CT': 'BN', 'Diễn giải': f"GBN: {desc}", 'TK Nợ': cr_acc, 'TK Có': '112', 'Tạo': 'BNK', 'Tiền': db})

    df_nkc = pd.DataFrame(entries)
    df_nkc['Ngày'] = pd.to_datetime(df_nkc['Ngày'])
    df_nkc = df_nkc.sort_values(['Ngày', 'Tạo'])
    
    # 4. EXCEL OUTPUTS
    acc_list = sorted(set(df_nkc['TK Nợ'].unique()) | set(df_nkc['TK Có'].unique()) | set(opening_bals.keys()))
    cdps = []
    
    sct_path = os.path.join(OUTPUT_DIR, f"SO_CHI_TIET_HHP_{YEAR}_FINAL.xlsx")
    with pd.ExcelWriter(sct_path, engine='openpyxl') as writer:
        for acc in acc_list:
            df_acc = df_nkc[(df_nkc['TK Nợ'] == acc) | (df_nkc['TK Có'] == acc)].copy()
            df_acc['Đối ứng'] = df_acc.apply(lambda r: r['TK Có'] if r['TK Nợ'] == acc else r['TK Nợ'], axis=1)
            df_acc['Nợ'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Nợ'] == acc else 0, axis=1)
            df_acc['Có'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Có'] == acc else 0, axis=1)
            
            b = opening_bals.get(acc, {'no': 0, 'co': 0})
            op_n, op_c = b['no'], b['co']
            ps_n, ps_c = df_acc['Nợ'].sum(), df_acc['Có'].sum()
            ed_n = max(op_n + ps_n - op_c - ps_c, 0)
            ed_c = max(op_c + ps_c - op_n - ps_n, 0)
            
            cdps.append({'Tên Tài Khoản': acc, 'Dư Đầu Nợ': op_n, 'Dư Đầu Có': op_c, 'Phát Sinh Nợ': ps_n, 'Phát Sinh Có': ps_c, 'Dư Cuối Nợ': ed_n, 'Dư Cuối Có': ed_c})
            
            df_out = df_acc[['Ngày', 'Số CT', 'Diễn giải', 'Đối ứng', 'Nợ', 'Có']]
            if op_n > 0 or op_c > 0:
                df_out = pd.concat([pd.DataFrame([{'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Nợ': op_n, 'Có': op_c}]), df_out], ignore_index=True)
            df_out = pd.concat([df_out, pd.DataFrame([{'Diễn giải': 'CỘNG PHÁT SINH', 'Nợ': ps_n, 'Có': ps_c}, {'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'Nợ': ed_n, 'Có': ed_c}])], ignore_index=True)
            df_out.to_excel(writer, sheet_name=f"CT_{acc}"[:31], index=False)

    nkc_path = os.path.join(OUTPUT_DIR, f"NKC_HHP_{YEAR}_FINAL.xlsx")
    with pd.ExcelWriter(nkc_path, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, sheet_name="NKC", index=False)
        pd.DataFrame(cdps).to_excel(writer, sheet_name="CDPS", index=False)
    
    # ------------------------------------------------------------
    # 5. XNT BUILD (SIMPLIFIED)
    # ------------------------------------------------------------
    xnt_path = os.path.join(OUTPUT_DIR, f"XNT_HHP_{YEAR}_FINAL.xlsx")
    # Mapping
    mapping = {}
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f: content = f.read()
        m_pat = re.compile(r'\|\s*\d+\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
        for line in content.split('\n'):
            m = m_pat.search(line)
            if m:
                ma = m.group(1).strip(); t23r = m.group(3).strip()
                if ma == "Mã Hàng (2024)": continue
                for n in [x.strip().upper() for x in t23r.split('<br>')]:
                    if n and n != "*KHÔNG TÌM THẤY*": mapping[n] = ma
    
    df_inv_only = invoices[invoices['type'].isin(['muavao', 'banra'])].copy()
    # (In real scenario we'd do a full month-by-month XNT like build_xnt_hhp_2023.py)
    # For now, let's output a summary based on the year's invoices
    print(f"✅ Success! SCT/NKC/CDPS created in {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_books()
