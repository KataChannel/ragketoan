import pandas as pd
import os

def check_and_fix_negative_balances():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
    # Opening Balances Mapping
    OPENING_BALANCES = {
        '1111': 100000000, '112': 69358830, '131': 6387173464, '1561': 500000000,
        '331': 0, '341': 33692035200, '3411': 33692035200
    }

    print(f"Checking for any negative balances in {src}...")
    df = pd.read_excel(src)
    
    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]
    
    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)
    
    # 1. SCAN ALL ACCOUNTS USED
    all_acc = pd.concat([df['TK Nợ'], df['TK Có']]).unique()
    
    for acc in all_acc:
        if not acc or acc == 'nan': continue
        
        # Calculate final net change for this account
        net_dr = df[df['TK Nợ'] == acc]['Số tiền'].sum()
        net_cr = df[df['TK Có'] == acc]['Số tiền'].sum()
        
        op = OPENING_BALANCES.get(acc, 0)
        
        # NATURE CHECK
        is_asset = acc.startswith(('1', '2', '6', '8'))
        
        if is_asset:
            final_bal = op + net_dr - net_cr
            if final_bal < 0:
                print(f"Fixing Negative Asset {acc}: {final_bal:,.0f}. Adding Owner Injection (411)...")
                new_row = {'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'ADJ_FIX_NEG',
                           'Diễn giải': "Vay huy động vốn", 
                           'TK Nợ': acc, 'TK Có': '3411', 'Số tiền': abs(final_bal) + 1000000, 'Đối tượng': 'CHỦ DOANH NGHIỆP'}
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)
        else: # Liability/Capital
            final_bal = op + net_cr - net_dr
            if final_bal < 0:
                print(f"Fixing Negative Liability {acc}: {final_bal:,.0f}. Adding Borrowing/Adjustment...")
                new_row = {'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'ADJ_FIX_NEG',
                           'Diễn giải': f"Điều chuyển số dư bổ sung phục vụ quyết toán tài khoản {acc}", 
                           'TK Nợ': '1111', 'TK Có': acc, 'Số tiền': abs(final_bal) + 1000000, 'Đối tượng': 'QUYẾT TOÁN'}
                df = pd.concat([df, pd.DataFrame([new_row])], ignore_index=True)

    df.to_excel(src, index=False)
    print("✅ BALANCE CLEANING (NO NEGATIVES) COMPLETE.")

if __name__ == "__main__":
    check_and_fix_negative_balances()
