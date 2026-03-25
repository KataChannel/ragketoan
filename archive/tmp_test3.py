import psycopg2
import re

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
        d.id, d.ten, d.sluong, d.dgia, d.thtien, h."idServer"
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
""")
rows = cur.fetchall()

def is_skip(h):
    h = str(h or "").lower().strip()
    if not h: return False
    # Simplified TIER 12 logic for test
    if re.search(r'thu\s*ph[ií]|chuy[eể]n\s*ti[eề]n|lãi\s*suất|thu\s*lãi|phí\s*cd|ngoài?\s*h[eệ]', h): return True
    if re.search(r'422924|608_\d|thanh\s*toán\s*lãi|phi\s*dich\s*vu', h): return True
    if re.search(r'bánh|nước\s*yến|nước\s*ngọt|cá\s*viên|sữa|bia\b|ruou|rượu|thực\s*phẩm|tương\s*đen|phở|gạo|trà\b|cà\s*phê|coffee|đường\s*mía', h): return True
    if re.search(r'sannest|nabati|richeese|coca|pepsi|nestle|vinamilk|kinh\s*đô', h): return True
    if re.search(r'khăn\s*lụa|khóa\s*lưng|dây\s*lưng|giày\b|áo\b.*burberry|burberry|gucci|nhãn\s*dán', h): return True
    if re.search(r'chiết\s*khấu|giảm\s*giá|hỗ\s*trợ\s*thêm|1\s*đổi\s*1|khuyến\s*mãi|hàng\s*khuyến', h): return True
    if re.search(r'bảo\s*hiểm|bảo\s*lãnh|hợp\s*đồng\s*vay|tiền\s*gửi|tiền\s*vay', h): return True
    if re.search(r'được\s*mua\s*bill|audio\s*giam|giá\s*sốc|tổng\s*cộng.*kg', h): return True
    return False

valid_invoices = {}

for row in rows:
    thang, yyyymm, yyyy, shdon, loaihd, tthai, tgtcthue, tgtthue, tgtttbso, detail_id, ten, sluong, dgia, thtien, idServer = row
    if yyyy != '2023': continue
    
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
    
    if not is_skip(ten):
        if idServer not in valid_invoices:
            valid_invoices[idServer] = {
                "loaihd": loaihd,
                "tgtcthue": float(tgtcthue or 0),
                "tgtttbso": float(tgtttbso or 0)
            }

banra_ct = 0
muavao_ct = 0
for v in valid_invoices.values():
    if v["loaihd"] == 'banra':
        banra_ct += v["tgtcthue"]
    else:
        muavao_ct += v["tgtcthue"]

print(f"Bán ra (chưa thuế, no skip invoices): {banra_ct:,.0f}")
print(f"Mua vào (chưa thuế, no skip invoices): {muavao_ct:,.0f}")
