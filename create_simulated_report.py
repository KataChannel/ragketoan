import pandas as pd

def create_clean_continuous_ledger():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    master_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
    
    total_opening = 5176863775
    total_closing = 4632756100
    
    # Target units names list (to keep real transactions for them)
    target_names = [
        'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA', 'CÔNG TY TNHH THẢO NHIÊN',
        'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN', 'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG',
        'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG', 'Công ty TNHH Phân phối Synnex FPT',
        'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN', 'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q',
        'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ', 'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ',
        'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT'
    ]
    
    # 1. Read Master
    df_src = pd.read_excel(master_path, sheet_name='331')
    df_src = df_src[df_src['TK Đối ứng'] != 911].dropna(subset=['Ngày hạch toán'])
    
    def is_target(desc):
        desc_u = str(desc).upper()
        for t in target_names:
            if t.upper() in desc_u: return True
        return False

    processed_rows = []
    
    # 2. Process transactions
    for _, r in df_src.iterrows():
        n_val = r['Phát sinh Nợ'] or 0
        c_val = r['Phát sinh Có'] or 0
        
        # If NOT a target unit, 'triệt tiêu' (Zero out turnover)
        if not is_target(r['Diễn giải']):
            n_val = 0
            c_val = 0
        
        processed_rows.append({
            'Ngày hạch toán': r['Ngày hạch toán'],
            'Số chứng từ': r['Số chứng từ'],
            'Diễn giải': r['Diễn giải'],
            'TK Đối ứng': r['TK Đối ứng'],
            'Phát sinh Nợ': n_val,
            'Phát sinh Có': c_val
        })
        
    df_processed = pd.DataFrame(processed_rows)
    # Sort chronologically
    df_processed = df_processed.sort_values(['Ngày hạch toán', 'Số chứng từ'])
    
    # Prepare columns for integer math
    df_processed['Phát sinh Nợ'] = df_processed['Phát sinh Nợ'].fillna(0).astype(int)
    df_processed['Phát sinh Có'] = df_processed['Phát sinh Có'].astype(int) # already processed
    
    # 3. Calculate Variance and Distribute
    # Identify indices of priority rows
    priority_indices = df_processed[df_processed['Diễn giải'].apply(is_target)].index.tolist()
    
    # Calculate current rb without adjustment (using integers)
    initial_sum_debit = df_processed['Phát sinh Nợ'].sum()
    initial_sum_credit = df_processed['Phát sinh Có'].sum()
    temp_rb = total_opening + (initial_sum_credit - initial_sum_debit)
    diff = int(total_closing - temp_rb)
    
    if len(priority_indices) > 0 and diff != 0:
        adj_per_row = diff // len(priority_indices)
        remainder = diff % len(priority_indices)
        
        # Apply adjustment to priority rows
        for i, idx in enumerate(priority_indices):
            extra = adj_per_row + (1 if i < remainder else 0)
            df_processed.at[idx, 'Phát sinh Có'] += extra
            
    # 4. Build Final Sequence with Continuous Balance
    final_output = []
    
    # Header Row
    final_output.append({
        'Ngày hạch toán': None, 'Số chứng từ': 'ĐẦU KỲ', 'Diễn giải': 'SỐ DƯ ĐẦU KỲ TỔNG HỢP (TK 331)',
        'TK Đối ứng': '', 'Đầu kỳ': int(total_opening), 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 'Cuối kỳ': int(total_opening)
    })
    
    rb = int(total_opening)
    for _, r in df_processed.iterrows():
        row_op = rb
        n_p = int(r['Phát sinh Nợ'] or 0)
        c_p = int(r['Phát sinh Có'] or 0)
        rb += (c_p - n_p)
        final_output.append({
            'Ngày hạch toán': r['Ngày hạch toán'], 'Số chứng từ': r['Số chứng từ'], 
            'Diễn giải': r['Diễn giải'], 'TK Đối ứng': r['TK Đối ứng'],
            'Đầu kỳ': row_op, 'Phát sinh Nợ': n_p, 'Phát sinh Có': c_p, 'Cuối kỳ': rb
        })
        
    df_final = pd.DataFrame(final_output)
    
    # Save
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_final.to_excel(writer, sheet_name='331_BC_Moi', index=False)
        
    print("Continuous ledger '331_BC_Moi' rebuilt successfully without messy top rows.")

if __name__ == '__main__':
    create_clean_continuous_ledger()
