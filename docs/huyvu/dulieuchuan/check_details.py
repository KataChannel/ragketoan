import pandas as pd

# Load DB data
df_db = pd.read_csv('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/invoices_all_2023.csv')
df_db['tdlap'] = pd.to_datetime(df_db['tdlap'])
df_db['month'] = df_db['tdlap'].dt.month
df_db_valid = df_db[df_db['tthai'] == 1]

# Load Reported data
df_rep = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/SL QUYẾT TOÁN 2023 HV.xlsx')
rep_data = [] # List for [Month, Sales_Rep, Purchase_Rep]
for i in range(3, 15):
    row = df_rep.iloc[i]
    m = int(row['THEO TỜ KHAI'])
    sales_dt = row['Unnamed: 1']
    sales_no_tax = row['Unnamed: 3'] if pd.notna(row['Unnamed: 3']) else 0
    sales_tax = row['Unnamed: 2'] if pd.notna(row['Unnamed: 2']) else 0
    purchase_dt = row['Unnamed: 7']
    purchase_tax = row['Unnamed: 8'] if pd.notna(row['Unnamed: 8']) else 0
    rep_data.append({
        'm': m,
        'rep_sales_no_tax': sales_dt + sales_no_tax,
        'rep_sales_with_tax': sales_dt + sales_no_tax + sales_tax,
        'rep_purchase_no_tax': purchase_dt, # Assume Col 7 is Before Tax if Col 8 exists
        'rep_purchase_with_tax': purchase_dt + purchase_tax
    })
df_rep_clean = pd.DataFrame(rep_data)

# Aggregate DB
db_sales = df_db_valid[df_db_valid['loaihd'] == 'banra'].groupby('month')['tgtcthue'].sum().reset_index()
db_purchases = df_db_valid[df_db_valid['loaihd'] == 'muavao'].groupby('month')['tgtcthue'].sum().reset_index()

# Merge
df_comp = df_rep_clean.merge(db_sales, left_on='m', right_on='month', how='left').rename(columns={'tgtcthue': 'db_sales_no_tax'})
df_comp = df_comp.merge(db_purchases, left_on='m', right_on='month', how='left').rename(columns={'tgtcthue': 'db_purchase_no_tax'})

print(df_comp[['m', 'rep_sales_no_tax', 'db_sales_no_tax', 'rep_purchase_no_tax', 'db_purchase_no_tax']])
