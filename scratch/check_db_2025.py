import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")

# MST Huy Vu: 5900363291
mst = '5900363291'
year = 2025

print(f"Checking DB for MST {mst} Year {year}")

# Ban ra (Xuất) - nbmst is Seller (Huy Vu)
query_out = f"""
    SELECT sum(tgtcthue) 
    FROM ext_listhoadon 
    WHERE nbmst = '{mst}' 
      AND tdlap >= '{year}-01-01' AND tdlap <= '{year}-12-31'
      AND tthai IN ('1','2','4','5')
      AND loaihd = 'banra'
"""
df_out = pd.read_sql(query_out, conn)
print(f"Ban ra (tgtcthue): {df_out.iloc[0,0]:,.0f}")

# Mua vao (Nhập) - nmmst is Buyer (Huy Vu)
query_in = f"""
    SELECT sum(tgtcthue) 
    FROM ext_listhoadon 
    WHERE nmmst = '{mst}' 
      AND tdlap >= '{year}-01-01' AND tdlap <= '{year}-12-31'
      AND tthai IN ('1','2','4','5')
      AND loaihd = 'muavao'
"""
df_in = pd.read_sql(query_in, conn)
print(f"Mua vao (tgtcthue): {df_in.iloc[0,0]:,.0f}")
