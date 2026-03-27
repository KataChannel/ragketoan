"""Tìm các HĐ muavao dịch vụ cần loại bỏ - so sánh theo tháng"""
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
CID = "db88c924-206b-4544-9256-c1cd79d417e4"
engine = create_engine(DB_URI)

target = {1:1154981164, 2:1745704064, 3:1536437738, 4:757550609,
          5:600350985, 6:749561478, 7:895409563, 8:1812197507,
          9:1552056812, 10:890284926, 11:1564643572, 12:2381764450}

q = text("""
SELECT "idServer", shdon,
  tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
  tgtcthue, tgtttbso
FROM ext_listhoadon
WHERE "congtyId" = :cid AND loaihd='muavao'
  AND tthai IN ('1','2','4','5')
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= '2023-01-01'
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < '2024-01-01'
ORDER BY tdlap
""")
with engine.connect() as conn:
    df = pd.read_sql(q, conn, params={'cid': CID})
df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month

for m in range(1, 13):
    dm = df[df['month'] == m]
    db_total = dm['tgtcthue'].sum()
    tgt = target[m]
    diff = db_total - tgt
    if abs(diff) < 1:
        continue
    print(f"\n=== T{m:02d}: DB={db_total:,.0f} Target={tgt:,.0f} Chênh={diff:,.0f} ===")
    # Tìm subset HĐ có tổng = diff
    # Sắp xếp theo giá trị nhỏ → lớn, thử tìm HĐ khớp
    candidates = dm.sort_values('tgtcthue')
    # In ra các HĐ nhỏ có thể là dịch vụ
    small = candidates[candidates['tgtcthue'] <= diff * 1.1]
    if len(small) > 0:
        for _, r in small.iterrows():
            print(f"  SHĐ={r['shdon']:>8} | {r['tgtcthue']:>14,.0f}")
        print(f"  Sum small: {small['tgtcthue'].sum():,.0f}")
