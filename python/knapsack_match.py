
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def find_subset_sum(items, target):
    # items: list of (id, val)
    # Using a simple recursive with memo or just a dictionary for DP if values are small
    # But values are millions, so we use a dictionary-based DP for "reachable" sums
    sums = {0: []}
    for item_id, val in items:
        new_sums = {}
        for s, ids in sums.items():
            new_val = s + val
            if new_val == target:
                return ids + [item_id]
            if new_val < target + 1000 and new_val not in sums:
                new_sums[new_val] = ids + [item_id]
        sums.update(new_sums)
        if len(sums) > 1000000: # Limit memory
            # Keep only sums close to target
            sums = {s: ids for s, ids in sums.items() if s <= target + 1000}
    
    # Return closest if no exact
    best_s = min(sums.keys(), key=lambda x: abs(x - target))
    return sums[best_s]

def main():
    q_all = text("SELECT \"idServer\", shdon, tgtcthue, (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as ict FROM ext_listhoadon WHERE \"congtyId\"=:cid AND loaihd='muavao' AND tthai IN ('1','2','4','5') AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01' AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'")
    with engine.connect() as conn:
        df = pd.read_sql(q_all, conn, params={'cid': COMPANY_ID})
    df['month'] = pd.to_datetime(df['ict']).dt.month
    
    all_skips = []
    for m in range(1, 13):
        df_m = df[df['month'] == m]
        diff = int(df_m['tgtcthue'].sum() - TARGET_PURCH[m])
        if diff <= 0: continue
        
        items = [(row.idServer, int(row.tgtcthue)) for row in df_m.itertuples() if row.tgtcthue > 0]
        res = find_subset_sum(items, diff)
        if res:
            print(f"Month {m}: Found {len(res)} items matching diff {diff:,.0f}")
            all_skips.extend(res)

    skip_shs = df[df['idServer'].isin(all_skips)]['shdon'].astype(str).tolist()
    print("FINAL SH LIST FOR PURCH_SKIP_2023:")
    print(json.dumps(sorted(list(set(skip_shs))), indent=2))

if __name__ == "__main__":
    main()
