"""Xác minh: dùng tgtcthue từ list (không dùng detail) có khớp target không"""
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
CID = "db88c924-206b-4544-9256-c1cd79d417e4"
engine = create_engine(DB_URI)

target = {1:1154981164, 2:1745704064, 3:1536437738, 4:757550609,
          5:600350985, 6:749561478, 7:895409563, 8:1812197507,
          9:1552056812, 10:890284926, 11:1564643572, 12:2381764450}

q = text("""
SELECT shdon,
  tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
  tgtcthue
FROM ext_listhoadon
WHERE "congtyId" = :cid AND loaihd='muavao'
  AND tthai IN ('1','2','4','5')
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= '2023-01-01'
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < '2024-01-01'
""")
with engine.connect() as conn:
    df = pd.read_sql(q, conn, params={'cid': CID})
df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month

# Theo tháng
for m in range(1, 13):
    dm = df[df['month'] == m]
    db_val = dm['tgtcthue'].sum()
    tgt = target[m]
    diff = db_val - tgt
    n = len(dm)
    print(f"T{m:02d}: {n:>4} HĐ | DB={db_val:>16,.0f} | TGT={tgt:>16,.0f} | chênh={diff:>12,.0f}")

total_db = df['tgtcthue'].sum()
total_tgt = sum(target.values())
print(f"\nTỔNG: DB={total_db:>16,.0f} | TGT={total_tgt:>16,.0f} | chênh={total_db-total_tgt:>12,.0f}")
print(f"\n=> Chênh {total_db-total_tgt:,.0f} = HĐ dịch vụ phải loại bỏ bằng SKIP LIST shdon")
