import pandas as pd
import re
import unicodedata

def remove_accents(input_str):
    if not isinstance(input_str, str): return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)]).replace('đ', 'd').replace('Đ', 'D')

def recover_payments_unaccented():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    master_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
    
    targets = [
        'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA',
        'CÔNG TY TNHH THẢO NHIÊN',
        'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN',
        'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG',
        'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG',
        'Công ty TNHH Phân phối Synnex FPT',
        'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN',
        'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q',
        'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ',
        'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ',
        'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT'
    ]
    
    # Unaccented keywords
    keywords_map = {remove_accents(t).upper(): t for t in targets}
    # Add shorter keywords for safety
    short_kws = {
        'LE TRAN GIA': 'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA',
        'THAO NHIEN': 'CÔNG TY TNHH THẢO NHIÊN',
        'SAO NAM AN': 'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN',
        'VINH XUAN': 'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG',
        'THE GIOI SO': 'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ',
        'SYNNEX': 'Công ty TNHH Phân phối Synnex FPT',
        'VIEN SON': 'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN',
        'CONG NGHE Q': 'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q',
        'DAU KHI': 'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ',
        'KIM PHAT': 'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT'
    }

    print("Reading sheets and scanning with unaccented matching...")
    df_112 = pd.read_excel(master_path, sheet_name='112')
    df_1111 = pd.read_excel(master_path, sheet_name='1111')
    
    payment_records = []
    
    for df_src, tk_src in [(df_112, '112'), (df_1111, '1111')]:
        pmts = df_src[df_src['Phát sinh Có'] > 0].copy()
        for _, r in pmts.iterrows():
            clean_desc = remove_accents(str(r['Diễn giải'])).upper()
            matched_target = None
            
            # 1. Try full unaccented match
            for u_target, full_name in keywords_map.items():
                if u_target in clean_desc:
                    matched_target = full_name
                    break
            
            # 2. Try short keyword match if not found
            if not matched_target:
                for kw, full_name in short_kws.items():
                    if kw in clean_desc:
                        matched_target = full_name
                        break
            
            if matched_target:
                # Special logic for Thế Giới Số branches
                if 'THE GIOI SO' in clean_desc:
                    if 'DA NANG' in clean_desc or 'DN' in clean_desc:
                        matched_target = 'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG'
                    else:
                        matched_target = 'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ'
                
                payment_records.append({
                    'Ngày': r['Ngày hạch toán'],
                    'Đối tượng': matched_target,
                    'Diễn giải': r['Diễn giải'],
                    'Số tiền': r['Phát sinh Có'],
                    'TK Nợ': '331',
                    'TK Có': tk_src
                })

    df_result = pd.DataFrame(payment_records)
    print(f"Found {len(df_result)} payments.")
    
    if len(df_result) > 0:
        with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
            df_result.to_excel(writer, sheet_name='CHI TIET THANH TOAN PB 331', index=False)
        print("Sheet updated.")
    else:
        print("Still 0 payments. Checking master ledger structure...")

if __name__ == '__main__':
    recover_payments_unaccented()
