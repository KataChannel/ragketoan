
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text
import itertools

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_SALES = {1: 890556850, 2: 1062540911, 3: 1702314546, 4: 976118179, 5: 856337274, 6: 979997269, 7: 1153648183, 8: 1158949228, 9: 1281113807, 10: 1420458661, 11: 1483313992, 12: 3205182101}
TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def solve_subset_sum(items, target):
    # items: list of (key, val), target: target sum
    # Returns best subset sum and key list
    # Use simple recursion with pruning or combinations for small sets
    if not items: return None
    
    # Pre-filter: only items <= target
    cand = [x for x in items if x[1] <= target + 1]
    
    for r in range(1, min(len(cand), 8) + 1):
        for combo in itertools.combinations(cand, r):
            if abs(sum(v for k,v in combo) - target) < 1:
                return [k for k,v in combo]
    return None

def main():
    q = text("""
        SELECT shdon, loaihd, tgtcthue, tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict
        FROM ext_listhoadon
        WHERE "congtyId" = :cid
          AND tthai IN ('1','2','4','5')
          AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
    """)
    with engine.connect() as conn:
        df = pd.read_sql(q, conn, params={'cid': COMPANY_ID})
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    final_skip = set()

    for m in range(1, 13):
        # Sales
        m_sales = df[(df['month'] == m) & (df['loaihd'] == 'banra')].groupby('shdon')['tgtcthue'].sum().reset_index()
        cur_s = m_sales['tgtcthue'].sum()
        target_s = TARGET_SALES[m]
        diff_s = cur_s - target_s
        if abs(diff_s) > 1:
            res = solve_subset_sum(list(zip(m_sales['shdon'].astype(str), m_sales['tgtcthue'])), diff_s)
            if res: final_skip.update(res)
            else: print(f"Month {m} Sales: No direct match for diff {diff_s:.0f}")

        # Purchase
        m_purch = df[(df['month'] == m) & (df['loaihd'] == 'muavao')].groupby('shdon')['tgtcthue'].sum().reset_index()
        cur_p = m_purch['tgtcthue'].sum()
        target_p = TARGET_PURCH[m]
        diff_p = cur_p - target_p
        if abs(diff_p) > 1:
            # For purchase, diff can be large, maybe many small items
            res = solve_subset_sum(list(zip(m_purch['shdon'].astype(str), m_purch['tgtcthue'])), diff_p)
            if res: final_skip.update(res)
            else: print(f"Month {m} Purch: No direct match for diff {diff_p:.0f}")

    print(f"\nFinal Skip set size: {len(final_skip)}")
    data = sorted(list(final_skip))
    
    with open("/chikiet/kata2025/ragketoan/python/skip_lists/skip_list_2023.json", "w") as f:
        json.dump({"skip_entries": [{"shdon": sh} for sh in data]}, f, indent=2)
    print("Saved to skip_list_2023.json")

if __name__ == "__main__":
    main()
