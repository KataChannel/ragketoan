import pandas as pd
import os

xl_path = '/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_2023_2026.xlsx'
ledger_path = '/chikiet/kata2025/ragketoan/docs/SoKeToan_Huy Vũ_20260321.xlsx'

def analyze_revenue():
    # 2023 from Ledger
    df_journal = pd.read_excel(ledger_path, sheet_name='Sổ Nhật Ký Chung', skiprows=2)
    dt_col = pd.to_datetime(df_journal.iloc[:,0], dayfirst=True, errors='coerce')
    df_2023 = df_journal[dt_col.dt.year == 2023]
    rev_2023 = df_2023[df_2023.iloc[:,5].astype(str).str.startswith('511', na=False)]
    
    # 2024 from Large Excel
    xl = pd.ExcelFile(xl_path)
    rev_2024 = 0
    for s in xl.sheet_names:
        if '_2024' in s:
            df = xl.parse(s)
            rev_2024 += df['Xuất (Tiền)'].sum()
            
    print(f"LEDGER 2023 REVENUE: {rev_2023.iloc[:,6].sum():,.0f}")
    print(f"LARGE EXCEL 2024 REVENUE: {rev_2024:,.0f}")

if __name__ == '__main__':
    analyze_revenue()
