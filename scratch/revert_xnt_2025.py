import os
import sys
from sqlalchemy import create_engine
import json

# Add current dir to path to import generate_huyvu_xlsx
sys.path.append('/chikiet/kata2025/ragketoan/python')
import generate_huyvu_xlsx

def revert_2025():
    engine = create_engine(generate_huyvu_xlsx.DB_URI)
    
    # We need prev_closing from 2024 to be accurate
    # Let's run 2023, 2024 first to get the correct opening for 2025
    prev_closing = {'OTH-GEN': {'qty': 20000, 'val': 20528682383.0}}
    
    for year in [2023, 2024, 2025]:
        skip_path = f"/chikiet/kata2025/ragketoan/python/skip_lists/skip_list_{year}.json"
        skip_shdons = set()
        if os.path.exists(skip_path):
            with open(skip_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                entries = data.get('skip_entries', []) if isinstance(data, dict) else data
                for s in entries:
                    skip_shdons.add(str(s.get('shdon', s) if isinstance(s, dict) else s))
        
        print(f"Processing year {year} to get state...")
        results = generate_huyvu_xlsx.process_year(year, engine, prev_opening_balance=prev_closing, skip_list=skip_shdons)
        if year == 2025:
            output_path = "/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025.xlsx"
            generate_huyvu_xlsx.save_excel(results, output_path)
            print(f"Reverted {output_path} to original state.")
        if results:
            prev_closing = results['closing_balance']

if __name__ == "__main__":
    revert_2025()
