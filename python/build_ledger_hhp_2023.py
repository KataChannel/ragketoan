import pandas as pd
import duckdb
import os
import time

# ============================================================
# CONFIG & SOURCES
# ============================================================
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82"
XNT_EXCEL = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/tonghop/XNT_HoangHuyPhat_2023.xlsx"
OUTPUT_XLSX = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/tonghop/SO_SACH_KE_TOAN_HHP_2023.xlsx"
DB_URL = "postgresql://root:password@localhost:5432/ketoan"

def build_ledger():
    print("🚀 Building Integrated Ledger for Hoàng Huy Phát 2023...")
    start_time = time.time()

    # 1. Load XNT and prepare NKC from it
    xnt = pd.read_excel(XNT_EXCEL, sheet_name="XNT_2023")
    
    # 2. Extract transactions from DB directly to NKC (more accurate)
    con = duckdb.connect()
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{DB_URL}' AS db (TYPE POSTGRES);")

    print("  - Fetching invoice transactions from database...")
    # Fetch Invoices with totals
    query_nkc = f"""
        SELECT 
            (hdon_list.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')::DATE as "Ngày",
            hdon_list.shdon as "Số HĐ",
            hdon_list.loaihd,
            details.ten as "Diễn giải",
            details.thtien as "Số tiền",
            details.tthue as "Thuế"
        FROM db.ext_listhoadon hdon_list
        JOIN db.ext_detailhoadon details ON details."idhdonServer" = hdon_list."idServer"
        WHERE hdon_list."congtyId" = '{COMPANY_ID}'
        AND hdon_list.tthai IN ('1','2','4','5')
        AND EXTRACT(YEAR FROM (hdon_list.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = 2023
    """
    df_raw = con.execute(query_nkc).df()

    # Expand into accounting entries (Journal entries)
    journal_entries = []
    
    for idx, row in df_raw.iterrows():
        # Sales (banra)
        if row['loaihd'] == 'banra':
            # Nợ 131 / Có 511
            journal_entries.append({
                "Ngày": row['Ngày'], "Số HĐ": row['Số HĐ'], "Diễn giải": f"Doanh thu: {row['Diễn giải']}", 
                "TK Nợ": "131", "TK Có": "5111", "Số tiền": row['Số tiền']
            })
            # Nợ 131 / Có 3331
            if row['Thuế'] > 0:
                journal_entries.append({
                    "Ngày": row['Ngày'], "Số HĐ": row['Số HĐ'], "Diễn giải": f"Thuế VAT bán ra HĐ {row['Số HĐ']}", 
                    "TK Nợ": "131", "TK Có": "3331", "Số tiền": row['Thuế']
                })
        # Purchases (muavao)
        elif row['loaihd'] == 'muavao':
            # Skip non-product purchases (like skip list logic, but simpler here: only if 156 exists)
            if any(p in row['Diễn giải'].upper() for p in ["PHÍ", "QUẢNG CÁO", "DỊCH VỤ"]): 
                acc_no = "642" # Expense
            else:
                acc_no = "1561" # Inventory
                
            # Nợ 1561/642 / Có 331
            journal_entries.append({
                "Ngày": row['Ngày'], "Số HĐ": row['Số HĐ'], "Diễn giải": f"Mua vào: {row['Diễn giải']}", 
                "TK Nợ": acc_no, "TK Có": "331", "Số tiền": row['Số tiền']
            })
            # Nợ 1331 / Có 331
            if row['Thuế'] > 0:
                journal_entries.append({
                    "Ngày": row['Ngày'], "Số HĐ": row['Số HĐ'], "Diễn giải": f"Thuế VAT mua vào HĐ {row['Số HĐ']}", 
                    "TK Nợ": "1331", "TK Có": "331", "Số tiền": row['Thuế']
                })

    # Add COGS from XNT - Monthly aggregated for simplicity
    cogs_total = xnt['X_COGS'].sum()
    journal_entries.append({
        "Ngày": "2023-12-31", "Số HĐ": "PX-TONG", "Diễn giải": "Giá vốn hàng bán năm 2023", 
        "TK Nợ": "632", "TK Có": "1561", "Số tiền": cogs_total
    })

    df_nkc = pd.DataFrame(journal_entries)
    df_nkc['Ngày'] = pd.to_datetime(df_nkc['Ngày'])
    
    # 3. Create CDPS (Trial Balance) and Other Sheets
    # We use DuckDB for grouping
    con_mem = duckdb.connect(':memory:')
    con_mem.execute("CREATE TABLE nkc AS SELECT * FROM df_nkc")
    
    # Opening Balances
    # Ton dau 113.7B
    TON_DAU_1561 = 113_746_247_959
    
    # Calculate CDPS
    con_mem.execute(f"""
        CREATE TABLE cdps AS
        WITH all_trans AS (
            SELECT "TK Nợ" as acc, "Số tiền" as no, 0.0 as co FROM nkc
            UNION ALL
            SELECT "TK Có" as acc, 0.0 as no, "Số tiền" as co FROM nkc
        ),
        acc_summary AS (
            SELECT acc, SUM(no) as ps_no, SUM(co) as ps_co
            FROM all_trans
            GROUP BY 1
        )
        SELECT 
            acc as "Tài khoản",
            CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) as "Dư Đầu Nợ",
            CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) as "Dư Đầu Có",
            CAST(ps_no AS DOUBLE) as "Phát sinh Nợ",
            CAST(ps_co AS DOUBLE) as "Phát sinh Có",
            CASE WHEN (CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) + ps_no - CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) - ps_co) > 0 
                 THEN (CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) + ps_no - CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) - ps_co) ELSE 0 END as "Dư Cuối Nợ",
            CASE WHEN (CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) + ps_no - CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) - ps_co) < 0 
                 THEN ABS(CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) + ps_no - CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) - ps_co) ELSE 0 END as "Dư Cuối Có"
        FROM acc_summary
        ORDER BY acc
    """)

    # 4. Writing Output
    print(f"  - Writing to {OUTPUT_XLSX}...")
    with pd.ExcelWriter(OUTPUT_XLSX, engine='openpyxl') as writer:
        # NKC
        con_mem.execute("SELECT * FROM nkc ORDER BY Ngày").df().to_excel(writer, sheet_name="NKC", index=False)
        
        # CDPS
        con_mem.execute("SELECT * FROM cdps").df().to_excel(writer, sheet_name="CDPS", index=False)
        
        # Major Acc Details
        major_accs = ['1111', '131', '1561', '331', '3331', '1331', '5111', '632', '642']
        for acc in major_accs:
            df_ct = con_mem.execute(f"""
                SELECT "Ngày", "Số HĐ", "Diễn giải", 
                       CASE WHEN "TK Nợ" LIKE '{acc}%' THEN "TK Có" ELSE "TK Nợ" END as "TK Đối ứng",
                       CASE WHEN "TK Nợ" LIKE '{acc}%' THEN "Số tiền" ELSE 0 END as "Nợ",
                       CASE WHEN "TK Có" LIKE '{acc}%' THEN "Số tiền" ELSE 0 END as "Có"
                FROM nkc
                WHERE "TK Nợ" LIKE '{acc}%' OR "TK Có" LIKE '{acc}%'
                ORDER BY "Ngày"
            """).df()
            df_ct.to_excel(writer, sheet_name=f"CT_{acc}", index=False)

    end_time = time.time()
    print(f"✅ Full Ledger for HHP complete! Time: {end_time - start_time:.2f}s.")

if __name__ == "__main__":
    build_ledger()
