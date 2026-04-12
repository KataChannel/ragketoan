import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
mst = '5900428904' # Hoàng Huy Phát

query = f"""
    SELECT 
        to_char(tdlap, 'YYYY-MM') as month,
        loaihd,
        SUM(tgtcthue) as total_amount
    FROM ext_listhoadon
    WHERE (nbmst='{mst}' OR nmmst='{mst}')
      AND tdlap >= '2023-01-01' AND tdlap <= '2023-12-31'
    GROUP BY month, loaihd
    ORDER BY month, loaihd
"""

df = pd.read_sql(query, conn)
pivot_df = df.pivot(index='month', columns='loaihd', values='total_amount')
print("\n--- Summary by Month (HHP 5900428904) ---")
print(pivot_df)

# Calculate total for the year
print("\n--- Year Total ---")
print(pivot_df.sum())

# Also check for values in 2023 specifically
# Let's see if we have targets matching the MD exactly in the DB
# (Maybe the MD targets are also adjusted from DB)
