import pandas as pd
import os
import shutil
from datetime import datetime

def rebalance_331():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    backup = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL_BEFORE_331_REBALANCE_PRO.xlsx'

    if not os.path.exists(backup):
        shutil.copy2(src, backup)
        print(f"Backup created at {backup}")

    # Target Data from User's Screenshots
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

    print("Loading data...")
    df = pd.read_excel(src)

    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]

    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)

    # 1. Capture current total purchase volume for the 8 targets
    current_buys = {}
    for s in TARGETS:
        # We look for rows where Có 331 and Đối tượng is this supplier
        buys = df[(df['TK Có'].str.startswith('331')) & (df['Đối tượng'] == s)]['Số tiền'].sum()
        if buys == 0:
            # Estimate a reasonable purchase volume if currently zero (like for Supplier Q)
            # Volume = Net Increase + some baseline, let's say 400m
            diff = TARGETS[s]['end'] - TARGETS[s]['start']
            buys = max(diff, 0) + 200000000 
        current_buys[s] = buys

    print("Cleaning up old 331 entries...")
    # Remove ALL rows related to 331 (Nợ or Có) for EVERYONE
    # We will regenerate them all to ensure 8 targets are distributed and others are zeroed.
    # Note: We keep the original 'Others' purchases to redistribute them as matched pairs.
    others_buys_df = df[(df['TK Có'].str.startswith('331')) & (~df['Đối tượng'].isin(TARGETS))].copy()
    
    # Filter df to REMOVE all 331-related rows
    df_clean = df[~(df['TK Nợ'].str.startswith('331') | df['TK Có'].str.startswith('331'))].copy()

    new_rows = []
    
    # 2. Regenerate for 8 Targets (Distributed Jan-Dec)
    print("Generating distributed entries for 8 targets...")
    for s, bal in TARGETS.items():
        total_buy = current_buys[s]
        total_pay = bal['start'] + total_buy - bal['end']
        
        for m in range(1, 13):
            # Purchase (Nợ 1561, 1331 / Có 331) - Split base and VAT
            buy_m = total_buy / 12
            base_m = round(buy_m / 1.1)
            vat_m = round(buy_m - base_m)
            
            # Row Purchase Base
            new_rows.append({
                'Ngày hạch toán': datetime(2023, m, 25),
                'Ngày chứng từ': datetime(2023, m, 25),
                'Số chứng từ': f'PB_BUY_{m:02d}',
                'Diễn giải': f'Mua hàng, hàng hóa tháng {m} - {s}',
                'TK Nợ': '1561', 'TK Có': '331', 'Số tiền': base_m, 'Đối tượng': s
            })
            # Row Purchase VAT
            new_rows.append({
                'Ngày hạch toán': datetime(2023, m, 25),
                'Ngày chứng từ': datetime(2023, m, 25),
                'Số chứng từ': f'PB_BUY_{m:02d}',
                'Diễn giải': f'Thuế GTGT đầu vào tháng {m} - {s}',
                'TK Nợ': '1331', 'TK Có': '331', 'Số tiền': vat_m, 'Đối tượng': s
            })
            
            # Payment (Nợ 331 / Có 112) - Spread evenly
            pay_m = round(total_pay / 12)
            new_rows.append({
                'Ngày hạch toán': datetime(2023, m, 28),
                'Ngày chứng từ': datetime(2023, m, 28),
                'Số chứng từ': f'PB_PAY_{m:02d}',
                'Diễn giải': f'Chuyển khoản trả tiền hàng tháng {m} cho {s}',
                'TK Nợ': '331', 'TK Có': '112', 'Số tiền': pay_m, 'Đối tượng': s
            })

    # 3. Regenerate for Others (Match and Pay)
    print("Matching and zeroing out other suppliers...")
    for _, row in others_buys_df.iterrows():
        # Add the original purchase
        new_rows.append(row.to_dict())
        # Add the matching payment (Cash 1111)
        new_rows.append({
            'Ngày hạch toán': row['Ngày hạch toán'],
            'Ngày chứng từ': row['Ngày chứng từ'],
            'Số chứng từ': 'MATCH_PAY',
            'Diễn giải': f"Chi trả tiền mặt cho {row['Đối tượng']}",
            'TK Nợ': '331', 'TK Có': '1111', 'Số tiền': row['Số tiền'], 'Đối tượng': row['Đối tượng']
        })

    # 4. Final Merge and Sort
    print("Merging and sorting...")
    new_df = pd.DataFrame(new_rows)
    
    # Ensure date objects
    df_clean['Ngày hạch toán'] = pd.to_datetime(df_clean['Ngày hạch toán'], errors='coerce')
    new_df['Ngày hạch toán'] = pd.to_datetime(new_df['Ngày hạch toán'], errors='coerce')
    
    df_final = pd.concat([df_clean, new_df], ignore_index=True)
    df_final = df_final.sort_values(by=['Ngày hạch toán', 'Số chứng từ'])

    # Format dates back to string for Excel
    df_final['Ngày hạch toán'] = df_final['Ngày hạch toán'].dt.strftime('%d/%m/%Y')
    df_final['Ngày chứng từ'] = df_final['Ngày chứng từ'].apply(lambda x: x.strftime('%d/%m/%Y') if hasattr(x, 'strftime') else x)

    df_final.to_excel(src, index=False)
    print(f"✅ SUCCESS: Rebalanced 331 for 2023. Saved to {src}")

if __name__ == "__main__":
    rebalance_331()
