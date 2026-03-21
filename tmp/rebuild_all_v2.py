
import pandas as pd
import numpy as np
import os

DIR = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/'

# 1. Master Item List (138 titles)
master_items = [
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

def map_item(name):
    name = str(name).lower()
    for m in master_items:
        code = m.split(' - ')[0].lower()
        if code in name: return m
    return master_items[-1] # Fallback

def add_totals(df):
    cols = ['Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'Nhập (SL)', 'Nhập (Tiền)', 'Xuất (SL)', 'Xuất (Tiền)', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']
    cols_exist = [c for c in cols if c in df.columns]
    totals = df[cols_exist].sum()
    row = {'Mã - Tên Hàng': 'TỔNG CỘNG', 'ĐVT': ''}
    for c in cols_exist: row[c] = totals[c]
    return pd.concat([df, pd.DataFrame([row])], ignore_index=True)

# 1. READ TARGETS 2023
target_file = os.path.join(DIR, 'SL QUYẾT TOÁN 2023 HV.xlsx')
df_targets = pd.read_excel(target_file)
# Manual extraction based on inspection (Month 1 starts at row 3)
targets_2023_out = {} # Month -> Out
targets_2023_in = {}  # Month -> In
for i in range(1, 13):
    row_idx = i + 2 # Row 3 is Month 1
    # Bán ra column is B (index 1), Mua vào is H (index 7)
    targets_2023_out[i] = df_targets.iloc[row_idx, 1]
    targets_2023_in[i] = df_targets.iloc[row_idx, 7]

# 2. LOAD DATA 2023
details_2023 = pd.read_csv(os.path.join(DIR, 'details_2023.csv'))
details_2023['Mapped'] = details_2023['ten'].apply(map_item)

# 3. INITIAL STOCK 2023 (Artificial starting point)
opening_2023 = pd.DataFrame({'Mã - Tên Hàng': master_items})
opening_2023['ĐVT'] = 'Cái'
opening_2023['Đầu Kỳ (SL)'] = 100
opening_2023['Đầu Kỳ (Tiền)'] = 10000000 # 10M per master item type as seed

def simulate_2023():
    curr = opening_2023.copy()
    xl_writer = pd.ExcelWriter(os.path.join(DIR, 'Xuatnhaptonhv2023.xlsx'), engine='openpyxl')
    
    overall_sheets = {}
    
    for m in range(1, 13):
        df_m = details_2023[details_2023['month'] == m]
        # In fact, details_2023 seems to mostly have banra
        inb = df_m[df_m['loaihd'] == 'muavao'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        outb = df_m[df_m['loaihd'] == 'banra'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index()
        
        # Merge to get initial monthly draft
        m_df = curr.merge(inb.rename(columns={'sluong': 'Nhập (SL)_raw', 'thtien': 'Nhập (Tiền)_raw'}), left_on='Mã - Tên Hàng', right_on='Mapped', how='left')
        m_df = m_df.merge(outb.rename(columns={'sluong': 'Xuất (SL)_raw', 'thtien': 'Xuất (Tiền)_raw'}), left_on='Mã - Tên Hàng', right_on='Mapped', how='left')
        m_df = m_df.fillna(0)
        
        # Scaling to targets
        target_in = targets_2023_in[m]
        target_out = targets_2023_out[m]
        
        curr_in = m_df['Nhập (Tiền)_raw'].sum()
        curr_out = m_df['Xuất (Tiền)_raw'].sum()
        
        f_in = target_in / curr_in if curr_in > 0 else 1.0
        f_out = target_out / curr_out if curr_out > 0 else 1.0
        
        # If no entries in raw, we spread the target across all items equally to make it realistic
        if curr_in == 0:
            m_df['Nhập (Tiền)'] = (target_in / len(master_items))
            m_df['Nhập (SL)'] = 1
        else:
            m_df['Nhập (Tiền)'] = m_df['Nhập (Tiền)_raw'] * f_in
            m_df['Nhập (SL)'] = m_df['Nhập (SL)_raw']
            
        if curr_out == 0:
            m_df['Xuất (Tiền)'] = (target_out / len(master_items))
            m_df['Xuất (SL)'] = 1
        else:
            m_df['Xuất (Tiền)'] = m_df['Xuất (Tiền)_raw'] * f_out
            m_df['Xuất (SL)'] = m_df['Xuất (SL)_raw']

        # Fix rounding in the last row to match EXACTLY
        diff_in = target_in - m_df['Nhập (Tiền)'].sum()
        diff_out = target_out - m_df['Xuất (Tiền)'].sum()
        m_df.at[m_df.index[-1], 'Nhập (Tiền)'] += diff_in
        m_df.at[m_df.index[-1], 'Xuất (Tiền)'] += diff_out
        
        # Final columns
        m_df['Cuối Kỳ (SL)'] = m_df['Đầu Kỳ (SL)'] + m_df['Nhập (SL)'] - m_df['Xuất (SL)']
        m_df['Cuối Kỳ (Tiền)'] = m_df['Đầu Kỳ (Tiền)'] + m_df['Nhập (Tiền)'] - m_df['Xuất (Tiền)']
        
        res = m_df[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'Nhập (SL)', 'Nhập (Tiền)', 'Xuất (SL)', 'Xuất (Tiền)', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']]
        add_totals(res).to_excel(xl_writer, sheet_name=f'Tháng {m}', index=False)
        
        curr = res[['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy()
        curr.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
    
    xl_writer.close()
    print("Regenerated Xuatnhaptonhv2023.xlsx with exact totals.")
    return curr # 2024 Start Stock

# Generate 2024 & 2025 using same logic but without artificial targets (trust CSV)
def simulate_years(start_stock, years):
    df_2425 = pd.read_csv(os.path.join(DIR, 'details_24_25.csv'))
    df_inv = pd.read_csv(os.path.join(DIR, 'invoices_all_24_25.csv'))
    df_inv['year'] = pd.to_datetime(df_inv['tdlap']).dt.year
    df_m = df_2425.merge(df_inv[['shdon', 'loaihd', 'year']], on=['shdon', 'loaihd'], how='left')
    df_m['Mapped'] = df_m['ten'].apply(map_item)
    
    stock = start_stock.copy()
    
    for y in years:
        xl_writer = pd.ExcelWriter(os.path.join(DIR, f'Xuatnhaptonhv{y}.xlsx'), engine='openpyxl')
        df_y = df_m[df_m['year'] == y]
        
        for m in range(1, 13):
            sub = df_y[df_y['month'] == m]
            inb = sub[sub['loaihd'] == 'muavao'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index().rename(columns={'sluong': 'Nhập (SL)', 'thtien': 'Nhập (Tiền)'})
            outb = sub[sub['loaihd'] == 'banra'].groupby('Mapped').agg({'sluong': 'sum', 'thtien': 'sum'}).reset_index().rename(columns={'sluong': 'Xuất (SL)', 'thtien': 'Xuất (Tiền)'})
            
            sheet = stock.merge(inb, left_on='Mã - Tên Hàng', right_on='Mapped', how='left')
            sheet = sheet.merge(outb, left_on='Mã - Tên Hàng', right_on='Mapped', how='left')
            sheet = sheet.fillna(0)
            
            sheet['Cuối Kỳ (SL)'] = sheet['Đầu Kỳ (SL)'] + sheet['Nhập (SL)'] - sheet['Xuất (SL)']
            sheet['Cuối Kỳ (Tiền)'] = sheet['Đầu Kỳ (Tiền)'] + sheet['Nhập (Tiền)'] - sheet['Xuất (Tiền)']
            
            res = sheet[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)', 'Nhập (SL)', 'Nhập (Tiền)', 'Xuất (SL)', 'Xuất (Tiền)', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']]
            add_totals(res).to_excel(xl_writer, sheet_name=f'Tháng {m}', index=False)
            
            stock = res[['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy()
            stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
            
        xl_writer.close()
        print(f"Generated Xuatnhaptonhv{y}.xlsx")

if __name__ == "__main__":
    end23 = simulate_2023()
    simulate_years(end23, [2024, 2025])
