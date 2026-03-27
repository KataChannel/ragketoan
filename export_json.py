import psycopg2
import json
from collections import defaultdict
import os

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
HUY_VU_MST = "5900363291"
OUTPUT_FILE = "/chikiet/kata2025/ragketoan/public/data.json"
os.makedirs("/chikiet/kata2025/ragketoan/public", exist_ok=True)

import os

print("Exporting data for web dashboard...")
conn = psycopg2.connect(DB_URL)
cur = conn.cursor()
cur.execute(f'SELECT nam, thang, "tenHang", "soLuongNhap", "soLuongXuat", "giaTriNhap", "giaTriXuat" FROM ext_tonghop WHERE "congtyMst" = \'{HUY_VU_MST}\'')
raw_data = cur.fetchall()
conn.close()

# Group by month for chart
# data[year][month] = { n_val: ..., x_val: ... }
chart_records = defaultdict(lambda: defaultdict(lambda: {"n": 0, "x": 0}))
for y, m, ten, n_q, x_q, n_v, x_v in raw_data:
    chart_records[y][m]["n"] += float(n_v or 0)
    chart_records[y][m]["x"] += float(x_v or 0)

with open(OUTPUT_FILE, "w") as f:
    json.dump(chart_records, f)

print(f"Exported: {OUTPUT_FILE}")
