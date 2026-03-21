import pandas as pd

# Load reported data
df_reported = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/SL QUYẾT TOÁN 2023 HV.xlsx')
reported_mapping = {}
for i in range(3, 15):
    row = df_reported.iloc[i]
    month = int(row['THEO TỜ KHAI'])
    sales_dt = row['Unnamed: 1']
    sales_no_tax = row['Unnamed: 3'] if pd.notna(row['Unnamed: 3']) else 0
    purchases_dt = row['Unnamed: 7']
    
    # Format month as "MM/2023"
    month_str = f"{month:02d}/2023"
    reported_mapping[(month_str, 'Bán ra')] = sales_dt + sales_no_tax
    reported_mapping[(month_str, 'Mua vào')] = purchases_dt

# Load target data
df_target = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx')

# Update values
for idx, row in df_target.iterrows():
    month = row['Tháng']
    hd_type = row['Loại HD']
    key = (month, hd_type)
    if key in reported_mapping:
        df_target.at[idx, 'Tổng giá tiền (VNĐ)'] = reported_mapping[key]

# Save updated data
df_target.to_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx', index=False)
print("Updated Xuatnhaptonhv2023.xlsx with matching figures.")
