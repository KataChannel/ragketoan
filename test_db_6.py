import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
df = pd.read_sql("""
    SELECT h."shdon", h."idServer", d."idhdonServer", h.loaihd
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d on d."shdon" = h.shdon
    WHERE to_char(h.tdlap, 'YYYY-MM') = '2023-01'
    LIMIT 10
""", conn)
print(df)
