import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")

df = pd.read_sql("""
    SELECT h.id as h_id, h."idServer" as h_server, h.shdon, d.id as d_id, d."idhdonServer" as d_server, h.loaihd
    FROM ext_listhoadon h
    JOIN ext_detailhoadon d ON h.shdon = split_part(d."idServer", '_', 1) -- just guessing if shdon is inside
    WHERE to_char(h.tdlap, 'YYYY') = '2023' AND h.loaihd = 'muavao'
    LIMIT 10
""", conn)
print(df)

df_try = pd.read_sql("""
    SELECT h.shdon, h.tdlap, d.ten, h."idServer" as h_srv, d."idhdonServer" as d_srv
    FROM ext_listhoadon h
    JOIN ext_detailhoadon d ON h.shdon = split_part(d."id", '_', 2) -- guessing
    LIMIT 2
""", conn)
