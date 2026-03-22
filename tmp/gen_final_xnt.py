import subprocess
import csv
import io
import pandas as pd
from datetime import datetime

def run_query(sql):
    result = subprocess.run(
        ["psql", "-h", "localhost", "-U", "root", "-d", "ketoan", "--csv", "-c", sql],
        env={"PGPASSWORD": "password"},
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return []
    f = io.StringIO(result.stdout)
    reader = csv.reader(f)
    next(reader) # skip header
    return list(reader)

# Query data grouped by (maHang, tenHang, dvtinh, nam, thang)
sql = """
SELECT 
    "maHang", 
    "tenHang", 
    "dvtinh", 
    nam, 
    thang, 
    SUM("soLuongNhap") as sln, 
    SUM("giaTriNhap") as gtn, 
    SUM("soLuongXuat") as slx, 
    SUM("giaTriXuat") as gtx
FROM ext_tonghop
WHERE ("nbmst" = '5900363291' OR "nmmst" = '5900363291')
  AND tdlap >= '2023-01-01'
GROUP BY "maHang", "tenHang", "dvtinh", nam, thang
ORDER BY nam, thang, "maHang";
"""

print("Fetching active item movement...")
rows = run_query(sql)

items_data = {}
all_ma_hang = set()

for r in rows:
    if len(r) < 9: continue
    ma, ten, dv, nam, thang, sln, gtn, slx, gtx = r
    nam, thang = int(nam), int(thang)
    sln, gtn, slx, gtx = float(sln), float(gtn), float(slx), float(gtx)
    
    if ma not in items_data:
        items_data[ma] = {
            'info': {'ten': ten, 'dv': dv},
            'months': {}
        }
    items_data[ma]['months'][(nam, thang)] = {'sln': sln, 'gtn': gtn, 'slx': slx, 'gtx': gtx}
    all_ma_hang.add(ma)

# Sequence from 2023-01 to 2026-01
min_y, max_y = 2023, 2026
months_seq = []
for y in range(min_y, max_y + 1):
    for m in range(1, 13):
        if y == 2026 and m > 1: break # Stop at Jan 2026
        months_seq.append((y, m))

md_output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_2023_2026.md"
excel_output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_2023_2026.xlsx"

print(f"Generating reports in /docs/huyvu/...")

# We'll use this to keep track of item balances
balances = {ma: {'sl': 0.0, 'val': 0.0} for ma in all_ma_hang}

# For Excel
writer = pd.ExcelWriter(excel_output_path, engine='openpyxl')

with open(md_output_path, "w", encoding="utf-8") as f_md:
    f_md.write("# Tổng Hợp Xuất Nhập Tồn (01/2023 - 01/2026)\n\n")
    
    f_md.write("## 1. Phương pháp tổng hợp dữ liệu\n")
    f_md.write("Báo cáo được tổng hợp tự động từ hệ thống cơ sở dữ liệu kế toán với các tiêu chí sau:\n\n")
    f_md.write("- **Nguồn dữ liệu**: Bảng `ext_tonghop`, lọc theo mã số thuế `5900363291` (Huy Vũ).\n")
    f_md.write("- **Nguyên lý tính toán**: Sử dụng thuật toán cân đối kho lũy kế (Inventory Rolling Balance).\n")
    f_md.write("  - **Đầu kỳ tháng (T)** = **Cuối kỳ tháng (T-1)**.\n")
    f_md.write("  - **Cuối kỳ tháng (T)** = **Đầu kỳ** + **Nhập** - **Xuất**.\n")
    f_md.write("- **Giá trị tiền**: Được cộng dồn từ cột `giaTriNhap` (Mua vào) và `giaTriXuat` (Doanh thu bán ra) tương ứng cho từng mặt hàng.\n")
    f_md.write("- **Thời gian**: Từ 01/01/2023 đến 01/01/2026.\n\n")
    
    f_md.write("---\n\n")

    for (y, m) in months_seq:
        sheet_name = f"{m:02d}_{y}"
        month_label = f"Tháng {m:02d}/{y}"
        
        table_rows = []
        excel_data = []

        for ma in sorted(all_ma_hang):
            item = items_data[ma]
            mov = item['months'].get((y, m), {'sln': 0, 'gtn': 0, 'slx': 0, 'gtx': 0})
            
            start_sl = balances[ma]['sl']
            start_val = balances[ma]['val']
            
            end_sl = start_sl + mov['sln'] - mov['slx']
            end_val = start_val + mov['gtn'] - mov['gtx']
            
            # Update
            balances[ma]['sl'] = end_sl
            balances[ma]['val'] = end_val
            
            # Non-zero filter
            if abs(start_sl) > 0.001 or abs(mov['sln']) > 0.001 or abs(mov['slx']) > 0.001:
                row_dict = {
                    "Mã - Tên Hàng": f"{ma} - {item['info']['ten']}",
                    "ĐVT": item['info']['dv'],
                    "Đầu Kỳ (SL)": start_sl,
                    "Đầu Kỳ (Tiền)": start_val,
                    "Nhập (SL)": mov['sln'],
                    "Nhập (Tiền)": mov['gtn'],
                    "Xuất (SL)": mov['slx'],
                    "Xuất (Tiền)": mov['gtx'],
                    "Cuối Kỳ (SL)": end_sl,
                    "Cuối Kỳ (Tiền)": end_val
                }
                excel_data.append(row_dict)
                
                md_row = f"| {row_dict['Mã - Tên Hàng']} | {row_dict['ĐVT']} | {start_sl:,.2f} | {start_val:,.0f} | {mov['sln']:,.2f} | {mov['gtn']:,.0f} | {mov['slx']:,.2f} | {mov['gtx']:,.0f} | {end_sl:,.2f} | {end_val:,.0f} |"
                table_rows.append(md_row)

        # Write to Markdown
        if table_rows:
            f_md.write(f"### {month_label}\n\n")
            f_md.write("| Mã - Tên Hàng | ĐVT | Đầu Kỳ (SL) | Đầu Kỳ (Tiền) | Nhập (SL) | Nhập (Tiền) | Xuất (SL) | Xuất (Tiền) | Cuối Kỳ (SL) | Cuối Kỳ (Tiền) |\n")
            f_md.write("| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n")
            f_md.write("\n".join(table_rows))
            f_md.write("\n\n")
            
            # Write to Excel sheet
            df = pd.DataFrame(excel_data)
            df.to_excel(writer, sheet_name=sheet_name, index=False)

writer.close()
print(f"Reports complete:\n - {md_output_path}\n - {excel_output_path}")
