import pandas as pd

def create_331_comparison_report():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    
    # 1. Get targets from 'Tổng hợp 331'
    df_targets = pd.read_excel(file_path, sheet_name='Tổng hợp 331')
    # Filter for the 11 priority units (usually the ones at the top with numbers)
    # TÊN NHÀ CUNG CẤP, SỐ DƯ ĐẦU KỲ, CUỐI KỲ
    
    priority_rows = []
    # Identify priority units (those with non-zero opening or closing in the target sheet)
    for _, r in df_targets.iterrows():
        name = str(r['TÊN NHÀ CUNG CẤP'])
        op = int(r['SỐ DƯ ĐẦU KỲ'] or 0)
        cl = int(r['CUỐI KỲ'] or 0)
        if op != 0 or cl != 0:
            # Calculate Debit/Credit to bridge Opening to Closing
            # Note: 331 is Liability (Credit normal)
            # Opening (C) - Debit + Credit = Closing (C)
            # So: Credit - Debit = Closing - Opening
            diff = cl - op
            n_val = 0
            c_val = 0
            if diff > 0:
                c_val = diff
            else:
                n_val = abs(diff)
                
            priority_rows.append({
                'Tên khách hàng/Nhà cung cấp': name,
                'Số dư đầu kỳ': op,
                'Phát sinh Nợ': n_val,
                'Phát sinh Có': c_val,
                'Số dư cuối kỳ': cl
            })
            
    # Add a Total Row for priority units
    df_p = pd.DataFrame(priority_rows)
    total_row = {
        'Tên khách hàng/Nhà cung cấp': 'TỔNG CỘNG',
        'Số dư đầu kỳ': df_p['Số dư đầu kỳ'].sum(),
        'Phát sinh Nợ': df_p['Phát sinh Nợ'].sum(),
        'Phát sinh Có': df_p['Phát sinh Có'].sum(),
        'Số dư cuối kỳ': df_p['Số dư cuối kỳ'].sum()
    }
    df_p = pd.concat([df_p, pd.DataFrame([total_row])], ignore_index=True)

    # 2. Save to new sheet '331_Dieukien'
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_p.to_excel(writer, sheet_name='331_Dieukien', index=False)
        
    print("Summary sheet '331_Dieukien' created successfully.")

if __name__ == '__main__':
    create_331_comparison_report()
