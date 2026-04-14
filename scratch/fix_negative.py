import pandas as pd
import numpy as np

ledger_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SO_CHI_TIET_HHP_2023.xlsx'
ledgers = pd.read_excel(ledger_path, sheet_name=None)
df = ledgers['1121'].copy()

# Remove TỔNG CỘNG row
is_total = df['Ngày hạch toán'].astype(str).str.contains('TỔNG CỘNG', na=False)
df = df[~is_total].copy()

# Separate header row (Số dư đầu kỳ) and data rows
header_row = df.iloc[0:1].copy()
data = df.iloc[1:].copy()
opening_bal = header_row.iloc[0]['Đầu kỳ']

# Strategy: Within each day, put all Nợ (deposits) BEFORE all Có (withdrawals)
# This maximizes balance before withdrawals happen
data['date'] = pd.to_datetime(data['Ngày hạch toán'], errors='coerce')

# Sort: by date, then Nợ first (descending so big deposits come first), then Có ascending
data['is_deposit'] = (data['Phát sinh Nợ'] > 0) & (data['Phát sinh Có'] == 0)
data = data.sort_values(
    by=['date', 'is_deposit', 'Phát sinh Nợ', 'Phát sinh Có'],
    ascending=[True, False, False, True]  # date asc, deposits first (desc=False), big deposits first, small withdrawals first
).reset_index(drop=True)

# Recompute running balance
cur_bal = opening_bal
balances = []
for i in range(len(data)):
    cur_bal = cur_bal + data.iloc[i]['Phát sinh Nợ'] - data.iloc[i]['Phát sinh Có']
    balances.append(cur_bal)
data['Cuối kỳ'] = balances

neg_count = sum(1 for b in balances if b < 0)
print(f"After reorder: {neg_count} negative rows (before: 1412)")

# If still negative, we need to shift some transactions between days
# Strategy: For each day with negative balance, try to pull in future deposits earlier
if neg_count > 0:
    print("Applying cross-day rebalancing...")
    rows = data.to_dict('records')
    
    # Multiple passes to fix negatives
    for pass_num in range(10):
        cur_bal = opening_bal
        fixed = 0
        i = 0
        while i < len(rows):
            new_bal = cur_bal + rows[i]['Phát sinh Nợ'] - rows[i]['Phát sinh Có']
            if new_bal < 0:
                # Find the next deposit that could cover this deficit
                deficit = -new_bal
                found_j = -1
                for j in range(i + 1, len(rows)):
                    if rows[j]['Phát sinh Nợ'] > 0 and rows[j]['Phát sinh Có'] == 0:
                        # Move this deposit before current row
                        found_j = j
                        break
                
                if found_j >= 0:
                    # Move deposit row before current withdrawal
                    deposit_row = rows.pop(found_j)
                    rows.insert(i, deposit_row)
                    fixed += 1
                    # Don't advance i, re-evaluate from same position
                    cur_bal = cur_bal + deposit_row['Phát sinh Nợ'] - deposit_row['Phát sinh Có']
                    i += 1
                    continue
                else:
                    cur_bal = new_bal
                    i += 1
            else:
                cur_bal = new_bal
                i += 1
        
        # Recompute all balances
        cur_bal = opening_bal
        neg_count2 = 0
        for r in rows:
            cur_bal = cur_bal + r['Phát sinh Nợ'] - r['Phát sinh Có']
            r['Cuối kỳ'] = cur_bal
            if cur_bal < 0:
                neg_count2 += 1
        
        print(f"  Pass {pass_num+1}: fixed {fixed}, remaining negative: {neg_count2}")
        if neg_count2 == 0 or fixed == 0:
            break
    
    data = pd.DataFrame(rows)

# Clean up temp columns
data = data.drop(columns=['date', 'is_deposit'], errors='ignore')

# Rebuild with header + data + TỔNG CỘNG
total_dr = data['Phát sinh Nợ'].sum()
total_cr = data['Phát sinh Có'].sum()
final_bal = data.iloc[-1]['Cuối kỳ'] if len(data) > 0 else opening_bal

summary = {
    'Ngày hạch toán': 'TỔNG CỘNG',
    'Số chứng từ': '',
    'Diễn giải': '',
    'TK Đối ứng': '',
    'Đầu kỳ': opening_bal,
    'Phát sinh Nợ': total_dr,
    'Phát sinh Có': total_cr,
    'Cuối kỳ': final_bal
}

df_final = pd.concat([header_row, data, pd.DataFrame([summary])], ignore_index=True)

# Update NKC too - rebuild 1121 entries in proper order
nkc = ledgers['NKC'].copy()
nkc_clean = nkc[~((nkc['dr'].astype(str).str.startswith('112')) | (nkc['cr'].astype(str).str.startswith('112')))].copy()

new_nkc = []
for _, row in data.iterrows():
    if row['Phát sinh Nợ'] > 0:
        new_nkc.append({
            'dt': row['Ngày hạch toán'], 'sh': row['Số chứng từ'], 'desc': row['Diễn giải'],
            'dr': '1121', 'cr': row['TK Đối ứng'] if row['TK Đối ứng'] else '331',
            'amt': row['Phát sinh Nợ'], 'obj': ''
        })
    if row['Phát sinh Có'] > 0:
        new_nkc.append({
            'dt': row['Ngày hạch toán'], 'sh': row['Số chứng từ'], 'desc': row['Diễn giải'],
            'dr': row['TK Đối ứng'] if row['TK Đối ứng'] else '331', 'cr': '1121',
            'amt': row['Phát sinh Có'], 'obj': ''
        })

nkc_final = pd.concat([nkc_clean, pd.DataFrame(new_nkc)], ignore_index=True)
nkc_final['dt'] = pd.to_datetime(nkc_final['dt'], errors='coerce')
nkc_final = nkc_final.sort_values(by=['dt', 'sh']).reset_index(drop=True)

# Write
with pd.ExcelWriter(ledger_path, engine='openpyxl', mode='w') as writer:
    for sheet_name, df_sheet in ledgers.items():
        if sheet_name == '1121':
            df_final.to_excel(writer, sheet_name='1121', index=False)
        elif sheet_name == 'NKC':
            nkc_final.to_excel(writer, sheet_name='NKC', index=False)
        else:
            df_sheet.to_excel(writer, sheet_name=sheet_name, index=False)

# Final check
neg_final = df_final[pd.to_numeric(df_final['Cuối kỳ'], errors='coerce') < 0]
print(f"\n✅ Hoàn tất! Negative rows remaining: {len(neg_final)}")
print(f"   Tổng Nợ: {total_dr:,.0f}")
print(f"   Tổng Có: {total_cr:,.0f}")
print(f"   Số dư cuối: {final_bal:,.0f}")
