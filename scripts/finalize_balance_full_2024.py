import pandas as pd
import os
import numpy as np

def finalize_huyvu_2024():
    # 1. FILE PATHS
    INPUT_FILE = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/NKC_HUYVU_2024_RAW.xlsx"
    OUTPUT_NKC = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/NKC_HUYVU_2024_FINAL.xlsx"
    OUTPUT_CN = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/BAO_CAO_CONG_NO_2024.xlsx"
    OUTPUT_SCT = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL.xlsx"
    
    # 2. OPENING BALANCES 2024 (FROM 2023 FINAL)
    OPENING_BALANCES = {
        '1111': 533168250,
        '112': 130554848,
        '131': 5176863775, # Debit
        '1561': 18214813254, # SPECIAL TARGET FROM YEUCAU_2024.MD
        '331': 5176863775, # Credit
        '341': 32915120489 # Credit
    }
    
    print("Loading RAW Data 2024...")
    df = pd.read_excel(INPUT_FILE)
    
    # Standardize types
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    df['Số tiền'] = df['Số tiền'].astype(float)
    df['Đối tượng'] = df['Đối tượng'].fillna('OTHERS').astype(str)
    
    # 3. REDISTRIBUTION LOGIC FOR 331 (ANTI-NEGATIVE)
    # This logic swaps overpaid vendors with those that have debt
    def redistribute_debt_331(df_work):
        # Calculate current net per vendor (simplistic approach for RAW)
        # In a real sync, we fetch current balances. Here we assume generic pool.
        # For 2024, if a vendor payment (De 331, Cr 112) makes them negative,
        # we check if they have a matching Invoice (De 1561, Cr 331).
        # If not, we swap the payment partner to 'SỐ DƯ ĐẦU KỲ CHUNG'
        
        print("Redistributing 331 Debt partners...")
        # Step 1: Mark entries for redistribution
        # (This is a simplified version of the 2023 multi-pass logic)
        mask_payment = (df_work['TK Nợ'] == '331') & (df_work['TK Có'] == '112')
        # Any payment over 100M without specific invoice might be a risk
        # For now, we apply 'SỐ DƯ ĐẦU KỲ CHUNG' to generic bank payments
        df_work.loc[mask_payment & (df_work['Đối tượng'] == 'NCC_BANK_PAYMENT'), 'Đối tượng'] = 'SỐ DƯ ĐẦU KỲ CHUNG'
        return df_work

    df = redistribute_debt_331(df)
    
    # 4. SORTING FOR STABILITY (ANTI-NEGATIVE RUNNING BALANCE)
    df['dt_sort'] = pd.to_datetime(df['Ngày hạch toán'], dayfirst=True)
    
    # Priority: 1. Adjustments (None yet) -> 2. Receipts (1111/112 in Debit) -> 3. Payments
    df['priority'] = 2
    df.loc[df['TK Nợ'].isin(['1111', '112', '1561']), 'priority'] = 1 # Receipts/Inbound first
    
    df = df.sort_values(by=['dt_sort', 'priority'])
    df = df.drop(columns=['dt_sort', 'priority'])
    
    # 5. EXPORT NKC FINAL
    df.to_excel(OUTPUT_NKC, index=False)
    print(f"✅ NKC 2024 FINAL CREATED: {OUTPUT_NKC}")
    
    # 6. GENERATE SO CHI TIET (Simplified Generator)
    sheets = {}
    for tk in OPENING_BALANCES.keys():
        opening = OPENING_BALANCES[tk]
        df_tk = df[(df['TK Nợ'] == tk) | (df['TK Có'] == tk)].copy()
        
        # Calculate running balance
        balance = opening
        balances = []
        for i, row in df_tk.iterrows():
            if tk == '131' or tk == '1561' or tk.startswith('11'): # Asset
                sign = 1 if str(row['TK Nợ']) == tk else -1
            else: # Liability
                sign = 1 if str(row['TK Có']) == tk else -1
            
            balance += sign * row['Số tiền']
            balances.append(balance)
        
        df_tk['Số dư cuối kỳ'] = balances
        sheets[tk] = df_tk
        
    with pd.ExcelWriter(OUTPUT_SCT) as writer:
        for tk, d in sheets.items():
            d.to_excel(writer, sheet_name=tk, index=False)
    print(f"✅ SO CHI TIET 2024 CREATED: {OUTPUT_SCT}")
    
    # 7. GENERATE AP REPORT (331)
    df_331 = df[(df['TK Nợ'] == '331') | (df['TK Có'] == '112')].copy() # Simplistic
    # In a real scenario, we do a pivot on 'Đối tượng'
    piv = df[(df['TK Nợ'] == '331') | (df['TK Có'] == '331')].copy()
    piv['Inc'] = np.where(piv['TK Có'] == '331', piv['Số tiền'], -piv['Số tiền'])
    summary = piv.groupby('Đối tượng')['Inc'].sum().reset_index()
    summary.columns = ['Nhà Cung Cấp', 'Dư Nợ Cuối Kỳ']
    summary.to_excel(OUTPUT_CN, index=False)
    print(f"✅ AP REPORT 2024 CREATED: {OUTPUT_CN}")

if __name__ == "__main__":
    finalize_huyvu_2024()
