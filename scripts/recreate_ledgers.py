import pandas as pd
import os

ADJUST_FILE = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/Yêu Cầu Điều Chỉnh.xlsx'
OUTPUT_FILE = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx'

OPENING_BALANCES = {'1561': 20_528_682_383, '411': 20_528_682_383}

def main():
    print("Loading data...")
    xl = pd.ExcelFile(ADJUST_FILE)
    nkc = xl.parse('NKC')
    nkc['Ngày'] = pd.to_datetime(nkc['Ngày']).dt.strftime('%d/%m/%Y')
    nkc['TK Nợ'] = nkc['TK Nợ'].astype(str).str.replace('.0', '', regex=False).str.strip()
    nkc['TK Có'] = nkc['TK Có'].astype(str).str.replace('.0', '', regex=False).str.strip()
    nkc['Số tiền'] = nkc['Số tiền'].fillna(0).astype(float)

    # Consolidation
    rep = {'112': '1121', '6422': '642'}
    nkc['TK Nợ'] = nkc['TK Nợ'].replace(rep)
    nkc['TK Có'] = nkc['TK Có'].replace(rep)

    # Vectorized adjustments for Bank Fees and Internet
    print("Applying tax optimizations...")
    nkc.loc[nkc['Diễn giải'].str.contains('PHÍ CK|PHÍ CT|PHÍ NGÂN HÀNG', case=False, na=False) & nkc['TK Nợ'].isin(['1561', '331']), 'TK Nợ'] = '635'
    nkc.loc[nkc['Diễn giải'].str.contains('CƯỚC|INTERNET|VIỄN THÔNG', case=False, na=False) & (nkc['TK Nợ'] == '1561'), 'TK Nợ'] = '642'
    
    # Generate Ledgers
    print("Generating ledger sheets...")
    with pd.ExcelWriter(OUTPUT_FILE, engine='xlsxwriter') as writer:
        accounts = ['1111', '1121', '131', '331', '1561', '1331', '3331', '3411', '511', '632', '642', '635', '515', '711', '411', '911']
        
        # Formats
        header_fmt = writer.book.add_format({'bold': True, 'bg_color': '#D9EAD3', 'border': 1, 'align': 'center'})
        num_fmt = writer.book.add_format({'num_format': '#,##0', 'border': 1})
        title_fmt = writer.book.add_format({'bold': True, 'font_size': 14})
        
        for acc in accounts:
            mask = (nkc['TK Nợ'] == acc) | (nkc['TK Có'] == acc)
            df = nkc[mask].copy()
            if df.empty and acc not in OPENING_BALANCES: continue
            
            # CORRECTED: Use df instead of nkc for indexing within the loop
            df['Nợ'] = 0.0
            df.loc[df['TK Nợ'] == acc, 'Nợ'] = df['Số tiền']
            df['Có'] = 0.0
            df.loc[df['TK Có'] == acc, 'Có'] = df['Số tiền']
            
            df['Đối ứng'] = df['TK Có']
            df.loc[df['TK Có'] == acc, 'Đối ứng'] = df['TK Nợ']
            
            opening = OPENING_BALANCES.get(acc, 0)
            if acc.startswith(('1','2', '6', '8')):
                df['Bal'] = (df['Nợ'] - df['Có']).cumsum() + opening
            else:
                df['Bal'] = (df['Có'] - df['Nợ']).cumsum() + opening
                
            # Final output columns
            out = df[['Ngày', 'Số HĐ', 'Diễn giải', 'Đối ứng', 'Nợ', 'Có', 'Bal']]
            out.columns = ['Ngày', 'Số HĐ', 'Diễn giải', 'TK Đối ứng', 'Nợ', 'Có', 'Số dư']
            
            # Prepend Opening Balance Row
            opening_row = pd.DataFrame([{
                'Ngày': '01/01/2023', 'Số HĐ': '', 'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 
                'TK Đối ứng': '', 'Nợ': 0, 'Có': 0, 'Số dư': opening
            }])
            out = pd.concat([opening_row, out], ignore_index=True)
            
            # Write sheet
            sheet_name = acc
            out.to_excel(writer, sheet_name=sheet_name, index=False, startrow=2)
            
            ws = writer.sheets[sheet_name]
            ws.write(0, 0, f"SỔ CHI TIẾT TÀI KHOẢN {acc} - NĂM 2023", title_fmt)
            
            # Column Formatting
            ws.set_column('A:A', 12) # Ngày
            ws.set_column('B:B', 15) # Số HĐ
            ws.set_column('C:C', 45) # Diễn giải
            ws.set_column('D:D', 10) # Đối ứng
            ws.set_column('E:G', 16, num_fmt)
            
            for col, val in enumerate(out.columns):
                ws.write(2, col, val, header_fmt)

    print(f"Successfully generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
