import pandas as pd
import os

BASE_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023'
SCT_FILE = os.path.join(BASE_PATH, 'SO_CHI_TIET_HUYVU_2023_FINAL.xlsx')

def check_negative():
    for acc in ['1111', '112']:
        try:
            df = pd.read_excel(SCT_FILE, sheet_name=acc)
            neg = df[df['Cuối kỳ'] < 0]
            print(f"Account {acc}: {len(neg)} negative balance rows.")
            if not neg.empty:
                print(f"  Min balance: {neg['Cuối kỳ'].min():,.0f}")
                print(f"  First negative date: {neg.iloc[0]['Ngày hạch toán']}")
        except Exception as e:
            print(f"Error reading {acc}: {e}")

if __name__ == "__main__":
    check_negative()
