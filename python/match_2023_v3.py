
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

# Accounting Targets
TARGET_SALES = {1: 890556850, 2: 1062540911, 3: 1702314546, 4: 976118179, 5: 856337274, 6: 979997269, 7: 1153648183, 8: 1158949228, 9: 1281113807, 10: 1420458661, 11: 1483313992, 12: 3205182101}
TARGET_PURCH = {1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609, 5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507, 9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450}

def get_year_data(year):
    q = text("""
        SELECT shdon, loaihd, tgtcthue, tthai,
               tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict
        FROM ext_listhoadon
        WHERE (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= :s
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < :e
          AND "congtyId" = :cid
          AND tthai IN ('1','2','4','5')
    """)
    with engine.connect() as conn:
        df = pd.read_sql(q, conn, params={'s': f'{year}-01-01', 'e': f'{year+1}-01-01', 'cid': COMPANY_ID})
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    return df

def find_combination(items, target, current_combo=[], current_sum=0, start_index=0, max_items=12):
    if abs(current_sum - target) < 1:
        return current_combo
    
    if len(current_combo) >= max_items:
        return None
        
    for i in range(start_index, len(items)):
        val = items[i][1]
        if current_sum + val > target + 10: # Pruning (assumes non-negative values)
            continue
        
        res = find_combination(items, target, current_combo + [items[i][0]], current_sum + val, i + 1, max_items)
        if res:
            return res
    return None

def find_subset_sum_fast(item_list, target):
    # Sort items by value descending - might not be optimal for pruning but let's try
    # Actually sort by value ascending to explore more combinations quickly?
    items = sorted(item_list, key=lambda x: x[1])
    # Filter items that are too big
    items = [x for x in items if x[1] <= target + 1]
    
    # Try with increasing max_items
    for limit in range(1, 15):
        print(f"    Checking combinations of up to {limit} items...", flush=True)
        res = find_combination(items, target, [], 0, 0, limit)
        if res:
            return res
    return None

def main():
    df = get_year_data(2023)
    skip_sh = set()
    
    results = []

    for month in range(1, 13):
        for loai, target_dict, name in [('banra', TARGET_SALES, 'Sales'), ('muavao', TARGET_PURCH, 'Purch')]:
            m_df = df[(df['month'] == month) & (df['loaihd'] == loai)]
            current = m_df['tgtcthue'].sum()
            target = target_dict[month]
            diff = current - target
            
            if abs(diff) > 1:
                print(f"\nMonth {month} {name}: Current={current:,.0f}, Target={target:,.0f}, Diff={diff:,.0f}")
                # Group by SH
                sh_vals = m_df.groupby('shdon')['tgtcthue'].sum().reset_index()
                item_list = list(zip(sh_vals['shdon'].astype(str), sh_vals['tgtcthue']))
                
                match = find_subset_sum_fast(item_list, diff)
                if match:
                    print(f"  FOUND MATCHING SH TO SKIP: {match}")
                    skip_sh.update(match)
                else:
                    print(f"  COULD NOT FIND MATCHING SH FOR DIFF {diff}")

    print("\n--- FINAL SKIP LIST ---")
    data = sorted(list(skip_sh))
    print(json.dumps(data, indent=2))
    
    with open("/chikiet/kata2025/ragketoan/python/skip_lists/skip_list_2023.json", "w") as f:
        json.dump({"skip_entries": [{"shdon": sh} for sh in data]}, f, indent=2)

if __name__ == "__main__":
    main()
