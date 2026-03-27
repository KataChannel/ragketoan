
import os
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

TARGET_PURCHASES = {
    1: 1154981164, 2: 1745704064, 3: 1536437738, 4: 757550609,
    5: 600350985, 6: 749561478, 7: 895409563, 8: 1812197507,
    9: 1552056812, 10: 890284926, 11: 1564643572, 12: 2381764450
}

def main():
    query = text("""
        SELECT l.shdon, l.nbten, l.tgtcthue, 
               (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') as tdlap_ict,
               d.ten as item_ten
        FROM ext_listhoadon l
        JOIN ext_detailhoadon d ON l."idServer" = d."idhdonServer"
        WHERE l."congtyId" = :cid
          AND l.loaihd = 'muavao'
          AND l.tthai IN ('1','2','4','5')
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' >= '2023-01-01'
          AND l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' < '2024-01-01'
    """)
    
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={'cid': COMPANY_ID})
    
    df['month'] = pd.to_datetime(df['tdlap_ict']).dt.month
    
    # Pre-identify clear service keywords
    svc_keys = [
        'phí', 'lãi', 'vay', 'điện', 'nước', 'quản lý', 'tên miền', 'hosting', 
        'hosting', 'bảo hiểm', 'sửa chữa', 'cước', 'quảng cáo', 'vệ sinh', 
        'vận chuyển', 'lắp đặt', 'đồ uống', 'ăn uống', 'phí bank', 'ngân hàng'
    ]
    
    all_skip_sh = set()
    
    for m in range(1, 13):
        target = TARGET_PURCHASES[m]
        m_df = df[df['month'] == m].copy()
        
        # Group by SH to get invoice total
        m_inv = m_df.groupby('shdon').agg({
            'tgtcthue': 'first',
            'item_ten': lambda x: ' | '.join(x.astype(str))
        }).reset_index()
        
        current = m_inv['tgtcthue'].sum()
        diff = current - target
        
        print(f"\nMonth {m}: Current={current:,.0f}, Target={target:,.0f}, Diff={diff:,.0f}")
        
        if diff == 0: continue
        
        # Find combination of invoices that sums to diff
        # Simple heuristic: look for service keywords first
        m_inv['is_likely_skip'] = m_inv['item_ten'].str.lower().apply(lambda x: any(k in x for k in svc_keys))
        
        potential_skip = m_inv[m_inv['is_likely_skip']]
        potential_sum = potential_skip['tgtcthue'].sum()
        print(f"  Service items sum: {potential_sum:,.0f}")
        
        # If potential_sum == diff, we found them!
        if abs(potential_sum - diff) < 1:
            print(f"  EXACT MATCH! Adding {len(potential_skip)} invoices to skip list.")
            all_skip_sh.update(potential_skip['shdon'].astype(str).tolist())
        else:
            # Need to find more. Maybe some are not caught by keywords.
            # Look for exact match individual or sorted search
            for i, row in m_inv.iterrows():
                if abs(row['tgtcthue'] - diff) < 1:
                    print(f"  Found single invoice matching diff: SH {row['shdon']} ({row['item_ten'][:50]})")
                    all_skip_sh.add(str(row['shdon']))
                    # break? not necessarily, but for now yes if found
                    
    print(f"\nTotal SH to skip for Purchase: {len(all_skip_sh)}")
    print(sorted(list(all_skip_sh)))

if __name__ == "__main__":
    main()
