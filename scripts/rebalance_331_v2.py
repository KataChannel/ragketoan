import pandas as pd
import os
import shutil
import random
from datetime import datetime

def rebalance_331_pro_varied():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    backup = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx.bak'
    
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

    print(f"Restoring original data from {backup}...")
    df = pd.read_excel(backup)

    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)

    df_no_331 = df[~(df['TK Nợ'].str.startswith('331') | df['TK Có'].str.startswith('331'))].copy()
    df_331_buys = df[df['TK Có'].str.startswith('331')].copy()
    
    new_rows = []
    for s, bal in TARGETS.items():
        my_buys = df_331_buys[df_331_buys['Đối tượng'] == s]
        total_buy = my_buys['Số tiền'].sum()
        
        if total_buy < 100000000:
            extra_buy = 400000000
            months = random.sample(range(1, 13), 4)
            for m in months:
                amt = round(extra_buy / 4 * random.uniform(0.7, 1.3))
                date = datetime(2023, m, random.randint(10, 25))
                new_rows.append({
                    'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'AUTO_BUY',
                    'Diễn giải': f'Mua hàng, hàng hóa theo hóa đơn - {s}',
                    'TK Nợ': '1561', 'TK Có': '331', 'Số tiền': round(amt / 1.1), 'Đối tượng': s
                })
                new_rows.append({
                    'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'AUTO_BUY',
                    'Diễn giải': f'Thuế GTGT đầu vào - {s}',
                    'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': round(amt / 1.1 * 0.1), 'Đối tượng': s
                })
            total_buy += extra_buy
        else:
            for _, row in my_buys.iterrows():
                new_rows.append(row.to_dict())

        total_pay_needed = bal['start'] + total_buy - bal['end']
        pay_count = random.randint(12, 18)
        factors = [max(0.3, random.normalvariate(1.0, 0.5)) for _ in range(pay_count)]
        s_fact = sum(factors)
        pay_amts = [round(total_pay_needed * f / s_fact) for f in factors]
        pay_amts[-1] = total_pay_needed - sum(pay_amts[:-1])
        
        for i in range(pay_count):
            month = (i % 12) + 1
            date = datetime(2023, month, random.randint(5, 28))
            new_rows.append({
                'Ngày hạch toán': date, 'Ngày chứng từ': date, 'Số chứng từ': f'UNC_CK',
                'Diễn giải': f'Chuyển khoản trả tiền hàng cho {s}',
                'TK Nợ': '331', 'TK Có': '112', 'Số tiền': pay_amts[i], 'Đối tượng': s
            })

    others_buys = df_331_buys[~df_331_buys['Đối tượng'].isin(TARGETS)]
    for _, row in others_buys.iterrows():
        new_rows.append(row.to_dict())
        new_rows.append({
            'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'],
            'Số chứng từ': 'MATCH_PAY', 'Diễn giải': f'Thanh toán tiền hàng cho {row["Đối tượng"]}',
            'TK Nợ': '331', 'TK Có': '1111', 'Số tiền': row['Số tiền'], 'Đối tượng': row['Đối tượng']
        })

    df_new = pd.DataFrame(new_rows)
    # Safely convert to datetime
    df_no_331['Ngày hạch toán'] = pd.to_datetime(df_no_331['Ngày hạch toán'], errors='coerce')
    df_new['Ngày hạch toán'] = pd.to_datetime(df_new['Ngày hạch toán'], errors='coerce')
    
    df_final = pd.concat([df_no_331, df_new], ignore_index=True)
    
    # Sort after ensuring all can be sorted (drop NaT for sorting if any, or handle them)
    df_final = df_final.sort_values(by=['Ngày hạch toán', 'Số chứng từ'])

    def safe_strftime(x):
        if pd.isna(x): return ""
        if hasattr(x, 'strftime'): return x.strftime('%d/%m/%Y')
        return str(x)

    df_final['Ngày hạch toán'] = df_final['Ngày hạch toán'].apply(safe_strftime)
    df_final['Ngày chứng từ'] = df_final['Ngày chứng từ'].apply(safe_strftime)

    df_final.to_excel(src, index=False)
    print(f"✅ Rebalanced 331 with NATURAL VARIATION saved to {src}")

if __name__ == "__main__":
    rebalance_331_pro_varied()
