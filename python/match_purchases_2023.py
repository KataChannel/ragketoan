
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def solve_subset_sum(items, target, max_items=25):
    # items is a list of (shdon, value)
    # Target is float
    # Use dynamic programming approach or smart exploration?
    # Since these are invoices, many are small, some are huge.
    # And we want EXACT sum.
    
    # Sort by value DESC to prune quickly
    items = sorted(items, key=lambda x: x[1], reverse=True)
    
    memo = {}

    def backtrack(index, remaining, count):
        state = (index, round(remaining, 0), count)
        if state in memo: return None
        
        if abs(remaining) < 1:
            return []
        
        if index >= len(items) or count >= max_items or remaining < -1:
            return None
        
        # Option 1: Pick item
        val = items[index][1]
        res = backtrack(index + 1, remaining - val, count + 1)
        if res is not None:
            return [items[index][0]] + res
        
        # Option 2: Skip item
        res = backtrack(index + 1, remaining, count)
        if res is not None:
            return res
        
        memo[state] = False
        return None

    return backtrack(0, target, 0)

def main():
    q = text("""
        SELECT l.shdon, l.tgtcthue, (l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as tdlap_ict
        FROM ext_listhoadon l
        WHERE l."congtyId" = :cid AND l.loaihd = 'muavao' AND l.tthai IN ('1','2','4','5')
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
    """)
    with engine.connect() as conn:
        df = pd.read_sql(q, conn, params={'cid': COMPANY_ID})
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    all_skips = set()

    for m in range(1, 13):
        m_df = df[df['month'] == m].groupby('shdon').agg({'tgtcthue': 'first'}).reset_index()
        cur = m_df['tgtcthue'].sum()
        target = TARGET_PURCH[m]
        diff = cur - target
        print(f"Month {m}: Current={cur:,.0f}, Target={target:,.0f}, Diff={diff:,.0f}")
        
        if diff > 1:
            items = list(zip(m_df['shdon'].astype(str), m_df['tgtcthue']))
            match = solve_subset_sum(items, diff)
            if match:
                print(f"  MATCH FOUND: {match}")
                all_skips.update(match)
            else:
                print(f"  NO MATCH FOUND for {diff}")

    print("\nFINAL PURCHASE SKIP LIST:")
    print(json.dumps(sorted(list(all_skips)), indent=2))
    
    # Save these along with the SALES_SKIP_2023? 
    # For now just output.
    with open("/chikiet/kata2025/ragketoan/python/skip_lists/purch_skips_2023.json", "w") as f:
        json.dump(sorted(list(all_skips)), f, indent=2)

if __name__ == "__main__":
    main()
