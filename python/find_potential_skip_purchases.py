
import os
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
engine = create_engine(DB_URI)
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

def main():
    query = text("""
        SELECT l.shdon, d.ten, d.thtien, l.tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict
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
    
    # Identify obvious service items
    svc_keywords = [
        'phí', 'bảo hiểm', 'vận chuyển', 'sửa chữa', 'bảo hành', 'lắp đặt',
        'cước', 'thuê', 'truyền thông', 'quảng cáo', 'văn phòng phẩm',
        'ăn uống', 'lưu trú', 'nghỉ', 'bank', 'ngân hàng', 'lãi', 'vốn', 'điện', 'nước'
    ]
    
    def is_service(h):
        h = str(h).lower()
        for kw in svc_keywords:
            if kw in h: return True
        return False
    
    df['is_svc'] = df['ten'].apply(is_service)
    
    svc_total = df[df['is_svc']]['thtien'].sum()
    print(f"Total potential service items in Purchase 2023: {svc_total:,.0f}")
    
    # Also check specific non-service but maybe out-of-scope items (e.g. tools vs goods)
    # But for now let's see what the diff is.
    # Current Nhập (2023): 16,404,753,712
    # Target: 15,640,942,868
    # Diff = 763,810,844
    
    # If I filter ALL svc, how much do I get?
    # Actually I should also find ALL invoices that are ENTIRELY services.
    
    df_inv = df.groupby('shdon').agg({
        'thtien': 'sum',
        'is_svc': 'all' # True if all items in invoice are services
    })
    
    print(f"Total entirely service invoices in Purchase 2023: {df_inv[df_inv['is_svc']]['thtien'].sum():,.0f}")
    
    # What if we include ANY invoice that has AT LEAST one service?
    df_inv_any = df.groupby('shdon').agg({
        'thtien': 'sum',
        'is_svc': 'any'
    })
    print(f"Total invoices with ANY service in Purchase 2023: {df_inv_any[df_inv_any['is_svc']]['thtien'].sum():,.0f}")

if __name__ == "__main__":
    main()
