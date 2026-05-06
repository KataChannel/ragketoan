import pandas as pd
import re
import os

def reconstruct_workbook():
    master_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
    out_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    
    print("Reading master source...")
    xl_master = pd.ExcelFile(master_path)
    
    # 1. Recreate '331' sheet
    df_331 = pd.read_excel(master_path, sheet_name='331')
    
    # 2. Recreate 'CHI TIET THANH TOAN PB 331' sheet
    print("Synthesizing Payment Detail sheet...")
    df_1111 = pd.read_excel(master_path, sheet_name='1111')
    df_112 = pd.read_excel(master_path, sheet_name='112')
    
    # Filter for Nợ 331 (Payment to supplier)
    # In 1111 and 112 ledgers, payments have TK Đối ứng = 331 and are in Phát sinh Có (Cash/Bank goes out)
    # NO! In 1111/112 ledger, 'Phát sinh Có' means Cash decreases. 'TK Đối ứng' would be 331 (Nợ 331).
    pmt_1111 = df_1111[df_1111['TK Đối ứng'] == 331].copy()
    pmt_112 = df_112[df_112['TK Đối ứng'] == 331].copy()
    
    pmt_rows = []
    for df_src, tk_co_val in [(pmt_1111, '1111'), (pmt_112, '112')]:
        for _, r in df_src.iterrows():
            # Extract Vendor name from description if possible
            obj = "Uncategorized"
            match = re.search(r'NB:\s*(.+)', str(r['Diễn giải']))
            if match: obj = match.group(1).strip()
            
            pmt_rows.append({
                'Tháng': pd.to_datetime(r['Ngày hạch toán']).month if not pd.isna(r['Ngày hạch toán']) else None,
                'Ngày': r['Ngày hạch toán'],
                'Đối tượng': obj,
                'Diễn giải': r['Diễn giải'],
                'TK Nợ': '331',
                'TK Có': tk_co_val,
                'Số tiền': r['Phát sinh Có'] # In Cash/Bank ledger, Có is decrease (Payment)
            })
    
    df_pmt_detail = pd.DataFrame(pmt_rows)
    
    # 3. Recreate 'Tổng hợp 331' sheet
    print("Generating Summary sheet...")
    # Based on targets in image
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
    
    # For summary, we can just put placeholders or calculated values if we want.
    # But usually this sheet is just for final reporting.
    summary_rows = []
    # (Simplified for now, as Phân bổ is the primary goal)
    for t in targets:
        summary_rows.append({'TÊN NHÀ CUNG CẤP': t, 'SỐ DƯ ĐẦU KỲ': 0, 'CUỐI KỲ': 0})
    df_summary = pd.DataFrame(summary_rows)

    # 4. Save Workbook
    print(f"Saving to {out_path}...")
    with pd.ExcelWriter(out_path, engine='openpyxl') as writer:
        df_331.to_excel(writer, sheet_name='331', index=False)
        df_pmt_detail.to_excel(writer, sheet_name='CHI TIET THANH TOAN PB 331', index=False)
        df_summary.to_excel(writer, sheet_name='Tổng hợp 331', index=False)
        # We will add others later or just run the allocation script after this.
        
    print("Base workbook restored. Running allocation script next...")

if __name__ == '__main__':
    reconstruct_workbook()
