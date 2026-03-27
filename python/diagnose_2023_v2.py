
import os
import json
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

# Targets from MD
TARGET_SALES = {
    1: 890556850, 2: 1062540911, 3: 1702314546, 4: 976118179,
    5: 856337274, 6: 979997269, 7: 1153648183, 8: 1158949228,
    9: 1281113807, 10: 1420458661, 11: 1483313992, 12: 3205182101
}

TARGET_PURCHASE = {
    1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609,
    5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507,
    9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450
}

def get_db_data(year):
    query = text("""
        SELECT "idServer", shdon, tdlap, loaihd, tgtcthue
        FROM ext_listhoadon
        WHERE "tdlap" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= :start
          AND "tdlap" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < :end
          AND tthai IN ('1', '2', '4', '5')
          AND "congtyId" = :cid
    """)
    start = f"{year}-01-01"
    end = f"{year+1}-01-01"
    
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={'start': start, 'end': end, 'cid': COMPANY_ID})
    
    df['tdlap_ict'] = pd.to_datetime(df['tdlap']).dt.tz_localize('UTC', ambiguous='infer').dt.tz_convert('Asia/Ho_Chi_Minh')
    df['month'] = df['tdlap_ict'].dt.month
    return df

def analyze_diffs(year):
    df = get_db_data(year)
    
    print(f"--- Analysis for {year} ---")
    
    df_sales = df[df['loaihd'] == 'banra']
    df_purch = df[df['loaihd'] == 'muavao']
    
    print("\n[SALES DIFFS]")
    for m in range(1, 13):
        cur = df_sales[df_sales['month'] == m]['tgtcthue'].sum()
        target = TARGET_SALES.get(m, 0)
        diff = cur - target
        if abs(diff) > 1:
            print(f"Month {m}: current={cur:,.0f}, target={target:,.0f}, diff={diff:,.0f}")
            # Potential invoices to skip
            potentials = df_sales[(df_sales['month'] == m) & (df_sales['tgtcthue'].abs() == abs(diff))]
            if potentials.empty:
                # Try to find common small values or combination?
                 potentials = df_sales[(df_sales['month'] == m)].sort_values(by='tgtcthue')
                 # Just show a few smallest
                 # print("  Smallest invoices in month:", potentials[['shdon', 'tgtcthue']].head(5).to_dict('records'))
                 pass
            else:
                print("  EXACT MATCH SH:", potentials['shdon'].tolist())

    print("\n[PURCHASE DIFFS]")
    for m in range(1, 13):
        cur = df_purch[df_purch['month'] == m]['tgtcthue'].sum()
        target = TARGET_PURCHASE.get(m, 0)
        diff = cur - target
        if abs(diff) > 1:
            print(f"Month {m}: current={cur:,.0f}, target={target:,.0f}, diff={diff:,.0f}")
            matches = df_purch[(df_purch['month'] == m) & (df_purch['tgtcthue'].abs() == abs(diff))]
            if not matches.empty:
                 print("  EXACT MATCH SH:", matches['shdon'].tolist())
            else:
                 # Check if multiple invoices sum to diff
                 pass

if __name__ == "__main__":
    analyze_diffs(2023)
