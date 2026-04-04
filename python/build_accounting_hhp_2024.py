import pandas as pd
import psycopg2
import os
import re
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from datetime import datetime

# ============================================================
# CONFIG
# ============================================================
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
HHP_COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
HHP_MST = "5900428904"
YEAR = 2024
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024"
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sao kê VTB 2024"
SCT_2023_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# ============================================================
# UTILS
# ============================================================
def format_excel_sheet(ws, headers):
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="2F5496")
    header_alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))

    for col, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = header_alignment
        cell.border = border
        ws.column_dimensions[get_column_letter(col)].width = 20

# ============================================================
# DATABASE LOADING
# ============================================================
def fetch_database_data():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    q_inv = """
        SELECT "idServer", shdon, tdlap, loaihd, nmmst, nmten, nbmst, nbten, tgtcthue, tgtthue, tgtttbso, khhdon, tthai
        FROM ext_listhoadon
        WHERE "congtyId" = %s AND EXTRACT(YEAR FROM tdlap) = %s AND tthai IN ('1','2','4','5')
    """
    cur.execute(q_inv, (HHP_COMPANY_ID, YEAR))
    invoices = cur.fetchall()
    cols_inv = [desc[0] for desc in cur.description]
    df_inv = pd.DataFrame(invoices, columns=cols_inv)
    
    q_det = """
        SELECT d.ten, d.sluong, d.dgia, d.thtien, d.tthue, d."idhdonServer"
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = %s AND EXTRACT(YEAR FROM h.tdlap) = %s AND h.tthai IN ('1','2','4','5')
    """
    cur.execute(q_det, (HHP_COMPANY_ID, YEAR))
    details = cur.fetchall()
    cols_det = [desc[0] for desc in cur.description]
    df_det = pd.DataFrame(details, columns=cols_det)
    
    conn.close()
    return df_inv, df_det

# ============================================================
# BANK STATEMENT LOADING (2024 VTB)
# ============================================================
def load_bank_statements_2024():
    all_trans = []
    if not os.path.exists(BANK_DIR):
        print(f"Bank dir not found: {BANK_DIR}")
        return pd.DataFrame()
        
    for filename in os.listdir(BANK_DIR):
        if not (filename.endswith(".xls") or filename.endswith(".xlsx")): continue
        path = os.path.join(BANK_DIR, filename)
        
        try:
            # Monthly statement logic - the columns are likely:
            # 0: Date, 1: Content/Description, 2: Withdrawal, 3: Deposit, 4: Balance
            df_raw = pd.read_excel(path, header=None)
            
            def clean_m(v):
                try: 
                    s = str(v).replace(',', '').replace(' ', '')
                    if not s or s.lower() == 'nan': return 0.0
                    return float(s)
                except: return 0.0

            if "sao ke" in filename.lower():
                for index, row in df_raw.iterrows():
                    try:
                        d_val = str(row.iloc[1])
                        # Match formats like DD-MM-YYYY or DD/MM/YYYY
                        if not re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', d_val): continue
                        
                        # Sometimes it has time: 19-02-2024 03:46:29
                        match = re.search(r'(\d{2}[-/]\d{2}[-/]\d{4})', d_val)
                        if not match: continue
                        dt_s = match.group(1)
                        
                        dt = pd.to_datetime(dt_s, dayfirst=True, errors='coerce')
                        if pd.isna(dt) or dt.year != YEAR: continue
                        
                        debit = clean_m(row.iloc[3]) if len(row) > 3 else 0.0
                        credit = clean_m(row.iloc[4]) if len(row) > 4 else 0.0
                        desc = str(row.iloc[2]) if len(row) > 2 else ""
                        
                        if debit == 0 and credit == 0: continue
                        if "số dư đầu kỳ" in desc.lower() or "opening balance" in desc.lower(): continue
                        
                        all_trans.append({'Bank': 'VTB', 'Date': dt, 'Description': desc, 'Debit': debit, 'Credit': credit})
                    except: continue
            elif "trả gốc vay" in filename.lower():
                # Example: ['01/01/2024', 'Lãi vay...', '1000000']
                for index, row in df_raw.iterrows():
                    try:
                        d_val = str(row.iloc[1]) # Check column 1 for date
                        if not re.match(r'\d{2}[-/]\d{2}[-/]\d{4}', d_val): 
                            d_val = str(row.iloc[0]) # Try column 0
                            if not re.match(r'\d{2}[-/]\d{2}[-/]\d{4}', d_val): continue
                        
                        dt = pd.to_datetime(d_val[:10], dayfirst=True, errors='coerce')
                        if pd.isna(dt) or dt.year != YEAR: continue
                        
                        # Amount could be in col 2 or 3
                        amt = clean_m(row.iloc[2])
                        if amt == 0 and len(row) > 3: amt = clean_m(row.iloc[3])
                        
                        if amt == 0: continue
                        all_trans.append({'Bank': 'VTB_Loan', 'Date': dt, 'Description': "Trat goc vay - " + filename, 'Debit': amt, 'Credit': 0})
                    except: continue
                        
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            
    return pd.DataFrame(all_trans)

# ============================================================
# OPENING BALANCES
# ============================================================
def fetch_opening_balances():
    opening = {
        '112': -4975543495.0,
        '131': 125370669263.0,
        '331': 109192946534.0,
        '1561': 69249273512.0,
        '5111': 115101431558.0,
        '642': 45758746467.0,
        '1331': 10266847601.0,
        '3331': 10269237705.0,
        '341': -79083346907.0,
        '635': 11611158.0
    }
    # Priority: read from the actual 2023 SCT file if it exists
    if os.path.exists(SCT_2023_PATH):
        try:
            xl = pd.ExcelFile(SCT_2023_PATH)
            for sheet in xl.sheet_names:
                df = pd.read_excel(xl, sheet_name=sheet)
                if not df.empty:
                    val = df.iloc[-1]["Cuối kỳ"]
                    opening[sheet] = float(val)
        except Exception as e:
            print(f"Error reading SCT 2023: {e}. Using hardcoded fallback.")
    return opening

# ============================================================
# ACCOUNT MAPPING
# ============================================================
def get_acc_for_item(ten):
    t = str(ten).lower()
    if any(k in t for k in ["cước", "dịch vụ", "điện lực", "nước", "internet", "văn phòng"]): return '6422'
    return '1561'

def generate_nkc_2024(df_inv, df_det, df_bank):
    nkc_rows = []
    # Sale
    for _, inv in df_inv[df_inv['loaihd'] == 'banra'].iterrows():
        cust, date_s = inv['nmten'], inv['tdlap'].strftime('%d/%m/%Y')
        shdon = inv['shdon']
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{shdon}", 'Diễn giải': f"Bán hàng cho {cust}", 'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': cust})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{shdon}", 'Diễn giải': f"Thuế GTGT đầu ra", 'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': cust})
    
    # Purchase
    for _, inv in df_inv[df_inv['loaihd'] == 'muavao'].iterrows():
        supp, date_s = inv['nbten'], inv['tdlap'].strftime('%d/%m/%Y')
        det = df_det[df_det['idhdonServer'] == inv['idServer']]
        acc_debit = get_acc_for_item(det.iloc[0]['ten']) if not det.empty else '1561'
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Mua hàng từ {supp}", 'TK Nợ': acc_debit, 'TK Có': '331', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': supp})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Thuế GTGT đầu vào", 'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': supp})
            
    # Bank
    for _, bank in df_bank.iterrows():
        date_s, desc = bank['Date'].strftime('%d/%m/%Y'), bank['Description']
        d = desc.lower()
        party = desc.split('-')[-1].strip() if '-' in desc else desc[:50]
        
        # Credit to Bank = Cash In (Nợ 112)
        if bank['Credit'] > 0:
            if "luân chuyển" in d or "rút tiền nộp vào nh" in d:
                tk_co = '3368'
            elif any(k in d for k in ["rút bidv", "nộp vào vcb", "bidv cty nộp vào vcb cty", "nộp tiền vào tài khoản", "nt vao tk", "nop tk", "nop tien", "nt-", "nop-"]):
                tk_co = '1111'
            elif "vay vcb tt tiền hàng" in d or "vay thanh toán" in d:
                tk_co = '3411'
            elif "lãi" in d or "tra lai" in d:
                tk_co = '515'
            elif "thu nợ" in d or "kh trả nợ" in d:
                tk_co = '131'
            else:
                tk_co = '131' # Default for inflows is 131 (customer payment)
                
            nkc_rows.append({
                'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3],
                'Diễn giải': desc, 'TK Nợ': '112', 'TK Có': tk_co, 'Số tiền': float(bank['Credit']), 'Đối tượng': party
            })
            
        # Debit from Bank = Cash Out (Có 112)
        if bank['Debit'] > 0:
            if any(k in d for k in ["thanh toán lương", "unc lương", "tiền lương", "thanh toán lương cty", "tt tiền lương"]):
                tk_no = '3341'
            elif any(k in d for k in ["thanh toán tiền ứng", "tạm ứng", "tiền ứng"]):
                tk_no = '3341' # Per user rule: thanh toán tiền ứng nợ 3341
            elif any(k in d for k in ["phí", "duy trì", "chuyển tiền", "phí thanh toán", "phí chuyển khoản", "thu phí tk", "vat"]):
                tk_no = '635'
            elif "bảo hiểm" in d:
                tk_no = '3383'
            elif "vay vcb tt tiền hàng" in d or "vay thanh toán" in d:
                # User wants "hạch toán song song"
                nkc_rows.append({
                    'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': 'VAY',
                    'Diễn giải': f"Giải ngân vay thanh toán tiền hàng - {desc}", 'TK Nợ': '112', 'TK Có': '3411', 'Số tiền': float(bank['Debit']), 'Đối tượng': party
                })
                tk_no = '331'
            elif "lãi vay" in d or "lai suat" in d or "tra no tk vay" in d:
                tk_no = '635'
            elif "gốc" in d or "trả gốc" in d or "tra no khoan vay" in d:
                tk_no = '341'
            else:
                tk_no = '331' # Default for outflows is 331 (vendor payment)
                
            nkc_rows.append({
                'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3],
                'Diễn giải': desc, 'TK Nợ': tk_no, 'TK Có': '112', 'Số tiền': float(bank['Debit']), 'Đối tượng': party
            })
            
    df = pd.DataFrame(nkc_rows)
    if not df.empty:
        df['dt'] = pd.to_datetime(df['Ngày hạch toán'], format='%d/%m/%Y')
        df = df.sort_values('dt', kind='mergesort').drop(columns=['dt'])
    return df

def generate_sct_2024(df_nkc, opening_balances):
    accounts = ['111', '112', '131', '331', '1561', '5111', '642', '1331', '3331', '341', '635', '515']
    sct_data = {}
    for acc in accounts:
        rows = []
        op_bal = opening_balances.get(acc, 0.0)
        bal = op_bal
        acc_rows = df_nkc[(df_nkc['TK Nợ'].str.startswith(acc)) | (df_nkc['TK Có'].str.startswith(acc))]
        for _, row in acc_rows.iterrows():
            is_no = row['TK Nợ'].startswith(acc)
            p_no = row['Số tiền'] if is_no else 0.0
            p_co = 0.0 if is_no else row['Số tiền']
            if acc in ['111', '112', '131', '1331', '1561', '642', '6422', '635']: bal += p_no - p_co
            else: bal += p_co - p_no
            rows.append({
                'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'], 'Số chứng từ': row['Số chứng từ'],
                'Diễn giải': row['Diễn giải'], 'TK Đối ứng': row['TK Có'] if is_no else row['TK Nợ'],
                'Đầu kỳ': op_bal if len(rows) == 0 else 0, 'Phát sinh Nợ': p_no, 'Phát sinh Có': p_co, 'Cuối kỳ': bal, 'Đối tượng': row['Đối tượng']
            })
        sct_data[acc] = pd.DataFrame(rows)
    return sct_data

def final_export_2024(nkc, sct, dir):
    # NKC
    path_nkc = os.path.join(dir, "NKC_HHP_2024.xlsx")
    wb1 = Workbook(); ws1 = wb1.active; ws1.title = "Sheet1"
    format_excel_sheet(ws1, list(nkc.columns))
    for r, row in enumerate(nkc.values.tolist(), 2):
        for c, v in enumerate(row, 1): ws1.cell(r, c, v)
    wb1.save(path_nkc)
    
    # SCT
    path_sct = os.path.join(dir, "SO_CHI_TIET_HHP_2024.xlsx")
    wb2 = Workbook(); wb2.remove(wb2.active)
    for acc, df in sct.items():
        if df.empty: continue
        ws = wb2.create_sheet(acc)
        format_excel_sheet(ws, list(df.columns))
        for r, row in enumerate(df.values.tolist(), 2):
            for c, v in enumerate(row, 1): ws.cell(r, c, v)
    wb2.save(path_sct)
    
    # BCCN
    path_bccn = os.path.join(dir, "BAO_CAO_CONG_NO_HHP_2024.xlsx")
    wb3 = Workbook(); wb3.remove(wb3.active)
    # 131
    ws_k = wb3.create_sheet("KHACH_HANG_131")
    format_excel_sheet(ws_k, ['Đối tượng', 'BÁN RA', 'ĐÃ THU', 'DƯ CUỐI KỲ'])
    df131 = nkc[(nkc['TK Nợ'] == '131') | (nkc['TK Có'] == '131')]
    kh_rows = []
    for cust in df131['Đối tượng'].unique():
        if not cust or str(cust).lower() == 'nan': continue
        tx = df131[df131['Đối tượng'] == cust]
        br, thu = tx[tx['TK Nợ'] == '131']['Số tiền'].sum(), tx[tx['TK Có'] == '131']['Số tiền'].sum()
        kh_rows.append([cust, br, thu, br-thu])
    for r, row in enumerate(kh_rows, 2):
        for c, v in enumerate(row, 1): ws_k.cell(r, c, v)
    # 331
    ws_n = wb3.create_sheet("NHA_CUNG_CAP_331")
    format_excel_sheet(ws_n, ['Đối tượng', 'MUA VÀO', 'ĐÃ TRẢ', 'DƯ CUỐI KỲ'])
    df331 = nkc[(nkc['TK Có'] == '331') | (nkc['TK Nợ'] == '331')]
    ncc_rows = []
    for supp in df331['Đối tượng'].unique():
        if not supp or str(supp).lower() == 'nan': continue
        tx = df331[df331['Đối tượng'] == supp]
        mv, tra = tx[tx['TK Có'] == '331']['Số tiền'].sum(), tx[tx['TK Nợ'] == '331']['Số tiền'].sum()
        ncc_rows.append([supp, mv, tra, mv-tra])
    for r, row in enumerate(ncc_rows, 2):
        for c, v in enumerate(row, 1): ws_n.cell(r, c, v)
    wb3.save(path_bccn)
    return path_nkc, path_sct, path_bccn

def main():
    print("Fetching database data...")
    df_i, df_d = fetch_database_data()
    print(f"Fetched {len(df_i)} invoices.")
    print("Loading bank statements...")
    df_b = load_bank_statements_2024()
    print(f"Loaded {len(df_b)} bank transactions.")
    print("Fetching opening balances...")
    opening = fetch_opening_balances()
    print("Generating NKC...")
    nkc = generate_nkc_2024(df_i, df_d, df_b)
    print(f"Generated NKC with {len(nkc)} rows.")
    print("Generating SCT...")
    sct = generate_sct_2024(nkc, opening)
    print("Exporting files...")
    final_export_2024(nkc, sct, OUTPUT_DIR)
    print(f"Accounting for {YEAR} generated successfully.")

if __name__ == "__main__": main()
