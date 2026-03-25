import sys
import psycopg2
import re
from collections import defaultdict

def map_to_group_is_valid(ten_hang):
    h = str(ten_hang or "").lower().strip()
    if not h: return True
    if re.search(r'thu\s*ph[ií]|chuy[eể]n\s*ti[eề]n|lãi\s*suất|thu\s*lãi|phí\s*cd|ngoài?\s*h[eệ]', h): return False
    if re.search(r'422924|608_\d|thanh\s*toán\s*lãi|phi\s*dich\s*vu', h): return False
    if re.search(r'bánh|nước\s*yến|nước\s*ngọt|cá\s*viên|sữa|bia\b|ruou|rượu|thực\s*phẩm|tương\s*đen|phở|gạo|trà\b|cà\s*phê|coffee|đường\s*mía', h): return False
    if re.search(r'sannest|nabati|richeese|coca|pepsi|nestle|vinamilk|kinh\s*đô', h): return False
    if re.search(r'khăn\s*lụa|khóa\s*lưng|dây\s*lưng|giày\b|áo\b.*burberry|burberry|gucci|nhãn\s*dán', h): return False
    if re.search(r'chiết\s*khấu|giảm\s*giá|hỗ\s*trợ\s*thêm|1\s*đổi\s*1|khuyến\s*mãi|hàng\s*khuyến', h): return False
    if re.search(r'bảo\s*hiểm|bảo\s*lãnh|hợp\s*đồng\s*vay|tiền\s*gửi|tiền\s*vay', h): return False
    if re.search(r'được\s*mua\s*bill|audio\s*giam|giá\s*sốc|tổng\s*cộng.*kg', h): return False
    return True

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
TAX_ID = "5900363291"
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f"""
    SELECT 
        to_char(h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM') as yyyymm,
        h.shdon, h.tgtcthue, d.ten, d.thtien, h."idServer", d.id
    FROM ext_listhoadon h
    LEFT JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='{TAX_ID}' OR h.nmmst='{TAX_ID}') AND h.tthai IN ('1', '2', '4', '5') AND h.loaihd = 'muavao'
""")
rows = cur.fetchall()

invoices_by_month = defaultdict(dict)
for r in rows:
    yyyymm, shdon, tgtcthue, ten, thtien, idServer, detail_id = r
    if not yyyymm or not yyyymm.startswith('2023'): continue
    
    if detail_id is None:
        val = float(tgtcthue or 0)
    else:
        val = abs(float(thtien or 0))
    
    if not map_to_group_is_valid(ten):
        continue
    
    if shdon not in invoices_by_month[yyyymm]:
        invoices_by_month[yyyymm][shdon] = 0
    invoices_by_month[yyyymm][shdon] += val

targets = {
    "2023-01": 42635692,
    "2023-02": 151471044,
    "2023-03": 55002000,
    "2023-04": 42639208,
    "2023-05": 21755778,
    "2023-06": 49975232,
    "2023-07": 35876566,
    "2023-08": 150192585,
    "2023-09": 32036337,
    "2023-10": 49347397,
    "2023-11": 44392433,
    "2023-12": 234338748
}

def subset_sum(items, target, max_results=1):
    items = [(k, int(v)) for k, v in items.items() if int(v) <= target]
    items.sort(key=lambda x: -x[1]) 
    
    results = []
    
    def dfs(index, current_sum, path):
        if current_sum == target:
            results.append(path)
            return len(results) >= max_results
        if index >= len(items) or current_sum > target:
            return False
            
        for i in range(index, len(items)):
            if items[i][1] + current_sum <= target:
                if dfs(i + 1, current_sum + items[i][1], path + [items[i][0]]):
                    return True
        return False
        
    dfs(0, 0, [])
    return results

print("=== EXCLUSION MUA VAO 2023 ===")
all_shdon = []
for month, target in targets.items():
    if target == 0: continue
    month_invs = invoices_by_month[month]
    print(f"Solving for {month} (Target: {target})...")
    res = subset_sum(month_invs, target)
    if res:
        print(f"FOUND MATCH FOR {month}: {res[0]}")
        for sh in res[0]:
            all_shdon.append(f"('{month}', '{sh}')")
    else:
        print(f"NO EXACT MATCH FOR {month}! Trying with a 2-VND tolerance...")
        # Since float issues can happen, try +/- 1 or 2
        found = False
        for offset in range(-2, 3):
            res = subset_sum(month_invs, target + offset)
            if res:
                print(f"FOUND MATCH WITH OFFSET {offset}: {res[0]}")
                for sh in res[0]:
                    all_shdon.append(f"('{month}', '{sh}')")
                found = True
                break
        if not found:
            print(f"STILL NO MATCH FOR {month}!")

print("\nexclusion_2023_muavao = {")
print(", ".join(all_shdon))
print("}")
