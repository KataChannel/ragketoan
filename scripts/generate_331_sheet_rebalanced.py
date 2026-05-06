import pandas as pd
import os
from datetime import datetime

def generate_331_sheet():
    nkc_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    so_sach_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'
    
    TARGETS = {
        "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG": {"start": 326472500, "end": 436912740},
        "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG": {"start": 638745241, "end": 396245780},
        "Công ty TNHH Phân phối Synnex FPT": {"start": 236879120, "end": 596080295},
        "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN": {"start": 1823753260, "end": 945621340},
        "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q": {"start": 126532140, "end": 326457632},
        "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ": {"start": 973654272, "end": 863487320},
        "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ": {"start": 1632594212, "end": 1065246321},
        "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT": {"start": 628542724, "end": 546812347}
    }

    print("Reading rebalanced Journal...")
    df_nkc = pd.read_excel(nkc_src)
    
    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df_nkc['TK Nợ'] = df_nkc['TK Nợ'].apply(fmt_acc)
    df_nkc['TK Có'] = df_nkc['TK Có'].apply(fmt_acc)
    
    df_331 = df_nkc[(df_nkc['TK Nợ'].str.startswith('331')) | (df_nkc['TK Có'].str.startswith('331'))].copy()
    
    # Safely convert dates
    df_331['Ngày hạch toán'] = pd.to_datetime(df_331['Ngày hạch toán'], format='%d/%m/%Y', errors='coerce', dayfirst=True)
    df_331 = df_331.sort_values(by=['Đối tượng', 'Ngày hạch toán', 'Số chứng từ'])
    
    all_rows = []
    suppliers = df_331['Đối tượng'].unique()
    for s in suppliers:
        s_target = TARGETS.get(s, {"start": 0, "end": 0})
        all_rows.append({
            'Ngày hạch toán': '01/01/2023',
            'Ngày chứng từ': '01/01/2023',
            'Số chứng từ': '',
            'Diễn giải': f'SỐ DƯ ĐẦU KỲ - {s}',
            'TK Đối ứng': '',
            'Nợ': 0, 'Có': 0, 'Số dư': s_target['start'],
            'Đối tượng': s
        })
        
        running_bal = s_target['start']
        s_trans = df_331[df_331['Đối tượng'] == s]
        
        for _, row in s_trans.iterrows():
            debit = row['Số tiền'] if row['TK Nợ'].startswith('331') else 0
            credit = row['Số tiền'] if row['TK Có'].startswith('331') else 0
            counter_acc = row['TK Có'] if row['TK Nợ'].startswith('331') else row['TK Nợ']
            running_bal = running_bal + credit - debit
            
            # Safe strftime
            dt = row['Ngày hạch toán']
            dt_str = dt.strftime('%d/%m/%Y') if hasattr(dt, 'strftime') and not pd.isna(dt) else str(dt)

            all_rows.append({
                'Ngày hạch toán': dt_str,
                'Ngày chứng từ': row['Ngày chứng từ'],
                'Số chứng từ': row['Số chứng từ'],
                'Diễn giải': row['Diễn giải'],
                'TK Đối ứng': counter_acc,
                'Nợ': debit, 'Có': credit, 'Số dư': running_bal,
                'Đối tượng': s
            })

    df_final = pd.DataFrame(all_rows)
    print(f"Adding new sheet '331_REBALANCED' to {so_sach_src}...")
    import openpyxl
    with pd.ExcelWriter(so_sach_src, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_final.to_excel(writer, sheet_name='331_REBALANCED', index=False)
    print("✅ SUCCESS: Sheet '331_REBALANCED' created.")

if __name__ == "__main__":
    generate_331_sheet()
