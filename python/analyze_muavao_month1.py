
import os
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

def main():
    query = text("""
        SELECT l.shdon, l.nbmst, l.nbten, l.tgtcthue, d.ten as item_ten
        FROM ext_listhoadon l
        JOIN ext_detailhoadon d ON l."idServer" = d."idhdonServer"
        WHERE l."congtyId" = :cid
          AND l.loaihd = 'muavao'
          AND l.tthai IN ('1','2','4','5')
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2023-02-01'
    """)
    
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={'cid': COMPANY_ID})
    
    # Sum by invoice
    df_inv = df.groupby(['shdon', 'nbmst', 'nbten']).agg({'tgtcthue': 'first', 'item_ten': lambda x: '; '.join(x.astype(str))}).reset_index()
    
    print("--- PURCHASE INVOICES JAN 2023 ---")
    print(df_inv.sort_values('tgtcthue', ascending=False).head(40))
    
    target_diff = 42870874
    print(f"\nTarget Diff to find: {target_diff:,.0f}")
    
    # Try to find a single one or combination?
    # Actually just look at the list
    
if __name__ == "__main__":
    main()
