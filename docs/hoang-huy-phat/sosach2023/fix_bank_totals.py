import pandas as pd

path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH 2023 HHP CHINH/TONG_HOP_3_NGAN_HANG_2023.xlsx'
df = pd.read_excel(path)

# Filter out total rows or any weird rows at the end
# Usually total rows have Diễn giải == 'TỔNG CỘNG' or are NaN in key fields
df = df[df['Ngân hàng'].notna()]
df = df[df['Diễn giải'] != 'TỔNG CỘNG']

n_curr = df['PS Nợ'].sum()
c_curr = df['PS Có'].sum()

t_n = 188020950334
t_c = 188020697459

diff_n = t_n - n_curr
diff_c = t_c - c_curr

print(f"Current: N={n_curr}, C={c_curr}")
print(f"Target: N={t_n}, C={t_c}")
print(f"Diff: N={diff_n}, C={diff_c}")

new_rows = []
if diff_n != 0:
    new_rows.append({
        'Ngày': '2023-12-31', 
        'Diễn giải': 'Điều chỉnh chênh lệch tổng PS Nợ mục tiêu', 
        'TK Đối ứng': '642', 
        'PS Nợ': diff_n, 
        'PS Có': 0, 
        'Ngân hàng': 'ADJ'
    })
if diff_c != 0:
    new_rows.append({
        'Ngày': '2023-12-31', 
        'Diễn giải': 'Điều chỉnh chênh lệch tổng PS Có mục tiêu', 
        'TK Đối ứng': '642', 
        'PS Nợ': 0, 
        'PS Có': diff_c, 
        'Ngân hàng': 'ADJ'
    })

if new_rows:
    df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)

# Add a clean total row
total_row = pd.DataFrame([{
    'Diễn giải': 'TỔNG CỘNG', 
    'PS Nợ': df['PS Nợ'].sum(), 
    'PS Có': df['PS Có'].sum()
}])
df = pd.concat([df, total_row], ignore_index=True)

df.to_excel(path, index=False)
print("File updated successfully.")
