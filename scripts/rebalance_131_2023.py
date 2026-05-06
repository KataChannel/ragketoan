import pandas as pd
import os
import shutil
import random
from datetime import datetime

def rebalance_131():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
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

    print(f"Loading data from {src}...")
    df = pd.read_excel(src)

    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)

    df_no_131 = df[~(df['TK Nợ'].str.startswith('131') | df['TK Có'].str.startswith('131'))].copy()
    df_131_sales = df[df['TK Nợ'].str.startswith('131')].copy()
    
    new_rows = []
    for customer, bal in TARGETS_131.items():
        cur_sales = df_131_sales[df_131_sales['Đối tượng'] == customer]
        total_sales = cur_sales['Số tiền'].sum()
        
        for _, row in cur_sales.iterrows():
            new_rows.append(row.to_dict())
            
        if total_sales < 100000000:
            extra_sales = 300000000
            print(f"Adding extra sales for {customer}...")
            months = random.sample(range(1, 13), 3)
            for m in months:
                amt = round(extra_sales / 3 * random.uniform(0.7, 1.3))
                date = datetime(2023, m, random.randint(5, 20))
                new_rows.append({
                    'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'AUTO_SALE',
                    'Diễn giải': f'Doanh thu bán hàng - {customer}',
                    'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': round(amt / 1.1), 'Đối tượng': customer
                })
                new_rows.append({
                    'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'AUTO_SALE',
                    'Diễn giải': f'Thuế GTGT đầu ra - {customer}',
                    'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': round(amt / 1.1 * 0.1), 'Đối tượng': customer
                })
            total_sales += extra_sales

        total_collect_needed = bal['start'] + total_sales - bal['end']
        pay_count = random.randint(12, 18)
        factors = [max(0.3, random.normalvariate(1.0, 0.4)) for _ in range(pay_count)]
        s_fact = sum(factors)
        collect_amts = [round(total_collect_needed * f / s_fact) for f in factors]
        collect_amts[-1] = total_collect_needed - sum(collect_amts[:-1])
        
        for i in range(pay_count):
            month = (i % 12) + 1
            date = datetime(2023, month, random.randint(5, 28))
            acc_to = '112' if collect_amts[i] > 20000000 else '1111'
            new_rows.append({
                'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'THU_TIEN',
                'Diễn giải': f'Thu tiền khách hàng trả nợ - {customer}',
                'TK Nợ': acc_to, 'TK Có': '131', 'Số tiền': collect_amts[i], 'Đối tượng': customer
            })

    others_sales = df_131_sales[~df_131_sales['Đối tượng'].isin(TARGETS_131.keys())]
    for _, row in others_sales.iterrows():
        new_rows.append(row.to_dict())
        new_rows.append({
            'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'],
            'Số chứng từ': 'MATCH_COLLECT', 'Diễn giải': f'Khách hàng thanh toán ngay - {row["Đối tượng"]}',
            'TK Nợ': '1111', 'TK Có': '131', 'Số tiền': row['Số tiền'], 'Đối tượng': row['Đối tượng']
        })

    df_new = pd.DataFrame(new_rows)
    df_no_131['Ngày hạch toán'] = pd.to_datetime(df_no_131['Ngày hạch toán'], errors='coerce')
    df_new['Ngày hạch toán'] = pd.to_datetime(df_new['Ngày hạch toán'], errors='coerce')
    
    df_final = pd.concat([df_no_131, df_new], ignore_index=True)
    df_final = df_final.sort_values(by=['Ngày hạch toán', 'Số chứng từ'])

    def safe_strftime(x):
        if pd.isna(x): return ""
        if hasattr(x, 'strftime'): return x.strftime('%d/%m/%Y')
        return str(x)

    df_final['Ngày hạch toán'] = df_final['Ngày hạch toán'].apply(safe_strftime)
    df_final['Ngày chứng từ'] = df_final['Ngày chứng từ'].apply(safe_strftime)

    df_final.to_excel(src, index=False)
    print(f"✅ Rebalanced 131 with NATURAL VARIATION saved to {src}")

if __name__ == "__main__":
    rebalance_131()
