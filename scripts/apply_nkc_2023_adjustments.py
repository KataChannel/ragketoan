import pandas as pd
import os
import json

def apply_adjustments():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/NKC_HUYVU_FULL_2023_V2.xlsx'
    dst = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
    print(f"Loading {src}...")
    df = pd.read_excel(src)
    
    # Ensure columns are strings to avoid dtype errors
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    df['Diễn giải'] = df['Diễn giải'].astype(str)
    df['Số chứng từ'] = df['Số chứng từ'].astype(str)
    
    # -------------------------------------------------------------
    # 1. LOAD MISSING BANK TRANSACTIONS FROM JSON
    # -------------------------------------------------------------
    json_dirs = [
        '/chikiet/kata2025/ragketoan/docs/nganhang/huyvu20232024/text-data/',
        '/chikiet/kata2025/ragketoan/nganhang/text_data/'
    ]
    
    all_bank_tx = []
    for d in json_dirs:
        if not os.path.exists(d): continue
        for f in os.listdir(d):
            if f.endswith('.json'):
                path = os.path.join(d, f)
                try:
                    with open(path, 'r', encoding='utf-8') as jf:
                        data = json.load(jf)
                        # Ensure data is a list
                        if isinstance(data, list):
                            all_bank_tx.extend(data)
                        elif isinstance(data, dict):
                            all_bank_tx.append(data)
                except Exception as e:
                    print(f"Error reading {path}: {e}")

    # Create a set of existing bank transactions in Excel for de-duplication
    # We use (Date, Description, Amount) as a loose key
    existing_keys = set()
    for _, row in df.iterrows():
        existing_keys.add((str(row['Ngày hạch toán']), str(row['Diễn giải']).upper().strip(), float(row['Số tiền'])))

    added_tx = []
    for tx in all_bank_tx:
        if "2023" not in str(tx.get('date', '')): continue
        
        desc = str(tx.get('description', '')).strip()
        desc_up = desc.upper()
        def clean_amt(v):
            if v is None: return 0.0
            if isinstance(v, (int, float)): return float(v)
            s = str(v).replace(',', '').strip()
            if not s: return 0.0
            try:
                return float(s)
            except:
                return 0.0

        amt_in = clean_amt(tx.get('credit', 0))
        amt_out = clean_amt(tx.get('debit', 0))
        amt = amt_in if amt_in > 0 else amt_out
        
        if amt == 0: continue
        
        # Check if already in Excel
        # Use a more lenient check for description if needed
        key = (str(tx.get('date')), desc_up, amt)
        if key not in existing_keys:
            # Special check for RUT TM TK entries
            if "RUT TM" in desc_up or "NHIEN" in desc_up:
                print(f"Found missing transaction: {tx.get('date')} - {desc} - {amt}")
                
                # Add to dataframe
                new_row = {
                    'Ngày hạch toán': tx.get('date'),
                    'Ngày chứng từ': tx.get('date'),
                    'Số chứng từ': 'GBN' if amt_out > 0 else 'GBC',
                    'Diễn giải': desc,
                    'TK Nợ': '1111' if (amt_out > 0 and "RUT" in desc_up) else '112',
                    'TK Có': '112' if (amt_out > 0 and "RUT" in desc_up) else '1111',
                    'Số tiền': amt,
                    'Đối tượng': ''
                }
                added_tx.append(new_row)
                existing_keys.add(key) # Prevent adding multiple times if same tx appears in diff JSONs

    if added_tx:
        print(f"Adding {len(added_tx)} missing bank transactions...")
        added_df = pd.DataFrame(added_tx)
        df = pd.concat([df, added_df], ignore_index=True)

    # -------------------------------------------------------------
    # 2. APPLY ADJUSTMENTS
    # -------------------------------------------------------------
    print("Applying adjustments...")
    
    counts = {
        '635_112': 0,
        '642_331': 0,
        '112_515': 0,
        '112_1111': 0,
        '1111_112': 0,
        '112_131': 0,
        'default': 0
    }

    partners_642 = ['XĂNG DẦU BẮC TÂY NGUYÊN', 'BẢO HIỂM BƯU ĐIỆN GIA LAI', 'MOBIFONE', 'VIETTEL', 'QUÂN ĐỘI', 'Ô TÔ GIA LAI', 'VNPT', 'TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI']
    partners_131 = ['CUC THONG KE', 'CUC QUAN LY THI TRUONG', 'DAI HOC LAM NGHIEP', 'DOVECO', 'DONG GIAO', 'QUY HO TRO PHU NU', 'BV DHYD HAGL', 'BENH VIEN DAI HOC Y DUOC', 'THIEN QUAN', 'DU LICH GIA LAI']

    def adjust_row(row):
        desc = str(row['Diễn giải']).upper()
        dr = str(row['TK Nợ'])
        cr = str(row['TK Có'])
        
        # 1. ACB / BAO MINH / LBM / SACOMBANK costs
        if (("NGÂN HÀNG TMCP Á CHÂU" in desc or "ACB" in desc) and "MUA HÀNG/DỊCH VỤ" in desc) or \
           ("BAO MINH" in desc and "TP CK" in desc) or \
           ("LBM" in desc and "TP CK" in desc) or \
           (("NGÂN HÀNG TMCP SÀI GÒN THƯƠNG TÍN" in desc or "SACOMBANK" in desc or "SAC" in desc) and 
            ("GIA LAI" in desc) and ("PHI" in desc or "CUOC" in desc or "MUA HÀNG/DỊCH VỤ" in desc or "CHUYEN TIEN" in desc)):
            counts['635_112'] += 1
            return "635", "112"
            
        # 2. Partners 642 - 331
        if "MUA HÀNG/DỊCH VỤ" in desc:
            for p in partners_642:
                if p in desc:
                    counts['642_331'] += 1
                    return "642", "331"
        
        # 3. Interest (Rule 8)
        if ("040019911911" in desc) and ("LAI" in desc or "TIEN GUI" in desc):
            counts['112_515'] += 1
            return "112", "515"
            
        # 4. RUT TM TK (Cash In) -> DR 1111 / CR 112
        if "RUT TM" in desc:
            counts['1111_112'] += 1
            return "1111", "112"
            
        # 5. NOP TM TK (Cash Out to Bank) -> DR 112 / CR 1111
        if "NOP TM" in desc or ("DANG THI XUAN HA" in desc and "040019911911" in desc):
            counts['112_1111'] += 1
            return "112", "1111"
            
        # 6. Customer Receipts (Rule 14)
        if "112" in dr:
            for p in partners_131:
                if p in desc:
                    counts['112_131'] += 1
                    return "112", "131"
            
        return dr, cr

    for idx, row in df.iterrows():
        new_dr, new_cr = adjust_row(row)
        df.at[idx, 'TK Nợ'] = new_dr
        df.at[idx, 'TK Có'] = new_cr
        
    print("Adjustment summary:")
    for k, v in counts.items():
        print(f" - {k}: {v}")
        
    # Sort by date before saving
    df['dt_sort'] = pd.to_datetime(df['Ngày hạch toán'], dayfirst=True, errors='coerce')
    df = df.sort_values('dt_sort').drop(columns=['dt_sort'])
    
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    df.to_excel(dst, index=False)
    print(f"✅ Finished! NKC saved to {dst}")

if __name__ == "__main__":
    apply_adjustments()
