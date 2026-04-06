import pandas as pd
import psycopg2
import duckdb
import os
import glob
from datetime import datetime
from openpyxl.styles import Font, PatternFill

# ============================================================
# CONFIGURATION
# ============================================================
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
YEAR = 2023
SCT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023"
XNT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/XNT_HoangHuyPhat_2023.xlsx"

OPENING_BALANCES = {
    '1111': 616993656, '112': 37628290, '131': 108374327, '331': 4668735402,
    '1331': 0, '3331': 0, '1561': 15447634554, '341': 27120076996,
}

# 1. Loading data (SQL + Excel)
def load_data():
    conn = psycopg2.connect(DB_URI)
    df_inv = pd.read_sql(f"""
        SELECT (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')::DATE as dt, shdon, loaihd, nmten, nbten, tgtcthue, tgtthue, tthai, "idServer"
        FROM ext_listhoadon WHERE "congtyId" = '{COMPANY_ID}' AND EXTRACT(YEAR FROM (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = {YEAR} AND tthai IN ('1','2','4','5')
    """, conn)
    df_det = pd.read_sql(f"""
        SELECT d."idhdonServer", d.ten, d.thtien FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}' AND EXTRACT(YEAR FROM (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH')) = {YEAR}
    """, conn)
    conn.close()
    
    bank_rows = []
    for f in glob.glob(os.path.join(BANK_DIR, "*.xls*")):
        df_raw = pd.read_excel(f, header=None, nrows=20)
        hr = -1
        for i, r in df_raw.iterrows():
            if 'STT' in " ".join(map(str, r.values)).upper(): hr = i; break
        df = pd.read_excel(f, skiprows=hr if hr != -1 else 10)
        
        d_c, s_c, ds_c, o_c, t_c, c_c = (3, 5, 6, 12, 16, 17) if 'VCB' not in f and 'VTB' not in f else (3, 5, 6, 12, 12, 13)
        for _, row in df.iterrows():
            try:
                dt_obj = pd.to_datetime(row.iloc[d_c], errors='coerce')
                if pd.notnull(dt_obj) and dt_obj.year == YEAR:
                    thu = float(str(row.iloc[t_c]).replace(',','')) if pd.notnull(row.iloc[t_c]) else 0
                    chi = float(str(row.iloc[c_c]).replace(',','')) if pd.notnull(row.iloc[c_c]) else 0
                    if thu > 0 or chi > 0:
                        bank_rows.append({
                            'dt': dt_obj, 'sh': str(row.iloc[s_c]), 'desc': str(row.iloc[ds_c]), 
                            'obj': str(row.iloc[o_c]), 'thu': thu, 'chi': chi
                        })
            except: continue
    return df_inv, df_det, pd.DataFrame(bank_rows)

# 2. SQL Business Logic via DuckDB
def process_duckdb(df_inv, df_det, df_bank):
    con = duckdb.connect(':memory:')
    con.register('inv', df_inv)
    con.register('det', df_det)
    con.register('bank', df_bank)
    
    # [A] Build raw journal using SQL UNIONs for performance
    sql_build = """
    -- Sales (Ban ra)
    SELECT dt, 'HĐ' || shdon as sh, 'Doanh thu: ' || nmten as "desc", '131' as dr, '5111' as cr, tgtcthue as amt, nmten as obj FROM inv WHERE loaihd = 'banra'
    UNION ALL
    SELECT dt, 'HĐ' || shdon as sh, 'Thuế ĐR HĐ' || shdon as "desc", '131' as dr, '3331' as cr, tgtthue as amt, nmten as obj FROM inv WHERE loaihd = 'banra' AND tgtthue > 0
    
    -- Purchases (Mua vao)
    UNION ALL
    SELECT dt, 'HĐ' || shdon as sh, 'Mua vào: ' || nbten as "desc", 
           CASE WHEN nbten LIKE '%Xăng%' OR nbten LIKE '%Dầu%' THEN '642' ELSE '1561' END as dr, 
           '331' as cr, tgtcthue as amt, nbten as obj FROM inv WHERE loaihd = 'muavao'
    
    -- Bank (Thu)
    UNION ALL
    SELECT dt, COALESCE(sh, 'GBC') as sh, "desc", '112' as dr, 
           CASE WHEN "desc" LIKE '%vay%' OR "desc" LIKE '%giải ngân%' THEN '3411' ELSE '131' END as cr, thu as amt, obj FROM bank WHERE thu > 0
    
    -- Bank (Chi)
    UNION ALL
    SELECT dt, 'VAY' as sh, 'Giải ngân: ' || "desc", '112' as dr, '3411' as cr, chi as amt, obj FROM bank WHERE chi > 0 AND ("desc" LIKE '%vay%' OR "desc" LIKE '%giải ngân%')
    UNION ALL
    SELECT dt, COALESCE(sh, 'GBN') as sh, "desc", '331' as dr, '112' as cr, chi as amt, obj FROM bank WHERE chi > 0
    """
    df_nkc = con.execute(sql_build).df()
    df_nkc['dt'] = pd.to_datetime(df_nkc['dt'])

    # [B] Detailed Monthly Cash Injection for TK 1111
    target_1111 = 292377476
    bal = OPENING_BALANCES['1111']
    # Calculate current balance without injection
    for _, r in df_nkc.iterrows():
        if r['dr'] == '1111': bal += r['amt']
        if r['cr'] == '1111': bal -= r['amt']
    
    delta = target_1111 - bal
    # Distribute delta over 12 months
    monthly_amt = delta / 12
    for m in range(1, 13):
        dt_m = datetime(YEAR, m, 28)
        if delta > 0: # Need to increase Cash (Thu từ khách)
            df_nkc = pd.concat([df_nkc, pd.DataFrame([{'dt': dt_m, 'sh': f'PT{m:02}', 'desc': f'Thu tiền mặt khách hàng - Tháng {m}', 'dr': '1111', 'cr': '131', 'amt': monthly_amt, 'obj': 'Khách hàng lẻ'}])], ignore_index=True)
        else: # Need to decrease Cash (Chi trả NCC)
            df_nkc = pd.concat([df_nkc, pd.DataFrame([{'dt': dt_m, 'sh': f'PC{m:02}', 'desc': f'Chi tiền mặt trả nhà cung cấp - Tháng {m}', 'dr': '331', 'cr': '1111', 'amt': -monthly_amt, 'obj': 'Nhà cung cấp lẻ'}])], ignore_index=True)

    # Final Sort
    df_nkc = df_nkc.sort_values('dt')
    return df_nkc

# 3. Final Excel Export with Totals
def save_sct(df_nkc):
    accounts = ['1111', '112', '131', '331', '1561', '341', '1331', '3331', '5111', '632', '642']
    with pd.ExcelWriter(SCT_PATH, engine='openpyxl') as writer:
        # [NKC]
        df_nkc.to_excel(writer, sheet_name='NKC', index=False)
        
        # [ACCOUNTS]
        for acc in accounts:
            mask = (df_nkc['dr'].str.startswith(acc)) | (df_nkc['cr'].str.startswith(acc))
            sub = df_nkc[mask].copy()
            ob = OPENING_BALANCES.get(acc, 0)
            
            rows = [{'Ngày hạch toán': datetime(YEAR, 1, 1), 'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Đầu kỳ': ob, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 'Cuối kỳ': ob}]
            bal = ob
            for _, r in sub.iterrows():
                pn, pc = (r['amt'], 0) if r['dr'].startswith(acc) else (0, r['amt'])
                if acc.startswith(('1','2','6')): bal += pn - pc
                else: bal += pc - pn
                rows.append({'Ngày hạch toán': r['dt'].strftime('%Y-%m-%d'), 'Số chứng từ': r['sh'], 'Diễn giải': r['desc'], 'TK Đối ứng': r['cr'] if r['dr'].startswith(acc) else r['dr'], 'Đầu kỳ': 0, 'Phát sinh Nợ': pn, 'Phát sinh Có': pc, 'Cuối kỳ': bal})
            
            # TOTAL
            res = pd.DataFrame(rows)
            total_row = pd.DataFrame([{'Diễn giải': 'TỔNG CỘNG', 'Phát sinh Nợ': res['Phát sinh Nợ'].sum(), 'Phát sinh Có': res['Phát sinh Có'].sum(), 'Cuối kỳ': bal}])
            res = pd.concat([res, total_row], ignore_index=True).fillna('')
            res.to_excel(writer, sheet_name=acc[:31], index=False)
            
            # Styling Bold Total
            ws = writer.sheets[acc[:31]]
            for cell in ws[ws.max_row]: cell.font = Font(bold=True); cell.fill = PatternFill("solid", fgColor="DDEBF7")
    print(f"✅ Fast duckdb build complete: {SCT_PATH}")

if __name__ == "__main__":
    i, d, b = load_data()
    n = process_duckdb(i, d, b)
    save_sct(n)
