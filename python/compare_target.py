import pandas as pd
from sqlalchemy import create_engine

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"
engine = create_engine(DB_URI)

# Tổng tgtcthue (trước thuế) cho muavao 2023
q1 = f"""
SELECT SUM(h.tgtcthue) as truoc_thue, SUM(h.tgtthue) as tien_thue, SUM(h.tgtttbso) as tong_tt
FROM ext_listhoadon h
WHERE h."congtyId" = '{COMPANY_ID}' AND h.loaihd = 'muavao'
  AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01'
"""
r1 = pd.read_sql(q1, engine)
print("=== ext_listhoadon muavao 2023 ===")
print(f"  Trước thuế (tgtcthue): {r1['truoc_thue'].iloc[0]:,.0f}")
print(f"  Tiền thuế (tgtthue):   {r1['tien_thue'].iloc[0]:,.0f}")
print(f"  Tổng TT (tgtttbso):    {r1['tong_tt'].iloc[0]:,.0f}")

# Tổng thtien từ detail cho muavao 2023
q2 = f"""
SELECT SUM(d.thtien) as detail_thtien, COUNT(*) as cnt
FROM ext_detailhoadon d
JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
WHERE h."congtyId" = '{COMPANY_ID}' AND h.loaihd = 'muavao'
  AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01'
"""
r2 = pd.read_sql(q2, engine)
print(f"\n=== ext_detailhoadon muavao 2023 ===")
print(f"  Detail thtien: {r2['detail_thtien'].iloc[0]:,.0f}")
print(f"  Detail rows:   {r2['cnt'].iloc[0]}")

# So sánh
print(f"\n=== SO SÁNH ===")
print(f"  Mục tiêu:      14,910,791,883 - 15,640,942,868")
print(f"  tgtcthue:       {r1['truoc_thue'].iloc[0]:,.0f}")
print(f"  Chênh vs 15.6B: {r1['truoc_thue'].iloc[0] - 15_640_942_868:,.0f}")
print(f"  Chênh vs 14.9B: {r1['truoc_thue'].iloc[0] - 14_910_791_883:,.0f}")
