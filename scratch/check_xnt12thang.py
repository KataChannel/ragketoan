import pandas as pd

file_path = '/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025.xlsx'
df = pd.read_excel(file_path, sheet_name='xnt12thang')

cols_to_sum = ['Tổng Tồn Đầu', 'Tổng Nhập', 'Tổng Xuất', 'Tổng Tồn Cuối']
for col in cols_to_sum:
    if col in df.columns:
        print(f"{col}: {df[col].sum():,.0f}")

# Check monthly
for m in range(1, 13):
    n_col = f'Tháng {m} Nhập'
    x_col = f'Tháng {m} Xuất'
    n_sum = df[n_col].sum() if n_col in df.columns else 0
    x_sum = df[x_col].sum() if x_col in df.columns else 0
    print(f"  T{m}: Nhập {n_sum:,.0f}, Xuất {x_sum:,.0f}")
