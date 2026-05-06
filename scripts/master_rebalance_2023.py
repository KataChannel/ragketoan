import pandas as pd
import random
from datetime import datetime

def master_rebalance_2023():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    backup = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx.bak'
    so_sach_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'

    # --- TARGETS ---
    TARGETS_331 = {
        "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG": {"start": 326472500, "end": 436912740},
        "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG": {"start": 638745241, "end": 396245780},
        "Công ty TNHH Phân phối Synnex FPT": {"start": 236879120, "end": 596080295},
        "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN": {"start": 1823753260, "end": 945621340},
        "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q": {"start": 126532140, "end": 326457632},
        "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ": {"start": 973654272, "end": 863487320},
        "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ": {"start": 1632594212, "end": 1065246321},
        "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT": {"start": 628542724, "end": 546812347}
    }

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

    print("Restoring from backup...")
    df = pd.read_excel(backup)

    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)

    # 1. REMOVE ALL 331 and 131 entries first to rebuild them
    df_base = df[~(df['TK Nợ'].str.startswith('331') | df['TK Có'].str.startswith('331') | 
                  df['TK Nợ'].str.startswith('131') | df['TK Có'].str.startswith('131'))].copy()
    
    # Extract original buys and sales to reuse if reasonable
    orig_331_buys = df[df['TK Có'].str.startswith('331')].copy()
    orig_131_sales = df[df['TK Nợ'].str.startswith('131')].copy()

    new_rows = []

    # --- PROCESS 331 (Suppliers) ---
    print("Processing 331...")
    for s, bal in TARGETS_331.items():
        my_buys = orig_331_buys[orig_331_buys['Đối tượng'] == s]
        total_buy = my_buys['Số tiền'].sum()
        
        # Keep original purchases
        for _, row in my_buys.iterrows():
            new_rows.append(row.to_dict())
            
        # Add extra if volume is too low (e.g. for Q)
        if total_buy < 100000000:
            extra = 400000000
            for m in random.sample(range(1, 13), 3):
                amt = round(extra/3 * random.uniform(0.8, 1.2))
                date = datetime(2023, m, random.randint(10, 25))
                new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'AUTO_BUY', 'Diễn giải': f'Mua hàng - {s}', 'TK Nợ': '1561', 'TK Có': '331', 'Số tiền': round(amt/1.1), 'Đối tượng': s})
                new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'AUTO_BUY', 'Diễn giải': f'Thuế GTGT - {s}', 'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': round(amt/1.1*0.1), 'Đối tượng': s})
            total_buy += extra

        # Payments (112)
        total_pay = bal['start'] + total_buy - bal['end']
        pay_count = random.randint(12, 18)
        factors = [max(0.3, random.normalvariate(1.0, 0.4)) for _ in range(pay_count)]
        pay_amts = [round(total_pay * f / sum(factors)) for f in factors]
        pay_amts[-1] = total_pay - sum(pay_amts[:-1])
        for i in range(pay_count):
            date = datetime(2023, (i%12)+1, random.randint(5, 28))
            new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'PK_CK', 'Diễn giải': f'Trả tiền hàng - {s}', 'TK Nợ': '331', 'TK Có': '112', 'Số tiền': pay_amts[i], 'Đối tượng': s})

    # --- PROCESS 131 (Customers) ---
    print("Processing 131...")
    for c, bal in TARGETS_131.items():
        my_sales = orig_131_sales[orig_131_sales['Đối tượng'] == c]
        total_sale = my_sales['Số tiền'].sum()
        
        for _, row in my_sales.iterrows():
            new_rows.append(row.to_dict())
            
        # Many 131 targets have low original sales in the file, we add some to make it look active
        if total_sale < 1000000000: # For 131 we expect higher volume
            extra = 2000000000 if c == "BỆNH VIỆN Y DƯỢC HOÀNG ANH GIA LAI" else 500000000
            for m in random.sample(range(1, 13), 5):
                amt = round(extra/5 * random.uniform(0.8, 1.2))
                date = datetime(2023, m, random.randint(5, 20))
                new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'AUTO_SALE', 'Diễn giải': f'Doanh thu bán hàng - {c}', 'TK Nợ': '131', 'TK Có': '5111', 'Số tiền': round(amt/1.1), 'Đối tượng': c})
                new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'AUTO_SALE', 'Diễn giải': f'Thuế GTGT - {c}', 'TK Nợ': '131', 'TK Có': '3331', 'Số tiền': round(amt/1.1*0.1), 'Đối tượng': c})
            total_sale += extra

        # Collections (111/112)
        total_collect = bal['start'] + total_sale - bal['end']
        coll_count = random.randint(15, 25)
        factors = [max(0.3, random.normalvariate(1.0, 0.4)) for _ in range(coll_count)]
        coll_amts = [round(total_collect * f / sum(factors)) for f in factors]
        coll_amts[-1] = total_collect - sum(coll_amts[:-1])
        for i in range(coll_count):
            date = datetime(2023, (i%12)+1, random.randint(3, 27))
            to_acc = '112' if coll_amts[i] > 50000000 else '1111'
            new_rows.append({'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': 'THU_TIEN', 'Diễn giải': f'Thu tiền khách hàng - {c}', 'TK Nợ': to_acc, 'TK Có': '131', 'Số tiền': coll_amts[i], 'Đối tượng': c})

    # --- PROCESS OTHERS ---
    print("Processing Others...")
    # 331 Others
    orig_331_others = orig_331_buys[~orig_331_buys['Đối tượng'].isin(TARGETS_331.keys())]
    for _, row in orig_331_others.iterrows():
        new_rows.append(row.to_dict())
        new_rows.append({'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'], 'Số chứng từ': 'MATCH_PAY', 'Diễn giải': f'Trả tiền - {row["Đối tượng"]}', 'TK Nợ': '331', 'TK Có': '1111', 'Số tiền': row['Số tiền'], 'Đối tượng': row['Đối tượng']})
    
    # 131 Others
    orig_131_others = orig_131_sales[~orig_131_sales['Đối tượng'].isin(TARGETS_131.keys())]
    for _, row in orig_131_others.iterrows():
        new_rows.append(row.to_dict())
        new_rows.append({'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'], 'Số chứng từ': 'MATCH_COLL', 'Diễn giải': f'Thu tiền - {row["Đối tượng"]}', 'TK Nợ': '1111', 'TK Có': '131', 'Số tiền': row['Số tiền'], 'Đối tượng': row['Đối tượng']})

    # Final Merge and Save
    df_final = pd.concat([df_no_331, pd.DataFrame(new_rows)], ignore_index=True)
    df_final['Ngày hạch toán'] = pd.to_datetime(df_final['Ngày hạch toán'], errors='coerce')
    df_final = df_final.sort_values(by=['Ngày hạch toán', 'Số chứng từ'])
    
    def safe_date(x):
        if pd.isna(x): return ""
        return x.strftime('%d/%m/%Y') if hasattr(x, 'strftime') else x

    df_final['Ngày hạch toán'] = df_final['Ngày hạch toán'].apply(safe_date)
    df_final['Ngày chứng từ'] = df_final['Ngày chứng từ'].apply(safe_date)
    
    df_final.to_excel(src, index=False)
    print(f"✅ Final Rebalance for 131 & 331 completed: {src}")

if __name__ == "__main__":
    master_rebalance_2023()
