
import os
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

FILTERS = {
    2: ["129", "69"],
    3: ["187", "221"],
    4: ["456", "420", "451"],
    5: ["497", "531"],
    6: ["681", "627"],
    7: ["698", "758"],
    8: ["800", "786", "808"],
    9: ["988", "1010", "964"],
    10: ["1119", "1112", "1123", "1048"],
    11: ["1332", "1249", "1272"],
    12: ["1508", "1463", "1538"]
}

def check_sales_filters():
    all_sh = []
    for m, shs in FILTERS.items():
        all_sh.extend(shs)
    
    query = text("""
        SELECT shdon, tgtcthue, loaihd, tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict
        FROM ext_listhoadon
        WHERE "congtyId" = :cid
          AND shdon IN :shs
          AND loaihd = 'banra'
    """)
    
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={'cid': COMPANY_ID, 'shs': tuple(all_sh)})
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    print("--- SALES FILTER ANALYSIS ---")
    for m in sorted(FILTERS.keys()):
        m_df = df[df['month'] == m]
        print(f"Month {m}: SH {FILTERS[m]} -> Sum: {m_df['tgtcthue'].sum():,.0f}")

if __name__ == "__main__":
    check_sales_filters()
