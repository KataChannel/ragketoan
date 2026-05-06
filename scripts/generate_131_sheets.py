import pandas as pd
import os
from datetime import datetime

def generate_131_sheets():
    nkc_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    so_sach_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'
    
    TARGETS_131 = {
        "BỆNH VIỆN Y DƯỢC HOÀNG ANH GIA LAI": {"start": 5532674532, "end": 3532674532},
        "CHI NHÁNH CÔNG TY TNHH TIN HỌC QUANG ANH": {"start": 186145376, "end": 81264320},
        "BAN QUẢN LÝ RỪNG PHÒNG HỘ HÀ RA": {"start": 82678320, "end": 32687456},
        "CÔNG TY TNHH TƯ VẤN THIẾT KẾ ĐẦU TƯ VÀ XÂY DỰNG PHÚ THỊNH GIA": {"start": 349655250, "end": 251022163},
        "TRƯỜNG CAO ĐẲNG NGHỀ SỐ 21 - BQP": {"start": 283961610, "end": 166529627},
        "CÔNG TY TNHH MỘT THÀNH VIÊN PCCC NGỌC MINH": {"start": 118327402, "end": 63278432},
        "XÍ NGHIỆP KHẢO SÁT THIẾT KẾ - CHI NHÁNH TỔNG CÔNG TY 15": {"start": 318868509, "end": 28679324},
        "CÔNG TY CỔ PHẦN TRƯỜNG PHỔ THÔNG NGUYỄN VĂN LINH GIA LAI": {"start": 243756320, "end": 193647521},
        "CÔNG TY TNHH TIN HỌC QUANG ANH GL": {"start": 186327940, "end": 263214756},
        "BINH ĐOÀN 15 - CÔNG TY TNHH MTV TỔNG CÔNG TY 15": {"start": 532745410, "end": 324628170},
        "CHI NHÁNH CÔNG TY CỔ PHẦN XĂNG DẦU DẦU KHÍ PVOIL MIỀN TRUNG TẠI GIA LAI": {"start": 124695327, "end": 107704881}
    }

    print("Reading Journal...")
    df_nkc = pd.read_excel(nkc_src)
    
    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df_nkc['TK Nợ'] = df_nkc['TK Nợ'].apply(fmt_acc)
    df_nkc['TK Có'] = df_nkc['TK Có'].apply(fmt_acc)
    
    df_131 = df_nkc[(df_nkc['TK Nợ'].str.startswith('131')) | (df_nkc['TK Có'].str.startswith('131'))].copy()
    df_131['Ngày hạch toán'] = pd.to_datetime(df_131['Ngày hạch toán'], format='%d/%m/%Y', errors='coerce', dayfirst=True)
    df_131 = df_131.sort_values(by=['Đối tượng', 'Ngày hạch toán', 'Số chứng từ'])
    
    # 1. Generate 131_REBALANCED
    detail_rows = []
    suppliers = df_131['Đối tượng'].unique()
    for s in suppliers:
        s_target = TARGETS_131.get(s, {"start": 0, "end": 0})
        detail_rows.append({
            'Ngày hạch toán': '01/01/2023',
            'Ngày chứng từ': '01/01/2023',
            'Số chứng từ': '',
            'Diễn giải': f'SỐ DƯ ĐẦU KỲ - {s}',
            'TK Đối ứng': '',
            'Nợ': s_target['start'], 'Có': 0, 'Số dư': s_target['start'],
            'Đối tượng': s
        })
        
        running_bal = s_target['start']
        s_trans = df_131[df_131['Đối tượng'] == s]
        
        for _, row in s_trans.iterrows():
            debit = row['Số tiền'] if row['TK Nợ'].startswith('131') else 0
            credit = row['Số tiền'] if row['TK Có'].startswith('131') else 0
            counter_acc = row['TK Có'] if row['TK Nợ'].startswith('131') else row['TK Nợ']
            running_bal = running_bal + debit - credit
            
            dt = row['Ngày hạch toán']
            dt_str = dt.strftime('%d/%m/%Y') if hasattr(dt, 'strftime') and not pd.isna(dt) else str(dt)

            detail_rows.append({
                'Ngày hạch toán': dt_str,
                'Ngày chứng từ': row['Ngày chứng từ'],
                'Số chứng từ': row['Số chứng từ'],
                'Diễn giải': row['Diễn giải'],
                'TK Đối ứng': counter_acc,
                'Nợ': debit, 'Có': credit, 'Số dư': running_bal,
                'Đối tượng': s
            })

    df_detail = pd.DataFrame(detail_rows)

    # 2. Generate 131_TONG_HOP
    summary_rows = []
    for s, bal in TARGETS_131.items():
        s_data = df_detail[df_detail['Đối tượng'] == s]
        debit = s_data['Nợ'].iloc[1:].sum() # Skip opening row
        credit = s_data['Có'].sum()
        
        summary_rows.append({
            'Tên khách hàng': s,
            'Số dư đầu kỳ': bal['start'],
            'Phát sinh Nợ (Bán)': debit,
            'Phát sinh Có (Thu)': credit,
            'Số dư cuối kỳ': bal['end']
        })
    
    df_summary = pd.DataFrame(summary_rows)
    totals = {
        'Tên khách hàng': 'TỔNG CỘNG',
        'Số dư đầu kỳ': df_summary['Số dư đầu kỳ'].sum(),
        'Phát sinh Nợ (Bán)': df_summary['Phát sinh Nợ (Bán)'].sum(),
        'Phát sinh Có (Thu)': df_summary['Phát sinh Có (Thu)'].sum(),
        'Số dư cuối kỳ': df_summary['Số dư cuối kỳ'].sum()
    }
    df_summary = pd.concat([df_summary, pd.DataFrame([totals])], ignore_index=True)

    print(f"Adding sheets to {so_sach_src}...")
    import openpyxl
    with pd.ExcelWriter(so_sach_src, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_detail.to_excel(writer, sheet_name='131_REBALANCED', index=False)
        df_summary.to_excel(writer, sheet_name='131_TONG_HOP', index=False)
        
    print("✅ SUCCESS: 131 sheets created/updated.")

if __name__ == "__main__":
    generate_131_sheets()
