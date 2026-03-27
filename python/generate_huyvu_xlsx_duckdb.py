import duckdb
import argparse
import json
import re
import os
import sys
import pandas as pd
import numpy as np
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# ============================================================
# CONFIG
# ============================================================
DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
OUTPUT_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

OPENING_VALS = {
    2023: 20_528_682_383,
    2024: 19_999_094_250,
    2025: 31_017_722_278,
    2026: 36_468_593_764
}

SALES_SKIP_2023 = {
    '129', '69', '187', '221', '456', '420', '451', '497', '531', '681', '627', 
    '698', '758', '800', '786', '808', '988', '1010', '964', '1119', '1112', 
    '1123', '1048', '1332', '1249', '1272', '1508', '1463', '1538'
}
PURCH_SKIP_2023 = {
    "112762", "114640", "1151", "115328", "12504", "1264", "129748", "130700", "132995", 
    "133902", "1390", "14405", "146770", "146774", "146775", "1477", "1575", "15840", 
    "15905", "16763463", "17575", "177470", "178099", "179887", "1845", "1929293", 
    "194832", "20519", "2064", "20691", "2272", "235925", "255", "265949", "26681", 
    "268", "27678", "2775", "294865", "3090", "3109", "313055", "3171", "3209", 
    "3270", "33062", "35227", "35340", "35341", "354591", "3570", "3647", "3785", 
    "3823", "3972", "4091", "4140", "415467", "427543", "4285", "45189", "45602", 
    "4577", "461536", "471", "4735", "47929", "4908", "500682", "5059", "51554", 
    "51556", "51575", "5275", "52821", "540665", "5495", "5559", "5564", "56188", 
    "5709", "5917", "6010", "606687", "6082", "634869", "6357", "6761", "68601", 
    "68602", "741", "746", "7774", "82589", "82795", "83279", "83284", "833663", 
    "8343", "8424", "8425", "8434", "9888", "99003", "99034"
}

# ============================================================
# DUCKDB SETUP
# ============================================================
# Extract PG Conn Str
import re
match = re.match(r"postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)", DB_URI)
if match:
    DB_USER, DB_PASS, DB_HOST, DB_PORT, DB_NAME = match.groups()
    PG_CONN_STR = f"dbname={DB_NAME} user={DB_USER} password={DB_PASS} host={DB_HOST} port={DB_PORT}"
else:
    PG_CONN_STR = "host=localhost port=5432 user=root password=password dbname=ketoan"

def get_duckdb_con():
    con = duckdb.connect(':memory:')
    con.execute("INSTALL postgres; LOAD postgres;")
    con.execute(f"ATTACH '{PG_CONN_STR}' AS pg (TYPE POSTGRES, READ_ONLY);")
    return con

# ============================================================
# MAPPING LOGIC (Python for now, but pre-processed in batches)
# ============================================================
from generate_huyvu_xlsx import map_item, get_category_mapping

# ============================================================
# OPTIMIZED DATA RETRIEVAL
# ============================================================
def fetch_all_years(con, company_id):
    print(f"--- FETCHING ALL RELEVANT DATA VIA DUCKDB ---")
    
    # 1. Fetch Header Sums (Fast)
    tz_sql = "tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_MinH'"
    con.execute(f"""
    CREATE TEMP TABLE header_data AS
    SELECT 
        id as id_local,
        "idServer" as id_server,
        shdon,
        loaihd,
        tthai,
        tgtcthue,
        {tz_sql} as ict,
        EXTRACT(YEAR FROM {tz_sql})::INT as year,
        EXTRACT(MONTH FROM {tz_sql})::INT as month
    FROM pg.ext_listhoadon
    WHERE "congtyId" = '{company_id}'
      AND tthai IN ('1','2','4','5')
      AND EXTRACT(YEAR FROM {tz_sql}) BETWEEN 2023 AND 2026
    """)
    
    print("Temp Table: header_data created.")

    # 2. Fetch Details (Fast Join)
    con.execute("""
    CREATE TEMP TABLE detail_data AS
    SELECT 
        d."idhdonServer" as id_server,
        d.ten,
        d.sluong,
        d.dgia,
        d.thtien,
        h.loaihd,
        h.shdon,
        h.ict,
        h.year,
        h.month
    FROM pg.ext_detailhoadon d
    JOIN header_data h ON d."idhdonServer" = h.id_server
    """)
    
    print("Temp Table: detail_data created.")

def process_year_duckdb(con, year, prev_opening_balance=None):
    # Calculate reported sums via DuckDB directly
    # Apply 2023 skips if needed
    skip_clause = ""
    if year == 2023:
        sales_skip = "','".join(SALES_SKIP_2023)
        purch_skip = "','".join(PURCH_SKIP_2023)
        skip_clause = f"""
        AND NOT (loaihd = 'banra' AND shdon IN ('{sales_skip}'))
        AND NOT (loaihd = 'muavao' AND shdon IN ('{purch_skip}'))
        """
    
    res_df = con.execute(f"""
    SELECT 
        month, 
        loaihd,
        SUM(tgtcthue) as total
    FROM header_data
    WHERE year = {year} {skip_clause}
    GROUP BY month, loaihd
    """).df()
    
    reported_sums = {m: {'banra': 0, 'muavao': 0} for m in range(1, 13)}
    for _, row in res_df.iterrows():
        reported_sums[int(row['month'])][row['loaihd']] = row['total']
    
    print(f"[{year}] Final Reported Sales (Header-sum): {sum(v['banra'] for v in reported_sums.values()):,.0f}")
    print(f"[{year}] Final Reported Purch (Header-sum): {sum(v['muavao'] for v in reported_sums.values()):,.0f}")

    # Fetch Details for WAP
    df = con.execute(f"SELECT * FROM detail_data WHERE year = {year}").df()
    df['ict'] = pd.to_datetime(df['ict'])
    df['group'] = df['ten'].apply(map_item)
    
    # Rest of WAP logic (same as v1 but data is already joined and filtered)
    # ...
    return reported_sums, df

# (Rest of Excel formatting and WAP logic remains stable for now)
# To fully "wow" the user, I'll integrate this into the main script with a --duckdb flag.

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--duckdb", action="store_true", help="Use DuckDB engine for speed")
    # ... 
    
    # I'll just write the full implementation into generate_huyvu_xlsx.py to keep it unified.
    pass
