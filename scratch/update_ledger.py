import pandas as pd
import numpy as np
import os

target_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
source_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"
output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023_UPDATED.xlsx"

print("Loading target file...")
df_target = pd.read_excel(target_path)
print(f"Target file loaded. Shape: {df_target.shape}")

# Filter out rows where dr or cr starts with 112
print("Filtering out old bank sources (account 112)...")
mask_bank = (df_target['dr'].astype(str).str.startswith('112')) | (df_target['cr'].astype(str).str.startswith('112'))
df_target_filtered = df_target[~mask_bank].copy()
removed_count = mask_bank.sum()
print(f"Removed {removed_count} rows relating to account 112.")

print("Loading source (standard) file...")
df_source = pd.read_excel(source_path)
print(f"Source file loaded. Shape: {df_source.shape}")

def parse_date(d):
    if pd.isna(d): return d
    if isinstance(d, pd.Timestamp): return d
    s = str(d).strip()
    if '/' in s:
        # Handle 03/012023 case where year lacks separator
        # Pattern: DD/MMYYYY
        if len(s) == 9 and s[2] == '/': # 03/012023
             try:
                 return pd.to_datetime(s[:2] + '/' + s[3:5] + '/' + s[5:], dayfirst=True)
             except: pass
        if len(s) == 10 and s[2] == '/' and s[5] != '/': # 03/012023 (if extra char?)
             try:
                 return pd.to_datetime(s[:2] + '/' + s[3:5] + '/' + s[6:], dayfirst=True)
             except: pass
        return pd.to_datetime(s, dayfirst=True, errors='coerce')
    return pd.to_datetime(s, errors='coerce')

def clean_amt(val):
    if pd.isna(val) or val == '-':
        return 0
    try:
        return float(val)
    except:
        return 0

new_rows = []
print("Transforming standard data...")
for idx, row in df_source.iterrows():
    dt_raw = row['Unnamed: 0']
    sh = row['Unnamed: 1']
    desc = row['Số dư đầu kỳ']
    contra = row['Unnamed: 3']
    dr_amt_raw = row['Unnamed: 4']
    cr_amt_raw = row['Unnamed: 5']
    
    if pd.isna(dt_raw) and pd.isna(sh) and pd.isna(desc):
        continue
        
    dt = parse_date(dt_raw)
    dr_amt = clean_amt(dr_amt_raw)
    cr_amt = clean_amt(cr_amt_raw)
    
    # Contra account cleanup
    try:
        if pd.notna(contra):
            contra = int(float(contra))
    except:
        pass

    if dr_amt > 0:
        new_rows.append({
            'dt': dt,
            'sh': sh,
            'desc': desc,
            'dr': 1121,
            'cr': contra,
            'amt': dr_amt,
            'obj': '',
            'type_priority': 2
        })
        
    if cr_amt > 0:
        new_rows.append({
            'dt': dt,
            'sh': sh,
            'desc': desc,
            'dr': contra,
            'cr': 1121,
            'amt': cr_amt,
            'obj': '',
            'type_priority': 2
        })

df_new = pd.DataFrame(new_rows)
print(f"Generated {len(df_new)} new rows from standard file.")

# Concatenate
df_final = pd.concat([df_target_filtered, df_new], ignore_index=True)
print(f"Final shape: {df_final.shape}")

# Sort by date
df_final = df_final.sort_values(by='dt')

# Save to updated file
df_final.to_excel(output_path, index=False)
print(f"Saved updated ledger to {output_path}")

# Verify totals for sanity
target_bank_dr = df_target[df_target['dr'].astype(str).str.startswith('112')]['amt'].sum()
target_bank_cr = df_target[df_target['cr'].astype(str).str.startswith('112')]['amt'].sum()
new_bank_dr = df_new[df_new['dr'] == 1121]['amt'].sum()
new_bank_cr = df_new[df_new['cr'] == 1121]['amt'].sum()

print(f"Old Bank totals: Dr={target_bank_dr:,.0f}, Cr={target_bank_cr:,.0f}")
print(f"New Bank totals: Dr={new_bank_dr:,.0f}, Cr={new_bank_cr:,.0f}")
