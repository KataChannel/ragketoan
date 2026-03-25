import psycopg2

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'MM') as thang,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        h.shdon, h.loaihd, h.tthai, h.tgtcthue, h.tgtthue, h.tgtttbso,
        h."idServer"
    FROM ext_listhoadon h
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
""")
rows = cur.fetchall()

banra_c = 0
banra_t = 0
muavao_c = 0
muavao_t = 0

for row in rows:
    thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso, idServer = row
    if yyyy != '2023': continue
    # EXCLUSIONS
    exclusion_2023 = {
        ('2023-02', '129'), ('2023-02', '69'), ('2023-03', '187'), ('2023-03', '221'),
        ('2023-04', '456'), ('2023-04', '420'), ('2023-04', '451'), ('2023-05', '497'),
        ('2023-05', '531'), ('2023-06', '681'), ('2023-06', '627'), ('2023-07', '698'),
        ('2023-07', '758'), ('2023-08', '800'), ('2023-08', '786'), ('2023-08', '808'),
        ('2023-09', '988'), ('2023-09', '1010'), ('2023-09', '964'), ('2023-10', '1119'),
        ('2023-10', '1112'), ('2023-10', '1123'), ('2023-10', '1048'), ('2023-11', '1332'),
        ('2023-11', '1249'), ('2023-11', '1272'), ('2023-12', '1508'), ('2023-12', '1463'),
        ('2023-12', '1538')
    }
    if (yyyymm, shdon) in exclusion_2023: continue
    
    val_c = float(tgtcthue or 0)
    val_t = float(tgtttbso or 0)
    
    if loaihd == 'banra':
        banra_c += val_c
        banra_t += val_t
    elif loaihd == 'muavao':
        muavao_c += val_c
        muavao_t += val_t

print(f"Bán ra (chưa thuế): {banra_c:,.0f}")
print(f"Bán ra (có thuế):   {banra_t:,.0f}")
print(f"Mua vào (chưa thuế): {muavao_c:,.0f}")
print(f"Mua vào (có thuế):   {muavao_t:,.0f}")
