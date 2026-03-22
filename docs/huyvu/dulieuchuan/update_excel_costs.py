import pandas as pd
import openpyxl
from openpyxl.utils import get_column_letter

def add_cost_details(year):
    inv_path = f'/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/invoices_all_{"2023" if year==2023 else "24_25"}.csv'
    excel_path = f'/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu{year}.xlsx'
    
    if not os.path.exists(inv_path) or not os.path.exists(excel_path):
        print(f"Skipping {year}: files missing")
        return

    inv = pd.read_csv(inv_path)
    # Filter for the specific year and muavao
    if year == 2023:
        inv_year = inv[inv['loaihd'] == 'muavao'].copy()
    else:
        # for 24 and 25
        inv['tdlap_dt'] = pd.to_datetime(inv['tdlap'])
        inv_year = inv[(inv['loaihd'] == 'muavao') & (inv['tdlap_dt'].dt.year == year)].copy()
    
    inv_year = inv_year.sort_values('tdlap')
    inv_year['Ngày lập'] = pd.to_datetime(inv_year['tdlap']).dt.strftime('%d/%m/%Y')
    
    # Select and Rename columns for Excel
    inv_year = inv_year[['shdon', 'Ngày lập', 'nbten', 'tgtcthue']].reset_index(drop=True)
    inv_year.columns = ['Số hóa đơn', 'Ngày lập hóa đơn', 'Nhà cung cấp', 'Tổng tiền (VNĐ)']
    
    # Adding STT
    inv_year.insert(0, 'STT', range(1, len(inv_year) + 1))
    
    # Append sheet to Excel
    with pd.ExcelWriter(excel_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        inv_year.to_excel(writer, sheet_name='Chi tiết Chi phí', index=False)
    
    print(f"Added 'Chi tiết Chi phí' sheet to Huyvu{year}.xlsx")

import os
# Process all years
for y in [2023, 2024, 2025]:
    add_cost_details(y)
