import pandas as pd
import glob
import os

files = glob.glob('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023/*.xls*')
all_descs = []
for f in files:
    try:
        df = pd.read_excel(f, skiprows=12) # Guessing 12
        # Try to find description column
        d_col = -1
        for i, c in enumerate(df.columns):
            if 'NỘI DUNG' in str(c).upper() or 'DIỄN GIẢI' in str(c).upper():
                d_col = i
                break
        if d_col == -1: d_col = 7 # fallback
        
        descs = df.iloc[:, d_col].dropna().unique().tolist()
        all_descs.extend(descs)
    except: pass

unique_descs = sorted(list(set(all_descs)))
for d in unique_descs[:100]: # Print first 100
    print(d)
