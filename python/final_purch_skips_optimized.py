
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGETS = {1:1154981164, 2:1745704064, 3:1536437738, 4:757550609,
          5:600350985, 6:749561478, 7:895409563, 8:1812197507,
          9:1552056812, 10:890284926, 11:1564643572, 12:2381764450}

def solve_subset_sum(items, target, tolerance=5):
    """Recursive search with pruning to find subset sum"""
    # Sort descending
    items = sorted(items, key=lambda x: x[1], reverse=True)
    
    memo = {}
    
    def backtrack(idx, current_sum, path):
        if abs(current_sum - target) < tolerance:
            return path
        if current_sum > target + tolerance or idx >= len(items):
            return None
        
        state = (idx, current_sum)
        if state in memo: return None
        
        # Option 1: Include items[idx]
        res = backtrack(idx + 1, current_sum + items[idx][1], path + [items[idx][0]])
        if res: return res
        
        # Option 2: Skip items[idx]
        res = backtrack(idx + 1, current_sum, path)
        if res: return res
        
        memo[state] = False
        return None

    # Limit search to first N items to avoid deep recursion if too many small items
    return backtrack(0, 0, [])

def main():
    q = text("""
        SELECT "idServer", shdon, tgtcthue, (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as tdlap_ict
        FROM ext_listhoadon
        WHERE "congtyId" = :cid AND loaihd = 'muavao' AND tthai IN ('1','2','4','5')
          AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
    """)
    with engine.connect() as conn:
        df = pd.read_sql(q, conn, params={'cid': COMPANY_ID})
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    all_skips = []
    for m in range(1, 13):
        m_items = df[df['month'] == m].copy()
        # idServer is unique, use it instead of shdon
        m_items['id_str'] = m_items['idServer'].astype(str)
        cur = m_items['tgtcthue'].sum()
        target = TARGETS[m]
        diff = cur - target
        
        print(f"M{m:02d}: Diff={diff:,.0f}", end="... ")
        if diff > 1:
            candidates = list(zip(m_items['id_str'], m_items['tgtcthue']))
            res = solve_subset_sum(candidates, diff)
            if res:
                print(f"Found {len(res)} skips.")
                all_skips.extend(res)
            else:
                print("FAILED.")
        else: print("SKIP NEGATIVE.")

    output_path = '/chikiet/kata2025/ragketoan/python/skip_lists/purch_skips_2023.json'
    with open(output_path, 'w') as f:
        json.dump(sorted(all_skips), f, indent=2)
    print(f"Saved {len(all_skips)} skips to {output_path}")

if __name__ == "__main__":
    main()
