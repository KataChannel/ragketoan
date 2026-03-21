import pandas as pd

# Load reported data
df_reported = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/SL QUYẾT TOÁN 2023 HV.xlsx')
# Skip headers, take months 1-12
# Monthly rows are from index 3 to 14 (1 to 12)
monthly_reported = []
for i in range(3, 15):
    row = df_reported.iloc[i]
    month = int(row['THEO TỜ KHAI'])
    sales_dt = row['Unnamed: 1']
    sales_no_tax = row['Unnamed: 3'] if pd.notna(row['Unnamed: 3']) else 0
    purchases_dt = row['Unnamed: 7']
    
    monthly_reported.append({
        "Month": month,
        "Reported_Sales": sales_dt + sales_no_tax,
        "Reported_Purchases": purchases_dt
    })

df_rep_summary = pd.DataFrame(monthly_reported)

# Load target data
df_target = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx')
# Group by Month and Type
# Month is formatted as "01/2023"
df_target['Month_Num'] = df_target['Tháng'].str.split('/').str[0].astype(int)

target_sales = df_target[df_target['Loại HD'] == 'Bán ra'].groupby('Month_Num')['Tổng giá tiền (VNĐ)'].sum().reset_index()
target_sales.columns = ['Month', 'Current_Sales']

target_purchases = df_target[df_target['Loại HD'] == 'Mua vào'].groupby('Month_Num')['Tổng giá tiền (VNĐ)'].sum().reset_index()
target_purchases.columns = ['Month', 'Current_Purchases']

# Merge for comparison
comparison = df_rep_summary.merge(target_sales, on='Month').merge(target_purchases, on='Month')
comparison['Sales_Diff'] = comparison['Reported_Sales'] - comparison['Current_Sales']
comparison['Purchases_Diff'] = comparison['Reported_Purchases'] - comparison['Current_Purchases']

print(comparison.to_string())
comparison.to_json('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/adjustment_plan.json', orient='records', indent=2)
