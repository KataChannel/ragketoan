import pandas as pd
import duckdb
import os
import time
from datetime import datetime

# ============================================================
# CONFIG & SOURCES
# ============================================================
COMPANY_ID = "03b043e9-b7cd-42bc-a4ea-db710552af82" # Hoàng Huy Phát
YEAR = 2023
XNT_EXCEL = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/tonghop/XNT_HoangHuyPhat_2023.xlsx"
OUTPUT_XLSX = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/tonghop/SO_SACH_KE_TOAN_HHP_2023.xlsx"
DB_URL = "postgresql://root:password@localhost:5432/ketoan"

# Opening Balance from 1.yeucauhhp.md
TON_DAU_1561 = 15447634554

def build_ledger():
    print("🚀 Building Integrated Ledger for Hoàng Huy Phát 2023...")
    start_time = time.time()

    if not os.path.exists(XNT_EXCEL):
        print(f"❌ XNT file not found: {XNT_EXCEL}")
        return

    # 1. Load XNT to get total COGS
    print("  - Reading XNT for COGS...")
    xnt_df = pd.read_excel(XNT_EXCEL, sheet_name="xnt12thang")
    # Get total COGS (excluding "TỔNG CỘNG" row if it exists)
    cogs_total = xnt_df[xnt_df['TenHang'] != 'TỔNG CỘNG']['X_COGS'].sum()

    # 2. Extract transactions from DB
    con = duckdb.connect()
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{DB_URL}' AS db (TYPE POSTGRES);")

    print("  - Fetching invoice transactions from database...")
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
        AND EXTRACT(YEAR FROM (hdon_list.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh')) = {YEAR}
    """
    df_raw = con.execute(query_nkc).df()

    # 3. Create Journal Entries (NKC)
    entries = []
    
    # 3.1 Initial Balance (Dummy entry for visualization in some reports, though usually in CDPS)
    # 3.2 Main Transactions
    for _, row in df_raw.iterrows():
        desc = row['Diễn giải']
        amt = row['Số tiền']
        tax = row['Thuế']
        date = row['Ngày']
        shdon = row['Số HĐ']
        
        if row['loaihd'] == 'banra':
            # Doanh thu: Nợ 131 / Có 5111
            entries.append({"Ngày": date, "Số CT": f"HĐ {shdon}", "Diễn giải": f"Doanh thu: {desc}", "TK Nợ": "131", "TK Có": "5111", "Số tiền": amt})
            # Thuế GTGT: Nợ 131 / Có 3331
            if tax > 0:
                entries.append({"Ngày": date, "Số CT": f"HĐ {shdon}", "Diễn giải": f"Thuế GTGT đầu ra HĐ {shdon}", "TK Nợ": "131", "TK Có": "33311", "Số tiền": tax})
        else: # muavao
            # Determine account: 1561 or expense
            # Simple heuristic
            acc_no = "1561"
            if any(x in str(desc).upper() for x in ["PHÍ", "QUẢNG CÁO", "DỊCH VỤ", "VẬN CHUYỂN", "TIỀN ĐIỆN", "TIỀN NƯỚC"]):
                acc_no = "642"
            
            # Mua hàng: Nợ 1561/642 / Có 331
            entries.append({"Ngày": date, "Số CT": f"HĐ {shdon}", "Diễn giải": f"Mua vào: {desc}", "TK Nợ": acc_no, "TK Có": "331", "Số tiền": amt})
            # Thuế GTGT: Nợ 1331 / Có 331
            if tax > 0:
                entries.append({"Ngày": date, "Số CT": f"HĐ {shdon}", "Diễn giải": f"Thuế GTGT đầu vào HĐ {shdon}", "TK Nợ": "1331", "TK Có": "331", "Số tiền": tax})

    # 3.3 Add COGS Adjustment
    entries.append({
        "Ngày": datetime(YEAR, 12, 31).date(),
        "Số CT": "PX-TONG",
        "Diễn giải": "Kết chuyển giá vốn hàng bán năm 2023",
        "TK Nợ": "632",
        "TK Có": "1561",
        "Số tiền": round(cogs_total, 2)
    })

    # 3.4 Closing Revenue and Expense to 911 (Simplified)
    # (Optional, but let's keep it to basic entries as requested)
    
    df_nkc = pd.DataFrame(entries)
    df_nkc['Ngày'] = pd.to_datetime(df_nkc['Ngày'])
    
    # 4. CDPS (Trial Balance) Calculation
    con_mem = duckdb.connect(':memory:')
    con_mem.execute("CREATE TABLE nkc AS SELECT * FROM df_nkc")
    
    # Extract unique accounts
    con_mem.execute("""
        CREATE TABLE acc_list AS
        SELECT DISTINCT "TK Nợ" as acc FROM nkc
        UNION
        SELECT DISTINCT "TK Có" as acc FROM nkc
    """)
    
    # CDPS Query
    cdps_query = f"""
        WITH trans AS (
            SELECT "TK Nợ" as acc, "Số tiền" as no, 0.0 as co FROM nkc
            UNION ALL
            SELECT "TK Có" as acc, 0.0 as no, "Số tiền" as co FROM nkc
        ),
        ps AS (
            SELECT acc, SUM(no) as ps_no, SUM(co) as ps_co
            FROM trans GROUP BY acc
        )
        SELECT 
            acc as "Tài khoản",
            CAST(CASE WHEN acc = '1561' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) as "Dư Đầu Nợ",
            CAST(CASE WHEN acc = '4111' THEN {TON_DAU_1561} ELSE 0 END AS DOUBLE) as "Dư Đầu Có",
            CAST(ps_no AS DOUBLE) as "Phát sinh Nợ",
            CAST(ps_co AS DOUBLE) as "Phát sinh Có",
            0.0 as "Dư Cuối Nợ",
            0.0 as "Dư Cuối Có"
        FROM ps
    """
    df_cdps = con_mem.execute(cdps_query).df()
    
    # Calculate Final Balances in Python for clarity
    df_cdps['Dư Cuối Nợ'] = (df_cdps['Dư Đầu Nợ'] + df_cdps['Phát sinh Nợ'] - df_cdps['Dư Đầu Có'] - df_cdps['Phát sinh Có']).apply(lambda x: x if x > 0 else 0)
    df_cdps['Dư Cuối Có'] = (df_cdps['Dư Đầu Có'] + df_cdps['Phát sinh Có'] - df_cdps['Dư Đầu Nợ'] - df_cdps['Phát sinh Nợ']).apply(lambda x: x if x > 0 else 0)

    # 5. Writing to Excel
    print(f"  - Writing to {OUTPUT_XLSX}...")
    with pd.ExcelWriter(OUTPUT_XLSX, engine='openpyxl') as writer:
        df_nkc.to_excel(writer, sheet_name="NKC", index=False)
        df_cdps.to_excel(writer, sheet_name="CDPS", index=False)
        
        # Detail Ledgers (Sổ Cái)
        major_accs = sorted(df_cdps['Tài khoản'].unique())
        for acc in major_accs:
            df_ct = con_mem.execute(f"""
                SELECT "Ngày", "Số CT", "Diễn giải", 
                       CASE WHEN "TK Nợ" = '{acc}' THEN "TK Có" ELSE "TK Nợ" END as "TK Đối ứng",
                       CASE WHEN "TK Nợ" = '{acc}' THEN "Số tiền" ELSE 0 END as "Nợ",
                       CASE WHEN "TK Có" = '{acc}' THEN "Số tiền" ELSE 0 END as "Có"
                FROM nkc
                WHERE "TK Nợ" = '{acc}' OR "TK Có" = '{acc}'
                ORDER BY "Ngày"
            """).df()
            if not df_ct.empty:
                # Add Opening row
                opening_no = df_cdps.loc[df_cdps['Tài khoản'] == acc, 'Dư Đầu Nợ'].values[0]
                opening_co = df_cdps.loc[df_cdps['Tài khoản'] == acc, 'Dư Đầu Có'].values[0]
                if opening_no > 0 or opening_co > 0:
                    op_row = pd.DataFrame([{"Ngày": datetime(YEAR, 1, 1), "Diễn giải": "Số dư đầu kỳ", "Nợ": opening_no, "Có": opening_co}])
                    df_ct = pd.concat([op_row, df_ct], ignore_index=True)
                
                # Add Total row
                tot_r = df_ct.sum(numeric_only=True)
                tot_r['Diễn giải'] = 'TỔNG CỘNG'
                df_ct = pd.concat([df_ct, pd.DataFrame([tot_r])], ignore_index=True)
                
                sheet_name = f"Sổ Cái {acc}"
                if len(sheet_name) > 31: sheet_name = sheet_name[:31]
                df_ct.to_excel(writer, sheet_name=sheet_name, index=False)

    print(f"✅ Full Ledger for HHP complete! Path: {OUTPUT_XLSX}")

if __name__ == "__main__":
    build_ledger()
