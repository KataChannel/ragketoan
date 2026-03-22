import pandas as pd
import os

def analyze_true_database_totals():
    ledger_path = '/chikiet/kata2025/ragketoan/docs/SoKeToan_Huy Vũ_20260321.xlsx'
    df = pd.read_excel(ledger_path, sheet_name='Sổ Nhật Ký Chung', skiprows=2)
    
    # Avoid type error by creating a new datetime column
    dt_col = pd.to_datetime(df.iloc[:,0], dayfirst=True, errors='coerce')
    
    # 2023 only
    mask = (dt_col.dt.year == 2023)
    df23 = df[mask].copy()
    dt23 = dt_col[mask]
    
    results = []
    for m in range(1, 13):
        m_mask = (dt23.dt.month == m)
        month_data = df23[m_mask]
        
        # Credit column is usually column 5 (0-indexed) or similar
        # AccCredit is col 5, AccDebit is col 4, Amount is col 6
        rev = month_data[month_data.iloc[:,5].astype(str).str.startswith('511', na=False)].iloc[:,6].sum()
        pur = month_data[month_data.iloc[:,4].astype(str).str.startswith('156', na=False)].iloc[:,6].sum()
        
        results.append({
            'Month': f"2023-{m:02d}",
            'Rev': rev,
            'Pur': pur
        })
    
    for r in results:
        print(f"{r['Month']} | Rev: {r['Rev']:12,.0f} | Pur: {r['Pur']:12,.0f}")
    
    print(f"TOTAL 2023 REV: {sum(r['Rev'] for r in results):,.0f}")

if __name__ == '__main__':
    analyze_true_database_totals()
