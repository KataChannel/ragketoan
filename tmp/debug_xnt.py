import subprocess
import csv
import io
import re
import pandas as pd
import os

def run_query(sql):
    result = subprocess.run(
        ["psql", "-h", "localhost", "-U", "root", "-d", "ketoan", "--csv", "-c", sql],
        env={"PGPASSWORD": "password"},
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return pd.DataFrame()
    return pd.read_csv(io.StringIO(result.stdout))

mst_huyvu = '5900363291'
sql = f"""
SELECT d.ten as "tenHang", d.sluong as sl, d.thtien, l.nbmst, l.nmmst
FROM ext_detailhoadon d
JOIN ext_listhoadon l ON d."idhdonServer" = l."idServer"
WHERE (l.nbmst = '{mst_huyvu}' OR l.nmmst = '{mst_huyvu}')
  AND l.tdlap >= '2023-01-01' AND l.tdlap < '2024-01-01'
  AND l.tthai = '1';
"""

df = run_query(sql)
print(f"Total rows fetched: {len(df)}")
df["nmmst"] = df["nmmst"].astype(str).str.strip()
df["nbmst"] = df["nbmst"].astype(str).str.strip()

nhap_raw = df[df["nmmst"] == mst_huyvu]
xuat_raw = df[df["nbmst"] == mst_huyvu]

print(f"NHAP rows (nmmst==Huyvu): {len(nhap_raw)}")
print(f"XUAT rows (nbmst==Huyvu): {len(xuat_raw)}")

if len(nhap_raw) == 0 and len(xuat_raw) > 0:
    print("WARNING: NHAP is empty. Check nmmst values.")
    print("Unique nmmst samples:", df["nmmst"].unique()[:10])
    print("Unique nbmst samples:", df["nbmst"].unique()[:10])
