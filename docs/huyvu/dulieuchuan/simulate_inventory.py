import pandas as pd
import numpy as np

# 1. Load Initial Stock from Backup (Jan 2023)
xl_backup = pd.ExcelFile('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_backup.xlsx')
df_init = xl_backup.parse('Tháng 1')
df_init = df_init[df_init['Mã - Tên Hàng'] != 'TỔNG CỘNG']
master_items = df_init[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']].copy()

# 2. Define Mapper (Heuristic)
# Many items in detail will match based on keywords
def map_item(name, master_list):
    # Try exact match or contains
    # For now, if no match, we create a new category
    for master_name in master_list:
        if master_name.split(' - ')[-1].lower() in name.lower():
            return master_name
    return f"NEW - {name}"

# 3. Process Year by Year
def process_year(year, details_file, opening_stock, matched_summaries=None):
    df_d = pd.read_csv(details_file)
    # Exclude Bank Fees
    df_d = df_d[~df_d['nbten'].str.contains('NGÂN HÀNG|Ngân hàng', na=False)]
    
    # Map to Master
    # Optimization: map unique names first
    unique_names = df_d['ten'].unique()
    mapping = {name: map_item(name, opening_stock['Mã - Tên Hàng'].tolist()) for name in unique_names}
    df_d['Mapped'] = df_d['ten'].map(mapping)
    
    sheets = {}
    current_stock = opening_stock.copy()
    current_stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
    
    for m in range(1, 13):
        # Filter details for this month
        df_m = df_d[df_d['month'] == m]
        
        # Calculate Nhập and Xuất for each item
        # Mua vao = Nhập, Ban ra = Xuất
        inbound = df_m[df_m['loaihd'] == 'muavao'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        outbound = df_m[df_m['loaihd'] == 'banra'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        
        # Merge with current stock
        m_sheet = current_stock.merge(inbound, left_on='Mã - Tên Hàng', right_on='Mapped', how='outer')
        m_sheet = m_sheet.merge(outbound, left_on='Mã - Tên Hàng', right_on='Mapped', how='outer', suffixes=('_in', '_out'))
        
        # Fill NaNs
        m_sheet['Mã - Tên Hàng'] = m_sheet['Mã - Tên Hàng'].combine_first(m_sheet['Mapped_in']).combine_first(m_sheet['Mapped_out'])
        m_sheet['ĐVT'] = m_sheet['ĐVT'].fillna('Cái')
        m_sheet[['Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'sluong_in', 'thtien_in', 'sluong_out', 'thtien_out']] = m_sheet[['Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'sluong_in', 'thtien_in', 'sluong_out', 'thtien_out']].fillna(0)
        
        # Calculate Cuối Kỳ
        m_sheet['Cuối Kỳ (SL)'] = m_sheet['Đầu Kỳ (SL)'] + m_sheet['sluong_in'] - m_sheet['sluong_out']
        # Simple Weighted Average Cost for Tiền (Heuristic for now)
        m_sheet['Cuối Kỳ (Tiền)'] = m_sheet['Đầu Kỳ (Tiền)'] + m_sheet['thtien_in'] - m_sheet['thtien_out']
        
        # Format columns exactly like backup
        m_sheet = m_sheet[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'sluong_in', 'thtien_in', 'sluong_out', 'thtien_out', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']]
        m_sheet.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'Nhập (SL)', 'Nhập (Tiền)', 'Xuất (SL)', 'Xuất (Tiền)', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']
        
        # Add TỔNG CỘNG row
        totals = m_sheet.select_dtypes(include=[np.number]).sum()
        totals_row = pd.DataFrame([['TỔNG CỘNG', ''] + totals.tolist()], columns=m_sheet.columns)
        m_sheet = pd.concat([m_sheet, totals_row], ignore_index=True)
        
        sheets[f'Tháng {m}'] = m_sheet
        
        # Opening for next month is closing of this month (excluding Totals row)
        next_opening = m_sheet.iloc[:-1][['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy()
        next_opening.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
        current_stock = next_opening
        
    # Generate xnt12thang (Summary of 12 months)
    # This is typically just the final month state or a pivot?
    # In the backup, xnt12thang was the same structure. 
    sheets['xnt12thang'] = sheets['Tháng 12']
    return sheets, current_stock

# Get matched summaries for 2023 to force totals (if possible)
# (Skipped for now to keep it simple, but we'll try to align)

# Process 2023
sheets_23, end_stock_23 = process_year(2023, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_2023.csv', master_items)

# Save 2023
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_final_v2.xlsx') as writer:
    # We still need the Hoadon sheet
    df_h = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_final.xlsx', sheet_name='Hoadon')
    df_h.to_excel(writer, sheet_name='Hoadon', index=False)
    for name, df in sheets_23.items():
        df.to_excel(writer, sheet_name=name, index=False)

# Process 2024
sheets_24, end_stock_24 = process_year(2024, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv', end_stock_23) # Use end of 23 as start of 24

# Save 2024
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2024_final_v2.xlsx') as writer:
    # Create Hoadon for 2024
    df_h24 = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2024_final.xlsx', sheet_name='Hoadon')
    df_h24.to_excel(writer, sheet_name='Hoadon', index=False)
    for name, df in sheets_24.items():
        df.to_excel(writer, sheet_name=name, index=False)

# Process 2025
sheets_25, _ = process_year(2025, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv', end_stock_24)

# Save 2025
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2025_final_v2.xlsx') as writer:
    df_h25 = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2025_final.xlsx', sheet_name='Hoadon')
    df_h25.to_excel(writer, sheet_name='Hoadon', index=False)
    for name, df in sheets_25.items():
        df.to_excel(writer, sheet_name=name, index=False)
