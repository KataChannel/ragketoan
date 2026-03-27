import duckdb
import os
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ============================================================
# CONFIG
# ============================================================
DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"

# Extracted from DB_URI for DuckDB ATTACH
# Format: postgresql://user:password@host:port/dbname
import re
match = re.match(r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", DB_URI)
if match:
    DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME = match.groups()
    PG_CONN_STR = f"dbname={DB_NAME} user={DB_USER} password={DB_PASS} host={DB_HOST} port={DB_PORT}"
else:
    # Fallback/Default
    PG_CONN_STR = "host=localhost port=5432 user=root password=password dbname=ketoan"

# ============================================================
# DATA FETCHING (DUCKDB ENGINE)
# ============================================================
def get_duckdb_conn():
    con = duckdb.connect(':memory:')
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{PG_CONN_STR}' AS pg (TYPE POSTGRES, READ_ONLY);")
    return con

def fetch_data_duckdb(year):
    con = get_duckdb_conn()
    
    # Timezone adjust logic in SQL
    tz_sql = "ic.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH'"
    
    # 1. Fetch Header Sums (For "Đối Chiếu Mục Tiêu" sheet)
    # We filter by status and type
    report_query = f"""
    SELECT 
        loaihd,
        shdon,
        tgtcthue,
        EXTRACT(MONTH FROM {tz_sql}) as month
    FROM pg.ext_listhoadon ic
    WHERE "congtyId" = '{COMPANY_ID}'
      AND tthai IN ('1','2','4','5')
      AND EXTRACT(YEAR FROM {tz_sql}) = {year}
    """
    df_reported = con.execute(report_query).df()
    
    # 2. Fetch Detailed Items (For XNT calculation)
    # Join list with details
    detail_query = f"""
    SELECT 
        l.loaihd,
        l.shdon,
        {tz_sql} as ict,
        d.mhdon,
        d.thang,
        d.sluong,
        d.dgiai,
        d.dgia,
        d.tthanhtien
    FROM pg.ext_detailhoadon d
    JOIN pg.ext_listhoadon l ON d."hoadonId" = l.id
    WHERE l."congtyId" = '{COMPANY_ID}'
      AND l.tthai IN ('1','2','4','5')
      AND EXTRACT(YEAR FROM {tz_sql}) = {year}
    """
    df_details = con.execute(detail_query).df()
    
    return df_reported, df_details

# ============================================================
# MAIN PROCESSING (HYBRID DUCKDB + PANDAS)
# ============================================================
# (Rest of logic similar to v1 but using DuckDB for speed-up where count is high)
# Note: For WAP, DuckDB is overkill if data is < 100k, but let's show how to use it.

if __name__ == "__main__":
    import time
    start_time = time.time()
    
    year = 2023
    print(f"--- Fetching 2023 data via DuckDB Scanner ---")
    df_rep, df_det = fetch_data_duckdb(year)
    
    print(f"Header lines: {len(df_rep)}")
    print(f"Detail lines: {len(df_det)}")
    print(f"Processing time: {time.time() - start_time:.2f}s")
    
    # Logic for XNT calculation goes here (porting from previous script)
    # ...
