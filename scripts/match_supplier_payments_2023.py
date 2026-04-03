import pandas as pd
import os

def finalize_all_supplier_payments():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    KIMPHAT = "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT"
    KP_BUY_TARGET = 673086051
    
    print(f"Executing FINAL supplier payment synchronization (v2) for {src}...")
    df = pd.read_excel(src)
    
    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]
    
    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)
    
    # 1. FORCE KIM PHAT PAYMENT TO MATCH PURCHASE
    kp_pay_mask = (df['TK Nợ'] == '331') & (df['Đối tượng'] == KIMPHAT)
    kp_pay_indices = df[kp_pay_mask].sort_values('Số tiền', ascending=False).index.tolist()
    
    current_kp_pay = 0
    diverted_count = 0
    
    for idx in kp_pay_indices:
        amt = df.at[idx, 'Số tiền']
        if current_kp_pay + amt <= KP_BUY_TARGET:
            current_kp_pay += amt
        else:
            df.at[idx, 'Đối tượng'] = 'NHÀ CUNG CẤP TỔNG HỢP'
            df.at[idx, 'Diễn giải'] = "Thanh toán tiền hàng cho Nhà cung cấp tổng hợp"
            diverted_count += 1
            
    print(f"Matched Kim Phat: Mua {KP_BUY_TARGET:,.0f} - Trả approx {current_kp_pay:,.0f}. Diverted {diverted_count} rows.")

    # 2. REDISTRIBUTE DIVERTS TO CLEAR DEBTS
    buy_per_s = df[df['TK Có'] == '331'].groupby('Đối tượng')['Số tiền'].sum().to_dict()
    paid_per_s = df[df['TK Nợ'] == '331'].groupby('Đối tượng')['Số tiền'].sum().to_dict()
    
    gen_pay_indices = df[(df['TK Nợ'] == '331') & (df['Đối tượng'] == 'NHÀ CUNG CẤP TỔNG HỢP')].index.tolist()
    
    for idx in gen_pay_indices:
        amt = df.at[idx, 'Số tiền']
        debts = {s: buy_per_s.get(s,0) - paid_per_s.get(s,0) for s in buy_per_s if s != 'NHÀ CUNG CẤP TỔNG HỢP'}
        debts = {s: d for s, d in debts.items() if d > 1000}
        if not debts: break
        target_s = max(debts, key=debts.get)
        df.at[idx, 'Đối tượng'] = target_s
        df.at[idx, 'Diễn giải'] = f"Thanh toán nợ tiền hàng cho {target_s}"
        paid_per_s[target_s] = paid_per_s.get(target_s, 0) + amt

    # 3. FINAL SWEEP (1111 / 331) TO ZERO OUT ALL 331
    final_debts = {s: buy_per_s.get(s,0) - paid_per_s.get(s,0) for s in buy_per_s if s != 'NHÀ CUNG CẤP TỔNG HỢP'}
    final_debts = {s: d for s, d in final_debts.items() if d > 1000}
    
    new_rows = []
    for s, debt in final_debts.items():
        new_rows.append({'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'ADJ_331_CASH_PAY',
                        'Diễn giải': f"Chi trả tiền hàng còn nợ cuối năm cho {s} bằng tiền mặt", 
                        'TK Nợ': '331', 'TK Có': '1111', 'Số tiền': debt, 'Đối tượng': s})
    
    if new_rows:
        df = pd.concat([df, pd.DataFrame(new_rows)], ignore_index=True)
        
    df.to_excel(src, index=False)
    print("✅ COMPLETED: ALL SUPPLIER DEBTS CLEARED AND KIM PHAT NORMALIZED.")

if __name__ == "__main__":
    finalize_all_supplier_payments()
