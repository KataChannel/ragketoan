import pandas as pd

def create_simulated_report_131():
    source_file = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET TK 131 NĂM 2024 HV (1).xlsx'
    
    # Target global figures from user's image
    total_opening = 5045331182
    total_closing = 5835849554
    
    # Units that should have 0 Net change (stay at Opening)
    group_a = [
        'BỆNH VIỆN Y DƯỢC HOÀNG ANH GIA LAI',
        'CHI NHÁNH CÔNG TY TNHH TIN HỌC QUANG ANH',
        'BAN QUẢN LÝ RỪNG PHÒNG HỘ HÀ RA',
        'TRƯỜNG CAO ĐẲNG NGHỀ SỐ 21 - BQP',
        'CÔNG TY TNHH MỘT THÀNH VIÊN PCCC NGỌC MINH',
        'CÔNG TY CỔ PHẦN TRƯỜNG PHỔ THÔNG NGUYỄN VĂN LINH GIA LAI',
        'CÔNG TY TNHH TIN HỌC QUANG ANH GL',
        'BINH ĐOÀN 15 - CÔNG TY TNHH MTV TỔNG CÔNG TY 15'
    ]
    
    # Units with specific Net change targets (Asset Debit increases)
    group_b_targets = {
        'CÔNG TY TNHH TƯ VẤN THIẾT KẾ ĐẦU TƯ VÀ XÂY DỰNG PHÚ THỊNH GIA': 232164810,
        'XÍ NGHIỆP KHẢO SÁT THIẾT KẾ - CHI NHÁNH TỔNG CÔNG TY 15': 125679032,
        'CHI NHÁNH CÔNG TY CỔ PHẦN XĂNG DẦU DẦU KHÍ PVOIL MIỀN TRUNG TẠI GIA LAI': 432674530
    }
    
    def get_group(desc):
        desc_u = str(desc).upper()
        for k in group_b_targets.keys():
            if k.upper() in desc_u: return 'B', k
        for k in group_a:
            if k.upper() in desc_u: return 'A', None
        return 'X', None # Other

    # 1. Read source
    df_src = pd.read_excel(source_file, sheet_name='131')
    df_src = df_src.dropna(subset=['Ngày hạch toán'])
    
    processed_rows = []
    
    # 2. Initial Process
    for _, r in df_src.iterrows():
        n_val = int(r['Phát sinh Nợ'] or 0)
        c_val = int(r['Phát sinh Có'] or 0)
        
        group, key = get_group(r['Diễn giải'])
        
        # 'Triệt tiêu' turnover for Group A and Others (Zero out)
        if group != 'B':
            n_val = 0
            c_val = 0
        
        processed_rows.append({
            'Ngày hạch toán': r['Ngày hạch toán'],
            'Số chứng từ': r['Số chứng từ'],
            'Diễn giải': r['Diễn giải'],
            'TK Đối ứng': r['TK Đối ứng'],
            'Phát sinh Nợ': n_val,
            'Phát sinh Có': c_val,
            '_group': group,
            '_key': key
        })
        
    df_processed = pd.DataFrame(processed_rows)
    df_processed = df_processed.sort_values(['Ngày hạch toán', 'Số chứng từ'])
    
    # 3. Distribute Unit-Specific Targets for Group B
    for key, target_net in group_b_targets.items():
        unit_indices = df_processed[df_processed['_key'] == key].index.tolist()
        if not unit_indices: continue
        
        curr_net = df_processed.loc[unit_indices, 'Phát sinh Nợ'].sum() - df_processed.loc[unit_indices, 'Phát sinh Có'].sum()
        diff = int(target_net - curr_net)
        
        if diff != 0:
            adj = diff // len(unit_indices)
            rem = diff % len(unit_indices)
            for i, idx in enumerate(unit_indices):
                extra = adj + (1 if i < rem else 0)
                df_processed.at[idx, 'Phát sinh Nợ'] += extra
            
    # 4. Build Final Sequence
    final_output = []
    
    # Header Row
    final_output.append({
        'Ngày hạch toán': None, 'Số chứng từ': 'ĐẦU KỲ', 'Diễn giải': 'SỐ DƯ ĐẦU KỲ TỔNG HỢP (TK 131)',
        'TK Đối ứng': '', 'Đầu kỳ': int(total_opening), 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 'Cuối kỳ': int(total_opening)
    })
    
    rb = int(total_opening)
    for _, r in df_processed.iterrows():
        row_op = rb
        n_p = int(r['Phát sinh Nợ'])
        c_p = int(r['Phát sinh Có'])
        rb += (n_p - c_p)
        final_output.append({
            'Ngày hạch toán': r['Ngày hạch toán'], 'Số chứng từ': r['Số chứng từ'], 
            'Diễn giải': r['Diễn giải'], 'TK Đối ứng': r['TK Đối ứng'],
            'Đầu kỳ': row_op, 'Phát sinh Nợ': n_p, 'Phát sinh Có': c_p, 'Cuối kỳ': rb
        })
        
    df_final = pd.DataFrame(final_output)
    
    # 5. Build Summary Sheet '131_Dieukien'
    summary_rows = []
    # All priority units from A and B
    all_priority_names = group_a + list(group_b_targets.keys())
    for name in all_priority_names:
        # For Group B, we know the target Net
        # For Group A, Net is 0
        net = group_b_targets.get(name, 0)
        # We need an "Opening" for each - let's find it from the context if possible, 
        # but the simplest is just to show Name, Net, and move on.
        # Actually, let's just use the values from the image provided earlier.
        summary_rows.append({
            'Tên khách hàng': name,
            'Phát sinh Nợ': net if net > 0 else 0,
            'Phát sinh Có': abs(net) if net < 0 else 0,
        })
    df_summary = pd.DataFrame(summary_rows)

    # 6. Save to new sheets
    with pd.ExcelWriter(source_file, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_final.to_excel(writer, sheet_name='131_BC_Moi', index=False)
        df_summary.to_excel(writer, sheet_name='131_Dieukien', index=False)
        
    print(f"Report '131_BC_Moi' and '131_Dieukien' generated successfully. Final Balance: {rb}")
        
    print(f"Report '131_BC_Moi' generated successfully. Final Balance: {rb}")

if __name__ == '__main__':
    create_simulated_report_131()
