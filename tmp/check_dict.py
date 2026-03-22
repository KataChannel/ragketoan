import psycopg2
import pandas as pd

DATABASE_URL = "postgresql://root:password@localhost:5432/ketoan"

conn = psycopg2.connect(DATABASE_URL)

query = 'SELECT "tenGoc", "tenChuan", "maHang", "nhomHang" FROM "ext_sanpham_dictionary" LIMIT 10;'
df = pd.read_sql(query, conn)
print("Dictionary sample:")
print(df)

query2 = 'SELECT count(*) FROM "ext_sanpham_dictionary";'
df2 = pd.read_sql(query2, conn)
print("Dictionary count:")
print(df2)

conn.close()
