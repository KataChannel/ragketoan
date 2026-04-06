import duckdb
import pandas as pd
import os

# ============================================================
# CONFIGURATION
# ============================================================
SCT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"

def analyze_with_duckdb():
    print(f"🚀 Initializing DuckDB for SCT Analysis: {os.path.basename(SCT_PATH)}")
    
    # 1. Load NKC into DuckDB for fast querying
    print("  - Loading NKC sheet into memory...")
    df_nkc = pd.read_excel(SCT_PATH, sheet_name='NKC')
    
    # Connect to DuckDB (in-memory)
    con = duckdb.connect(database=':memory:')
    con.register('nkc', df_nkc)
    
    print("\n--- [1] TỔNG HỢP CÂN ĐỐI TÀI KHOẢN (DUCKDB) ---")
    summary_query = """
        SELECT 
            "TK Nợ" as TK,
            SUM("Số tiền") as PhatSinhNo,
            0 as PhatSinhCo
        FROM nkc 
        WHERE "TK Nợ" IS NOT NULL
        GROUP BY 1
        UNION ALL
        SELECT 
            "TK Có" as TK,
            0 as PhatSinhNo,
            SUM("Số tiền") as PhatSinhCo
        FROM nkc 
        WHERE "TK Có" IS NOT NULL
        GROUP BY 1
    """
    
    # Aggregated CDPS from NKC
    cdps = con.execute(f"""
        SELECT 
            TK, 
            SUM(PhatSinhNo) as Total_Dr, 
            SUM(PhatSinhCo) as Total_Cr
        FROM ({summary_query})
        GROUP BY TK
        ORDER BY TK
    """).df()
    
    print(cdps)
    
    print("\n--- [2] TOP 10 ĐỐI TƯỢNG CÓ GIAO DỊCH LỚN NHẤT ---")
    top_parties = con.execute("""
        SELECT "Đối tượng", SUM("Số tiền") as TongGiaTri
        FROM nkc
        WHERE "Đối tượng" IS NOT NULL AND "Đối tượng" <> 'Cấn trừ nợ' AND "Đối tượng" <> 'TỔNG CỘNG'
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
    """).df()
    print(top_parties)

    print("\n--- [3] KIỂM TRA TÀI KHOẢN TIỀN GỬI (112) CHI TIẾT ---")
    bank_check = con.execute("""
        SELECT "Ngày hạch toán", "Diễn giải", "TK Nợ", "TK Có", "Số tiền"
        FROM nkc
        WHERE CAST("TK Nợ" AS VARCHAR) LIKE '112%' OR CAST("TK Có" AS VARCHAR) LIKE '112%'
        LIMIT 5
    """).df()
    print(bank_check)
    
    print("\n✅ DuckDB Analysis Complete. Data is lightning fast for large datasets.")

if __name__ == "__main__":
    if os.path.exists(SCT_PATH):
        analyze_with_duckdb()
    else:
        print(f"❌ File not found: {SCT_PATH}")
