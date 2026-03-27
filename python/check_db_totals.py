import psycopg2

DB_URL = "postgresql://root:password@localhost:5432/ketoan"
HUY_VU_MST = "5900363291"

def check_totals():
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    # Check total Mua vào (soLuongNhap * some_price? No, let's look at giaTriNhap if it exists)
    # Let's first see the columns in ext_tonghop
    cur.execute("SELECT * FROM ext_tonghop LIMIT 0")
    colnames = [desc[0] for desc in cur.description]
    print(f"Columns in ext_tonghop: {colnames}")
    
    # Sum up everything for 2023
    # Try different columns if they exist
    if 'giaTriNhap' in colnames:
        cur.execute(f"SELECT SUM(\"giaTriNhap\") FROM ext_tonghop WHERE \"congtyMst\" = '{HUY_VU_MST}' AND nam = 2023")
        total_gtn = cur.fetchone()[0]
        print(f"Total giaTriNhap (ext_tonghop) 2023: {total_gtn:,.0f}")
    
    cur.execute(f"SELECT SUM(\"soLuongNhap\") FROM ext_tonghop WHERE \"congtyMst\" = '{HUY_VU_MST}' AND nam = 2023")
    total_sln = cur.fetchone()[0]
    print(f"Total soLuongNhap (ext_tonghop) 2023: {total_sln:,.2f}")

    conn.close()

if __name__ == "__main__":
    check_totals()
