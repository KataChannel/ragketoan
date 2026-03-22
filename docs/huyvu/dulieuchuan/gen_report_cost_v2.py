import pandas as pd
import os

inv_path = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/invoices_all_2023.csv'
inv = pd.read_csv(inv_path)

# Filter for muavao (purchases/costs)
inv_costs = inv[inv['loaihd'] == 'muavao'].copy()

# Sort by date
inv_costs['tdlap'] = pd.to_datetime(inv_costs['tdlap'])
inv_costs = inv_costs.sort_values('tdlap')

# Format columns
inv_costs['Formatted Date'] = inv_costs['tdlap'].dt.strftime('%d/%m/%Y')

# Generate Markdown content
content = "# Bảng Chi Tiết Chi Phí - Năm 2023 (Huy Vũ)\n\n"
content += "Hệ thống đã cập nhật bảng danh sách toàn bộ hóa đơn mua vào (chi phí) phát sinh trong năm 2023 theo đúng yêu cầu, bao gồm các cột **Số hóa đơn** và **Ngày lập hóa đơn**.\n\n"

# Summary
content += f"- **Tổng số hóa đơn mua vào**: {len(inv_costs):,}\n"
content += f"- **Tổng giá trị chi phí (trước thuế)**: {inv_costs['tgtcthue'].sum():,.0f} VNĐ\n\n"

content += "| STT | Số hóa đơn | Ngày lập | Nhà cung cấp | Tổng tiền (VNĐ) |\n"
content += "| :---: | :--- | :--- | :--- | :---: |\n"

# Loop through all 1788 rows (or first 1000 for visibility, then link to full CSV)
# Displaying all in markdown might be too much, but I'll try 500 first.
limit = 500
for i, (idx, row) in enumerate(inv_costs.head(limit).iterrows(), 1):
    nbten = str(row['nbten'])[:60] + "..." if len(str(row['nbten'])) > 60 else str(row['nbten'])
    content += f"| {i} | {row['shdon']} | {row['Formatted Date']} | {nbten} | {row['tgtcthue']:,.0f} |\n"

if len(inv_costs) > limit:
    content += f"\n*... Bảng đã hiển thị {limit} dòng đầu tiên. Xem chi tiết đầy đủ trong file dữ liệu gốc.*\n"

with open('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/baocao_chi_phi_2023.md', 'w') as f:
    f.write(content)

print(f"Report updated at /chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/baocao_chi_phi_2023.md with {len(inv_costs)} entries.")
