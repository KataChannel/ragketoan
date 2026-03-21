import pandas as pd

# Load Tax Report Data (Matched targets)
df_rep = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/SL QUYẾT TOÁN 2023 HV.xlsx')
targets = []
for i in range(3, 15):
    row = df_rep.iloc[i]
    m = int(row['THEO TỜ KHAI'])
    targets.append({
        'month': m,
        'tgt_sales': row['Unnamed: 1'] + (row['Unnamed: 3'] if pd.notna(row['Unnamed: 3']) else 0),
        'tgt_purchases': row['Unnamed: 7']
    })
df_targets = pd.DataFrame(targets)

# Load DB Data
df_db = pd.read_csv('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/invoices_all_2023.csv')
df_db['tdlap'] = pd.to_datetime(df_db['tdlap'])
df_db['m'] = df_db['tdlap'].dt.month

def reconcile(df_month, target, label):
    # Try to find a subset or adjustments
    actual = df_month['tgtcthue'].sum()
    diff = actual - target
    if abs(diff) < 100:
        return "MATCHED", []
    
    # Check for Bank invoices in purchases
    banks = df_month[df_month['nbten'].str.contains('NGÂN HÀNG|Ngân hàng', na=False) | df_month['nmten'].str.contains('NGÂN HÀNG|Ngân hàng', na=False)]
    if not banks.empty:
        banks_sum = banks['tgtcthue'].sum()
        if abs(actual - banks_sum - target) < 1000:
            return f"EXCLUDE_BANKS (Sum: {banks_sum})", banks['shdon'].tolist()
            
    # Check for specific invoices that match the diff
    single_match = df_month[df_month['tgtcthue'].round(0) == round(diff, 0)]
    if not single_match.empty:
        return f"EXCLUDE_INVOICES (Single: {diff})", single_match['shdon'].tolist()

    return f"REMAINING_DIFF: {diff}", []

recon_results = []
for m in range(1, 13):
    target = df_targets[df_targets['month'] == m].iloc[0]
    
    # Sales
    df_s = df_db[(df_db['m'] == m) & (df_db['loaihd'] == 'banra') & (df_db['tthai'] == 1)]
    s_status, s_shdon = reconcile(df_s, target['tgt_sales'], "Sales")
    
    # Purchase
    df_p = df_db[(df_db['m'] == m) & (df_db['loaihd'] == 'muavao') & (df_db['tthai'] == 1)]
    p_status, p_shdon = reconcile(df_p, target['tgt_purchases'], "Purchase")
    
    recon_results.append({
        'm': m,
        's_diff': df_s['tgtcthue'].sum() - target['tgt_sales'],
        's_notes': s_status,
        'p_diff': df_p['tgtcthue'].sum() - target['tgt_purchases'],
        'p_notes': p_status
    })

pd.DataFrame(recon_results).to_csv('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/reconciliation_plan.csv', index=False)
print(pd.DataFrame(recon_results))
