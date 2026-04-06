import pandas as pd
import glob
import os

files = glob.glob('/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023/*.xls*')
for f in files:
    print(f"\n--- {os.path.basename(f)} ---")
    try:
        df = pd.read_excel(f, header=None, nrows=30)
        # Display sample data to find headers
        print(df.iloc[:25, :18])
    except Exception as e:
        print(f"Error reading {f}: {e}")
