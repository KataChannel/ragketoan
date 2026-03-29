from scripts.FinalAccountingReportHuyVu2023 import parse_md_table_carefully
import os

path = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/ACTUAL_DETAIL_642_2023.md"
df = parse_md_table_carefully(path)
if df is not None:
    print(f"Success! Rows: {len(df)}")
    print(df.head())
else:
    print("Failed to parse.")
