import psycopg2

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()

# Try matching ext_detailhoadon.idhdonServer with ext_listhoadon.id
cur.execute("""
    SELECT count(*)
    FROM ext_detailhoadon d
    JOIN ext_listhoadon h ON d."idhdonServer" = h.id
""")
print("d.idhdonServer = h.id :", cur.fetchone()[0])

# Try matching ext_detailhoadon.idServer with ext_listhoadon.idServer
cur.execute("""
    SELECT count(*)
    FROM ext_detailhoadon d
    JOIN ext_listhoadon h ON d."idServer" = h."idServer"
""")
print("d.idServer = h.idServer :", cur.fetchone()[0])

# Just how many details exist in the database without an ext_listhoadon link under the idhdonserver = idserver condition?
cur.execute("""
    SELECT count(*) 
    FROM ext_detailhoadon d
    LEFT JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
    WHERE h.id IS NULL
""")
print("Details with NO matching listhoadon (idServer = idhdonServer) :", cur.fetchone()[0])

# How many details exist?
cur.execute("SELECT count(*) FROM ext_detailhoadon")
print("Total details:", cur.fetchone()[0])
