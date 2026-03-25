import sys
import psycopg2

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        h.loaihd, h.tthai, d.thtien, h.tgtcthue, h."idServer", d.id
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
""")
rows = cur.fetchall()

seen = set()
sum_tgtcthue = 0
sum_thtien = 0

for r in rows:
    yyyy, loaihd, tthai, thtien, tgtcthue, idServer, detail_id = r
    if yyyy != '2023': continue
    if loaihd == 'muavao':
        if idServer not in seen:
            seen.add(idServer)
            sum_tgtcthue += float(tgtcthue or 0)
        
        if detail_id is None:
            sum_thtien += float(tgtcthue or 0)
        else:
            sum_thtien += abs(float(thtien or 0))

print(f"Total Mua vào tgtcthue: {sum_tgtcthue:,.0f}")
print(f"Total Mua vào thtien: {sum_thtien:,.0f}")
