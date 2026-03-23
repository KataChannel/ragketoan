import psycopg2
import pandas as pd

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
df = pd.read_sql("""
    SELECT d."idhdonServer"
    FROM ext_detailhoadon d
    LIMIT 20
""", conn)
print("sample d.idhdonServer:")
print(df)
