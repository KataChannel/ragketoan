import pandas as pd
from sqlalchemy import create_engine

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

def check_raw_sum():
    engine = create_engine(DB_URI)
    
    # Query list
    query_list = f"""
        SELECT h."idServer", h.tdlap, h.loaihd, h.tgtttbso 
        FROM ext_listhoadon h
        WHERE h."congtyId" = '{COMPANY_ID}'
          AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01'
          AND h.loaihd = 'muavao'
    """
    df_list = pd.read_sql(query_list, engine)
    print(f"Total list rows (muavao 2023): {len(df_list)}")
    print(f"Total tgtttbso in list: {df_list['tgtttbso'].sum():,.0f}")
    
    # Query detail
    query_detail = f"""
        SELECT d."idhdonServer", d.thtien 
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}'
          AND h.tdlap >= '2023-01-01' AND h.tdlap < '2024-01-01'
          AND h.loaihd = 'muavao'
    """
    df_detail = pd.read_sql(query_detail, engine)
    print(f"Total detail rows (muavao 2023): {len(df_detail)}")
    print(f"Total thtien in detail: {df_detail['thtien'].sum():,.0f}")

if __name__ == "__main__":
    check_raw_sum()
