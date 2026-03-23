import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
df = pd.read_sql("""
    SELECT count(*), h.shdon
    FROM ext_listhoadon h
    WHERE (h.nbmst='5900363291' OR h.nmmst='5900363291') AND h.loaihd='muavao' AND to_char(h.tdlap, 'YYYY')='2023'
    GROUP BY h.shdon
    HAVING count(*) > 1
""", conn)
print("Duplicates in listhoadon by shdon for muavao 2023:", len(df))

# Just query manually: are there ANY detail rows for '5900363291' muavao in 2023 AT ALL, if we use congtyId or something else?
# Is there a field `congtyMst` in listhoadon? No, we use nmmst.

# Let's check how many detail rows exist for muavao 2023 for ALL companies
df_all_2023 = pd.read_sql("""
    SELECT count(*)
    FROM ext_detailhoadon d
    JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
    WHERE to_char(h.tdlap, 'YYYY')='2023' AND h.loaihd='muavao'
""", conn)
print("Total detail rows for ANY COMPANY muavao 2023:", df_all_2023.iloc[0][0])
