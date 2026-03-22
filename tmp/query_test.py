import psycopg2
import pandas as pd
import os

DATABASE_URL = "postgresql://root:password@localhost:5432/ketoan"

def main():
    print("Connecting to DB...")
    conn = psycopg2.connect(DATABASE_URL)
    
    # Check the mappings available
    query_tonghop = """
    SELECT "nam", "thang", "loaihd", "maHang", "nhomHang", SUM(sluong) as total_qty, SUM(thtien) as total_val
    FROM "ext_tonghop"
    WHERE "nam" IN (2023, 2024)
    GROUP BY "nam", "thang", "loaihd", "maHang", "nhomHang"
    LIMIT 10;
    """
    df = pd.read_sql(query_tonghop, conn)
    print("Sample from ext_tonghop:")
    print(df)
    
    # Check how many unique maHang we have
    query_count = """
    SELECT count(distinct "maHang") as unique_ma, count(distinct "nhomHang") as unique_nhom
    FROM "ext_tonghop"
    WHERE "nam" IN (2023, 2024);
    """
    df_count = pd.read_sql(query_count, conn)
    print("Counts:")
    print(df_count)

    conn.close()

if __name__ == "__main__":
    main()
