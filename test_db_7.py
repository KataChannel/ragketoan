import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")

df_unlinked = pd.read_sql("""
    SELECT h."shdon", h.tdlap, h."idServer" as h_id, count(d.id) as d_cnt
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE to_char(h.tdlap, 'YYYY-MM') = '2023-01' AND h.loaihd = 'muavao'
    GROUP BY h."shdon", h.tdlap, h."idServer"
    ORDER BY d_cnt ASC
    LIMIT 5
""", conn)
print("Unlinked listhoadon examples:")
print(df_unlinked)

if len(df_unlinked) > 0:
    shdon = df_unlinked.iloc[0]['shdon']
    df_search = pd.read_sql(f"""
        SELECT h."shdon" as "H_Shdon", h."idServer" as "H_idServer", d.id as "D_id", d."idhdonServer" as "D_idhdonServer", h.loaihd
        FROM ext_listhoadon h
        JOIN ext_detailhoadon d on d."idhdonServer" = h."idServer"
        WHERE h.shdon = '{shdon}'
    """, conn)
    print(f"Are there any details for shdon {shdon} in the DB linked proper?")
    print(df_search)
    
    # search purely in detail using a generic text match?
    df_raw = pd.read_sql(f"""
        SELECT * FROM ext_detailhoadon WHERE "idhdonServer" LIKE '%{shdon}%' LIMIT 5
    """, conn)
    print("Raw search by shdon in idhdonServer:")
    print(df_raw)

