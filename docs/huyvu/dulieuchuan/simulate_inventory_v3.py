import pandas as pd
import numpy as np

# 1. Define the 134 Master Items list provided by the user
master_item_names = [
    "ACC-GEN-FREE - Phụ kiện & vật tư phụ (Không thu tiền)",
    "PC-CUSTOM-U8M - Máy bộ PC để bàn Lắp ráp (Dưới 8 Triệu)",
    "ACC-GEN-200K_1M - Phụ kiện & vật tư phụ (200k - 1M)",
    "MOUSE-LOGI-WLS - Chuột máy tính Logitech (Không Dây)",
    "NW-ADAPTER - USB/Card thu phát WiFi",
    "INK-GEN-12A-COMPAT - Mực in Phổ thông (12A/303) Thường (100K-250K (Hộp mực tương thích))",
    "MOUSE-RAPOO-WIR - Chuột máy tính Rapoo (Dây)",
    "ACC-GEN-U200K - Phụ kiện & vật tư phụ (< 200k)",
    "ACC-GEN-O1M - Phụ kiện & vật tư phụ (> 1M)",
    "PC-CUSTOM-8-12M - Máy bộ PC để bàn Lắp ráp (Từ 8-12 Triệu)",
    "CABLE-SIG - Cáp truyền tín hiệu HDMI/VGA/USB",
    "SV-TELECOM - Cước Viễn thông / Internet",
    "PSU-JETEK - Nguồn máy tính Jetek",
    "CAM-OTH - Camera quan sát Khác",
    "SPK-SMAX - Loa máy tính SoundMax",
    "SSD-256G - Ổ cứng SSD dung lượng 120GB-256GB",
    "SSD-1TB - Ổ cứng SSD dung lượng 1TB+",
    "PRJ-EQ - Thiết bị Máy chiếu / Màn chiếu",
    "HP-GEN - Tai nghe máy tính",
    "NW-SWITCH - Thiết bị chia mạng (Switch)",
    "OFFICE-EQ - Thiết bị kiểm soát (Chấm công/Mã vạch)",
    "INK-BRO-LSR-COMPAT - Mực in Laser/Bột Brother (100K-250K (Hộp mực tương thích))",
    "PR-BRO-B2100 - Máy in Brother B2100/B2180 Series",
    "SSD-512G - Ổ cứng SSD dung lượng 500GB-512GB",
    "NW-ROUTER-TPLINK - Bộ định tuyến WiFi (Router) TP-Link",
    "PR-CAN-LBP2900 - Máy in Canon LBP2900",
    "INK-GEN-LSR-REFILL - Mực in Laser/Bột Thường (< 100K (Bơm mực/Thay thế))",
    "KB-DELL - Bàn phím máy tính Dell",
    "INK-BRO-LSR-PREMIUM - Mực in Laser/Bột Brother (250K-600K (Hộp mực xịn))",
    "FEE-GIFT - Hàng tặng / Khuyến mãi",
    "KB-OTH - Bàn phím máy tính Khác",
    "KB-LOGI - Bàn phím máy tính Logitech",
    "MOUSE-RAPOO-WLS - Chuột máy tính Rapoo (Không Dây)",
    "KB-RAPOO - Bàn phím máy tính Rapoo",
    "USB-32G - Bộ nhớ ngoài / USB / Thẻ nhớ (32GB/Thấp)",
    "LT-LEN-10-15M - Laptop Lenovo (Từ 10-15 Triệu)",
    "LT-DEL-INS-10-15M - Laptop Dell Inspiron (Từ 10-15 Triệu)",
    "PR-CAN-LBP240 - Máy in Canon LBP 240 Series",
    "MOUSE-LOGI-WIR - Chuột máy tính Logitech (Dây)",
    "PR-BRO-HL2321 - Máy in Brother HL-L2321D",
    "MON-GEN-22_24 - Màn hình máy tính Thường 21-24 Inch",
    "SW-AV - Phần mềm diệt Virus Kaspersky",
    "PR-OTH - Máy in Hãng Khác",
    "PR-XPR - Máy in Xprinter (Máy in bill)",
    "INK-BRO-LSR-REFILL - Mực in Laser/Bột Brother (< 100K (Bơm mực/Thay thế))",
    "MOUSE-DELL-WIR - Chuột máy tính Dell (Dây)",
    "UPS-GEN - Bộ lưu điện (UPS)",
    "PR-BRO - Máy in Brother",
    "MON-DEL-22_24 - Màn hình máy tính Dell 21-24 Inch",
    "INK-GEN-LSR-COMPAT - Mực in Laser/Bột Thường (100K-250K (Hộp mực tương thích))",
    "PR-CAN - Máy in Canon",
    "INK-GEN-LSR-PREMIUM - Mực in Laser/Bột Thường (250K-600K (Hộp mực xịn))",
    "MON-GEN-19_20 - Màn hình máy tính Thường 19-20 Inch",
    "MAIN-ASU-H510 - Mainboard ASUS dòng H510",
    "NW-CABLE - Dây cáp mạng Internet",
    "MOUSE-OTH-WLS - Chuột máy tính Khác (Không Dây)",
    "WCAM-LOGI - Webcam / Thiết bị ghi hình Logitech",
    "CAM-EZVIZ - Camera quan sát EZVIZ",
    "PR-EPS-L805 - Máy in Epson L805/L8050",
    "MAIN-ASU-H610 - Mainboard ASUS dòng H610",
    "INK-GEN-LSR-OEM - Mực in Laser/Bột Thường (> 600k (Mực chính hãng/Màu))",
    "PR-CAN-LBP6030 - Máy in Canon LBP6030",
    "CPU-I3 - Bộ vi xử lý Intel Core i3",
    "LT-DEL-10-15M - Laptop Dell (Từ 10-15 Triệu)",
    "PR-EPS-LSER - Máy in Epson Dòng L-Series Khác",
    "USB-64G - Bộ nhớ ngoài / USB / Thẻ nhớ (64GB)",
    "MON-GEN-27P - Màn hình máy tính Thường 27 Inch+",
    "PC-ASU-U8M - Máy bộ PC để bàn ASUS (Dưới 8 Triệu)",
    "CPU-I5 - Bộ vi xử lý Intel Core i5",
    "SPK-OTH - Loa máy tính Khác",
    "MOUSE-DELL-WLS - Chuột máy tính Dell (Không Dây)",
    "PSU-GEN - Nguồn máy tính Máy tính",
    "LT-DEL-INS-15-20M - Laptop Dell Inspiron (Từ 15-20 Triệu)",
    "USB-128G - Bộ nhớ ngoài / USB / Thẻ nhớ (128GB+)",
    "INK-EPS-INK-COMPAT - Mực in Nước/Màu Epson (100K-250K (Hộp mực tương thích))",
    "HDD-1TB - Ổ cứng HDD dung lượng 1TB+",
    "LT-LEN-TPD-15-20M - Laptop Lenovo ThinkPad (Từ 15-20 Triệu)",
    "INK-GEN-12A-REFILL - Mực in Phổ thông (12A/303) Thường (< 100K (Bơm mực/Thay thế))",
    "FEE-BANK - Phí dịch vụ ngân hàng / CK",
    "MON-VS-27P - Màn hình máy tính ViewSonic 27 Inch+",
    "LT-DEL-15-20M - Laptop Dell (Từ 15-20 Triệu)",
    "MOUSE-OTH-WIR - Chuột máy tính Khác (Dây)",
    "LT-LEN-U10M - Laptop Lenovo (Dưới 10 Triệu)",
    "MON-VS-19_20 - Màn hình máy tính ViewSonic 19-20 Inch",
    "LT-LEN-TBK-10-15M - Laptop Lenovo ThinkBook (Từ 10-15 Triệu)",
    "MON-DEL-27P - Màn hình máy tính Dell 27 Inch+",
    "LT-MSI-15-20M - Laptop MSI (Từ 15-20 Triệu)",
    "LT-LEN-TPD-FREE - Laptop Lenovo ThinkPad (Không thu tiền)",
    "RAM-8GB - Bộ nhớ RAM 8GB",
    "LT-OTH-U10M - Laptop Khác (Dưới 10 Triệu)",
    "NW-ROUTER-TPL_OTH - Bộ định tuyến WiFi (Router) TPLink / Khác",
    "PR-BRO-MFC_HL - Máy in Brother Dòng Đa Năng",
    "MON-VS-22_24 - Màn hình máy tính ViewSonic 21-24 Inch",
    "INK-GEN-12A-PREMIUM - Mực in Phổ thông (12A/303) Thường (250K-600K (Hộp mực xịn))",
    "LT-LEN-TBK-15-20M - Laptop Lenovo ThinkBook (Từ 15-20 Triệu)",
    "SW-GEN - Bản quyền phần mềm (Win/Office/Khác)",
    "MAIN-ASU-B760 - Mainboard ASUS dòng B760",
    "LT-DEL-INS-O20M - Laptop Dell Inspiron (Trên 20 Triệu)",
    "WCAM-OTH - Webcam / Thiết bị ghi hình Khác",
    "LT-LEN-TPD-10-15M - Laptop Lenovo ThinkPad (Từ 10-15 Triệu)",
    "INK-BRO-LSR-OEM - Mực in Laser/Bột Brother (> 600k (Mực chính hãng/Màu))",
    "FEE-DISC - Chiết khấu thương mại / Giảm giá",
    "LT-MSI-O20M - Laptop MSI (Trên 20 Triệu)",
    "RAM-4GB - Bộ nhớ RAM 4GB",
    "MON-DEL-19_20 - Màn hình máy tính Dell 19-20 Inch",
    "CPU-I7 - Bộ vi xử lý Intel Core i7",
    "LT-MSI-10-15M - Laptop MSI (Từ 10-15 Triệu)",
    "LT-LEN-15-20M - Laptop Lenovo (Từ 15-20 Triệu)",
    "CPU-CPU - Bộ vi xử lý Intel CPU",
    "PC-DEL-O20M - Máy bộ PC để bàn Dell (Trên 20 Triệu)",
    "INK-CAN-LSR-FREE - Mực in Laser/Bột Canon (Không thu tiền)",
    "LT-HP-15-20M - Laptop HP (Từ 15-20 Triệu)",
    "LT-HP-10-15M - Laptop HP (Từ 10-15 Triệu)",
    "LT-LEN-FREE - Laptop Lenovo (Không thu tiền)",
    "LT-DEL-VOS-10-15M - Laptop Dell Vostro (Từ 10-15 Triệu)",
    "LT-DEL-U10M - Laptop Dell (Dưới 10 Triệu)",
    "PC-CUSTOM-FREE - Máy bộ PC để bàn Lắp ráp (Không thu tiền)",
    "PC-LEN-U8M - Máy bộ PC để bàn Lenovo (Dưới 8 Triệu)",
    "LT-LEN-TPD-O20M - Laptop Lenovo ThinkPad (Trên 20 Triệu)",
    "MON-SAM-27P - Màn hình máy tính Samsung 27 Inch+",
    "CAM-HIKV - Camera quan sát HIKVISION",
    "LT-DEL-FREE - Laptop Dell (Không thu tiền)",
    "LT-HP-U10M - Laptop HP (Dưới 10 Triệu)",
    "MAIN-MSI-GEN - Mainboard MSI dòng Bo mạch chủ",
    "LT-DEL-LAT-U10M - Laptop Dell Latitude (Dưới 10 Triệu)",
    "PC-DEL-8-12M - Máy bộ PC để bàn Dell (Từ 8-12 Triệu)",
    "LT-DEL-O20M - Laptop Dell (Trên 20 Triệu)",
    "INK-BRO-LSR-FREE - Mực in Laser/Bột Brother (Không thu tiền)",
    "PC-DEL-12-20M - Máy bộ PC để bàn Dell (Từ 12-20 Triệu)",
    "LT-OTH-10-15M - Laptop Khác (Từ 10-15 Triệu)",
    "LT-DEL-LAT-10-15M - Laptop Dell Latitude (Từ 10-15 Triệu)",
    "RAM-16GB - Bộ nhớ RAM 16GB",
    "LT-ASU-10-15M - Laptop ASUS (Từ 10-15 Triệu)"
]

# 2. Get Initial Stocks from Backup and map to 134 items
xl_backup = pd.ExcelFile('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_backup.xlsx')
df_bk = xl_backup.parse('Tháng 1')
df_bk = df_bk[df_bk['Mã - Tên Hàng'] != 'TỔNG CỘNG']

# Mapping initial stocks to new master list
def get_initial_stock(master_list, backup_df):
    results = []
    for item in master_list:
        # Match by name part
        name_part = item.split(' - ')[-1].lower().strip()
        code_part = item.split(' - ')[0].upper().strip()
        
        # Look for exact code or name in backup
        match = backup_df[backup_df['Mã - Tên Hàng'].str.contains(code_part, na=False, regex=False) | 
                          backup_df['Mã - Tên Hàng'].str.lower().str.contains(name_part[:20], na=False, regex=False)]
        
        if not match.empty:
            row = match.iloc[0]
            results.append({
                'Mã - Tên Hàng': item,
                'ĐVT': row['ĐVT'] if pd.notna(row['ĐVT']) else 'Cái',
                'Đầu Kỳ (SL)': row['Đầu Kỳ (SL)'] if pd.notna(row['Đầu Kỳ (SL)']) else 0,
                'Đầu Kỳ (Tiền)': row['Đầu Kỳ (Tiền)'] if pd.notna(row['Đầu Kỳ (Tiền)']) else 0
            })
        else:
            results.append({
                'Mã - Tên Hàng': item,
                'ĐVT': 'Cái',
                'Đầu Kỳ (SL)': 0,
                'Đầu Kỳ (Tiền)': 0
            })
    return pd.DataFrame(results)

master_stock_2023 = get_initial_stock(master_item_names, df_bk)

# 3. Mapper for invoice details
def map_detail_to_master(detail_name, master_list):
    name = detail_name.lower()
    # Scoring based on keywords
    best_match = None
    best_score = 0
    
    for master in master_list:
        parts = master.split(' - ')
        code = parts[0].lower()
        desc = parts[1].lower() if len(parts) > 1 else ""
        
        score = 0
        if code in name: score += 10
        if desc[:20] in name: score += 5
        
        # Special keywords
        if "dell" in code and "dell" in name: score += 2
        if "laptop" in desc and "laptop" in name: score += 2
        
        if score > best_score:
            best_score = score
            best_match = master
            
    if best_score >= 5:
        return best_match
    return "ACC-GEN-O1M - Phụ kiện & vật tư phụ (> 1M)" # Fallback

# 4. Process Yearly Simulation
def process_year_v3(year, details_file, opening_stock):
    df_d = pd.read_csv(details_file)
    # Mapping
    unique_names = df_d['ten'].unique()
    mapping = {name: map_detail_to_master(name, master_item_names) for name in unique_names}
    df_d['Mapped'] = df_d['ten'].map(mapping)
    
    sheets = {}
    current_stock = opening_stock.copy()
    
    for m in range(1, 13):
        df_m = df_d[df_d['month'] == m]
        
        inbound = df_m[df_m['loaihd'] == 'muavao'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        outbound = df_m[df_m['loaihd'] == 'banra'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        
        m_sheet = current_stock.merge(inbound, left_on='Mã - Tên Hàng', right_on='Mapped', how='left')
        m_sheet = m_sheet.merge(outbound, left_on='Mã - Tên Hàng', right_on='Mapped', how='left', suffixes=('_in', '_out'))
        
        m_sheet = m_sheet.fillna(0)
        m_sheet['Cuối Kỳ (SL)'] = m_sheet['Đầu Kỳ (SL)'] + m_sheet['sluong_in'] - m_sheet['sluong_out']
        m_sheet['Cuối Kỳ (Tiền)'] = m_sheet['Đầu Kỳ (Tiền)'] + m_sheet['thtien_in'] - m_sheet['thtien_out']
        
        # Result columns
        res = m_sheet[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'sluong_in', 'thtien_in', 'sluong_out', 'thtien_out', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']]
        res.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'Nhập (SL)', 'Nhập (Tiền)', 'Xuất (SL)', 'Xuất (Tiền)', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']
        
        # Totals
        totals = res.select_dtypes(include=[np.number]).sum()
        totals_row = pd.DataFrame([['TỔNG CỘNG', ''] + totals.tolist()], columns=res.columns)
        res = pd.concat([res, totals_row], ignore_index=True)
        
        sheets[f'Tháng {m}'] = res
        
        # Next opening
        current_stock = res.iloc[:-1][['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy()
        current_stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
        
    sheets['xnt12thang'] = sheets['Tháng 12']
    return sheets, current_stock

# Run 2023
sheets_2023, end_2023 = process_year_v3(2023, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_2023.csv', master_stock_2023)
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx') as writer:
    pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/final_summary_matched_2023.xlsx').to_excel(writer, sheet_name='Hoadon', index=False)
    for k, v in sheets_2023.items(): v.to_excel(writer, sheet_name=k, index=False)

# Run 2024
sheets_2024, end_2024 = process_year_v3(2024, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv', end_2023)
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2024.xlsx') as writer:
    # Simplified Hoadon for 2024 (using year 2024 filter)
    df_h24 = pd.read_csv('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_pivoted_23_25.csv')
    df_h24[df_h24['Year']==2024].to_excel(writer, sheet_name='Hoadon', index=False)
    for k, v in sheets_2024.items(): v.to_excel(writer, sheet_name=k, index=False)

# Run 2025
sheets_2025, _ = process_year_v3(2025, '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv', end_2024)
with pd.ExcelWriter('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2025.xlsx') as writer:
    df_h25 = pd.read_csv('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_pivoted_23_25.csv')
    df_h25[df_h25['Year']==2025].to_excel(writer, sheet_name='Hoadon', index=False)
    for k, v in sheets_2025.items(): v.to_excel(writer, sheet_name=k, index=False)

print("Finished generating 2023, 2024, 2025 with 134 items.")
