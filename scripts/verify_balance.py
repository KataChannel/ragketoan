import pandas as pd

file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx'

def main():
    nkc = pd.read_excel(file_path, sheet_name='NKC_CORRECTED')
    
    # Calculate Debit sum per account
    debits = nkc.groupby('TK Nợ')['Số tiền'].sum().reset_index()
    debits.columns = ['TK', 'Phát sinh Nợ']
    
    # Calculate Credit sum per account
    credits = nkc.groupby('TK Có')['Số tiền'].sum().reset_index()
    credits.columns = ['TK', 'Phát sinh Có']
    
    # Merge
    tb = pd.merge(debits, credits, on='TK', how='outer').fillna(0)
    
    print("--- BẢNG CÂN ĐỐI PHÁT SINH TÓM TẮT ---")
    print(tb)
    print("\nTổng Nợ:", tb['Phát sinh Nợ'].sum())
    print("Tổng Có:", tb['Phát sinh Có'].sum())
    print("Chênh lệch:", tb['Phát sinh Nợ'].sum() - tb['Phát sinh Có'].sum())
    
    # Check for empty accounts
    invalids = tb[tb['TK'].astype(str).str.contains('nan|None|unspecified', case=False)]
    if not invalids.empty:
        print("\nCảnh báo: Phát hiện tài khoản không hợp lệ:")
        print(invalids)

if __name__ == "__main__":
    main()
