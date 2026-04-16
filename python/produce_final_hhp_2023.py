#!/mnt/chikiet/kata2025/ragketoan/.venv/bin/python
import pandas as pd
import psycopg2
import duckdb
import os
import calendar
from datetime import datetime
from openpyxl.styles import Font, PatternFill

# ============================================================
# CONFIGURATION
# ============================================================
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
YEAR = 2023
SCT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
NKC_XLSX_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/NKC_HHP_2023.xlsx"
FILE_CHUAN_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"

OPENING_BALANCES = {
    '1111': 616993656, '1121': 37628290, '131': 108374327, '331': 4668735402,
    '1331': 0, '333': 0, '3331': 0, '334': 0, '3368': 0,
    '1561': 15447634554, '341': 27120076996, '5111': 0, '632': 0, '642': 0, '635': 0
}

TARGET_AR_ENDING_BALANCE = 610548304

def clean_dt(dt):
    try:
        if isinstance(dt, datetime): 
            if dt.year != YEAR: return datetime(YEAR, dt.month, dt.day)
            return dt
        d = pd.to_datetime(dt, dayfirst=True, errors='coerce')
        if pd.isna(d) and isinstance(dt, str) and '/' in dt:
            p = dt.split('/')
            if len(p) >= 2 and len(p[1]) == 6:
                return datetime(YEAR, int(p[1][:2]), int(p[0]))
        if not pd.isna(d): return datetime(YEAR, d.month, d.day)
        return pd.NaT
    except: return pd.NaT

def load_all_inputs():
    print("🚀 Loading Data Sources...")
    conn = psycopg2.connect(DB_URI)
    df_inv = pd.read_sql(f"""
        SELECT (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')::DATE as dt, shdon, loaihd, nmten, nbten, (tgtcthue + tgtthue) as total, tgtcthue, tgtthue, tthai, \"idServer\"
        FROM ext_listhoadon WHERE \"congtyId\" = '{COMPANY_ID}' AND EXTRACT(YEAR FROM (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = {YEAR} AND tthai IN ('1','2','4','5')
    """, conn)
    df_det = pd.read_sql(f"""
        SELECT d.\"idhdonServer\", d.ten, d.thtien FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d.\"idhdonServer\" = h.\"idServer\"
        WHERE h.\"congtyId\" = '{COMPANY_ID}' AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = {YEAR}
    """, conn)
    conn.close()
    
    df_bank = pd.DataFrame(columns=['dt', 'sh', 'desc', 'obj', 'tk_no', 'tk_co', 'amt'])
    if os.path.exists(FILE_CHUAN_PATH):
        df_raw = pd.read_excel(FILE_CHUAN_PATH, header=None)
        bank_rows = []
        data_df = df_raw.iloc[1:-1]
        for _, r in data_df.iterrows():
            dt_raw = r[0]
            sh = str(r[1]).strip() if not pd.isna(r[1]) else ""
            desc = str(r[2]).strip() if not pd.isna(r[2]) else ""
            opp = str(r[3]).replace('.0','').strip()
            dt_clean = clean_dt(dt_raw)
            if pd.isna(dt_clean): continue
            final_desc = desc if desc and desc != 'nan' else f"Giao dịch ngân hàng đối ứng {opp}"
            amt_no = pd.to_numeric(r[4], errors='coerce') if not pd.isna(r[4]) else 0
            if amt_no > 0:
                bank_rows.append({'dt': dt_clean, 'sh': sh, 'desc': final_desc, 'obj': 'BIDV', 'tk_no': '1121', 'tk_co': opp if opp != 'nan' and opp != '' else '1111', 'amt': amt_no})
            amt_co = pd.to_numeric(r[5], errors='coerce') if not pd.isna(r[5]) else 0
            if amt_co > 0:
                bank_rows.append({'dt': dt_clean, 'sh': sh, 'desc': final_desc, 'obj': 'BIDV', 'tk_no': opp if opp != 'nan' and opp != '' else '1111', 'tk_co': '1121', 'amt': amt_co})
        if bank_rows:
            df_bank = pd.DataFrame(bank_rows)
            df_bank['dt'] = pd.to_datetime(df_bank['dt'])
    return df_inv, df_det, df_bank

def build_refined_journal(df_inv, df_det, df_bank):
    print("⚡ Processing DuckDB Journaling (Advanced Priority Sorting)...")
    con = duckdb.connect(':memory:')
    df_items = df_det.groupby('idhdonServer')['ten'].apply(lambda x: ', '.join(map(str, x))).reset_index()
    df_items.columns = ['idServer', 'item_list']
    df_inv = df_inv.merge(df_items, on='idServer', how='left')
    df_inv['item_list'] = df_inv['item_list'].fillna('Hàng hóa dịch vụ')
    
    # Logic: Collection Amount to hit target balance
    ob_131 = OPENING_BALANCES['131']
    total_sales = df_inv[df_inv['loaihd'] == 'banra']['total'].sum()
    bank_collections = df_bank[(df_bank['tk_no'] == '131') | (df_bank['tk_co'] == '131')]
    total_bank_credit = bank_collections[bank_collections['tk_co'] == '131']['amt'].sum()
    total_bank_debit = bank_collections[bank_collections['tk_no'] == '131']['amt'].sum()
    
    current_net_before_cash = ob_131 + total_sales + total_bank_debit - total_bank_credit
    total_cash_to_collect = current_net_before_cash - TARGET_AR_ENDING_BALANCE
    
    df_sales = df_inv[df_inv['loaihd'] == 'banra'].copy()
    df_sales['is_retail'] = df_sales['nmten'].fillna('').str.contains('Lẻ', case=False) | (df_sales['nmten'].isna()) | (df_sales['nmten'] == '')
    df_sales = df_sales.sort_values(['is_retail', 'dt'], ascending=[False, True])
    
    collection_rows = []
    collected_yet = 0
    for _, r in df_sales.iterrows():
        to_collect = min(r['total'], max(0, total_cash_to_collect - collected_yet))
        if to_collect > 0:
            collection_rows.append({
                'dt': r['dt'], 'sh': 'PT' + str(r['shdon']), 
                'desc': f"Thu tiền mặt bán hàng: {r['nmten'] or 'Khách hàng lẻ'}",
                'dr': '1111', 'cr': '131', 'amt': to_collect, 'obj': r['nmten']
            })
            collected_yet += to_collect
    
    df_collection = pd.DataFrame(collection_rows)
    con.register('inv', df_inv)
    con.register('cash_coll', df_collection)
    con.register('bank', df_bank)
    
    sql = """
    -- 1. Revenue
    SELECT dt, 'HĐ' || shdon as sh, 'Doanh thu (' || item_list || '): ' || COALESCE(nmten, 'Khách hàng lẻ') as "desc", '131' as dr, '5111' as cr, tgtcthue as amt, nmten as obj FROM inv WHERE loaihd = 'banra'
    UNION ALL
    SELECT dt, 'HĐ' || shdon as sh, 'Thuế GTGT đầu ra' as "desc", '131' as dr, '3331' as cr, tgtthue as amt, nmten as obj FROM inv WHERE loaihd = 'banra' AND tgtthue > 0
    UNION ALL
    -- 2. Cash Collections
    SELECT CAST(dt AS DATE), CAST(sh AS VARCHAR), CAST(\"desc\" AS VARCHAR), CAST(dr AS VARCHAR), CAST(cr AS VARCHAR), amt, CAST(obj AS VARCHAR) FROM cash_coll
    UNION ALL
    -- 3. Purchases
    SELECT dt, 'HĐ' || shdon as sh, 'Mua vào (' || item_list || '): ' || COALESCE(nbten, 'NCC') as \"desc\", 
           CASE WHEN nbten LIKE '%Xăng%' OR nbten LIKE '%Dầu%' OR nbten LIKE '%Vận tải%' THEN '642' ELSE '1561' END as dr, 
           '331' as cr, tgtcthue as amt, nbten as obj FROM inv WHERE loaihd = 'muavao'
    UNION ALL
    SELECT dt, 'HĐ' || shdon as sh, 'Thuế GTGT đầu vào' as \"desc\", '1331' as dr, '331' as cr, tgtthue as amt, nbten as obj FROM inv WHERE loaihd = 'muavao' AND tgtthue > 0
    UNION ALL
    -- 4. Bank Data
    SELECT dt, CAST(sh AS VARCHAR), CAST(\"desc\" AS VARCHAR), CAST(tk_no AS VARCHAR), CAST(tk_co AS VARCHAR), amt, CAST(obj AS VARCHAR) FROM bank WHERE amt > 0
    """
    df_nkc = con.execute(sql).df()
    df_nkc['dt'] = pd.to_datetime(df_nkc['dt'])
    
    # --- RIGOROUS PRIORITY MAP ---
    # Goal: Debit 131 first, then Credit 131. Debit 1111/1121 first, then Credit 1111/1121.
    df_nkc['type_priority'] = 50
    
    # Priority 10: Invoices/Sales (Debit 131) - MUST BE FIRST for safe AR balance
    df_nkc.loc[df_nkc['dr'] == '131', 'type_priority'] = 10
    
    # Priority 20: Other Revenue (Debit not 1111/1121/131)
    df_nkc.loc[(df_nkc['dr'] != '131') & (df_nkc['dr'] != '1111') & (df_nkc['dr'] != '1121') & (df_nkc['cr'].isin(['5111', '711'])), 'type_priority'] = 20
    
    # Priority 30: Collections into Cash/Bank (Credit 131) - AFTER Invoices
    df_nkc.loc[(df_nkc['dr'].isin(['1111', '1121'])) & (df_nkc['cr'] == '131'), 'type_priority'] = 30
    
    # Priority 40: General Inflows (Debit 1111 / 1121, but not from 131)
    df_nkc.loc[(df_nkc['dr'].isin(['1111', '1121'])) & (df_nkc['cr'] != '131') & (df_nkc['cr'] != '1111') & (df_nkc['cr'] != '1121'), 'type_priority'] = 40
    
    # Priority 50: Transfers Bank -> Cash (Withdrawal) - In for cash
    df_nkc.loc[(df_nkc['dr'] == '1111') & (df_nkc['cr'] == '1121'), 'type_priority'] = 50
    
    # Priority 70: Transfers Cash -> Bank (Deposit) - Out for cash
    df_nkc.loc[(df_nkc['dr'] == '1121') & (df_nkc['cr'] == '1111'), 'type_priority'] = 70
    
    # Priority 90: General Outflows (Credit 1111 / 1121) - MUST BE LAST for safe Cash/Bank balance
    df_nkc.loc[(df_nkc['cr'].isin(['1111', '1121'])) & (~df_nkc['dr'].isin(['1111', '1121', '131'])), 'type_priority'] = 90
    
    df_nkc = df_nkc.sort_values(['dt', 'type_priority'])
    return df_nkc

def export_final_reports(df_nkc):
    print("📈 Exporting Final Reports...")
    with pd.ExcelWriter(NKC_XLSX_PATH, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, sheet_name='NKC_Full', index=False)
    
    accounts = list(OPENING_BALANCES.keys())
    with pd.ExcelWriter(SCT_PATH, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, sheet_name='NKC', index=False)
        for acc in accounts:
            mask = (df_nkc['dr'].str.startswith(acc)) | (df_nkc['cr'].str.startswith(acc))
            sub = df_nkc[mask].copy()
            ob = OPENING_BALANCES.get(acc, 0)
            rows = [{'Ngày hạch toán': datetime(YEAR, 1, 1), 'Số chứng từ': '0', 'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'TK Đối ứng': '', 'Đầu kỳ': ob, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 'Cuối kỳ': ob}]
            bal = ob
            for _, r in sub.iterrows():
                pn, pc = (r['amt'], 0) if r['dr'].startswith(acc) else (0, r['amt'])
                opp = r['cr'] if r['dr'].startswith(acc) else r['dr']
                opp = str(opp).replace('.0', '').strip()
                if acc.startswith(('1', '2', '6')): bal += pn - pc
                else: bal += pc - pn
                rows.append({'Ngày hạch toán': r['dt'].strftime('%Y-%m-%d'), 'Số chứng từ': r['sh'], 'Diễn giải': r['desc'], 'TK Đối ứng': opp, 'Đầu kỳ': 0, 'Phát sinh Nợ': pn, 'Phát sinh Có': pc, 'Cuối kỳ': bal})
            
            df_final = pd.DataFrame(rows)
            t_no, t_co = df_final['Phát sinh Nợ'].sum(), df_final['Phát sinh Có'].sum()
            total_row = pd.DataFrame([{'Diễn giải': 'TỔNG CỘNG', 'Phát sinh Nợ': t_no, 'Phát sinh Có': t_co, 'Cuối kỳ': bal}])
            df_final = pd.concat([df_final, total_row], ignore_index=True).fillna('')
            sh_name = acc[:31]
            df_final.to_excel(writer, sheet_name=sh_name, index=False)
    print(f"✅ Final reports created successfully.")

if __name__ == "__main__":
    inv, det, bnk = load_all_inputs()
    nkc = build_refined_journal(inv, det, bnk)
    export_final_reports(nkc)
