
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text
import itertools

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def solve_subset_sum(items, target, max_r=7):
    # items: list of (id, val)
    cand = [x for x in items if x[1] <= target + 1]
    for r in range(1, max_r + 1):
        for combo in itertools.combinations(cand, r):
            if abs(sum(v for k,v in combo) - target) < 1:
                return [k for k,v in combo]
    return None

def main():
    q_list = text("SELECT \"idServer\", shdon FROM ext_listhoadon WHERE \"congtyId\" = :cid AND tthai IN ('1','2','4','5') AND loaihd = 'muavao' AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01' AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01' ")
    q_detail = text("SELECT \"idhdonServer\", thtien, ten FROM ext_detailhoadon WHERE \"idhdonServer\" IN (SELECT \"idServer\" FROM ext_listhoadon WHERE \"congtyId\" = :cid AND tthai IN ('1','2','4','5') AND loaihd='muavao') ")
    
    with engine.connect() as conn:
        df_l = pd.read_sql(q_list, conn, params={'cid': COMPANY_ID})
        df_d = pd.read_sql(q_detail, conn, params={'cid': COMPANY_ID})
        q_times = text("SELECT \"idServer\", (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as ict FROM ext_listhoadon WHERE \"idServer\" IN :ids")
        df_t = pd.read_sql(q_times, conn, params={'ids': tuple(df_l['idServer'].tolist())})

    df = df_l.merge(df_t, on='idServer').merge(df_d.groupby('idhdonServer')['thtien'].sum().reset_index(), left_on='idServer', right_on='idhdonServer')
    df['month'] = pd.to_datetime(df['ict']).dt.month
    
    # Pre-merge detail 'ten' for keywords
    sh_ten = df_d.groupby('idhdonServer')['ten'].apply(lambda x: ' | '.join(x.astype(str))).reset_index()
    df = df.merge(sh_ten, on='idhdonServer')

    kw = ['phí', 'lãi', 'vay', 'huy động', 'bảo hiểm', 'cước', 'quảng cáo', 'tiền điện', 'tiền nước', 'vận chuyển', 'thuê', 'sửa chữa', 'mặt bằng', 'triển khai', 'banking']
    df['is_svc'] = df['ten'].str.lower().apply(lambda x: any(k in x for k in kw))
    
    final_skips = set()
    for m in range(1, 13):
        m_df = df[df['month'] == m]
        cur = m_df['thtien'].sum()
        target = TARGET_PURCH[m]
        diff = cur - target
        
        # Step 1: Skip all known services
        svc_sh = m_df[m_df['is_svc']]['shdon'].astype(str).tolist()
        svc_val = m_df[m_df['is_svc']]['thtien'].sum()
        
        rem_diff = diff - svc_val
        print(f"Month {m}: Total diff={diff:,.0f}, Service skip val={svc_val:,.0f}, Rem diff={rem_diff:,.0f}")
        
        final_skips.update(svc_sh)
        
        if abs(rem_diff) > 1:
            # Match the remainder among non-service items
            non_svc = m_df[~m_df['is_svc']]
            items = list(zip(non_svc['shdon'].astype(str), non_svc['thtien']))
            res = solve_subset_sum(items, rem_diff)
            if res:
                print(f"  FOUND rem: {res}")
                final_skips.update(res)
            else:
                # If not found in non-svc, maybe some "service" items are actually goods or vice-versa?
                # Just try ALL items for rem_diff
                items = list(zip(m_df['shdon'].astype(str), m_df['thtien']))
                # But we already added svc_sh, so this logic is a bit confused.
                # Let's just solve for THE ENTIRE DIFF from scratch for that month.
                print(f"  Trying full diff matching for month {m}...")
                res = solve_subset_sum(list(zip(m_df['shdon'].astype(str), m_df['thtien'])), diff)
                if res:
                    print(f"  FOUND full match: {res}")
                    # Clear svc_sh and use this match instead
                    for s in svc_sh: final_skips.discard(s)
                    final_skips.update(res)
                else: print(f"  STILL NO MATCH for month {m}")

    print("\nFINAL SKIP LIST 2023:")
    data = sorted(list(final_skips))
    print(json.dumps(data, indent=2))

if __name__ == "__main__":
    main()
