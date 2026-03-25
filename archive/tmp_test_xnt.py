import sys
sys.path.append('.')
import psycopg2
import re

def map_to_group(ten_hang):
    h = str(ten_hang or "").lower().strip()
    if not h: return "OTH-GEN"
    # TIER 12 SKIP
    if re.search(r'thu\s*ph[ií]|chuy[eể]n\s*ti[eề]n|lãi\s*suất|thu\s*lãi|phí\s*cd|ngoài?\s*h[eệ]', h): return "SKIP"
    if re.search(r'422924|608_\d|thanh\s*toán\s*lãi|phi\s*dich\s*vu', h): return "SKIP"
    if re.search(r'bánh|nước\s*yến|nước\s*ngọt|cá\s*viên|sữa|bia\b|ruou|rượu|thực\s*phẩm|tương\s*đen|phở|gạo|trà\b|cà\s*phê|coffee|đường\s*mía', h): return "SKIP"
    if re.search(r'sannest|nabati|richeese|coca|pepsi|nestle|vinamilk|kinh\s*đô', h): return "SKIP"
    if re.search(r'khăn\s*lụa|khóa\s*lưng|dây\s*lưng|giày\b|áo\b.*burberry|burberry|gucci|nhãn\s*dán', h): return "SKIP"
    if re.search(r'chiết\s*khấu|giảm\s*giá|hỗ\s*trợ\s*thêm|1\s*đổi\s*1|khuyến\s*mãi|hàng\s*khuyến', h): return "SKIP"
    if re.search(r'bảo\s*hiểm|bảo\s*lãnh|hợp\s*đồng\s*vay|tiền\s*gửi|tiền\s*vay', h): return "SKIP"
    if re.search(r'được\s*mua\s*bill|audio\s*giam|giá\s*sốc|tổng\s*cộng.*kg', h): return "SKIP"
    return "NOT_SKIP"

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') as yyyy,
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        h.shdon, h.loaihd, h.tthai,
        d.id, d.ten, d.thtien, h.tgtcthue
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5')
""")
rows = cur.fetchall()

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

nhap_tien = 0
xuat_tien = 0
for row in rows:
    yyyy, yyyymm, shdon, loaihd, tthai, detail_id, ten, thtien, tgtcthue = row
    if not yyyymm or yyyy != '2023': continue
    if (yyyymm, shdon) in exclusion_2023: continue
    
    if detail_id is None:
        thtien_val = float(tgtcthue or 0)
    else:
        thtien_val = abs(float(thtien or 0))
        
    grp_code = map_to_group(ten)
    if grp_code == "SKIP":
        continue
        
    if loaihd == 'muavao':
        nhap_tien += thtien_val
    elif loaihd == 'banra':
        xuat_tien += thtien_val

print(f"RAW nhap_tien: {nhap_tien:,.0f}")
print(f"RAW xuat_tien: {xuat_tien:,.0f}")
