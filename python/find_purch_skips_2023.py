
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text
import itertools

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def solve_subset_sum(items, target):
    # Pre-filter
    cand = [x for x in items if x[1] <= target + 1]
    
    # Try combinations of 1 to 10 items
    for r in range(1, min(len(cand), 10) + 1):
        for combo in itertools.combinations(cand, r):
            if abs(sum(v for k,v in combo) - target) < 1:
                return [k for k,v in combo]
    return None

def main():
    q = text("""
        SELECT l.shdon, l.tgtcthue, (l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as tdlap_ict, d.ten
        FROM ext_listhoadon l
        JOIN ext_detailhoadon d ON l."idServer" = d."idhdonServer"
        WHERE l."congtyId" = :cid AND l.loaihd = 'muavao' AND l.tthai IN ('1','2','4','5')
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
    """)
    with engine.connect() as conn:
        df = pd.read_sql(q, conn, params={'cid': COMPANY_ID})
    
    # Exclude keywords already filtered in generate script
    keywords = ['phí', 'lãi', 'vay', 'huy động', 'bảo hiểm', 'cước', 'quảng cáo', 'tiền điện', 'tiền nước', 'vận chuyển', 'thuê', 'sửa chữa', 'mặt bằng', 'triển khai']
    df['is_svc'] = df['ten'].str.lower().apply(lambda x: any(k in str(x).lower() for k in keywords))
    
    # We want to find the skips among the NON-SERVICE items that are still excess?
    # No, we want to find THE ENTIRE SKIP LIST for Purchase.
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    all_skips = set()
    
    for m in range(1, 13):
        m_df = df[df['month'] == m].copy()
        # Group by SH (important: sum of details if multiple rows for same SH)
        m_inv = m_df.groupby('shdon').agg({
            'tgtcthue': 'first', # tgtcthue is the invoice level tax total? No, tgtcthue in list is total before tax.
            'ten': lambda x: ' | '.join(x.astype(str))
        }).reset_index()
        
        current = m_inv['tgtcthue'].sum()
        target = TARGET_PURCH[m]
        diff = current - target
        
        print(f"Month {m}: Current={current:,.0f}, Target={target:,.0f}, Diff={diff:,.0f}")
        
        if diff > 1:
            # Look for subset that equals diff among ALL items
            items = list(zip(m_inv['shdon'].astype(str), m_inv['tgtcthue']))
            res = solve_subset_sum(items, diff)
            if res:
                print(f"  FOUND: {res}")
                all_skips.update(res)
            else:
                print(f"  NO MATCH FOUND for {diff}")

    print("\nFINAL PURCHASE SKIP LIST:")
    print(json.dumps(sorted(list(all_skips)), indent=2))

if __name__ == "__main__":
    main()
