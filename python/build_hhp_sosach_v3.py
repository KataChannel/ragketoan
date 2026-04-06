import pandas as pd
import psycopg2
import os
import glob
import re
from datetime import datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ============================================================
# CONFIGURATION
# ============================================================
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82" # HHP
YEAR = 2023
SCT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023"
XNT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/XNT_HoangHuyPhat_2023.xlsx"

# Targets from BANG_TONG_HOP_SO_LIEU_HHP_2023.md
OPENING_BALANCES = {
    '1111': 616993656,
    '112': 37628290,
    '131': 108374327,
    '331': 4668735402,
    '1331': 0,
    '3331': 0,
    '1561': 15447634554,
    '341': 27120076996,
}

# ============================================================
# DATA LOADING
# ============================================================
def fetch_invoices():
    conn = psycopg2.connect(DB_URI)
    query = """
        SELECT 
            (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')::DATE as dt,
            shdon, loaihd, nmten as nmmst, nbten as nbmst, tgtcthue, tgtthue, tthai, "idServer"
        FROM ext_listhoadon
        WHERE "congtyId" = %s AND EXTRACT(YEAR FROM (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = %s AND tthai IN ('1','2','4','5')
    """
    df = pd.read_sql(query, conn, params=(COMPANY_ID, YEAR))
    query_det = """
        SELECT d."idhdonServer", d.ten, d.thtien
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = %s AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = %s
    """
    df_det = pd.read_sql(query_det, conn, params=(COMPANY_ID, YEAR))
    conn.close()
    return df, df_det

def load_bank():
    all_trans = []
    files = glob.glob(os.path.join(BANK_DIR, "*.xls*"))
    for f in files:
        try:
            df = pd.read_excel(f, header=None)
            # Find data rows
            header_row = 12 # common
            df = pd.read_excel(f, skiprows=header_row)
            date_col, desc_col, thu_col, chi_col = 3, 7, 16, 17 # standard for these files
            if 'Bidv' in f: date_col, desc_col, thu_col, chi_col = 3, 7, 16, 17
            elif 'VTB' in f or 'VCB' in f: date_col, desc_col, thu_col, chi_col = 3, 7, 12, 13
            
            for _, row in df.iterrows():
                try:
                    dt = pd.to_datetime(row.iloc[date_col], errors='coerce')
                    if pd.isna(dt) or dt.year != YEAR: continue
                    desc = str(row.iloc[desc_col])
                    thu = float(str(row.iloc[thu_col]).replace(',','')) if not pd.isna(row.iloc[thu_col]) else 0
                    chi = float(str(row.iloc[chi_col]).replace(',','')) if not pd.isna(row.iloc[chi_col]) else 0
                    if thu == 0 and chi == 0: continue
                    all_trans.append({'dt': dt, 'desc': desc, 'thu': thu, 'chi': chi, 'bank': os.path.basename(f)})
                except: continue
        except: continue
    return pd.DataFrame(all_trans)

# ============================================================
# COMPILER
# ============================================================
def build_data():
    df_inv, df_det = fetch_invoices()
    df_bank = load_bank()
    
    nkc = []
    # 1. Sales
    for _, inv in df_inv[df_inv['loaihd'] == 'banra'].iterrows():
        dt = inv['dt']
        desc = f"Bán hàng cho {inv['nmmst']}"
        sh = f"HĐ{inv['shdon']}"
        nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': desc, 'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': str(inv['nmmst'])})
        if inv['tgtthue'] > 0:
            nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': 'Thuế GTGT bán ra', 'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': str(inv['nmmst'])})
            
    # 2. Purchases
    for _, inv in df_inv[df_inv['loaihd'] == 'muavao'].iterrows():
        dt = inv['dt']
        supp = str(inv['nbmst'])
        sh = f"HĐ{inv['shdon']}"
        det = df_det[df_det['idhdonServer'] == inv['idServer']]
        items = " ".join(det['ten'].astype(str)).lower()
        acc_dr = '1561'
        if any(k in items for k in ["xăng", "dầu", "cước", "phí", "sửa", "văn phòng"]): acc_dr = '642'
        nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': f"Mua vào: {supp}", 'TK Nợ': acc_dr, 'TK Có': '331', 'Số tiền': float(inv['tgtcthue']), 'Đối tượng': supp})
        if inv['tgtthue'] > 0:
            nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': 'Thuế GTGT mua vào', 'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': float(inv['tgtthue']), 'Đối tượng': supp})

    # 3. Bank
    for _, bx in df_bank.iterrows():
        dt = bx['dt']
        d = bx['desc']
        sh = "GBC" if bx['thu'] > 0 else "GBN"
        if bx['thu'] > 0:
            acc_co = '131'
            if "vay" in d.lower(): acc_co = '3411'
            elif "lãi" in d.lower(): acc_co = '515'
            elif any(k in d.lower() for k in ["nộp tiền", "luân chuyển"]): acc_co = '1111'
            nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': d, 'TK Nợ': '112', 'TK Có': acc_co, 'Số tiền': float(bx['thu']), 'Đối tượng': bx['bank']})
        if bx['chi'] > 0:
            acc_no = '331'
            if "vay" in d.lower(): acc_no = '3411'
            elif any(k in d.lower() for k in ["lãi", "phí"]): acc_no = '635'
            elif any(k in d.lower() for k in ["thuế"]): acc_no = '3331'
            elif any(k in d.lower() for k in ["lương", "bhxh"]): acc_no = '334'
            nkc.append({'Ngày hạch toán': dt, 'Ngày chứng từ': dt, 'Số chứng từ': sh, 'Diễn giải': d, 'TK Nợ': acc_no, 'TK Có': '112', 'Số tiền': float(bx['chi']), 'Đối tượng': bx['bank']})

    # 4. Giá vốn
    if os.path.exists(XNT_PATH):
        try:
            xnt_df = pd.read_excel(XNT_PATH, sheet_name='xnt12thang')
            total_gv = xnt_df[xnt_df['TenHang'] != 'TỔNG CỘNG']['X_COGS'].sum()
            nkc.append({'Ngày hạch toán': datetime(YEAR, 12, 31), 'Ngày chứng từ': datetime(YEAR, 12, 31), 'Số chứng từ': 'PK', 'Diễn giải': 'Kết chuyển giá vốn hàng bán', 'TK Nợ': '632', 'TK Có': '1561', 'Số tiền': float(total_gv), 'Đối tượng': 'XNT'})
        except: pass
    
    df_nkc = pd.DataFrame(nkc)
    if not df_nkc.empty:
        df_nkc['Ngày hạch toán'] = pd.to_datetime(df_nkc['Ngày hạch toán'])
        df_nkc = df_nkc.sort_values('Ngày hạch toán')
    return df_nkc

# ============================================================
# EXCEL GENERATOR (MATCHING HUY VU 100%)
# ============================================================
def generate_sct_full(df_nkc):
    print(f"🚀 Generating SCT for HHP 2023 with Huy Vu pattern...")
    
    with pd.ExcelWriter(SCT_PATH, engine='openpyxl') as writer:
        # 1. NKC Sheet
        df_nkc.to_excel(writer, sheet_name='NKC', index=False)
        
        # 2. Account Sheets
        accounts = ['1111', '112', '131', '1331', '1561', '331', '3331', '341', '5111', '515', '632', '635', '642']
        for acc in accounts:
            mask = (df_nkc['TK Nợ'].str.startswith(acc)) | (df_nkc['TK Có'].str.startswith(acc))
            df_acc = df_nkc[mask].copy()
            
            # Opening balance logic
            open_bal = OPENING_BALANCES.get(acc, 0)
            # Standardizing account direction: Assets (1, 15, 6) increase Debt, Liab (3, 4, 5) increase Credit
            # But the 'Cuối kỳ' calculation depends on the account type.
            
            rows = []
            # First row: SỐ DƯ ĐẦU KỲ
            rows.append({
                'Ngày hạch toán': datetime(YEAR, 1, 1),
                'Số chứng từ': '0',
                'Diễn giải': 'SỐ DƯ ĐẦU KỲ',
                'TK Đối ứng': '',
                'Đầu kỳ': float(open_bal),
                'Phát sinh Nợ': 0.0,
                'Phát sinh Có': 0.0,
                'Cuối kỳ': float(open_bal)
            })
            
            curr_bal = float(open_bal)
            for _, row in df_acc.iterrows():
                is_no = row['TK Nợ'].startswith(acc)
                ps_no = row['Số tiền'] if is_no else 0.0
                ps_co = 0.0 if is_no else row['Số tiền']
                opp_acc = row['TK Có'] if is_no else row['TK Nợ']
                
                # Update running balance
                if acc.startswith(('1', '2', '6')):
                    curr_bal += ps_no - ps_co
                else:
                    curr_bal += ps_co - ps_no
                
                rows.append({
                    'Ngày hạch toán': row['Ngày hạch toán'],
                    'Số chứng từ': row['Số chứng từ'],
                    'Diễn giải': row['Diễn giải'],
                    'TK Đối ứng': opp_acc,
                    'Đầu kỳ': 0.0,
                    'Phát sinh Nợ': ps_no,
                    'Phát sinh Có': ps_co,
                    'Cuối kỳ': curr_bal
                })
            
            df_final = pd.DataFrame(rows)
            # Reorder columns to match exactly
            df_final = df_final[['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Đầu kỳ', 'Phát sinh Nợ', 'Phát sinh Có', 'Cuối kỳ']]
            sheet_name = acc[:31]
            df_final.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # Format columns (Optional, but let's keep it simple first)
    
    print(f"✅ Success! File saved at {SCT_PATH}")

if __name__ == "__main__":
    df_nkc = build_data()
    generate_sct_full(df_nkc)
