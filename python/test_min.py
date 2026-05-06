import pandas as pd
import duckdb
from produce_final_hhp_2023 import load_all_inputs, OPENING_BALANCES

def run_test():
    inv, det, bnk = load_all_inputs()
    con = duckdb.connect()
    
    # Simple logic
    ob_131 = OPENING_BALANCES['131']
    total_sales = inv[inv['loaihd'] == 'banra']['total'].sum()
    bank_collections = bnk[(bnk['tk_no'] == '131') | (bnk['tk_co'] == '131')]
    total_bank_credit = bank_collections[bank_collections['tk_co'] == '131']['amt'].sum()
    total_bank_debit = bank_collections[bank_collections['tk_no'] == '131']['amt'].sum()
    
    current_net_before_cash = ob_131 + total_sales + total_bank_debit - total_bank_credit
    total_cash_to_collect = current_net_before_cash - 610548304
    
    df_sales = inv[inv['loaihd'] == 'banra'].copy()
    df_sales['is_retail'] = df_sales['nmten'].fillna('').str.contains('Lẻ', case=False) | (df_sales['nmten'].isna()) | (df_sales['nmten'] == '')
    df_sales = df_sales.sort_values(['is_retail', 'dt'], ascending=[False, True])
    
    collection_rows = []
    collected_yet = 0
    for _, r in df_sales.iterrows():
        to_collect = min(r['total'], max(0, total_cash_to_collect - collected_yet))
        if to_collect > 0:
            collection_rows.append({
                'dt': r['dt'], 'sh': 'PT', 'dr': '1111', 'cr': '131', 'amt': to_collect
            })
            collected_yet += to_collect
    
    df_collection = pd.DataFrame(collection_rows)
    # Combine just 1111 transactions
    t1 = bnk[bnk['tk_no'] == '1111'][['dt', 'tk_no', 'tk_co', 'amt']].rename(columns={'tk_no':'dr','tk_co':'cr'})
    t2 = bnk[bnk['tk_co'] == '1111'][['dt', 'tk_no', 'tk_co', 'amt']].rename(columns={'tk_no':'dr','tk_co':'cr'})
    t3 = df_collection[['dt', 'dr', 'cr', 'amt']]
    
    df_1111 = pd.concat([t1, t2, t3], ignore_index=True)
    df_1111['dt'] = pd.to_datetime(df_1111['dt'])
    
    df_1111['type_priority'] = 50
    df_1111.loc[(df_1111['dr'] == '1111') & (df_1111['cr'] == '131'), 'type_priority'] = 30
    df_1111.loc[(df_1111['dr'] == '1111') & (df_1111['cr'] == '1121'), 'type_priority'] = 50
    df_1111.loc[(df_1111['dr'] == '1121') & (df_1111['cr'] == '1111'), 'type_priority'] = 70
    
    df_1111 = df_1111.sort_values(['dt', 'type_priority'])
    
    bal = OPENING_BALANCES['1111']
    min_bal = bal
    min_dt = None
    for _, r in df_1111.iterrows():
        if r['dr'] == '1111': bal += float(r['amt'])
        if r['cr'] == '1111': bal -= float(r['amt'])
        if bal < min_bal:
            min_bal = bal
            min_dt = r['dt']
            
    print(f"Min balance without 331/3411 payout: {min_bal:,.0f} at {min_dt}")

run_test()
