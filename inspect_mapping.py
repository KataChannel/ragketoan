import psycopg2
import pandas as pd

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
"""
cur.execute(query)
rows = cur.fetchall()

group_counts = {g['code']: {"name": g['name'], "count": 0, "sum_tien": 0} for g in groups}

for ten, count, sluong, thtien in rows:
    grp = map_to_group(ten)
    grp_code = grp['code']
    if grp_code in group_counts:
        group_counts[grp_code]["count"] += count
        group_counts[grp_code]["sum_tien"] += thtien or 0

sorted_groups = sorted(group_counts.values(), key=lambda x: x["count"], reverse=True)

empty_groups = [g for g in sorted_groups if g["count"] == 0]
mapped_groups = [g for g in sorted_groups if g["count"] > 0]

print(f"Tổng số nhóm: {len(groups)}")
print(f"Số nhóm KHÔNG CÓ dòng nào được map (0 data): {len(empty_groups)}")
print(f"Số nhóm CÓ data: {len(mapped_groups)}")
print("\nTop 10 nhóm được map nhiều nhất:")
for g in sorted_groups[:10]:
    print(f"- {g['name']}: {g['count']} dòng, tổng tiền: {g['sum_tien']:,.0f}")

Khac_groups = [g for g in sorted_groups if "khác" in g["name"].lower() or "chưa phân loại" in g["name"].lower()]
print("\nCác nhóm 'Khác' / 'Chưa phân loại':")
for g in Khac_groups:
    print(f"- {g['name']}: {g['count']} dòng, tổng tiền: {g['sum_tien']:,.0f}")
