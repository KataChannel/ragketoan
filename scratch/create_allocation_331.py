import pandas as pd
import re
from openpyxl import load_workbook

def get_vendor_full(desc):
    if pd.isna(desc): return 'Chưa phân loại'
    match = re.search(r'NB:\s*(.+)', str(desc))
    if match: return match.group(1).strip()
    return 'Chưa phân loại'

def create_allocation_sheet():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    df = pd.read_excel(file_path, sheet_name='331')

    # 1. Image Data: Target Units and their Opening balances
    targets_info = {
        'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA': 0,
        'CÔNG TY TNHH THẢO NHIÊN': 0,
        'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN': 0,
        'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG': 436912740,
        'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG': 396245780,
        'Công ty TNHH Phân phối Synnex FPT': 596080295,
        'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN': 945621340,
        'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q': 326457632,
        'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ': 863487320,
        'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ': 1065246321,
        'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT': 546812347
    }

    # 2. Pre-process ledger
    df_clean = df.copy()
    # Filter out 911 rows as they are closing/offset entries
    df_clean = df_clean[df_clean['TK Đối ứng'] != 911]
    # Filter out rows with no date (Opening/Total)
    df_clean = df_clean.dropna(subset=['Ngày hạch toán'])

    # 3. Assign Vendor
    # Sort targets by length descending to avoid substring issues (e.g., matching 'TG Số' instead of 'TG Số Đà Nẵng')
    sorted_targets = sorted(targets_info.keys(), key=len, reverse=True)

    def map_to_target(desc):
        if pd.isna(desc): return 'Chưa phân loại'
        desc_str = str(desc).upper()
        # First try to find target in description
        for t in sorted_targets:
            if t.upper() in desc_str:
                return t
        # If not, try to extract vendor via "NB:"
        match = re.search(r'NB:\s*(.+)', str(desc))
        if match:
            vendor = match.group(1).strip()
            for t in sorted_targets:
                if t.upper() in vendor.upper():
                    return t
            return vendor
        return 'Chưa phân loại'

    df_clean['Nhà cung cấp'] = df_clean['Diễn giải'].apply(map_to_target)

    # 4. Create the allocated data structures
    allocated_rows = []
    
    # Process 11 target vendors first
    for vendor in targets_info.keys():
        v_df = df_clean[df_clean['Nhà cung cấp'] == vendor].copy()
        v_df = v_df.sort_values('Ngày hạch toán')
        
        opening = targets_info[vendor]
        
        # Opening row
        allocated_rows.append({
            'Nhà cung cấp': vendor,
            'Ngày hạch toán': None,
            'Số chứng từ': 'ĐẦU KỲ',
            'Diễn giải': f'Dư đầu kỳ: {vendor}',
            'TK Đối ứng': None,
            'Phát sinh Nợ': 0,
            'Phát sinh Có': 0,
            'Số dư': opening
        })
        
        running_balance = opening
        for _, row in v_df.iterrows():
            debit = row['Phát sinh Nợ'] if not pd.isna(row['Phát sinh Nợ']) else 0
            credit = row['Phát sinh Có'] if not pd.isna(row['Phát sinh Có']) else 0
            running_balance += (credit - debit)
            
            allocated_rows.append({
                'Nhà cung cấp': vendor,
                'Ngày hạch toán': row['Ngày hạch toán'],
                'Số chứng từ': row['Số chứng từ'],
                'Diễn giải': row['Diễn giải'],
                'TK Đối ứng': row['TK Đối ứng'],
                'Phát sinh Nợ': debit,
                'Phát sinh Có': credit,
                'Số dư': running_balance
            })
            
    # Process Others
    others = df_clean[~df_clean['Nhà cung cấp'].isin(targets_info.keys())]
    other_vendors = others['Nhà cung cấp'].unique()
    
    for vendor in other_vendors:
        v_df = others[others['Nhà cung cấp'] == vendor].copy()
        v_df = v_df.sort_values('Ngày hạch toán')
        
        if v_df['Phát sinh Nợ'].sum() == 0 and v_df['Phát sinh Có'].sum() == 0:
            continue
            
        allocated_rows.append({
            'Nhà cung cấp': vendor,
            'Ngày hạch toán': None,
            'Số chứng từ': 'ĐẦU KỲ',
            'Diễn giải': f'Dư đầu kỳ: {vendor}',
            'TK Đối ứng': None,
            'Phát sinh Nợ': 0,
            'Phát sinh Có': 0,
            'Số dư': 0
        })
        
        rb = 0
        for _, row in v_df.iterrows():
            debit = row['Phát sinh Nợ'] if not pd.isna(row['Phát sinh Nợ']) else 0
            credit = row['Phát sinh Có'] if not pd.isna(row['Phát sinh Có']) else 0
            rb += (credit - debit)
            
            allocated_rows.append({
                'Nhà cung cấp': vendor,
                'Ngày hạch toán': row['Ngày hạch toán'],
                'Số chứng từ': row['Số chứng từ'],
                'Diễn giải': row['Diễn giải'],
                'TK Đối ứng': row['TK Đối ứng'],
                'Phát sinh Nợ': debit,
                'Phát sinh Có': credit,
                'Số dư': rb
            })

    # Save
    df_output = pd.DataFrame(allocated_rows)
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_output.to_excel(writer, sheet_name='Phân bổ', index=False)
    print(f"Updated sheet 'Phân bổ' in {file_path}")

if __name__ == '__main__':
    create_allocation_sheet()
