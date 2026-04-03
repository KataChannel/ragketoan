import pandas as pd
import psycopg2
import json
import os
from datetime import datetime

def generate_huyvu_2024_master():
    # 1. CONFIG
    DB_URL = "postgresql://root:password@localhost:5432/ketoan"
    BANK_DIR = "/chikiet/kata2025/ragketoan/docs/nganhang/huyvu20232024/text-data/"
    OUTPUT_RAW = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/NKC_HUYVU_2024_RAW.xlsx"
    os.makedirs(os.path.dirname(OUTPUT_RAW), exist_ok=True)
    
    print("Step 1: Extracting Invoices 2024 from Database...")
    conn = psycopg2.connect(DB_URL)
    query = """
        SELECT tdlap, loaihd, nbten, nmten, "tenHang", sluong, thtien, tthue, "tongTien", tthai 
        FROM ext_tonghop 
        WHERE nam = 2024 
        AND tthai IN ('1', '2', '4', '5')
        AND (nbmst = '5900363291' OR nmmst = '5900363291')
    """
    df_inv = pd.read_sql(query, conn)
    conn.close()
    
    # Filter out services for Inventory purposes if needed, 
    # but for NKC we keep for accounting (reclassified to 642/635 later)
    
    nkc_entries = []
    
    # Process Invoices
    for _, row in df_inv.iterrows():
        # ICT Timezone conversion could be done if raw date is UTC, 
        # but tdlap is usually stored as local or with tzinfo.
        date_str = row['tdlap'].strftime('%d/%m/%Y')
        
        # Skip specific service strings if non-inventory
        is_service = any(x in row['tenHang'].upper() for x in ['LÃI VAY', 'PHÍ NGÂN HÀNG', 'CHUYỂN TIỀN'])
        
        if row['loaihd'] == 'muavao':
            tk_no = '642' if is_service else '1561'
            nkc_entries.append({
                'Ngày hạch toán': date_str, 'Ngày chứng từ': date_str, 'Số chứng từ': 'HDM_INV',
                'Diễn giải': f"Mua {'dịch vụ' if is_service else 'hàng'}: {row['tenHang']} - NB: {row['nbten']}",
                'TK Nợ': tk_no, 'TK Có': '331', 'Số tiền': float(row['tongTien']), 'Đối tượng': str(row['nbten'])
            })
        else: # banra
            nkc_entries.append({
                'Ngày hạch toán': date_str, 'Ngày chứng từ': date_str, 'Số chứng từ': 'HDB_INV',
                'Diễn giải': f"Bán hàng: {row['tenHang']} - NM: {row['nmten']}",
                'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': float(row['tongTien']), 'Đối tượng': str(row['nmten'])
            })
            
    print(f"Loaded {len(nkc_entries)} invoice entries.")
    
    print("Step 2: Extracting Bank Transactions 2024 from JSONs...")
    bank_count = 0
    for filename in os.listdir(BANK_DIR):
        if filename.endswith(".json"):
            with open(os.path.join(BANK_DIR, filename), 'r') as f:
                data = json.load(f)
                for tx in data:
                    # Filter only 2024
                    if '/2024' in tx['date']:
                        bank_count += 1
                        desc = tx['description'].upper()
                        # Simple rule mapping
                        tk_no, tk_co = '642', '112'
                        dt = 'NGÂN HÀNG'
                        
                        if tx['debit'] > 0:
                            tk_co = '112'
                            if 'TRA GOC VAY' in desc or 'LAI VAY' in desc or 'SACOMBANK' in desc:
                                tk_no = '635' # Applying logic from 2023
                            elif 'MUA' in desc or 'TRA TIEN' in desc:
                                tk_no = '331'
                                # Try to extract vendor name if possible, or use generic
                                dt = 'NCC_BANK_PAYMENT'
                            else:
                                tk_no = '642'
                            amt = tx['debit']
                        else:
                            tk_no = '112'
                            if 'NOP TM' in desc or 'NOP TIEN' in desc:
                                tk_co = '1111'
                            else:
                                tk_co = '131'
                                dt = 'KH_BANK_TRANSFER'
                            amt = tx['credit']
                            
                        nkc_entries.append({
                            'Ngày hạch toán': tx['date'], 'Ngày chứng từ': tx['date'], 'Số chứng từ': 'GBC_BANK' if tx['debit']>0 else 'GBN_BANK',
                            'Diễn giải': tx['description'],
                            'TK Nợ': tk_no, 'TK Có': tk_co, 'Số tiền': float(amt), 'Đối tượng': dt
                        })
    
    print(f"Loaded {bank_count} bank entries.")
    
    # Step 3: Final RAW Export
    df_nkc = pd.DataFrame(nkc_entries)
    # Sort by date
    df_nkc['dt_sort'] = pd.to_datetime(df_nkc['Ngày hạch toán'], dayfirst=True, errors='coerce')
    df_nkc = df_nkc.sort_values('dt_sort').drop(columns=['dt_sort'])
    
    df_nkc.to_excel(OUTPUT_RAW, index=False)
    print(f"✅ NKC 2024 RAW CREATED: {OUTPUT_RAW}")

if __name__ == "__main__":
    generate_huyvu_2024_master()
