import pandas as pd
import os

def parse_md_table_carefully(file_path):
    print(f"Parsing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        data_rows = []
        in_table = False
        for line in lines:
            line = line.strip()
            if '|' in line:
                if '---' in line: continue
                parts = [p.strip() for p in line.split('|')]
                if not parts[0]: parts = parts[1:]
                if not parts[-1]: parts = parts[:-1]
                if not in_table: # Header row
                    in_table = True
                else:
                    if len(parts) >= 6: # Date, Doc, Desc, Partner, Contra, No, Co
                        data_rows.append(parts)
        if not data_rows: return None
        # Date, Doc No, Desc, Partner, TK Đ/Ứ, Nợ, Có (7 columns)
        # But some files might have more or fewer cells if pipes are used in Desc.
        # Let's just print the first row to see.
        print(f"First row: {data_rows[0]}")
        return data_rows
    except Exception as e:
        print(f"Error: {e}")
        return None

path = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/ACTUAL_DETAIL_642_2023.md"
df = parse_md_table_carefully(path)
if df: print(f"Lines: {len(df)}")
