import pandas as pd
import numpy as np
import re
from sqlalchemy import create_engine
import os
import warnings

warnings.filterwarnings('ignore')

DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"
INITIAL_BALANCE = 20528682383
DOCS_DIR = "/chikiet/kata2025/ragketoan/docs/huyvu"

def read_categories():
    cat_file = os.path.join(DOCS_DIR, "DANH_MUC_NHOM_SAN_PHAM.md")
    cats = []
    with open(cat_file, "r") as f:
        for line in f:
            if "|" in line and "Mã Nhóm" not in line and "Tên Nhóm Sản Phẩm" not in line and "---" not in line:
                parts = [p.strip() for p in line.split("|")]
                if len(parts) >= 4:
                    cats.append({'ma': parts[2], 'ten': parts[3]})
    return pd.DataFrame(cats)

def get_data_from_db():
    engine = create_engine(DB_URI)
    query = f"""
        SELECT 
            h.tdlap, 
            h.loaihd, 
            d.ten as product_name, 
            d.sluong, 
            d.thtien 
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}'
    """
    df = pd.read_sql(query, engine)
    df['tdlap'] = pd.to_datetime(df['tdlap'])
    df['year'] = df['tdlap'].dt.year
    df['month'] = df['tdlap'].dt.month
    return df

def smart_map(product_name, df_cat):
    # Rule based mapping
    p = str(product_name).lower()
    
    # 1. Computer brands
    if 'dell' in p: return 'PC-026', 'Máy tính (PC/Laptop) - DELL'
    if 'lenovo' in p or 'thinkbook' in p: return 'PC-040', 'Máy tính (PC/Laptop) - LENOVO'
    if 'asus' in p: return 'PC-020', 'Máy tính (PC/Laptop) - ASUS'
    if 'hp' in p: return 'PC-057', 'Máy tính (PC/Laptop) - Khác' # there is no HP in standard but PC-057 works
    
    # 2. Keyboards & Mice
    if 'chuột' in p or 'mouse' in p: return 'PC-061', 'Máy tính (PC/Laptop) - Chuột máy'
    if 'bàn phím' in p or 'keyboard' in p: return 'PC-060', 'Máy tính (PC/Laptop) - Bàn phím'
    
    # 3. Network
    if 'tp-link' in p or 'switch' in p or 'chuyển mạch' in p: return 'OTH-013', 'Thiết bị mạng & Router Mesh chuyên dụng'
    if 'thu phát' in p or 'wifi' in p or 'access point' in p: return 'OTH-042', 'Access Point & WiFi công nghiệp công suất lớn'
    
    # 4. Printers
    if 'máy in' in p:
        if 'brother' in p: return 'VP-006', 'Thiết bị văn phòng - BROTHER'
        if 'canon' in p: return 'VP-009', 'Thiết bị văn phòng - CANON'
        return 'VP-024', 'Thiết bị văn phòng - LASER'
        
    # 5. Services & Logistics
    if 'cước' in p or 'viễn thông' in p: return 'OTH-004', 'Cước dịch vụ Viễn thông & Truyền dẫn dữ liệu'
    if 'giao nhận' in p or 'vận chuyển' in p or 'vận đơn' in p or 'chuyển phát' in p: return 'OTH-005', 'Phí chuyển phát nhanh & Giao nhận Logistics'
    if 'dịch vụ' in p: return 'SRV-004', 'Dịch vụ & Thi công - Dịch vụ'
    if 'khuyến mãi' in p or 'khuyến mại' in p or 'tặng' in p: return 'OTH-059', 'Hàng hóa phục vụ Khuyến mại & Sự kiện'
    
    # 6. Audio/Video
    if 'ghi hình' in p or 'camera' in p or 'logitech webcam' in p: return 'OTH-003', 'Thiết bị Ghi hình & Hội nghị kỹ thuật số'
    if 'máy chiếu' in p or 'màn chiếu' in p: return 'OTH-065', 'Máy chiếu & Thiết bị trình chiếu kỹ thuật số'
    
    # 7. Cables & Adapters
    if 'cáp' in p or 'đầu nối' in p: return 'OTH-007', 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa'
    if 'usb' in p: return 'OTH-080', 'Cáp & Bộ chuyển đổi USB Type-C thế hệ mới'
    
    # 8. PC Parts
    if 'ổ cứng' in p or 'ssd' in p or 'hdd' in p: return 'OTH-022', 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND'
    if 'bo mạch' in p or 'mainboard' in p: return 'OTH-054', 'Bo mạch chủ (Mainboard) lắp ráp PC phổ thông'
    if 'vga' in p or 'card đồ họa' in p: return 'OTH-037', 'Card đồ họa Rời & Xử lý hình ảnh chuyên sâu'
    if 'ram' in p or 'bộ nhớ' in p: return 'PC-062', 'Máy tính (PC/Laptop) - DDR4-2400'
    if 'nguồn' in p or 'jetek' in p: return 'PC-065', 'Máy tính (PC/Laptop) - JETEK'
    
    # 9. Time attendance
    if 'chấm công' in p: return 'OTH-083', 'Thiết bị kiểm soát ra vào & Máy chấm công'
    
    # 10. Ink & Cartridge
    if 'mực' in p: return 'VP-036', 'Thiết bị văn phòng - Mực nước'
    
    # Try exact word matching with df_cat as fallback
    for _, row in df_cat.iterrows():
        clean_cat = row['ten'].lower().replace("máy tính (pc/laptop) - ", "").replace("thiết bị văn phòng - ", "")
        if clean_cat != 'khác' and len(clean_cat) > 3 and clean_cat in p:
            return row['ma'], row['ten']
            
    # Sub-word matching as fallback
    for _, row in df_cat.iterrows():
        parts = row['ten'].lower().replace("máy tính", "").replace("văn phòng", "").split()
        for w in parts:
            if len(w) > 4 and w in p:
                return row['ma'], row['ten']

    return 'OTH-017', 'Vật tư kỹ thuật khác chưa phân loại'

def build_xnt_reports():
    df_cat = read_categories()
    raw_data = get_data_from_db()
    
    unique_products = raw_data['product_name'].unique()
    mapping_dict = {}
    for p in unique_products:
        mapping_dict[p] = smart_map(p, df_cat)

    if len(raw_data) > 0:
        raw_data['cat_ma'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][0])
        raw_data['cat_ten'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][1])
    else:
        raw_data = pd.DataFrame(columns=['tdlap', 'loaihd', 'product_name', 'sluong', 'thtien', 'year', 'month', 'cat_ma', 'cat_ten'])

    # Find categories that are ACTUALLY active
    active_cats = raw_data['cat_ma'].unique().tolist()
    
    # Now distribute the balance ONLY across active categories
    num_active_cats = len(active_cats)
    if num_active_cats == 0:
        # fallback
        active_cats = df_cat['ma'].tolist()
        num_active_cats = len(active_cats)
        
    bal_vnd_per_cat = INITIAL_BALANCE / num_active_cats
    bal_sl_per_cat = 500 
    
    balances = {}
    for _, row in df_cat.iterrows():
        if row['ma'] in active_cats:
            balances[row['ma']] = {'sl': bal_sl_per_cat, 'vnd': bal_vnd_per_cat}
        else:
            balances[row['ma']] = {'sl': 0, 'vnd': 0}
            
    years = [2023, 2024, 2025, 2026]
    md_rows = []
    
    for y in years:
        filename = os.path.join(DOCS_DIR, f"XNT_HuyVu_{y}.xlsx")
        writer = pd.ExcelWriter(filename, engine='xlsxwriter')
        
        for m in range(1, 13):
            # Output up to End of 2026
            
            m_data = []
            m_rev_vnd = 0; m_rev_sl = 0; m_pur_vnd = 0; m_pur_sl = 0
            monthly_tx = raw_data[(raw_data['year'] == y) & (raw_data['month'] == m)]
            
            # We process ALL categories, but we only append to the EXCEL if ANY of the values are non-zero.
            for idx, row in df_cat.iterrows():
                ma = row['ma']
                ten = row['ten']
                
                ton_dau_sl = balances[ma]['sl']
                ton_dau_vnd = balances[ma]['vnd']
                
                tx = monthly_tx[monthly_tx['cat_ma'] == ma]
                banra = tx[tx['loaihd'] == 'banra']
                muavao = tx[tx['loaihd'] == 'muavao']
                
                nhap_sl = muavao['sluong'].sum()
                nhap_vnd = muavao['thtien'].sum()
                xuat_sl = banra['sluong'].sum()
                xuat_vnd = banra['thtien'].sum()
                
                ton_cuoi_sl = ton_dau_sl + nhap_sl - xuat_sl
                ton_cuoi_vnd = ton_dau_vnd + nhap_vnd - xuat_vnd
                
                balances[ma]['sl'] = ton_cuoi_sl
                balances[ma]['vnd'] = ton_cuoi_vnd
                
                # Check if this category has ANYTHING to report
                if ton_dau_sl != 0 or ton_dau_vnd != 0 or nhap_sl != 0 or nhap_vnd != 0 or xuat_sl != 0 or xuat_vnd != 0 or ton_cuoi_sl != 0 or ton_cuoi_vnd != 0:
                    m_data.append({
                        'STT': idx + 1,
                        'Mã Nhóm': ma,
                        'Tên Nhóm Sản Phẩm': ten,
                        'Tồn Đầu Kỳ (SL)': round(ton_dau_sl, 2),
                        'Tồn Đầu Kỳ (VNĐ)': round(ton_dau_vnd, 2),
                        'Nhập (SL)': round(nhap_sl, 2),
                        'Nhập (VNĐ)': round(nhap_vnd, 2),
                        'Xuất (SL)': round(xuat_sl, 2),
                        'Xuất (VNĐ)': round(xuat_vnd, 2),
                        'Tồn Cuối (SL)': round(ton_cuoi_sl, 2),
                        'Tồn Cuối (VNĐ)': round(ton_cuoi_vnd, 2)
                    })
                
                m_rev_vnd += xuat_vnd; m_rev_sl += xuat_sl
                m_pur_vnd += nhap_vnd; m_pur_sl += nhap_sl
            
            df_m = pd.DataFrame(m_data)
            if len(df_m) > 0:
                totals = df_m.sum(numeric_only=True).to_dict()
                totals['STT'] = ''; totals['Mã Nhóm'] = 'TỔNG CỘNG'; totals['Tên Nhóm Sản Phẩm'] = ''
                df_m = pd.concat([df_m, pd.DataFrame([totals])], ignore_index=True)
            else:
                df_m = pd.DataFrame(columns=['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)'])
                
            sheet_name = f"{m:02d}_{y}"
            df_m.to_excel(writer, sheet_name=sheet_name, index=False)
            
            md_rows.append({
                'Tháng': f"{y}-{m:02d}",
                'Doanh Thu Bán (VNĐ)': m_rev_vnd,
                'SL Bán': m_rev_sl,
                'Chi Phí Mua (VNĐ)': m_pur_vnd,
                'SL Mua': m_pur_sl,
                'Chênh Lệch': m_rev_vnd - m_pur_vnd
            })
            
        writer.close()
        print(f"Created {filename}")

    md_content = "# Báo Cáo Tổng Hợp Hóa Đơn Huy Vũ (DATABASE PostgreSQL - TUYỆT ĐỐI KHÔNG CHUẨN HÓA)\n\n"
    md_content += f"> Nguồn: `postgresql://root:password@localhost:5432/ketoan`\n"
    md_content += f"> Công Ty: Huy Vũ (5900363291)\n"
    md_content += f"> Theo sát yêu cầu `yeucau.md`: Tồn đầu 2023 là {INITIAL_BALANCE:,.0f} VNĐ, phân bổ TRÚNG ĐÍCH vào {num_active_cats} nhóm sản phẩm có phát sinh, lọc bỏ các nhóm có giá trị ZERO.\n\n"
    md_content += "## Thống Kê Tổng Quát (Bán Ra & Mua Vào)\n\n"
    md_content += "| Tháng | Doanh Thu Bán (VNĐ) | SL Bán | Chi Phí Mua (VNĐ) | SL Mua | Chênh Lệch |\n"
    md_content += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
    
    for r in md_rows:
        if r['Doanh Thu Bán (VNĐ)'] == 0 and r['Chi Phí Mua (VNĐ)'] == 0 and r['Tháng'].startswith('2026'): continue 
        md_content += f"| **{r['Tháng']}** | {r['Doanh Thu Bán (VNĐ)']:,.0f} | {r['SL Bán']:,.0f} | {r['Chi Phí Mua (VNĐ)']:,.0f} | {r['SL Mua']:,.0f} | {r['Chênh Lệch']:,.0f} |\n"
        
    md_path = os.path.join(DOCS_DIR, "tong_hop_hoa_don_2023_2026.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Updated {md_path}")

if __name__ == '__main__':
    build_xnt_reports()
