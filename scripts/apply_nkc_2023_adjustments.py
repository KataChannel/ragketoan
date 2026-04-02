import pandas as pd
import os

def apply_adjustments():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/NKC_HUYVU_FULL_2023_V2.xlsx'
    dst = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
    print(f"Loading {src}...")
    df = pd.read_excel(src)
    
    # Ensure columns are strings to avoid dtype errors
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    df['Diễn giải'] = df['Diễn giải'].astype(str)
    
    counts = {
        '635_112': 0,
        '642_331': 0,
        '112_515': 0,
        '112_1111': 0,
        '112_131': 0,
        'default': 0
    }

    # Define partners for TK 642 - 331
    partners_642 = [
        'XĂNG DẦU BẮC TÂY NGUYÊN',
        'BẢO HIỂM BƯU ĐIỆN GIA LAI',
        'MOBIFONE',
        'VIETTEL',
        'QUÂN ĐỘI',
        'Ô TÔ GIA LAI',
        'VNPT',
        'TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI'
    ]
    
    # Define partners for TK 112 - 131
    partners_131 = [
        'CUC THONG KE',
        'CUC QUAN LY THI TRUONG',
        'DAI HOC LAM NGHIEP',
        'DOVECO',
        'DONG GIAO',
        'QUY HO TRO PHU NU',
        'BV DHYD HAGL',
        'BENH VIEN DAI HOC Y DUOC',
        'THIEN QUAN',
        'DU LICH GIA LAI'
    ]

    def adjust_row(row):
        desc = str(row['Diễn giải']).upper()
        dr = str(row['TK Nợ'])
        cr = str(row['TK Có'])
        
        # RULES
        
        # 1. ACB / BAO MINH / LBM / SACOMBANK (Rule 1, 10-13)
        if (("NGÂN HÀNG TMCP Á CHÂU" in desc or "ACB" in desc) and "MUA HÀNG/DỊCH VỤ" in desc) or \
           ("BAO MINH" in desc and "TP CK" in desc) or \
           ("LBM" in desc and "TP CK" in desc) or \
           (("NGÂN HÀNG TMCP SÀI GÒN THƯƠNG TÍN" in desc or "SACOMBANK" in desc or "SAC" in desc) and 
            ("GIA LAI" in desc) and ("PHI" in desc or "CUOC" in desc or "MUA HÀNG/DỊCH VỤ" in desc or "CHUYEN TIEN" in desc)):
            counts['635_112'] += 1
            return "635", "112"
            
        # 2. Partners 642 (Rule 2-7)
        if "MUA HÀNG/DỊCH VỤ" in desc:
            for p in partners_642:
                if p in desc:
                    counts['642_331'] += 1
                    return "642", "331"
        
        # 3. Sacombank Interest (Rule 8)
        if ("040019911911" in desc or "0400199111911" in desc) and ("LAI" in desc or "TIEN GUI" in desc) and dr == "112":
            counts['112_515'] += 1
            return "112", "515"
            
        # 4. Dang Thi Xuan Ha (Rule 9)
        if "DANG THI XUAN HA" in desc and ("040019911911" in desc or "NOP SCB" in desc) and dr == "112":
            counts['112_1111'] += 1
            return "112", "1111"
            
        # 5. Customer Receipts (Rule 14)
        if dr == "112":
            for p in partners_131:
                if p in desc:
                    counts['112_131'] += 1
                    return "112", "131"
            
        counts['default'] += 1
        return dr, cr

    # Apply adjustments
    for idx, row in df.iterrows():
        new_dr, new_cr = adjust_row(row)
        df.at[idx, 'TK Nợ'] = new_dr
        df.at[idx, 'TK Có'] = new_cr
        
    print("Adjustment summary:")
    for k, v in counts.items():
        print(f" - {k}: {v}")
        
    # Save the output file
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    df.to_excel(dst, index=False)
    print(f"✅ Finished! NKC saved to {dst}")

if __name__ == "__main__":
    apply_adjustments()
