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
YEAR = 2023
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023"
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

# ============================================================
# UTILS
# ============================================================
def format_excel_sheet(ws, headers):
    # Header style
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
        # Auto column width
        ws.column_dimensions[get_column_letter(col)].width = 20

# ============================================================
# DATABASE LOADING
# ============================================================
def fetch_database_data():
    conn = psycopg2.connect(DB_URI)
    cur = conn.cursor()
    
    # Fetch invoices
    q_inv = """
        SELECT "idServer", shdon, tdlap, loaihd, nmmst, nmten, nbmst, nbten, tgtcthue, tgtthue, tgtttbso, khhdon, tthai
        FROM ext_listhoadon
        WHERE "congtyId" = %s AND EXTRACT(YEAR FROM tdlap) = %s AND tthai IN ('1','2','4','5')
    """
    cur.execute(q_inv, (HHP_COMPANY_ID, YEAR))
    invoices = cur.fetchall()
    cols_inv = [desc[0] for desc in cur.description]
    df_inv = pd.DataFrame(invoices, columns=cols_inv)
    
    # Fetch details
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
# BANK STATEMENT LOADING
# ============================================================
def load_bank_statements():
    bank_files = [
        ('Bidv', 'sao kê Bidv 23.xls'),
        ('VTB', 'sao kê VTB23.xls'),
        ('VCB_Vay', 'sao kê VCB_Vay 23.xls'),
        ('VTB_Vay', 'sao kê VTB_Vay 23.xls')
    ]
    
    all_trans = []
    for bank_name, filename in bank_files:
        path = os.path.join(BANK_DIR, filename)
        if not os.path.exists(path):
            print(f"Warning: File not found {path}")
            continue
            
        try:
            # First peek at the file to find the header row
            raw_df = pd.read_excel(path, nrows=30, header=None)
            date_col, thu_col, chi_col = -1, -1, -1
            desc_cols = []
            
            # Look for columns
            for i in range(raw_df.shape[1]):
                for r in range(min(raw_df.shape[0], 25)):
                    val = str(raw_df.iloc[r, i]).strip().lower()
                    if "ngày" in val and date_col == -1: date_col = i
                    if ("nội dung" in val or "diễn giải" in val) and i not in desc_cols: desc_cols.append(i)
                    # Check if column name resembles money and column content has numbers
                    if val in ["thu", "ghi nợ", "ps tăng", "tăng"] and thu_col == -1: thu_col = i
                    if val in ["chi", "ghi có", "ps giảm", "giảm"] and chi_col == -1: chi_col = i
            
            # Additional logic to find THU/CHI based on common positions if not found by keywords
            if thu_col == -1 or chi_col == -1:
                # Try to find columns with numeric headers or THU/CHI labels
                for i in range(raw_df.shape[1]):
                    for r in range(min(raw_df.shape[0], 25)):
                        v = str(raw_df.iloc[r, i]).strip()
                        if v == "THU": thu_col = i
                        if v == "CHI": chi_col = i
            
            # Specific Bank Fallbacks if detection still feels wrong
            if 'Bidv' in bank_name:
                if thu_col == -1: thu_col = 16
                if chi_col == -1: chi_col = 17
            elif 'VTB' in bank_name or 'VCB' in bank_name:
                if thu_col == -1: thu_col = 12
                if chi_col == -1: chi_col = 13
            
            if date_col == -1: date_col = 3
            if not desc_cols: desc_cols = [6, 8]
            
            print(f"Bank {bank_name}: DateCol={date_col}, ThuCol={thu_col}, ChiCol={chi_col}")
            
            df = pd.read_excel(path, header=None, skiprows=12)
            for _, row in df.iterrows():
                try:
                    if len(row) <= max(date_col, thu_col, chi_col): continue
                    date_val = row.iloc[date_col]
                    if pd.isna(date_val): continue
                    if not isinstance(date_val, (datetime, pd.Timestamp)):
                        date_val = pd.to_datetime(date_val, errors='coerce')
                    if pd.isna(date_val) or date_val.year != YEAR: continue
                    
                    def clean_money(v):
                        if pd.isna(v) or v == '': return 0.0
                        return float(str(v).replace(',', '').replace(' ', ''))
                    
                    thu = clean_money(row.iloc[thu_col])
                    chi = clean_money(row.iloc[chi_col])
                    if thu == 0 and chi == 0: continue
                    
                    desc = " ".join([str(row.iloc[c]) for c in desc_cols if c < len(row) and not pd.isna(row.iloc[c])])
                    all_trans.append({'Bank': bank_name, 'Date': date_val, 'Description': desc, 'Debit': chi, 'Credit': thu})
                except: continue
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            
    return pd.DataFrame(all_trans)

# ============================================================
# ACCOUNT MAPPING
# ============================================================
def get_account_for_item(ten):
    t = str(ten).lower()
    if any(k in t for k in ["cước", "dịch vụ", "điện lực", "nước", "internet", "văn phòng", "photo"]):
        return '6422'
    return '1561'

def generate_nkc(df_inv, df_det, df_bank):
    nkc_rows = []
    # Sale
    for _, inv in df_inv[df_inv['loaihd'] == 'banra'].iterrows():
        cust, date_s = inv['nmten'], inv['tdlap'].strftime('%d/%m/%Y')
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Bán hàng cho {cust}", 'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': cust})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Thuế GTGT đầu ra", 'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': cust})
    
    # Purchase
    for _, inv in df_inv[df_inv['loaihd'] == 'muavao'].iterrows():
        supp, date_s = inv['nbten'], inv['tdlap'].strftime('%d/%m/%Y')
        det = df_det[df_det['idhdonServer'] == inv['idServer']]
        acc_debit = get_account_for_item(det.iloc[0]['ten']) if not det.empty else '1561'
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Mua hàng từ {supp}", 'TK Nợ': acc_debit, 'TK Có': '331', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': supp})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Thuế GTGT đầu vào", 'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': supp})
            
    # Bank
    for _, bank in df_bank.iterrows():
        date_s, desc = bank['Date'].strftime('%d/%m/%Y'), bank['Description']
        party = desc.split('-')[-1].strip()
        if bank['Credit'] > 0:
            tk_co = '112' if "luân chuyển" in desc.lower() else ('515' if "lãi" in desc.lower() else '131')
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3], 'Diễn giải': desc, 'TK Nợ': '112', 'TK Có': tk_co, 'Số tiền': bank['Credit'], 'Đối tượng': party})
        if bank['Debit'] > 0:
            tk_no = '112' if "luân chuyển" in desc.lower() else ('642' if "phí" in desc.lower() else ('635' if "lãi vay" in desc.lower() else ('341' if "vay" in desc.lower() else '331')))
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3], 'Diễn giải': desc, 'TK Nợ': tk_no, 'TK Có': '112', 'Số tiền': bank['Debit'], 'Đối tượng': party})
            
    df = pd.DataFrame(nkc_rows)
    df['dt'] = pd.to_datetime(df['Ngày hạch toán'], format='%d/%m/%Y'); df = df.sort_values('dt').drop(columns=['dt'])
    return df

def generate_sct(df_nkc):
    accounts = ['112', '131', '331', '1561', '5111', '642', '1331', '3331', '341', '635', '515']
    sct_data = {}
    for acc in accounts:
        rows = []; bal = 0
        acc_rows = df_nkc[(df_nkc['TK Nợ'].str.startswith(acc)) | (df_nkc['TK Có'].str.startswith(acc))]
        for _, row in acc_rows.iterrows():
            is_no = row['TK Nợ'].startswith(acc); p_no = row['Số tiền'] if is_no else 0; p_co = 0 if is_no else row['Số tiền']
            if acc in ['112', '131', '1331', '1561', '642', '632', '635']: bal += p_no - p_co
            else: bal += p_co - p_no
            rows.append({'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'], 'Số chứng từ': row['Số chứng từ'], 'Diễn giải': row['Diễn giải'], 'TK Đối ứng': row['TK Có'] if is_no else row['TK Nợ'], 'Đầu kỳ': 0, 'Phát sinh Nợ': p_no, 'Phát sinh Có': p_co, 'Cuối kỳ': bal, 'Đối tượng': row['Đối tượng']})
        sct_data[acc] = pd.DataFrame(rows)
    return sct_data

def final_export(nkc, sct, dir):
    # NKC
    wb1 = Workbook(); ws1 = wb1.active; ws1.title = "Sheet1"
    format_excel_sheet(ws1, list(nkc.columns))
    for r, row in enumerate(nkc.values.tolist(), 2):
        for c, v in enumerate(row, 1): ws1.cell(r, c, v)
    wb1.save(os.path.join(dir, "NKC_HHP_2023.xlsx"))
    
    # SCT
    wb2 = Workbook(); wb2.remove(wb2.active)
    for acc, df in sct.items():
        if df.empty: continue
        ws = wb2.create_sheet(acc)
        format_excel_sheet(ws, list(df.columns))
        for r, row in enumerate(df.values.tolist(), 2):
            for c, v in enumerate(row, 1): ws.cell(r, c, v)
    wb2.save(os.path.join(dir, "SO_CHI_TIET_HHP_2023.xlsx"))
    
    # BCCN
    wb3 = Workbook(); wb3.remove(wb3.active)
    ws_k = wb3.create_sheet("KHACH_HANG_131"); kh_rows = []
    df131 = nkc[(nkc['TK Nợ'] == '131') | (nkc['TK Có'] == '131')]
    for cust in df131['Đối tượng'].unique():
        if not cust: continue
        tx = df131[df131['Đối tượng'] == cust]
        br, thu = tx[tx['TK Nợ'] == '131']['Số tiền'].sum(), tx[tx['TK Có'] == '131']['Số tiền'].sum()
        kh_rows.append([cust, br, thu, br-thu])
    format_excel_sheet(ws_k, ['Đối tượng', 'BÁN RA', 'ĐÃ THU', 'DƯ CUỐI KỲ'])
    for r, row in enumerate(kh_rows, 2):
        for c, v in enumerate(row, 1): ws_k.cell(r, c, v)
        
    ws_n = wb3.create_sheet("NHA_CUNG_CAP_331"); ncc_rows = []
    df331 = nkc[(nkc['TK Có'] == '331') | (nkc['TK Nợ'] == '331')]
    for supp in df331['Đối tượng'].unique():
        if not supp: continue
        tx = df331[df331['Đối tượng'] == supp]
        mv, tra = tx[tx['TK Có'] == '331']['Số tiền'].sum(), tx[tx['TK Nợ'] == '331']['Số tiền'].sum()
        ncc_rows.append([supp, mv, tra, mv-tra])
    format_excel_sheet(ws_n, ['Đối tượng', 'MUA VÀO', 'ĐÃ TRẢ', 'DƯ CUỐI KỲ'])
    for r, row in enumerate(ncc_rows, 2):
        for c, v in enumerate(row, 1): ws_n.cell(r, c, v)
    wb3.save(os.path.join(dir, "BAO_CAO_CONG_NO_HHP_2023.xlsx"))

def main():
    df_i, df_d = fetch_database_data(); df_b = load_bank_statements()
    nkc = generate_nkc(df_i, df_d, df_b)
    sct = generate_sct(nkc)
    final_export(nkc, sct, OUTPUT_DIR)
    print("Exported files to", OUTPUT_DIR)

if __name__ == "__main__": main()
