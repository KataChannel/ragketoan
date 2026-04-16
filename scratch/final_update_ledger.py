import pandas as pd
import numpy as np
import os

target_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx"
source_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/File Chuẩn.xlsx"

print("Loading data...")
df_target = pd.read_excel(target_path)
df_source = pd.read_excel(source_path)

print(f"Original ledger rows: {len(df_target)}")

# Filter out old bank sources (account 112*)
print("Removing old bank sources...")
mask_bank = (df_target['dr'].astype(str).str.startswith('112')) | (df_target['cr'].astype(str).str.startswith('112'))
df_target_filtered = df_target[~mask_bank].copy()
print(f"Rows removed: {mask_bank.sum()}")

def fix_row_date(val):
    if pd.isna(val): return val
    if isinstance(val, pd.Timestamp):
        if val.year == 3023: return val.replace(year=2023)
        if val.year == 2022: return val.replace(year=2023)
        return val
    s = str(val).strip()
    # Handle DD/MMYYYY
    if len(s) == 9 and s[2] == '/':
        try:
             return pd.Timestamp(year=int(s[5:]), month=int(s[3:5]), day=int(s[:2]))
        except: pass
    try:
        dt = pd.to_datetime(s, dayfirst=True)
        if dt.year == 3023: return dt.replace(year=2023)
        if dt.year == 2022: return dt.replace(year=2023)
        return dt
    except:
        return pd.NaT

def clean_amt(v):
    if pd.isna(v) or v == '-': return 0
    try: return float(v)
    except: return 0

new_rows = []
print("Transforming standard file data...")
for idx, row in df_source.iterrows():
    dt_raw = row['Unnamed: 0']
    sh = row['Unnamed: 1']
    desc = row['Số dư đầu kỳ']
    contra = row['Unnamed: 3']
    dr_amt_raw = row['Unnamed: 4']
    cr_amt_raw = row['Unnamed: 5']
    
    if pd.isna(dt_raw) and pd.isna(sh) and pd.isna(desc):
        continue
        
    dt = fix_row_date(dt_raw)
    
    bank_name = ''
    if pd.notna(desc):
        desc_str = str(desc).upper()
        if 'BIDV' in desc_str: bank_name = 'BIDV'
        elif 'VCB' in desc_str: bank_name = 'VCB'
        elif 'VTB' in desc_str or 'VIETTIN' in desc_str: bank_name = 'VTB'
    
    dr_amt = clean_amt(dr_amt_raw)
    cr_amt = clean_amt(cr_amt_raw)
    
    try:
        if pd.notna(contra):
            # Convert to int then str to remove .0 if it was a float in excel
            contra_val = str(int(float(contra)))
        else:
            contra_val = ''
    except:
        contra_val = str(contra)

    if dr_amt > 0:
        new_rows.append({'dt': dt, 'sh': sh, 'desc': desc, 'dr': '1121', 'cr': contra_val, 'amt': dr_amt, 'obj': bank_name, 'type_priority': 2})
    if cr_amt > 0:
        new_rows.append({'dt': dt, 'sh': sh, 'desc': desc, 'dr': contra_val, 'cr': '1121', 'amt': cr_amt, 'obj': bank_name, 'type_priority': 2})

df_new = pd.DataFrame(new_rows)
print(f"New bank rows created: {len(df_new)}")

df_final = pd.concat([df_target_filtered, df_new], ignore_index=True)
# Sort to keep ledger orderable
df_final = df_final.sort_values(by=['dt', 'sh'])

print("Saving updated ledger...")
df_final.to_excel(target_path, index=False)
print(f"Update complete. Total rows: {len(df_final)}")
