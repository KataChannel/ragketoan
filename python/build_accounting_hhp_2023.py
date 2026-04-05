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
        WHERE "congtyId" = %s AND EXTRACT(YEAR FROM (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = %s AND tthai IN ('1','2','4','5')
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
        WHERE h."congtyId" = %s AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = %s AND h.tthai IN ('1','2','4','5')
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
            for r in range(min(20, len(raw_df))):
                for i in range(len(raw_df.columns)):
                    val = str(raw_df.iloc[r, i]).strip().lower()
                    if "ngày" in val and date_col == -1: date_col = i
                    if ("nội dung" in val or "diễn giải" in val) and i not in desc_cols: desc_cols.append(i)
                    if ("số tiền nhận" in val or "ghi có" in val or "thu" in val) and thu_col == -1: thu_col = i
                    if ("số tiền chuyển" in val or "ghi nợ" in val or "chi" in val or "rút tiền" in val) and chi_col == -1: chi_col = i
            
            # Specific for HHP 2023 Excel formats
            date_col = 3
            if 7 not in desc_cols: desc_cols.append(7)
            if thu_col == -1: thu_col = 16
            if chi_col == -1: chi_col = 17
            
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
# Danh sách các nhà cung cấp chỉ bán hàng hóa (Sữa, Thực phẩm, Bánh kẹo...)
INVENTORY_SUPPLIERS = {
    'CÔNG TY TNHH BEL VIỆT NAM', 
    'CÔNG TY CỔ PHẦN THỰC PHẨM CHOLIMEX', 
    'CÔNG TY CỔ PHẦN VIỆT NAM KỸ NGHỆ SÚC SẢN', 
    'CÔNG TY TNHH NABATI VIỆT NAM', 
    'CÔNG TY CỔ PHẦN NƯỚC GIẢI KHÁT SANEST KHÁNH HÒA',
    'CÔNG TY CỔ PHẦN SÁCH VÀ THIẾT BỊ TRƯỜNG HỌC GIA LAI'
}

def get_product_avg_prices(df_inv, df_det):
    """
    Calculate weighted average prices for products based on Purchases and Opening Balance
    to be used for COGS calculation.
    """
    TOTAL_OPENING_VALUE = 15447634554
    DEFAULT_PRICE = 20000 
    
    # Purchases (muavao)
    purchases = df_inv[df_inv['loaihd'] == 'muavao']
    purch_ids = purchases['idServer'].tolist()
    purch_details = df_det[df_det['idhdonServer'].isin(purch_ids)]
    
    # Group by product name
    prod_stats = purch_details.groupby('ten').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
    total_purch_amt = float(prod_stats['thtien'].sum())
    
    avg_prices = {}
    if total_purch_amt > 0:
        for _, row in prod_stats.iterrows():
            name = row['ten']
            purch_qty = float(row['sluong'])
            purch_amt = float(row['thtien'])
            # Share of opening based on purchase weight
            opening_amt_share = (purch_amt / total_purch_amt) * TOTAL_OPENING_VALUE
            opening_qty_est = purch_qty * 0.2
            avg_p = (opening_amt_share + purch_amt) / (opening_qty_est + purch_qty) if (opening_qty_est + purch_qty) > 0 else DEFAULT_PRICE
            avg_prices[name] = avg_p
    else:
        # Fallback if no purchases found
        unique_names = df_det['ten'].unique()
        if len(unique_names) > 0:
            share = TOTAL_OPENING_VALUE / len(unique_names)
            for name in unique_names:
                avg_prices[name] = DEFAULT_PRICE # Simplified
                
    return avg_prices

def get_debit_account_for_purchase(supplier_name, item_names):
    """
    Ưu tiên 1: Kiểm tra từ khóa trong tên hàng để hạch toán vào 642 (Xăng dầu, phụ tùng, văn phòng phẩm...)
    Ưu tiên 2: Kiểm tra nhà cung cấp hàng hóa để hạch toán vào 156
    """
    s = str(supplier_name).strip()
    full_items_text = " ".join([str(t) for t in item_names]).lower()
    
    expense_keywords = [
        "xăng", "dầu", "do ", "giấy", "bảo trì", "sửa chữa", "phụ tùng", 
        "lốp", "vỏ xe", "nhớt", "cước", "dịch vụ", "văn phòng", "photo", "vận chuyển"
    ]
    
    if any(k in full_items_text for k in expense_keywords):
        return '6422'
    if s in INVENTORY_SUPPLIERS:
        return '1561'
    return '6422' # Default to expense

def map_bank_account(desc, is_credit, amount):
    """
    is_credit=True means Money In (Credit bank statement column, but Debit 112 in accounting)
    is_credit=False means Money Out (Debit bank statement column, but Credit 112 in accounting)
    """
    d = str(desc).lower()
    
    if is_credit: # Money In (Nợ 112)
        if any(k in d for k in ["nộp vào", "nộp tiền", "nop tien", "nt vao tk", "nop tk", "bidv cty nộp vào vcb cty", "rút bidv", "nộp-", "nt-", "luân chuyển"]):
            return '1111'
        if any(k in d for k in ["quỹ từ tkd", "quỹ từ ctv"]):
            return '3368'
        if any(k in d for k in ["vay vcb tt", "vay thanh toán", "giải ngân"]):
            return '3411'
        if any(k in d for k in ["lãi", "tra lai"]):
            return '515'
        return '131' # Default for inflow is customer payment
    else: # Money Out (Có 112)
        # Ngân hàng hạch toán Nợ 635, Có 112 theo yêu cầu
        if any(k in d for k in ["thanh toán lương", "unc lương", "tiền lương", "thanh toán lương cty", "tt tiền lương", "thanh toán tiền ứng", "tạm ứng", "tiền ứng"]):
            return '3341'
        if any(k in d for k in ["bảo hiểm", "bhxh", "bhyt"]):
            return '3383'
        # Tất cả các nghiệp vụ ngân hàng khác mặc định vào 635 (bao gồm cả phí và trả 331 nếu không tách)
        return '635'

def add_cogs_entries(nkc_rows, year):
    path_xnt = f"/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/XNT_HoangHuyPhat_{year}.xlsx"
    if not os.path.exists(path_xnt):
        return nkc_rows
    try:
        df_xnt = pd.read_excel(path_xnt, sheet_name='xnt12thang')
        for m in range(1, 13):
            # The XNT script creates sheets "Tháng 1", "Tháng 2", etc.
            sheet_name = f"Tháng {m}"
            try:
                df_m = pd.read_excel(path_xnt, sheet_name=sheet_name)
                # Ensure we only sum numeric values and exclude the "TỔNG CỘNG" row
                df_m = df_m[df_m['Mã Hàng'] != 'TỔNG CỘNG']
                monthly_gv = df_m['Xuất Theo Giá Vốn'].sum()
                if monthly_gv > 0:
                    last_day = (pd.to_datetime(f"{year}-{m:02d}-01") + pd.offsets.MonthEnd(0)).strftime('%d/%m/%Y')
                    nkc_rows.append({
                        'Ngày hạch toán': last_day, 'Ngày chứng từ': last_day, 'Số chứng từ': f'GV{m:02d}', 
                        'Diễn giải': f"Giá vốn hàng bán - Tháng {m}/{year}", 
                        'TK Nợ': '632', 'TK Có': '1561', 'Số tiền': float(monthly_gv), 'Đối tượng': 'CTY HHP'
                    })
            except Exception as e:
                # print(f"Skipping sheet {sheet_name}: {e}")
                pass
    except Exception as e: 
        print(f"Error reading XNT file: {e}")
        pass
    return nkc_rows

def generate_nkc(df_inv, df_det, df_bank):
    nkc_rows = []
    # Sale
    avg_prices = get_product_avg_prices(df_inv, df_det)
    for _, inv in df_inv[df_inv['loaihd'] == 'banra'].iterrows():
        nmten = inv['nmten']
        cust = str(nmten) if not pd.isna(nmten) and str(nmten).strip() != '' else "Khách lẻ"
        date_s = inv['tdlap'].strftime('%d/%m/%Y')
        shdon = inv['shdon']
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{shdon}", 'Diễn giải': f"Bán hàng cho {cust}", 'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': cust})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{shdon}", 'Diễn giải': f"Thuế GTGT đầu ra", 'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': cust})
        
        # Add COGS (632) entries per item (DANGEROUS: REMOVED TO PREVENT DUPLICATES)
        # det_sales = df_det[df_det['idhdonServer'] == inv['idServer']]
        # for _, d in det_sales.iterrows():
        #     prod_name = d['ten']
        #     qty = d['sluong']
        #     avg_p = avg_prices.get(prod_name, 20000)
        #     cogs_amt = float(qty) * float(avg_p)
        #     nkc_rows.append({
        #         'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"GV{shdon}", 
        #         'Diễn giải': f"Giá vốn - {prod_name}", 'TK Nợ': '632', 'TK Có': '1561', 'Số tiền': float(cogs_amt), 'Đối tượng': 'CTY HHP'
        #     })
    
    # Purchase
    for _, inv in df_inv[df_inv['loaihd'] == 'muavao'].iterrows():
        nbten = inv['nbten']
        supp = str(nbten) if not pd.isna(nbten) and str(nbten).strip() != '' else "Nhà cung cấp lạ"
        date_s = inv['tdlap'].strftime('%d/%m/%Y')
        det = df_det[df_det['idhdonServer'] == inv['idServer']]
        item_names = det['ten'].tolist() if not det.empty else []
        acc_debit = get_debit_account_for_purchase(supp, item_names)
        nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Mua hàng từ {supp}", 'TK Nợ': acc_debit, 'TK Có': '331', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': supp})
        if inv['tgtthue'] > 0:
            nkc_rows.append({'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': f"HĐ{inv['shdon']}", 'Diễn giải': f"Thuế GTGT đầu vào", 'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': supp})
            
    # Bank
    for _, bank in df_bank.iterrows():
        date_s, desc = bank['Date'].strftime('%d/%m/%Y'), bank['Description']
        party = desc.split('-')[-1].strip() if '-' in desc else desc[:50]
        
        # Credit to Bank = Cash In (Nợ 112)
        if bank['Credit'] > 0:
            desc = str(bank['Description'])
            if "luân chuyển" in desc.lower():
                desc = "Nộp tiền mặt vào tài khoản"
            tk_co = map_bank_account(bank['Description'], True, bank['Credit'])
            nkc_rows.append({
                'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3], 
                'Diễn giải': desc, 'TK Nợ': '112', 'TK Có': tk_co, 'Số tiền': bank['Credit'], 'Đối tượng': party
            })
            
        # Debit from Bank = Cash Out (Có 112)
        if bank['Debit'] > 0:
            # Special case for loan payment "song song"
            if any(k in desc.lower() for k in ["vay vcb tt tiền hàng", "vay thanh toán"]):
                # 1. Displacement (Nợ 112 / Có 3411)
                nkc_rows.append({
                    'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': 'VAY', 
                    'Diễn giải': f"Giải ngân vay thanh toán tiền hàng - {desc}", 'TK Nợ': '112', 'TK Có': '3411', 'Số tiền': bank['Debit'], 'Đối tượng': party
                })
                # 2. Payment (Nợ 331 / Có 112)
                tk_no = '331'
            else:
                tk_no = map_bank_account(desc, False, bank['Debit'])
                
            nkc_rows.append({
                'Ngày hạch toán': date_s, 'Ngày chứng từ': date_s, 'Số chứng từ': bank['Bank'][:3], 
                'Diễn giải': desc, 'TK Nợ': tk_no, 'TK Có': '112', 'Số tiền': bank['Debit'], 'Đối tượng': party
            })
            
    # Add COGS
    nkc_rows = add_cogs_entries(nkc_rows, YEAR)
            
    df = pd.DataFrame(nkc_rows)
    df['dt'] = pd.to_datetime(df['Ngày hạch toán'], format='%d/%m/%Y'); df = df.sort_values('dt').drop(columns=['dt'])
    return df

def generate_sct(df_nkc):
    accounts = ['1111', '112', '131', '331', '3368', '1561', '3341', '5111', '642', '1331', '3331', '341', '3411', '635', '515', '3383', '632']
    sct_data = {}
    for acc in accounts:
        rows = []; bal = 0
        acc_rows = df_nkc[(df_nkc['TK Nợ'].str.startswith(acc)) | (df_nkc['TK Có'].str.startswith(acc))]
        for _, row in acc_rows.iterrows():
            is_no = row['TK Nợ'].startswith(acc); p_no = row['Số tiền'] if is_no else 0; p_co = 0 if is_no else row['Số tiền']
            if acc in ['1111', '112', '131', '1331', '1561', '642', '632', '635']: bal += p_no - p_co
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
