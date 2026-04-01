import pandas as pd
import re
import os
import json

# ============================================================
# CONFIG
# ============================================================
MAPPING_FILE = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/2.mapping_341_items.md"
STD_XNT_FILE = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/dulieuchuan/XNT năm 2023 HHP.xlsx"
OUTPUT_DATA = "/tmp/std_movements_2023.json"

def get_mapping():
    mapping = {} # Name -> MaHang
    if os.path.exists(MAPPING_FILE):
        with open(MAPPING_FILE, 'r', encoding='utf-8') as f:
            content = f.read()
        pattern = re.compile(r'\|\s*\d+\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|')
        for line in content.split('\n'):
            m = pattern.search(line)
            if m:
                ma = m.group(1).strip()
                t23r = m.group(3).strip()
                if ma == "Mã Hàng (2024)": continue
                names = [x.strip().upper() for x in t23r.split('<br>')]
                for n in names:
                    if n and n != "*KHÔNG TÌM THẤY*":
                        mapping[n] = ma
    return mapping

def extract_std_data():
    mapping = get_mapping()
    sheets = ['Tháng ' + str(i) for i in range(1, 13)]
    movements = {}
    
    for month_idx, sheet_name in enumerate(sheets, 1):
        try:
            df = pd.read_excel(STD_XNT_FILE, sheet_name=sheet_name, skiprows=1)
        except Exception as e:
            print(f"Skipping {sheet_name}: {e}")
            continue
            
        for _, row in df.iterrows():
            if pd.isna(row.iloc[0]): continue
            name = str(row.iloc[0]).strip().upper()
            if name == "TỔNG CỘNG" or "TỔNG" in name: continue
            
            ma = mapping.get(name)
            if not ma:
                # Try a bit more aggressive cleaning
                clean_name = name.replace('  ', ' ')
                ma = mapping.get(clean_name)
                
            if not ma:
                continue
                
            try:
                n_qty = float(row.iloc[4]) if not pd.isna(row.iloc[4]) else 0.0
                x_qty = float(row.iloc[6]) if not pd.isna(row.iloc[6]) else 0.0
            except:
                n_qty = 0.0
                x_qty = 0.0
            
            if ma not in movements:
                movements[ma] = {str(m): {'nhap': 0.0, 'xuat': 0.0} for m in range(1, 13)}
            
            movements[ma][str(month_idx)]['nhap'] += n_qty
            movements[ma][str(month_idx)]['xuat'] += x_qty

    with open(OUTPUT_DATA, 'w', encoding='utf-8') as f:
        json.dump(movements, f, ensure_ascii=False, indent=2)
    print(f"Extracted movements for {len(movements)} items.")

if __name__ == "__main__":
    extract_std_data()
