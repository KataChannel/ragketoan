import psycopg2
conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()
cur.execute("""
    SELECT loaihd, COUNT(*) 
    FROM ext_listhoadon 
    WHERE nbmst='5900363291' OR nmmst='5900363291' 
    GROUP BY loaihd
""")
print("loaihd for 5900363291:")
for row in cur.fetchall():
    print(row)
