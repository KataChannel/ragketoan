import pandas as pd
import glob
import os

files = sorted(glob.glob('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023/*.xls*'))

for f in files:
    print(f"\n--- {os.path.basename(f)} RAW ---")
    try:
        df = pd.read_excel(f, header=None, nrows=20)
        # Flatten row by row
        for i, row in df.iterrows():
            print(f"Row {i}: {' | '.join([str(x) for x in row.values])}")
    except Exception as e:
        print(f"Error {f}: {e}")
