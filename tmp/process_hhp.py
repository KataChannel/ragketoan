import pandas as pd
import numpy as np
import os
import re

file_path = '/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx'
output_dir = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat'

def clean_name(name):
    if not isinstance(name, str):
        return 'UNKNOWN'
    name = name.strip().upper()
    name = ' '.join(name.split())
    name = name.replace('(KM)', '').replace('KM ', '').strip()
    return name

def group_item(name):
    """Aggressively groups items to reduce total unique count."""
    # 1. Brands/Identifiers
    if 'NABATI' in name: return 'NBT - BÁNH NABATI'
    if 'VISSAN' in name or 'VS ' in name or 'XÚC XÍCH' in name: return 'VS - XÚC XÍCH VISSAN'
    if 'SANEST' in name or 'SANVINEST' in name or 'NƯỚC YẾN' in name or 'YẾN SÀO' in name: return 'SN - YẾN SÀO/NƯỚC YẾN'
    if 'CHOLIMEX' in name or 'CLM' in name: return 'CLM - GIA VỊ CHOLIMEX'
    if 'ANLENE' in name or 'AL ' in name: return 'AL - SỮA ANLENE'
    if 'XĂNG' in name or 'RON95' in name: return 'FUEL - XĂNG'
    if 'DẦU' in name or 'DO 0.05S' in name: return 'FUEL - DẦU DO'
    if 'TƯƠNG ỚT' in name: return 'CLM - TƯƠNG ỚT (CHUNG)'
    if 'PHÔ MAI' in name or 'BEL ' in name: return 'BEL - PHÔ MAI'
    if 'CHIẾT KHẤU' in name: return 'SERVICE - CHIẾT KHẤU'
    if 'NƯỚC KHOÁNG' in name or 'SANNA' in name: return 'SN - NƯỚC KHOÁNG SANNA'
    
    # 2. General Categories for leftovers
    if 'ÁO' in name or 'QUẦN' in name or 'BURBERRY' in name: return 'FASHION - QUẦN ÁO/PHỤ KIỆN'
    if 'GIÀY' in name or 'LOAFERS' in name: return 'FASHION - GIÀY DÉP'
    if 'DÂY LƯNG' in name or 'KHÓA LƯNG' in name: return 'FASHION - THẮT LƯNG'
    if 'BÁNH' in name: return 'FOOD - BÁNH (CHUNG)'
    if 'KẸO' in name: return 'FOOD - KẸO (CHUNG)'
    
    # 3. Strip sizes and details as final attempt
    # Remove numbers + g/ml/oz/kg
    name = re.sub(r'(\d+)\s?(G|ML|KG|ML|HỘP|LON|THÙNG|LỌ|GÓI|CHAI|HŨ|X)', '', name)
    # Remove short words usually being IDs
    name = ' '.join([w for w in name.split() if len(w) > 2])
    
    return name[:50].strip() # Truncate

def process_hhp():
    print("Reading Excel...")
    inv_df = pd.read_excel(file_path, sheet_name='Ke khai Hoa don 2023')
    
    # Standardize column names
    inv_df['Ngày'] = pd.to_datetime(inv_df['Ngày'])
    inv_df['Tên hàng cleaned'] = inv_df['Tên hàng'].apply(clean_name)
    
    # Apply Grouping
    inv_df['Grouped Name'] = inv_df['Tên hàng cleaned'].apply(group_item)
    
    # Check count
    unique_groups = inv_df['Grouped Name'].nunique()
    print(f"Total Unique Groups: {unique_groups}")
    
    # If still > 300, we could apply more rules, but this should be close.
    # If still over, we take the top 250 and group others into "OTHER"
    if unique_groups > 250:
        counts = inv_df['Grouped Name'].value_counts()
        top_groups = counts.index[:250]
        inv_df['Grouped Name'] = inv_df['Grouped Name'].apply(lambda x: x if x in top_groups else 'OTHER - CÁC MẶT HÀNG KHÁC')
        print(f"Refined Unique Groups: {inv_df['Grouped Name'].nunique()}")

    # Add codes for Groups
    codes = {name: f"GRP-{i:03d}" for i, name in enumerate(sorted(inv_df['Grouped Name'].unique()))}
    inv_df['GroupCode'] = inv_df['Grouped Name'].map(codes)
    
    # 2023 only
    inv_2023 = inv_df[(inv_df['Ngày'] >= '2023-01-01') & (inv_df['Ngày'] <= '2023-12-31')].copy()
    
    # Monthly XNT
    xnt_monthly = inv_2023.groupby([inv_2023['Ngày'].dt.to_period('M'), 'GroupCode', 'Grouped Name', 'Loại'])['Số lượng'].sum().unstack(fill_value=0)
    xnt_monthly.to_csv(os.path.join(output_dir, 'xnt_monthly_grouped_2023.csv'))
    
    # Accounting Books
    ledger_entries = []
    for idx, row in inv_2023.iterrows():
        if row['Loại'] == 'Bán ra':
            ledger_entries.append({'Ngày': row['Ngày'], 'Số HĐ': row['Số HĐ'], 'TK Nợ': '131', 'TK Có': '511', 'Giá trị': row['Thành tiền'], 'Diễn giải': f"Bán ra: {row['Grouped Name']}"})
            ledger_entries.append({'Ngày': row['Ngày'], 'Số HĐ': row['Số HĐ'], 'TK Nợ': '131', 'TK Có': '3331', 'Giá trị': row['Thuế'], 'Diễn giải': f"VAT bán ra HĐ {row['Số HĐ']}"})
        else:
            ledger_entries.append({'Ngày': row['Ngày'], 'Số HĐ': row['Số HĐ'], 'TK Nợ': '156', 'TK Có': '331', 'Giá trị': row['Thành tiền'], 'Diễn giải': f"Mua vào: {row['Grouped Name']}"})
            ledger_entries.append({'Ngày': row['Ngày'], 'Số HĐ': row['Số HĐ'], 'TK Nợ': '1331', 'TK Có': '331', 'Giá trị': row['Thuế'], 'Diễn giải': f"VAT mua vào HĐ {row['Số HĐ']}"})
    
    ledger_df = pd.DataFrame(ledger_entries)
    ledger_df.to_csv(os.path.join(output_dir, 'gl_journal_grouped_2023.csv'), index=False)
    
    # Analysis summary update
    with open(os.path.join(output_dir, 'analysis_report.md'), 'a') as f:
        f.write("\n## 5. Cập nhật Gom nhóm Hàng hóa (Dưới 300 nhóm)\n")
        f.write(f"- Đã thực hiện gom {len(inv_df['Tên hàng cleaned'].unique())} mặt hàng về còn **{inv_df['Grouped Name'].nunique()} nhóm chính**.\n")
        f.write("- Các nhóm có tần suất giao dịch cao nhất:\n")
        for group, count in inv_df['Grouped Name'].value_counts().head(10).items():
            f.write(f"  - {group}: {count} hóa đơn/dòng hàng\n")
        f.write("\n- **Lợi ích**: Giúp báo cáo tài chính và sổ sách gọn gàng, dễ theo dõi biến động tồn kho theo dòng hàng thay vì theo từng mã SKU lẻ.\n")

    print(f"Success! Grouped reports saved in {output_dir}")

if __name__ == '__main__':
    process_hhp()
