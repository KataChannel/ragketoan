"""
So sánh tổng theo tháng: DB hiện tại vs BAO_CAO_GIAI_TRINH
Logic: ICT timezone + tthai IN (1,2,4,5) + loại HĐ dịch vụ
"""
import pandas as pd
from sqlalchemy import create_engine

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"
engine = create_engine(DB_URI)

# Tổng theo tháng với ICT timezone, tthai IN (1,2,4,5)
q = f"""
SELECT 
  EXTRACT(MONTH FROM tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as thang,
  COUNT(*) as cnt,
  SUM(tgtcthue) as truoc_thue
FROM ext_listhoadon
WHERE "congtyId" = '{COMPANY_ID}' AND loaihd = 'muavao'
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= '2023-01-01'
  AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < '2024-01-01'
  AND tthai IN ('1','2','4','5')
GROUP BY 1 ORDER BY 1
"""
df = pd.read_sql(q, engine)

# Mục tiêu từ báo cáo giải trình
target = {
    1: 1154981164, 2: 1745704064, 3: 1536437738,
    4: 757550609,  5: 600350985,  6: 749561478,
    7: 895409563,  8: 1812197507, 9: 1552056812,
    10: 890284926, 11: 1564643572, 12: 2381764450
}

print(f"{'Tháng':>6} | {'DB (ICT+status)':>18} | {'Mục tiêu':>18} | {'Chênh lệch':>14}")
print("-" * 70)
total_db = 0
total_tgt = 0
for _, r in df.iterrows():
    m = int(r['thang'])
    db_val = r['truoc_thue']
    tgt_val = target.get(m, 0)
    diff = db_val - tgt_val
    total_db += db_val
    total_tgt += tgt_val
    print(f"  T{m:02d}  | {db_val:>18,.0f} | {tgt_val:>18,.0f} | {diff:>14,.0f}")
print("-" * 70)
print(f" TỔNG  | {total_db:>18,.0f} | {total_tgt:>18,.0f} | {total_db-total_tgt:>14,.0f}")
print(f"\nChênh lệch = {total_db - total_tgt:,.0f} VNĐ")
print("=> Phần chênh = HĐ dịch vụ/bank/bảo hiểm cần loại bỏ")
