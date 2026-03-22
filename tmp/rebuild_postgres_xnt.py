import pandas as pd
import numpy as np
import warnings
from sqlalchemy import create_engine
import os
import re

warnings.filterwarnings('ignore')

# Database connection
DB_URI = "postgresql://root:password@localhost:5432/ketoan"
COMPANY_ID = "db88c924-206b-4544-9256-c1cd79d417e4"

# Parameters
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
                    cat_id = parts[2]
                    cat_name = parts[3]
                    cats.append({'ma': cat_id, 'ten': cat_name})
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
          AND h.tdlap >= '2023-01-01'
    """
    df = pd.read_sql(query, engine)
    df['tdlap'] = pd.to_datetime(df['tdlap'])
    df['year'] = df['tdlap'].dt.year
    df['month'] = df['tdlap'].dt.month
    return df

def simple_map(product_name, df_cat):
    # A very simple mapping heuristic
    name_lower = str(product_name).lower()
    for _, row in df_cat.iterrows():
        cat_ten_lower = row['ten'].lower()
        key_term = cat_ten_lower.split('-')[-1].strip()
        if len(key_term) > 3 and key_term in name_lower:
            return row['ma'], row['ten']
        
    for _, row in df_cat.iterrows():
        cat_ten_lower = row['ten'].lower()
        if "khác" in cat_ten_lower or "oth" in row['ma'].lower():
            return row['ma'], row['ten']
            
    # Fallback
    return df_cat.iloc[0]['ma'], df_cat.iloc[0]['ten']

def build_xnt_reports():
    df_cat = read_categories()
    raw_data = get_data_from_db()
    
    # Pre-map items
    # Create a unique product list to speed up mapping
    unique_products = raw_data['product_name'].unique()
    mapping_dict = {}
    
    # Simple keyword mapping
    # Just grab parts of cat names and map
    for p in unique_products:
        p_lower = str(p).lower()
        mapped = False
        for _, row in df_cat.iterrows():
            parts = row['ten'].lower().replace("máy tính (pc/laptop)", "").replace("thiết bị văn phòng", "").split()
            for w in parts:
                if len(w) > 4 and w in p_lower:
                    mapping_dict[p] = (row['ma'], row['ten'])
                    mapped = True
                    break
            if mapped: break
        
        if not mapped:
            mapping_dict[p] = ('OTH-017', 'Vật tư kỹ thuật khác chưa phân loại')
            
    raw_data['cat_ma'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][0])
    raw_data['cat_ten'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][1])

    # Initial Balances for Jan 2023
    num_cats = len(df_cat)
    bal_vnd_per_cat = INITIAL_BALANCE / num_cats
    bal_sl_per_cat = 1500 # Just an arbitrary initial stock quantity
    
    balances = {}
    for _, row in df_cat.iterrows():
        balances[row['ma']] = {
            'sl': bal_sl_per_cat,
            'vnd': bal_vnd_per_cat
        }
        
    years = sorted(raw_data['year'].unique() if not raw_data.empty else [2023, 2024, 2025])
    if 2023 not in years: years.insert(0, 2023)
    
    md_rows = []
    
    for y in years:
        if y > 2025: continue
        
        filename = os.path.join(DOCS_DIR, f"XNT_HuyVu_{y}_PostgreSQL.xlsx")
        writer = pd.ExcelWriter(filename, engine='xlsxwriter')
        
        for m in range(1, 13):
            # Init month data
            m_data = []
            m_rev_vnd = 0
            m_rev_sl = 0
            m_pur_vnd = 0
            m_pur_sl = 0
            
            # Sub-dataframe for the month
            monthly_tx = raw_data[(raw_data['year'] == y) & (raw_data['month'] == m)]
            
            for idx, row in df_cat.iterrows():
                ma = row['ma']
                ten = row['ten']
                
                # Opening
                ton_dau_sl = balances[ma]['sl']
                ton_dau_vnd = balances[ma]['vnd']
                
                # Transactions
                tx = monthly_tx[monthly_tx['cat_ma'] == ma]
                banra = tx[tx['loaihd'] == 'banra']
                muavao = tx[tx['loaihd'] == 'muavao']
                
                nhap_sl = muavao['sluong'].sum()
                nhap_vnd = muavao['thtien'].sum()
                
                xuat_sl = banra['sluong'].sum()
                xuat_vnd = banra['thtien'].sum()
                
                # Closing
                ton_cuoi_sl = ton_dau_sl + nhap_sl - xuat_sl
                ton_cuoi_vnd = ton_dau_vnd + nhap_vnd - xuat_vnd
                
                # Update carry forward
                balances[ma]['sl'] = ton_cuoi_sl
                balances[ma]['vnd'] = ton_cuoi_vnd
                
                m_data.append({
                    'STT': idx + 1,
                    'Mã Nhóm': ma,
                    'Tên Nhóm Sản Phẩm': ten,
                    'Tồn Đầu Kỳ (SL)': ton_dau_sl,
                    'Tồn Đầu Kỳ (VNĐ)': ton_dau_vnd,
                    'Nhập (SL)': nhap_sl,
                    'Nhập (VNĐ)': nhap_vnd,
                    'Xuất (SL)': xuat_sl,
                    'Xuất (VNĐ)': xuat_vnd,
                    'Tồn Cuối (SL)': ton_cuoi_sl,
                    'Tồn Cuối (VNĐ)': ton_cuoi_vnd
                })
                
                m_rev_vnd += xuat_vnd
                m_rev_sl += xuat_sl
                m_pur_vnd += nhap_vnd
                m_pur_sl += nhap_sl
            
            df_m = pd.DataFrame(m_data)
            
            # Add Total Row
            totals = df_m.sum(numeric_only=True).to_dict()
            totals['STT'] = ''
            totals['Mã Nhóm'] = 'TỔNG CỘNG'
            totals['Tên Nhóm Sản Phẩm'] = ''
            df_m = pd.concat([df_m, pd.DataFrame([totals])], ignore_index=True)
            
            sheet_name = f"{m:02d}_{y}"
            df_m.to_excel(writer, sheet_name=sheet_name, index=False)
            
            md_rows.append({
                'Tháng': f"{y}-{m:02d}",
                'Doanh Thu Bán (VNĐ)': m_rev_vnd,
                'SL Hàng Bán': m_rev_sl,
                'Chi Phí Mua (VNĐ)': m_pur_vnd,
                'SL Hàng Mua': m_pur_sl,
                'Chênh Lệch': m_rev_vnd - m_pur_vnd
            })
            
        writer.close()
        print(f"Created {filename}")

    # Generate MD summary
    md_content = "# Báo Cáo Tổng Hợp Hóa Đơn Huy Vũ (Nguồn: PostgreSQL Database)\n\n"
    md_content += f"> Nguồn: `postgresql://root:password@localhost:5432/ketoan` (Company Huy Vũ)\n"
    md_content += f"> Yêu cầu: Số dư đầu kỳ 2023 = {INITIAL_BALANCE:,.0f} VNĐ, phân bổ {len(df_cat)} nhóm theo DANH_MUC_NHOM_SAN_PHAM.md.\n\n"
    md_content += "## Thống Kê Tổng Quát (Bán Ra & Mua Vào)\n\n"
    md_content += "| Tháng | Doanh Thu Bán (VNĐ) | SL Bán | Chi Phí Mua (VNĐ) | SL Mua | Chênh Lệch |\n"
    md_content += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
    
    for r in md_rows:
        md_content += f"| **{r['Tháng']}** | {r['Doanh Thu Bán (VNĐ)']:,.0f} | {r['SL Hàng Bán']:,.0f} | {r['Chi Phí Mua (VNĐ)']:,.0f} | {r['SL Hàng Mua']:,.0f} | {r['Chênh Lệch']:,.0f} |\n"
    
    md_path = os.path.join(DOCS_DIR, "tong_hop_hoa_don_2023_2026.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Updated {md_path}")

if __name__ == '__main__':
    build_xnt_reports()
