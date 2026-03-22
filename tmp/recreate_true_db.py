import pandas as pd
import numpy as np
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

def build_xnt_reports():
    df_cat = read_categories()
    raw_data = get_data_from_db()
    
    unique_products = raw_data['product_name'].unique()
    mapping_dict = {}
    
    for p in unique_products:
        p_lower = str(p).lower()
        mapped = False
        # Try finding words from category names
        for _, row in df_cat.iterrows():
            clean_cat = row['ten'].lower().replace("máy tính (pc/laptop) - ", "").replace("thiết bị văn phòng - ", "")
            if clean_cat in p_lower:
                mapping_dict[p] = (row['ma'], row['ten'])
                mapped = True
                break
        
        if not mapped:
            for _, row in df_cat.iterrows():
                parts = row['ten'].lower().replace("máy tính", "").replace("văn phòng", "").split()
                for w in parts:
                    if len(w) > 4 and w in p_lower:
                        mapping_dict[p] = (row['ma'], row['ten'])
                        mapped = True
                        break
                if mapped: break
                
        if not mapped:
            mapping_dict[p] = ('OTH-017', 'Vật tư kỹ thuật khác chưa phân loại')

    if len(raw_data) > 0:
        raw_data['cat_ma'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][0])
        raw_data['cat_ten'] = raw_data['product_name'].apply(lambda x: mapping_dict[x][1])
    else:
        raw_data = pd.DataFrame(columns=['tdlap', 'loaihd', 'product_name', 'sluong', 'thtien', 'year', 'month', 'cat_ma', 'cat_ten'])

    num_cats = len(df_cat)
    # Using float for precise distribution, round at display if necessary
    bal_vnd_per_cat = INITIAL_BALANCE / num_cats
    bal_sl_per_cat = 500 
    
    balances = {}
    for _, row in df_cat.iterrows():
        balances[row['ma']] = {'sl': bal_sl_per_cat, 'vnd': bal_vnd_per_cat}
        
    years = [2023, 2024, 2025, 2026]
    md_rows = []
    
    for y in years:
        filename = os.path.join(DOCS_DIR, f"XNT_HuyVu_{y}.xlsx")
        writer = pd.ExcelWriter(filename, engine='xlsxwriter')
        
        for m in range(1, 13):
            # Stop generating future months for 2026 since there's no data
            if y == 2026 and m > 12: break # we generate up to current known data, actually let's generate all 12.
            
            m_data = []
            m_rev_vnd = 0; m_rev_sl = 0; m_pur_vnd = 0; m_pur_sl = 0
            monthly_tx = raw_data[(raw_data['year'] == y) & (raw_data['month'] == m)]
            
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
            totals = df_m.sum(numeric_only=True).to_dict()
            totals['STT'] = ''; totals['Mã Nhóm'] = 'TỔNG CỘNG'; totals['Tên Nhóm Sản Phẩm'] = ''
            df_m = pd.concat([df_m, pd.DataFrame([totals])], ignore_index=True)
            
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
    md_content += f"> Theo sát yêu cầu `yeucau.md`: Tồn đầu 2023 là {INITIAL_BALANCE:,.0f} VNĐ, phân bổ {num_cats} nhóm sản phẩm.\n\n"
    md_content += "## Thống Kê Tổng Quát (Bán Ra & Mua Vào)\n\n"
    md_content += "| Tháng | Doanh Thu Bán (VNĐ) | SL Bán | Chi Phí Mua (VNĐ) | SL Mua | Chênh Lệch |\n"
    md_content += "| :--- | :--- | :--- | :--- | :--- | :--- |\n"
    
    for r in md_rows:
        if r['Doanh Thu Bán (VNĐ)'] == 0 and r['Chi Phí Mua (VNĐ)'] == 0 and r['Tháng'].startswith('2026'): continue # omit empty 2026
        md_content += f"| **{r['Tháng']}** | {r['Doanh Thu Bán (VNĐ)']:,.0f} | {r['SL Bán']:,.0f} | {r['Chi Phí Mua (VNĐ)']:,.0f} | {r['SL Mua']:,.0f} | {r['Chênh Lệch']:,.0f} |\n"
        
    md_path = os.path.join(DOCS_DIR, "tong_hop_hoa_don_2023_2026.md")
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(md_content)
    print(f"Updated {md_path}")

if __name__ == '__main__':
    build_xnt_reports()
