"""Tìm tên sản phẩm dịch vụ trong detail - phục vụ cải thiện bộ lọc"""
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
CID = "db88c924-206b-4544-9256-c1cd79d417e4"
engine = create_engine(DB_URI)

# Lấy tất cả detail muavao 2023 (valid status, ICT timezone)
q = text("""
SELECT d.ten, d.thtien, h.shdon,
  EXTRACT(MONTH FROM h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as month
FROM ext_detailhoadon d
JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
WHERE h."congtyId" = :cid AND h.loaihd='muavao'
  AND h.tthai IN ('1','2','4','5')
  AND (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= '2023-01-01'
  AND (h.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < '2024-01-01'
""")
with engine.connect() as conn:
    df = pd.read_sql(q, conn, params={'cid': CID})

# Tổng theo tên sản phẩm, sắp xếp, tìm dịch vụ
total_by_name = df.groupby('ten')['thtien'].sum().sort_values(ascending=False)
print("TOP 50 sản phẩm theo giá trị:")
for name, val in total_by_name.head(50).items():
    print(f"  {val:>16,.0f} | {name[:80]}")

print(f"\nTỔNG ALL: {df['thtien'].sum():,.0f}")
print(f"TARGET:   15,640,942,868")
print(f"CHÊNH:    {df['thtien'].sum() - 15640942868:,.0f}")
