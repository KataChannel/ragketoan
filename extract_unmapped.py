import psycopg2
from build_xnt_final import map_to_group, groups

conn = psycopg2.connect("postgresql://root:password@localhost:5432/ketoan")
cur = conn.cursor()
query = """
    SELECT d.ten, COUNT(d.id), SUM(d.sluong), SUM(d.thtien)
    FROM ext_listhoadon h
    JOIN ext_detailhoadon d ON h."idServer" = d."idhdonServer"
    WHERE (h.nbmst='5900363291' OR h.nmmst='5900363291')
    AND EXTRACT(YEAR FROM h.tdlap) = 2023
    GROUP BY d.ten
    ORDER BY SUM(d.thtien) DESC
"""
cur.execute(query)
rows = cur.fetchall()

unmapped_items = []
mapped_groups_count = {g['code']: 0 for g in groups}

for ten, count, sluong, thtien in rows:
    grp = map_to_group(ten)
    mapped_groups_count[grp['code']] += count
    if 'khác' in grp['name'].lower() or 'chưa phân loại' in grp['name'].lower():
        unmapped_items.append({
            "ten": ten,
            "count": count,
            "tien": thtien or 0
        })

print(f"Tổng số mặt hàng (unique names) bị rơi vào 'Khác': {len(unmapped_items)}")
print("\nTop 40 Mặt hàng 'Khác' có giá trị cao nhất:")
for item in unmapped_items[:40]:
    print(f"- {item['ten']} | Số dòng: {item['count']} | Tổng tiền: {item['tien']:,.0f}")

empty_groups = [g for g in groups if mapped_groups_count[g['code']] == 0]
print(f"\nSố nhóm 0 phát sinh: {len(empty_groups)}")
