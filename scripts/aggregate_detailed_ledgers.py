import pandas as pd
import re
import os
import glob

def parse_md_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Extract table rows
    data = []
    columns = []
    table_started = False
    
    for line in lines:
        if '|' in line:
            parts = [p.strip() for p in line.split('|') if p.strip()]
            if not table_started:
                if 'Ngày' in parts:
                    columns = parts
                    table_started = True
            elif '---' in line:
                continue
            else:
                # Pad row with empty strings if it has fewer columns than the header
                row = parts + [''] * (len(columns) - len(parts))
                # If row has MORE columns, trim it
                row = row[:len(columns)]
                data.append(row)
    
    if not data:
        return None
    
    df = pd.DataFrame(data, columns=columns)
    
    # Clean numeric columns (Nợ, Có)
    def clean_numeric(val):
        if not val or val == '0':
            return 0.0
        # Remove dots (thousands separator in Vietnam) and replace comma with dot if needed
        # But here they use dots for thousands and commas are usually not used or used for decimals.
        # Let's assume dots are thousands and we need to remove them.
        cleaned = str(val).replace('.', '').replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    if 'Nợ' in df.columns:
        df['Nợ'] = df['Nợ'].apply(clean_numeric)
    if 'Có' in df.columns:
        df['Có'] = df['Có'].apply(clean_numeric)
        
    return df

def aggregate_ledgers():
    source_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/'
    output_file = os.path.join(source_dir, 'TONG_HOP_SO_CHI_TIET_THUC_TE_2023_HUYVU.xlsx')
    
    md_files = sorted(glob.glob(os.path.join(source_dir, 'ACTUAL_DETAIL_*_2023.md')))
    
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        for file in md_files:
            # Extract account number from filename
            account_num = re.search(r'ACTUAL_DETAIL_(\d+)_2023', os.path.basename(file))
            if account_num:
                sheet_name = f"TK {account_num.group(1)}"
                print(f"Processing {file} -> Sheet {sheet_name}")
                df = parse_md_table(file)
                if df is not None:
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
                else:
                    print(f"Warning: No table found in {file}")

    print(f"Successfully created: {output_file}")

if __name__ == "__main__":
    aggregate_ledgers()
