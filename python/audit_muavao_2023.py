"""
Audit toàn bộ hóa đơn mua vào 2023 - Công ty Huy Vũ
Mục tiêu: Xác minh tổng = 15,640,942,868
"""
import pandas as pd
from sqlalchemy import create_engine

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"
TARGET = 15_640_942_868
engine = create_engine(DB_URI)

print("=" * 70)
print("AUDIT TOÀN BỘ HÓA ĐƠN MUA VÀO 2023 - HUY VŨ")
print("=" * 70)

# 1. Tổng quan ext_listhoadon
q1 = f"""
SELECT tthai, COUNT(*) as cnt,
  SUM(tgtcthue) as truoc_thue,
  SUM(tgtthue) as tien_thue, 
  SUM(tgtttbso) as tong_tt
FROM ext_listhoadon
WHERE "congtyId" = '{COMPANY_ID}' AND loaihd = 'muavao'
  AND tdlap >= '2023-01-01' AND tdlap < '2024-01-01'
GROUP BY tthai ORDER BY tthai
"""
df1 = pd.read_sql(q1, engine)
print("\n[1] TỔNG QUAN ext_listhoadon theo tthai:")
for _, r in df1.iterrows():
    print(f"  tthai={r['tthai']}: {r['cnt']} HĐ | "
          f"trước thuế={r['truoc_thue']:>18,.0f} | "
          f"thuế={r['tien_thue']:>14,.0f} | "
          f"tổng TT={r['tong_tt']:>18,.0f}")
print(f"  TỔNG ALL:        | trước thuế={df1['truoc_thue'].sum():>18,.0f} | "
      f"tổng TT={df1['tong_tt'].sum():>18,.0f}")

# 2. Thử các cách tính để khớp TARGET
print(f"\n[2] THỬ CÁC CÁCH TÍNH ĐỂ KHỚP {TARGET:,.0f}:")
tthai1 = df1[df1['tthai']==1]
tthai5 = df1[df1['tthai']==5]
tthai6 = df1[df1['tthai']==6]
v1 = tthai1['truoc_thue'].sum() if len(tthai1) else 0
v5 = tthai5['truoc_thue'].sum() if len(tthai5) else 0
v6 = tthai6['truoc_thue'].sum() if len(tthai6) else 0
t1 = tthai1['tong_tt'].sum() if len(tthai1) else 0
t5 = tthai5['tong_tt'].sum() if len(tthai5) else 0
t6 = tthai6['tong_tt'].sum() if len(tthai6) else 0

combos = [
    ("tthai=1 tgtcthue", v1),
    ("tthai=1 tgtttbso", t1),
    ("tthai=1 tgtcthue - tthai=6", v1 - v6),
    ("tthai=1 tgtttbso - tthai=6", t1 - t6),
    ("tthai=1 tgtcthue + tthai=5 - tthai=6", v1 + v5 - v6),
    ("tthai=1 tgtttbso + tthai=5 - tthai=6", t1 + t5 - t6),
    ("ALL tgtcthue", df1['truoc_thue'].sum()),
    ("ALL tgtttbso", df1['tong_tt'].sum()),
]
for label, val in combos:
    diff = val - TARGET
    mark = " ✅ KHỚP!" if abs(diff) < 1000 else ""
    print(f"  {label:45s} = {val:>18,.0f} | chênh = {diff:>14,.0f}{mark}")

# 3. Kiểm tra detail
print(f"\n[3] TỔNG ext_detailhoadon theo tthai:")
q3 = f"""
SELECT h.tthai, COUNT(d.*) as cnt, SUM(d.thtien) as sum_thtien
FROM ext_detailhoadon d
JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
WHERE h."congtyId" = '{COMPANY_ID}' AND h.loaihd = 'muavao'
  AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01'
GROUP BY h.tthai ORDER BY h.tthai
"""
df3 = pd.read_sql(q3, engine)
for _, r in df3.iterrows():
    print(f"  tthai={r['tthai']}: {r['cnt']} dòng | thtien={r['sum_thtien']:>18,.0f}")
print(f"  TỔNG detail:                    | thtien={df3['sum_thtien'].sum():>18,.0f}")

# Detail combos
d1 = df3[df3['tthai']==1]['sum_thtien'].sum() if len(df3[df3['tthai']==1]) else 0
d5 = df3[df3['tthai']==5]['sum_thtien'].sum() if len(df3[df3['tthai']==5]) else 0
d6 = df3[df3['tthai']==6]['sum_thtien'].sum() if len(df3[df3['tthai']==6]) else 0
print(f"\n  Detail tthai=1:                  {d1:>18,.0f} | chênh vs target = {d1-TARGET:>14,.0f}")
print(f"  Detail tthai=1 - tthai=6:        {d1-d6:>18,.0f} | chênh vs target = {d1-d6-TARGET:>14,.0f}")

# 4. So sánh list vs detail cho tthai=1
print(f"\n[4] SO SÁNH list.tgtcthue vs SUM(detail.thtien) cho tthai=1:")
q4 = f"""
SELECT h."idServer", h.shdon, h.tdlap, h.tgtcthue, h.tgtttbso,
  COALESCE((SELECT SUM(d.thtien) FROM ext_detailhoadon d WHERE d."idhdonServer" = h."idServer"), 0) as detail_sum
FROM ext_listhoadon h
WHERE h."congtyId" = '{COMPANY_ID}' AND h.loaihd = 'muavao'
  AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01' AND h.tthai = '1'
ORDER BY h.tdlap
"""
df4 = pd.read_sql(q4, engine)
df4['diff'] = df4['tgtcthue'] - df4['detail_sum']
mismatched = df4[abs(df4['diff']) > 1]
print(f"  Tổng HĐ tthai=1: {len(df4)}")
print(f"  HĐ có chênh lệch list vs detail: {len(mismatched)}")
print(f"  Tổng list.tgtcthue:  {df4['tgtcthue'].sum():>18,.0f}")
print(f"  Tổng detail.thtien:  {df4['detail_sum'].sum():>18,.0f}")
print(f"  Chênh lệch:          {df4['tgtcthue'].sum() - df4['detail_sum'].sum():>18,.0f}")
if len(mismatched) > 0 and len(mismatched) <= 20:
    print(f"\n  Chi tiết HĐ chênh lệch:")
    for _, r in mismatched.head(10).iterrows():
        print(f"    SHĐ={r['shdon']}, ngày={r['tdlap']}, "
              f"list={r['tgtcthue']:,.0f}, detail={r['detail_sum']:,.0f}, diff={r['diff']:,.0f}")

# 5. Kiểm tra HĐ trùng
print(f"\n[5] KIỂM TRA HĐ TRÙNG:")
q5 = f"""
SELECT shdon, tdlap, COUNT(*) as cnt
FROM ext_listhoadon
WHERE "congtyId" = '{COMPANY_ID}' AND loaihd = 'muavao'
  AND tdlap >= '2023-01-01' AND tdlap < '2024-01-01' AND tthai = '1'
GROUP BY shdon, tdlap HAVING COUNT(*) > 1
ORDER BY cnt DESC LIMIT 10
"""
df5 = pd.read_sql(q5, engine)
print(f"  Số cặp trùng shdon+tdlap: {len(df5)}")
if len(df5) > 0:
    for _, r in df5.iterrows():
        print(f"    SHĐ={r['shdon']}, ngày={r['tdlap']}, lần={r['cnt']}")

# 6. Theo tháng
print(f"\n[6] PHÂN BỔ THEO THÁNG (tthai=1, tgtcthue):")
q6 = f"""
SELECT EXTRACT(MONTH FROM tdlap) as thang, COUNT(*) as cnt, SUM(tgtcthue) as truoc_thue
FROM ext_listhoadon
WHERE "congtyId" = '{COMPANY_ID}' AND loaihd = 'muavao'
  AND tdlap >= '2023-01-01' AND tdlap < '2024-01-01' AND tthai = '1'
GROUP BY 1 ORDER BY 1
"""
df6 = pd.read_sql(q6, engine)
for _, r in df6.iterrows():
    print(f"  T{int(r['thang']):02d}: {r['cnt']:>4} HĐ | {r['truoc_thue']:>16,.0f}")
print(f"  TỔNG: {df6['cnt'].sum():>4} HĐ | {df6['truoc_thue'].sum():>16,.0f}")
print(f"  TARGET:              {TARGET:>16,.0f}")
print(f"  CHÊNH:               {df6['truoc_thue'].sum()-TARGET:>16,.0f}")

print("\n" + "=" * 70)
print("KẾT LUẬN")
print("=" * 70)
best = min(combos, key=lambda x: abs(x[1] - TARGET))
print(f"  Công thức gần nhất: {best[0]}")
print(f"  Giá trị:            {best[1]:,.0f}")
print(f"  Chênh vs mục tiêu:  {best[1]-TARGET:,.0f}")
