import pandas as pd
import unicodedata

def remove_accents(input_str):
    if not isinstance(input_str, str): return ""
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)]).replace('đ', 'd').replace('Đ', 'D')

def finalize_everything_v2():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    
    # NEW Targets data
    targets_info = {
        'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA': [0, 136120700],
        'CÔNG TY TNHH THẢO NHIÊN': [0, 126329100],
        'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN': [0, 359208302],
        'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG': [436912740, 0],
        'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG': [396245780, 296245780],
        'Công ty TNHH Phân phối Synnex FPT': [596080295, 596080295],
        'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN': [945621340, 868745100],
        'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q': [326457632, 426378230],
        'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ': [863487320, 663487320],
        'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ': [1065246321, 537425327],
        'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT': [546812347, 622735946]
    }
    
    # 1. Update Tổng hợp 331
    df_ledger = pd.read_excel(file_path, sheet_name='331')
    df_ledger['vendor'] = df_ledger['Diễn giải'].str.extract(r'NB:\s*(.+)')
    all_individual_vendors = df_ledger['vendor'].dropna().unique()
    
    summary_rows = []
    target_names = set(targets_info.keys())
    for t, vals in targets_info.items():
        summary_rows.append({'TÊN NHÀ CUNG CẤP': t, 'SỐ DƯ ĐẦU KỲ': vals[0], 'CUỐI KỲ': vals[1]})
    
    for v in sorted(all_individual_vendors):
        is_target = False
        v_u = str(v).upper()
        for t in target_names:
            if t.upper() in v_u or v_u in t.upper():
                is_target = True
                break
        if not is_target:
            summary_rows.append({'TÊN NHÀ CUNG CẤP': v, 'SỐ DƯ ĐẦU KỲ': 0, 'CUỐI KỲ': 0})
            
    df_summary = pd.DataFrame(summary_rows)
    total_row = pd.DataFrame([{'TÊN NHÀ CUNG CẤP': 'TỔNG CỘNG', 'SỐ DƯ ĐẦU KỲ': df_summary['SỐ DƯ ĐẦU KỲ'].sum(), 'CUỐI KỲ': df_summary['CUỐI KỲ'].sum()}])
    df_summary = pd.concat([df_summary, total_row], ignore_index=True)
    
    # 2. Update CHI TIET THANH TOAN using unaccented scan
    master_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
    df_112 = pd.read_excel(master_path, sheet_name='112')
    df_1111 = pd.read_excel(master_path, sheet_name='1111')
    
    keywords_map = {remove_accents(t).upper(): t for t in targets_info.keys()}
    short_kws = {'LE TRAN GIA': 'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA', 'THAO NHIEN': 'CÔNG TY TNHH THẢO NHIÊN', 'SAO NAM AN': 'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN', 'VINH XUAN': 'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG', 'THE GIOI SO': 'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ', 'SYNNEX': 'Công ty TNHH Phân phối Synnex FPT', 'VIEN SON': 'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN', 'CONG NGHE Q': 'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q', 'DAU KHI': 'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ', 'KIM PHAT': 'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT'}

    payment_records = []
    for df_src, tk_src in [(df_112, '112'), (df_1111, '1111')]:
        pmts = df_src[df_src['Phát sinh Có'] > 0].copy()
        for _, r in pmts.iterrows():
            clean_desc = remove_accents(str(r['Diễn giải'])).upper()
            matched_target = None
            for u_target, full_name in keywords_map.items():
                if u_target in clean_desc: matched_target = full_name; break
            if not matched_target:
                for kw, full_name in short_kws.items():
                    if kw in clean_desc: matched_target = full_name; break
            if matched_target:
                if 'THE GIOI SO' in clean_desc:
                    if 'DA NANG' in clean_desc or 'DN' in clean_desc: matched_target = 'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG'
                    else: matched_target = 'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ'
                payment_records.append({'Ngày': r['Ngày hạch toán'], 'Đối tượng': matched_target, 'Diễn giải': r['Diễn giải'], 'Số tiền': r['Phát sinh Có'], 'TK Nợ': '331', 'TK Có': tk_src})
    
    df_pmt = pd.DataFrame(payment_records)
    
    # 3. Save
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_summary.to_excel(writer, sheet_name='Tổng hợp 331', index=False)
        df_pmt.to_excel(writer, sheet_name='CHI TIET THANH TOAN PB 331', index=False)
    print("Full Workbook Refresh with new targets complete.")

if __name__ == '__main__':
    finalize_everything_v2()
