import pandas as pd
import glob
import os

files = sorted(glob.glob('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023/*.xls*'))
all_extracted = []

for f in files:
    try:
        raw_df = pd.read_excel(f, header=None)
        # Find header
        header_row = -1
        for i, row in raw_df.iterrows():
            row_str = " ".join([str(x).upper() for x in row.values])
            if 'NGÀY' in row_str and ('NỘI DUNG' in row_str or 'DIỄN GẢI' in row_str):
                header_row = i
                break
        
        if header_row == -1: 
            print(f"Skipping {os.path.basename(f)}: No header found")
            continue
            
        df = pd.read_excel(f, skiprows=header_row)
        
        # Mapping cols
        d_col, t_col, c_col = -1, -1, -1
        for i, col in enumerate(df.columns):
            s = str(col).upper()
            if 'NỘI DUNG' in s or 'DIỄN GIẢI' in s: d_col = i
            elif 'THU' in s or 'CÓ' in s: t_col = i
            elif 'CHI' in s or 'NỢ' in s: c_col = i
            
        # Fallback if names are on next row (double header)
        if t_col == -1 or c_col == -1:
            row0 = df.iloc[0].astype(str).str.upper()
            for i, v in enumerate(row0):
                if 'THU' in v: t_col = i
                if 'CHI' in v: c_col = i
        
        # Specific bank column fallbacks (important for HHP)
        if 'Bidv' in f: d_col, t_col, c_col = 7, 16, 17
        elif 'VTB' in f or 'VCB' in f: d_col, t_col, c_col = 7, 12, 13
            
        print(f"File {os.path.basename(f)}: Header row {header_row}, Desc Col {d_col}, Thu Col {t_col}, Chi Col {c_col}")
        
        for _, row in df.iterrows():
            desc = str(row.iloc[d_col]) if d_col < len(row) else ""
            thu = float(str(row.iloc[t_col]).replace(',','')) if t_col < len(row) and not pd.isna(row.iloc[t_col]) else 0
            chi = float(str(row.iloc[c_col]).replace(',','')) if c_col < len(row) and not pd.isna(row.iloc[c_col]) else 0
            if (thu > 0 or chi > 0) and desc != "nan" and "Tháng" not in desc:
                all_extracted.append({'desc': desc, 'thu': thu, 'chi': chi, 'bank': os.path.basename(f)})
    except Exception as e:
        print(f"Error {os.path.basename(f)}: {e}")

unique_descs = sorted(list(set([d['desc'] for d in all_extracted])))
print(f"Extracted {len(unique_descs)} unique descriptions.")
for d in unique_descs:
    print(d)
