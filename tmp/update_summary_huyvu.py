import subprocess
import csv
import io
import pandas as pd
import os

def run_query(sql):
    result = subprocess.run(
        ["psql", "-h", "localhost", "-U", "root", "-d", "ketoan", "--csv", "-c", sql],
        env={"PGPASSWORD": "password"},
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return pd.DataFrame()
    return pd.read_csv(io.StringIO(result.stdout))

def update_summary():
    mst = "5900363291"
    
    # 1. Monthly basic stats from ext_listhoadon
    q_h = f"""
    SELECT 
        to_char(tdlap, 'YYYY-MM') as month,
        SUM(CASE WHEN nbmst = '{mst}' THEN cast(tgtttbso as numeric) ELSE 0 END) as ban_ra_vnđ,
        COUNT(CASE WHEN nbmst = '{mst}' THEN 1 END) as ban_ra_hd,
        SUM(CASE WHEN nmmst = '{mst}' THEN cast(tgtttbso as numeric) ELSE 0 END) as mua_vao_vnđ,
        COUNT(CASE WHEN nmmst = '{mst}' THEN 1 END) as mua_vao_hd
    FROM ext_listhoadon
    WHERE (nbmst = '{mst}' OR nmmst = '{mst}')
      AND tdlap >= '2023-01-01' AND tdlap < '2026-04-01'
      AND tthai = '1'
    GROUP BY month
    ORDER BY month;
    """
    df_h = run_query(q_h)
    
    # 2. Detail stats from ext_tonghop
    q_d = f"""
    SELECT 
        to_char(tdlap, 'YYYY-MM') as month,
        loaihd,
        "tenHang",
        sluong,
        thtien,
        tsuat,
        "tongTien" as tgtttbso
    FROM ext_tonghop
    WHERE (nbmst = '{mst}' OR nmmst = '{mst}')
      AND tdlap >= '2023-01-01' AND tdlap < '2026-04-01'
      AND tthai = '1';
    """
    df_details = run_query(q_d)
    
    if df_details.empty:
        print("No details found.")
        return

    # Classification Logic
    def classify(row):
        ten = str(row['tenHang']).lower()
        loaihd = row['loaihd']
        thtien = float(row['thtien'] or 0)
        tsuat = float(row['tsuat'] or 0)
        
        # 1. Khuyến mãi / Giảm giá
        if any(kd in ten for kd in ['khuyến mãi', 'khuyến mại', 'giảm giá', 'chiết khấu', 'ck ']) or thtien < 0:
            return 'PROMO'
        
        # 2. Chi phí
        if loaihd == 'muavao' and any(kc in ten for kc in ['chi phí', 'cước', 'phí', 'dịch vụ', 'điện', 'nước', 'vận chuyển', 'viễn thông', 'internet', 'wifi']):
            return 'COST'
        
        # 3. KCT
        if loaihd == 'banra' and tsuat == 0:
            return 'NON_TAX'
        
        return 'GOODS'

    df_details['cat'] = df_details.apply(classify, axis=1)
    df_details['tgtttbso'] = pd.to_numeric(df_details['tgtttbso'], errors='coerce').fillna(0)
    df_details['sluong'] = pd.to_numeric(df_details['sluong'], errors='coerce').fillna(0)
    
    # Pivot Monthly Summary
    results = []
    for month in sorted(df_details['month'].unique()):
        m_data = df_details[df_details['month'] == month]
        banra = m_data[m_data['loaihd'] == 'banra']
        muavao = m_data[m_data['loaihd'] == 'muavao']
        
        results.append({
            'month': month,
            'sl_ban': banra['sluong'].sum(),
            'sl_mua': muavao['sluong'].sum(),
            'cp_rieng_mua': muavao[muavao['cat'] == 'COST']['tgtttbso'].sum(),
            'th_rieng_ban': banra[banra['cat'] == 'GOODS']['tgtttbso'].sum(),
            'th_rieng_mua': muavao[muavao['cat'] == 'GOODS']['tgtttbso'].sum(),
            'km_rieng_ban': banra[banra['cat'] == 'PROMO']['tgtttbso'].sum(),
            'km_rieng_mua': muavao[muavao['cat'] == 'PROMO']['tgtttbso'].sum(),
            'dt_kct_ban': banra[banra['cat'] == 'NON_TAX']['tgtttbso'].sum()
        })
        
    df_s = pd.DataFrame(results)
    
    # Final Merge
    final_df = pd.merge(df_h, df_s, on='month', how='outer').fillna(0)
    
    # Formatting helper for display
    def fmt_num(val):
        return f"{val:,.0f}".replace(',', '.')
    
    # Generate MD content
    md = "# Báo Cáo Tổng Hợp Hóa Đơn Huy Vũ (01/2023 - 02/2026)\n\n"
    md += "## 1. Thống Kê Tổng Quát (Banra & Muavao)\n\n"
    md += "| Tháng | Doanh Thu Bán (VNĐ) | SL HD | SL Hàng | Chi Phí Mua (VNĐ) | SL HD | SL Hàng | Chênh Lệch |\n"
    md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
    
    for _, r in final_df.iterrows():
        diff = r['ban_ra_vnđ'] - r['mua_vao_vnđ']
        md += f"| **{r['month']}** | {fmt_num(r['ban_ra_vnđ'])} | {int(r['ban_ra_hd'])} | {fmt_num(r['sl_ban'])} | {fmt_num(r['mua_vao_vnđ'])} | {int(r['mua_vao_hd'])} | {fmt_num(r['sl_mua'])} | {fmt_num(diff)} |\n"
    
    md += "\n## 2. Phân Tích Chi Tiết (Nghiệp vụ Hạch toán)\n\n"
    md += "| Tháng | Tiền Hàng Riêng (Bán) | DT Không Thuế | Khuyến Mãi (Bán) | CP Riêng (Mua) | Tiền Hàng (Mua) | KM (Mua) |\n"
    md += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n"
    
    for _, r in final_df.iterrows():
        md += f"| **{r['month']}** | {fmt_num(r['th_rieng_ban'])} | {fmt_num(r['dt_kct_ban'])} | {fmt_num(r['km_rieng_ban'])} | {fmt_num(r['cp_rieng_mua'])} | {fmt_num(r['th_rieng_mua'])} | {fmt_num(r['km_rieng_mua'])} |\n"
        
    md += "\n## 3. Ghi Chú\n"
    md += "- **Tiền hàng riêng**: Trị giá hàng hóa chính.\n"
    md += "- **CP Riêng**: Các khoản phí dịch vụ, vận chuyển, điện nước, vv.\n"
    md += "- **KM riêng**: Các khoản chiết khấu, giảm giá, hàng KM không thu tiền.\n"
    md += "- **DT Không thuế**: Doanh thu từ các mặt hàng không chịu thuế GTGT (Lãi vay, vv).\n"
    md += "- **Số lượng hàng**: Tổng cộng cột `sluong` của tất cả các dòng chi tiết.\n"
    md += "\n--- *AI Generated Summary - 2026-03-22*"
    
    output_path = '/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_hoa_don_2023_2026.md'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(md)
    print(f"Report updated at {output_path}")

if __name__ == "__main__":
    update_summary()
