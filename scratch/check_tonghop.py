import pandas as pd
p = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/TONG_HOP_SAO_KE_HHP_2023.xlsx'
df = pd.read_excel(p)
print("Columns:", df.columns.tolist())
try:
    print(f"TONG HOP SUM - Thu (Ghi Nợ): {df['Thu/Nợ'].sum():,.0f}, Chi (Ghi Có): {df['Chi/Có'].sum():,.0f}")
except Exception as e:
    print("Error:", e)
