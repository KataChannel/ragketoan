import pandas as pd
import os

# Load data
det_path = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_2023.csv'
inv_path = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/invoices_all_2023.csv'

if not os.path.exists(det_path) or not os.path.exists(inv_path):
    print("Files not found")
    exit(1)

det = pd.read_csv(det_path)
inv = pd.read_csv(inv_path)

# Filter for muavao (Costs/Purchases)
det_costs = det[det['loaihd'] == 'muavao'].copy()
inv_costs = inv[inv['loaihd'] == 'muavao'].copy()

# Ensure types match for merging
det_costs['shdon'] = det_costs['shdon'].astype(str)
inv_costs['shdon'] = inv_costs['shdon'].astype(str)

# Merge to get Date
merged = det_costs.merge(inv_costs[['shdon', 'tdlap']], on='shdon', how='left')

# Format "Số hóa đơn (Ngày lập)"
merged['hd_ngay'] = merged['shdon'] + " (" + merged['tdlap'].fillna('').str[:10] + ")"

# Prepare Markdown
content = "# Bảng Chi Tiết Chi Phí Năm 2023\n\n"
content += "Hệ thống đã cập nhật bảng chi tiết các khoản chi phí mua vào cho năm 2023, đồng thời bổ sung cột **Số hóa đơn (Ngày lập hóa đơn)** theo đúng yêu cầu của bạn.\n\n"

# Summary Table
total_val = merged['thtien'].sum()
content += f"**Tổng cộng số dòng chi phí**: {len(merged)}\n"
content += f"**Tổng giá trị chi phí (trước thuế)**: {total_val:,.0f} VNĐ\n\n"

content += "| Hóa đơn (Ngày lập) | Nhà cung cấp | Tên mặt hàng/Dịch vụ | ĐVT | SL | Thành tiền (VNĐ) |\n"
content += "| :--- | :--- | :--- | :---: | :---: | :---: |\n"

# Cap for display if too many? No, user asked for "Bảng chi tiết". I'll show top 500 or so if it becomes huge, but 1800 rows is fine for MD files.
for _, row in merged.iterrows():
    nbten = str(row['nbten'])[:50] + "..." if len(str(row['nbten'])) > 50 else str(row['nbten'])
    item_ten = str(row['ten'])[:80] + "..." if len(str(row['ten'])) > 80 else str(row['ten'])
    content += f"| {row['hd_ngay']} | {nbten} | {item_ten} | {row['dvtinh']} | {row['sluong']:.2f} | {row['thtien']:,.0f} |\n"

# Footer
content += "\n---\n*Trích xuất từ hệ thống Rag Ketoan - Huy Vũ 2023*\n"

with open('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/baocao_chi_phi_2023.md', 'w') as f:
    f.write(content)
print("Report generated at /chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/baocao_chi_phi_2023.md")
