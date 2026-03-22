import pandas as pd
import numpy as np
import hashlib
from sqlalchemy import create_engine
import os

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

def get_full_data():
    engine = create_engine(DB_URI)
    
    query_list = f"""
        SELECT 
            h."idServer",
            h.tdlap, 
            h.loaihd, 
            h.tgtttbso 
        FROM ext_listhoadon h
        WHERE h."congtyId" = '{COMPANY_ID}'
    """
    df_list = pd.read_sql(query_list, engine)
    
    query_detail = f"""
        SELECT 
            d."idhdonServer",
            d.ten as product_name, 
            d.sluong, 
            d.thtien 
        FROM ext_detailhoadon d
        JOIN ext_listhoadon h ON d."idhdonServer" = h."idServer"
        WHERE h."congtyId" = '{COMPANY_ID}'
    """
    df_detail = pd.read_sql(query_detail, engine)
    
    return df_list, df_detail

def smart_map(product_name, df_cat):
    p = str(product_name).lower()
    
    if 'dell' in p: return 'PC-026', 'Máy tính (PC/Laptop) - DELL'
    if 'lenovo' in p or 'thinkbook' in p: return 'PC-040', 'Máy tính (PC/Laptop) - LENOVO'
    if 'asus' in p: return 'PC-020', 'Máy tính (PC/Laptop) - ASUS'
    if 'hp' in p or 'acer' in p: return 'PC-057', 'Máy tính (PC/Laptop) - Khác'
    if 'chuột' in p or 'mouse' in p: return 'PC-061', 'Máy tính (PC/Laptop) - Chuột máy'
    if 'bàn phím' in p or 'keyboard' in p: return 'PC-060', 'Máy tính (PC/Laptop) - Bàn phím'
    if 'tp-link' in p or 'switch' in p or 'chuyển mạch' in p: return 'OTH-013', 'Thiết bị mạng & Router Mesh chuyên dụng'
    if 'thu phát' in p or 'wifi' in p or 'access point' in p: return 'OTH-042', 'Access Point & WiFi công nghiệp công suất lớn'
    if 'máy in' in p:
        if 'brother' in p: return 'VP-006', 'Thiết bị văn phòng - BROTHER'
        if 'canon' in p: return 'VP-009', 'Thiết bị văn phòng - CANON'
        return 'VP-024', 'Thiết bị văn phòng - LASER'
    if 'cước' in p or 'viễn thông' in p: return 'OTH-004', 'Cước dịch vụ Viễn thông & Truyền dẫn dữ liệu'
    if 'giao nhận' in p or 'vận chuyển' in p or 'vận đơn' in p or 'chuyển phát' in p or 'phí' in p: return 'OTH-005', 'Phí chuyển phát nhanh & Giao nhận Logistics'
    if 'dịch vụ' in p: return 'SRV-004', 'Dịch vụ & Thi công - Dịch vụ'
    if 'khuyến mãi' in p or 'khuyến mại' in p or 'tặng' in p: return 'OTH-059', 'Hàng hóa phục vụ Khuyến mại & Sự kiện'
    if 'ghi hình' in p or 'camera' in p or 'logitech webcam' in p: return 'OTH-003', 'Thiết bị Ghi hình & Hội nghị kỹ thuật số'
    if 'máy chiếu' in p or 'màn chiếu' in p: return 'OTH-065', 'Máy chiếu & Thiết bị trình chiếu kỹ thuật số'
    if 'cáp' in p or 'đầu nối' in p: return 'OTH-007', 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa'
    if 'usb' in p: return 'OTH-080', 'Cáp & Bộ chuyển đổi USB Type-C thế hệ mới'
    if 'ổ cứng' in p or 'ssd' in p or 'hdd' in p: return 'OTH-022', 'Thiết bị lưu trữ di dộng & Thẻ nhớ NAND'
    if 'bo mạch' in p or 'mainboard' in p: return 'OTH-054', 'Bo mạch chủ (Mainboard) lắp ráp PC phổ thông'
    if 'vga' in p or 'card đồ họa' in p: return 'OTH-037', 'Card đồ họa Rời & Xử lý hình ảnh chuyên sâu'
    if 'ram' in p or 'bộ nhớ' in p: return 'PC-062', 'Máy tính (PC/Laptop) - DDR4-2400'
    if 'nguồn' in p or 'jetek' in p: return 'PC-065', 'Máy tính (PC/Laptop) - JETEK'
    if 'chấm công' in p: return 'OTH-083', 'Thiết bị kiểm soát ra vào & Máy chấm công'
    if 'mực' in p: return 'VP-036', 'Thiết bị văn phòng - Mực nước'
    if 'máy chủ' in p or 'server' in p: return 'SRV-001', 'Máy chủ (Server) & Giải pháp doanh nghiệp'
    if 'phần mềm' in p or 'bản quyền' in p: return 'OTH-045', 'Bản quyền Phần mềm & Hệ điều hành'

    for _, row in df_cat.iterrows():
        clean_cat = row['ten'].lower().replace("máy tính (pc/laptop) - ", "").replace("thiết bị văn phòng - ", "")
        if clean_cat != 'khác' and len(clean_cat) > 3 and clean_cat in p: return row['ma'], row['ten']
    for _, row in df_cat.iterrows():
        parts = row['ten'].lower().replace("máy tính", "").replace("văn phòng", "").split()
        for w in parts:
            if len(w) > 4 and w in p: return row['ma'], row['ten']
            
    return 'OTH-017', 'Vật tư kỹ thuật khác chưa phân loại'

def generate_mock_product(invoice_id_str):
    h = int(hashlib.md5(invoice_id_str.encode()).hexdigest()[:8], 16)
    mocks = [
        ("Máy tính để bàn HP", 12000000),
        ("Máy tính xách tay DELL", 18000000),
        ("Máy in trắng đen Canon", 3500000),
        ("Ổ cứng SSD 512GB", 800000),
        ("Chuột máy tính không dây", 200000),
        ("Cáp mạng RJ45 2m", 50000),
        ("Thiết bị mạng Switch TP-Link", 1200000),
        ("Bản quyền MS Windows", 2000000)
    ]
    return mocks[h % len(mocks)]

def assemble_raw_data(df_list, df_detail, df_cat):
    invoices_with_details = set(df_detail['idhdonServer'])
    missing_invoices = df_list[~df_list['idServer'].isin(invoices_with_details)]
    
    valid_details = pd.merge(df_detail, df_list[['idServer', 'tdlap', 'loaihd']], left_on='idhdonServer', right_on='idServer')
    
    new_rows = []
    for _, row in missing_invoices.iterrows():
        if row['tgtttbso'] <= 0: continue
        total = row['tgtttbso']
        prod_name, unit_price = generate_mock_product(row['idServer'])
        qty = round(total / unit_price, 2)
        if qty < 1: qty = 1
        
        new_rows.append({
            'idhdonServer': row['idServer'],
            'product_name': prod_name,
            'sluong': qty,
            'thtien': total,
            'idServer': row['idServer'],
            'tdlap': row['tdlap'],
            'loaihd': row['loaihd']
        })
        
    synthesized = pd.DataFrame(new_rows)
    raw_data = pd.concat([valid_details, synthesized], ignore_index=True)
    raw_data['tdlap'] = pd.to_datetime(raw_data['tdlap'])
    raw_data['year'] = raw_data['tdlap'].dt.year
    raw_data['month'] = raw_data['tdlap'].dt.month
    raw_data['ym'] = raw_data['year'] * 100 + raw_data['month']
    
    mapping_dict = {}
    unique_products = raw_data['product_name'].unique()
    for p in unique_products:
        mapping_dict[p] = smart_map(p, df_cat)
        
    if len(raw_data) > 0:
        raw_data['cat_ma'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][0])
    
    return raw_data

def evaluate_deficits():
    df_cat = read_categories()
    df_list, df_detail = get_full_data()
    raw_data = assemble_raw_data(df_list, df_detail, df_cat)
    
    # Sort chronologically
    months = sorted(raw_data['ym'].unique())
    
    active_cats = raw_data['cat_ma'].unique().tolist()
    
    deficits = {}
    
    for ma in active_cats:
        run_sl = 0
        run_vnd = 0
        min_sl = 0
        min_vnd = 0
        
        tx_cat = raw_data[raw_data['cat_ma'] == ma]
        for ym in months:
            m_tx = tx_cat[tx_cat['ym'] == ym]
            nhap_sl = m_tx[m_tx['loaihd'] == 'muavao']['sluong'].sum()
            nhap_vnd = m_tx[m_tx['loaihd'] == 'muavao']['thtien'].sum()
            xuat_sl = m_tx[m_tx['loaihd'] == 'banra']['sluong'].sum()
            xuat_vnd = m_tx[m_tx['loaihd'] == 'banra']['thtien'].sum()
            
            run_sl += nhap_sl - xuat_sl
            run_vnd += nhap_vnd - xuat_vnd
            
            if run_sl < min_sl: min_sl = run_sl
            if run_vnd < min_vnd: min_vnd = run_vnd
            
        deficits[ma] = {
            'req_sl': -min_sl,
            'req_vnd': -min_vnd
        }
    
    total_req_vnd = sum(d['req_vnd'] for d in deficits.values())
    print("Total Required Initial Balance VNĐ to prevent negatives:", total_req_vnd)
    print("Available Initial Balance:", INITIAL_BALANCE)
    print("Deficit/Surplus:", INITIAL_BALANCE - total_req_vnd)

if __name__ == '__main__':
    evaluate_deficits()
