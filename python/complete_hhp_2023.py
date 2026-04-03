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
YEAR = 2023
DB_URL = "postgresql://root:password@localhost:5432/ketoan"
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023"

# Opening/Closing Balances
TON_DAU_1561 = 15447634554
TON_CUOI_1561 = 15761231523
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023"

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
# 2. BANK EXTRACTION (Standardized)
# ------------------------------------------------------------
def fetch_bank_statements():
    all_trans = []
    files = glob.glob(os.path.join(BANK_DIR, "*.xls"))
    
    for f in files:
        fname = os.path.basename(f)
        try:
            # We try to read headers until we find them. 
            # Vietnamese bank statements often have two layers of headers.
            df_probe = pd.read_excel(f, header=None, nrows=25)
            header_row = -1
            sub_header_data = {} # To find columns like THU/CHI in data area
            
            for i, row in df_probe.iterrows():
                row_str = " ".join([str(x) for x in row.values]).upper()
                if ('NGÀY' in row_str or 'CHỨNG TỪ' in row_str) and \
                   ('DIỄN GIẢI' in row_str or 'NỘI DUNG' in row_str or 'THỤ' in row_str):
                    header_row = i
                    # Let's check if the row after this row contains 'THU' or 'CHI'
                    next_row_str = " ".join([str(x) for x in df_probe.iloc[i+1].values]).upper()
                    if 'THU' in next_row_str or 'CHI' in next_row_str:
                        # Successively layer headers? 
                        # Easier for now to just peek row 0 of reading or take the next row as values etc.
                        pass
                    break
            
            if header_row == -1:
                header_row = 10 # Default for many formats
                
            df = pd.read_excel(f, skiprows=header_row)
            
            # Heuristic for columns
            col_map = {}
            for col in df.columns:
                c = str(col).upper().strip()
                v0 = str(df[col].iloc[0]).upper() if not df[col].empty else ""
                
                if 'NGÀY' in c: col_map[col] = 'date'
                elif 'DIỄN GIẢI' in c or 'NỘI DUNG' in c: col_map[col] = 'desc'
                
                # Check for THU/CHI in the first data row (as they are often labels)
                if 'THU' in c or 'GHI CÓ' in c or 'THU' in v0: col_map[col] = 'credit'
                elif 'CHI' in c or 'GHI NỢ' in c or 'CHI' in v0: col_map[col] = 'debit'
                elif 'SỐ TIỀN' in c and ('NHẢ' not in c):
                    # Guess if it is debit or credit by nearby headers or index
                    if 'CÓ' in c: col_map[col] = 'credit'
                    elif 'NỢ' in c: col_map[col] = 'debit'
                    else: col_map[col] = 'amount'

            df = df.rename(columns=col_map)
            # If we renamed multiple to 'credit' or 'debit' just keep first? 
            # Or if it's named Credit/Debit from v0, we must remove those rows.
            df = df.dropna(subset=['date'])
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            df = df[df['date'].dt.year == YEAR]
            
            # Convert to numeric
            for c in ['debit', 'credit', 'amount']:
                if c in df.columns: df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
            
            if 'credit' not in df.columns: df['credit'] = 0
            if 'debit' not in df.columns: df['debit'] = 0
            
            all_trans.append(df[['date', 'desc', 'debit', 'credit']])
            print(f"  - Added {len(df)} from {fname}")
        except Exception as e:
            print(f"  - Error {fname}: {e}")
            
    return pd.concat(all_trans).sort_values('date') if all_trans else pd.DataFrame()

# ------------------------------------------------------------
# 3. BUILD BOOKS
# ------------------------------------------------------------
def start():
    print(f"🚀 Accounting Blueprint HHP {YEAR}")
    invoices = fetch_invoices()
    bank = fetch_bank_statements()
    print(f"  - Raw data: {len(invoices)} invoices, {len(bank)} bank tx.")
    
    entries = []
    
    # 3.1 Mapping Invoices
    for _, row in invoices.iterrows():
        dt, no, desc, amt, tax, tc = row['date'], row['invoice_no'], row['detail'], row['amount'], row['tax'], row['customer_vendor']
        if row['type'] == 'banra':
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Bán hàng: {desc}", 'TK Nợ': '131', 'TK Có': '5111', 'Tạo': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Thuế ĐR HĐ {no}", 'TK Nợ': '131', 'TK Có': '3331', 'Tạo': 'INV', 'Tiền': tax})
        else:
            acc_dr = '1561'
            if any(x in str(desc).upper() for x in ["PHÍ", "LÀM", "SỬA", "CÔNG", "QUẢN"]): acc_dr = '642'
            entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Mua vào: {desc}", 'TK Nợ': acc_dr, 'TK Có': '331', 'Tạo': 'INV', 'Tiền': amt})
            if tax > 0: entries.append({'Ngày': dt, 'Số CT': f"HĐ {no}", 'Diễn giải': f"Thuế ĐV HĐ {no}", 'TK Nợ': '1331', 'TK Có': '331', 'Tạo': 'INV', 'Tiền': tax})
            
    # 3.2 Mapping Bank (112)
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
    
    # 3.3 SCT & CDPS
    acc_list = sorted(set(df_nkc['TK Nợ'].unique()) | set(df_nkc['TK Có'].unique()))
    cdps = []
    
    # Generate SCT first
    sct_path = os.path.join(OUTPUT_DIR, "SO_CHI_TIET_HHP_2023_FINAL.xlsx")
    with pd.ExcelWriter(sct_path, engine='openpyxl') as writer:
        for acc in acc_list:
            df_acc = df_nkc[(df_nkc['TK Nợ'] == acc) | (df_nkc['TK Có'] == acc)].copy()
            df_acc['Đối ứng'] = df_acc.apply(lambda r: r['TK Có'] if r['TK Nợ'] == acc else r['TK Nợ'], axis=1)
            df_acc['Nợ'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Nợ'] == acc else 0, axis=1)
            df_acc['Có'] = df_acc.apply(lambda r: r['Tiền'] if r['TK Có'] == acc else 0, axis=1)
            
            # Balances
            open_n = TON_DAU_1561 if acc == '1561' else 0
            open_c = TON_DAU_1561 if acc == '411' else 0 # Simple balance
            ps_n, ps_c = df_acc['Nợ'].sum(), df_acc['Có'].sum()
            end_n = max(open_n + ps_n - open_c - ps_c, 0)
            end_c = max(open_c + ps_c - open_n - ps_n, 0)
            
            cdps.append({'Tên Tài Khoản': acc, 'Dư Đầu Nợ': open_n, 'Dư Đầu Có': open_c, 'Phát Sinh Nợ': ps_n, 'Phát Sinh Có': ps_c, 'Dư Cuối Nợ': end_n, 'Dư Cuối Có': end_c})
            
            # Print to Excel
            df_out = df_acc[['Ngày', 'Số CT', 'Diễn giải', 'Đối ứng', 'Nợ', 'Có']]
            # Add Opening row
            if open_n > 0 or open_c > 0:
                op_row = pd.DataFrame([{'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Nợ': open_n, 'Có': open_c}])
                df_out = pd.concat([op_row, df_out], ignore_index=True)
            # Add Sum row
            sum_row = pd.DataFrame([{'Diễn giải': 'CỘNG PHÁT SINH', 'Nợ': ps_n, 'Có': ps_c}, {'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'Nợ': end_n, 'Có': end_c}])
            df_out = pd.concat([df_out, sum_row], ignore_index=True)
            
            sn = f"CT_{acc}"[:31]
            df_out.to_excel(writer, sheet_name=sn, index=False)
            
    # 3.4 CDPS & NKC Excel
    df_cdps = pd.DataFrame(cdps)
    nkc_path = os.path.join(OUTPUT_DIR, "NKC_HHP_2023_FINAL.xlsx")
    with pd.ExcelWriter(nkc_path, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, sheet_name="NKC", index=False)
        df_cdps.to_excel(writer, sheet_name="CDPS", index=False)
    
    print(f"✅ Success! SCT: {len(acc_list)} accounts.")

if __name__ == "__main__":
    start()
