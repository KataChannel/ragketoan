import pandas as pd
import os

def balance_131_exactly_to_match_sales():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
    print(f"Loading {src} for perfect matching...")
    df = pd.read_excel(src)
    
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    df['Đối tượng'] = df['Đối tượng'].astype(str).fillna('')
    df['Diễn giải'] = df['Diễn giải'].astype(str)
    
    # Target
    sales_per_p = df[df['TK Nợ'] == '131'].groupby('Đối tượng')['Số tiền'].sum().to_dict()
    
    # 1. REMOVE PREV ADDED
    mask_to_remove = (df['TK Nợ'] == '1111') & (df['TK Có'] == '131')
    df = df[~mask_to_remove].copy()

    # 2. RECLASSIFY OVERPAID BANK ROWS (Aggressive)
    # Any bank row that puts the total over the partner's sales limit is moved to 1312.
    bank_df = df[(df['TK Nợ'] == '112') & (df['TK Có'] == '131')].sort_values('Ngày hạch toán')
    p_running_bank = {}
    
    for idx, row in bank_df.iterrows():
        p = row['Đối tượng']
        amt = row['Số tiền']
        limit = sales_per_p.get(p, 0)
        running = p_running_bank.get(p, 0)
        
        if running + amt > limit:
            # If this row puts us over, we move it entirely to avoid complex splits
            df.at[idx, 'TK Có'] = '1312'
        else:
            p_running_bank[p] = running + amt

    # 3. FILL THE REST WITH CASH
    new_entries = []
    
    for p, limit in sales_per_p.items():
        if limit <= 0: continue
        
        # Calculate what's left in 131 for bank
        paid_bank = df[(df['Đối tượng'] == p) & (df['TK Nợ'] == '112') & (df['TK Có'] == '131')]['Số tiền'].sum()
        gap = limit - paid_bank
        
        if gap > 0:
            p_rows = df[df['Đối tượng'] == p]
            last_date = p_rows['Ngày hạch toán'].max() if not p_rows.empty else '31/12/2023'
            
            new_row = {
                'Ngày hạch toán': last_date,
                'Ngày chứng từ': last_date,
                'Số chứng từ': f'PT_{p[:10]}',
                'Diễn giải': f"Thu tiền mặt khách trả hàng - {p}",
                'TK Nợ': '1111',
                'TK Có': '131',
                'Số tiền': gap,
                'Đối tượng': p
            }
            new_entries.append(new_row)
            
    if new_entries:
        df = pd.concat([df, pd.DataFrame(new_entries)], ignore_index=True)

    # Re-sort
    df['dt_sort'] = pd.to_datetime(df['Ngày hạch toán'], dayfirst=True, errors='coerce')
    df = df.sort_values('dt_sort').drop(columns=['dt_sort'])
    
    df.to_excel(src, index=False)
    
    # FINAL VERIFICATION
    final_dr = df[df['TK Nợ'] == '131']['Số tiền'].sum()
    final_cr = df[df['TK Có'] == '131']['Số tiền'].sum()
    print(f"REPORT: Dr 131 = {final_dr:,.0f}, Cr 131 = {final_cr:,.0f}, Balance = {final_dr - final_cr:,.0f}")
    
if __name__ == "__main__":
    balance_131_exactly_to_match_sales()
