
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text
import itertools

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def solve_month(m, df_all, target):
    df_m = df_all[df_all['month'] == m].copy()
    
    # Pre-filter common skips using keywords if possible (requires fetching detail ten)
    # But for now, let's just use the current tgtcthue sum.
    current_sum = df_m['tgtcthue'].sum()
    diff = current_sum - target
    print(f"Month {m}: Total Sum={current_sum:,.0f}, Target={target:,.0f}, Diff={diff:,.0f}")
    
    if abs(diff) < 1: return []
    
    # Subset matching
    items = list(df_m.itertuples(index=False))
    
    # Use a greedy + backtrack for large diffs
    # Sort items close to the diff or small bank amounts
    pool = sorted(items, key=lambda x: abs(x.tgtcthue), reverse=True)
    
    # If r is large, we can't use itertools.
    # Let's use a simpler check for r=1,2,3 first
    for r in range(1, 4):
        print(f"  Trying r={r} (combos)...")
        for combo in itertools.combinations(pool, r):
            if abs(sum(x.tgtcthue for x in combo) - diff) < 1:
                return [x.idServer for x in combo]
    
    # If not found, try greedy subtraction
    print("  Greedy reduction...")
    rem = diff
    skips = []
    pool_sorted = sorted(pool, key=lambda x: x.tgtcthue, reverse=True)
    for x in pool_sorted:
        if x.tgtcthue <= rem + 1 and x.tgtcthue > 0:
            rem -= x.tgtcthue
            skips.append(x.idServer)
            if abs(rem) < 1: return skips
            
    print(f"  Month {m} failed exact match. Remainder: {rem:,.0f}")
    return skips if abs(rem) < 1000 else None

def main():
    q_all = text("SELECT \"idServer\", shdon, tgtcthue, (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as ict FROM ext_listhoadon WHERE \"congtyId\"=:cid AND loaihd='muavao' AND tthai IN ('1','2','4','5') AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01' AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'")
    with engine.connect() as conn:
        df = pd.read_sql(q_all, conn, params={'cid': COMPANY_ID})
    df['month'] = pd.to_datetime(df['ict']).dt.month
    
    all_skips = []
    for m in range(1, 13):
        res = solve_month(m, df, TARGET_PURCH[m])
        if res:
            print(f"  Month {m} found {len(res)} skips")
            all_skips.extend(res)
        else:
            print(f"  Month {m} NO MATCH FOUND within range!")

    # Write as dict with shdon too for reference
    records = df[df['idServer'].isin(all_skips)][['idServer', 'shdon', 'tgtcthue', 'month']].to_dict('records')
    with open('python/skip_lists/skip_list_2023.json', 'w', encoding='utf-8') as f:
        json.dump({'skip_entries': records}, f, indent=2, ensure_ascii=False)
    print("FINISHED!")

if __name__ == "__main__":
    main()
