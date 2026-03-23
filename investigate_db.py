import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
df_list = pd.read_sql("""
    SELECT count(*), h.loaihd
    FROM ext_listhoadon h
    WHERE h.nbmst='5900363291' OR h.nmmst='5900363291'
    GROUP BY h.loaihd
""", conn)
print("count from listhoadon:")
print(df_list)

df_det = pd.read_sql("""
    SELECT count(*)
    FROM ext_detailhoadon d
""", conn)
print("count of all details:", df_det.iloc[0][0])

df_unlinked = pd.read_sql("""
    SELECT d."idhdonServer"
    FROM ext_detailhoadon d
    LEFT JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
    WHERE h.id IS NULL
    LIMIT 5
""", conn)
print("Details without listhoadon link:", len(df_unlinked))

df_h = pd.read_sql("""
    SELECT h."idServer", h.shdon, h.tdlap, h.tgtcthue, h.nmmst, h.nbmst
    FROM ext_listhoadon h 
    WHERE (h.nbmst='5900363291' OR h.nmmst='5900363291')
      AND to_char(h.tdlap, 'YYYY-MM') = '2023-01' AND h.loaihd='muavao'
    LIMIT 5
""", conn)
print("Sample listhoadon lacking details:")
print(df_h)

sample_idServers = tuple(df_h['idServer'].tolist())

df_d_manual = pd.read_sql(f"""
    SELECT * FROM ext_detailhoadon WHERE "idhdonServer" IN {sample_idServers}
""", conn)
print("Detail rows for these samples:", len(df_d_manual))

# Search detailhoadon using shdon maybe?
if len(df_h) > 0:
    sample_shdon = df_h.iloc[0]['shdon']
    df_d_shdon = pd.read_sql(f"""
        SELECT d.id, d."idhdonServer", h.shdon, d.ten
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h on d."idhdonServer" = h."idServer"
        WHERE h.shdon = '{sample_shdon}'
        LIMIT 5
    """, conn)
    print(f"Details joined by shdon '{sample_shdon}':", len(df_d_shdon))
