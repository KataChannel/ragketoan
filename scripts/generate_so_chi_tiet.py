import pandas as pd
import os

def generate_professional_subsidiary_ledger_final_v4():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    dst = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SO_CHI_TIET_HUYVU_2023_FINAL.xlsx'
    
    # 1. FINAL CORRECT OPENING BALANCES (PROVIDED BY USER)
    NEW_OPS = {
        '1111': 64833645.0,
        '112': 69358830.0,
        '131': 6387173464.0,
        '1561': 20528673683.0,
        '341': 33692035200.0, '3411': 33692035200.0,
        '331': 0, '1312': 0, '1331': 0, '3331': 0, '411': 0
    }

    print(f"Generating Professional Subsidiary Ledger V4 with Correct Opening Balances from {src}...")
    df = pd.read_excel(src)
    
    def fmt_acc(x):
        if pd.isna(x): return ""
        if isinstance(x, (int, float)): return str(int(x))
        return str(x).split('.')[0]
    
    df['TK Nợ'] = df['TK Nợ'].apply(fmt_acc)
    df['TK Có'] = df['TK Có'].apply(fmt_acc)
    
    # All distinct accounts in Ledger
    all_accs = sorted(list(set(df['TK Nợ'].unique()) | set(df['TK Có'].unique())))
    all_accs = [a for a in all_accs if a and a != 'nan']

    with pd.ExcelWriter(dst, engine='xlsxwriter') as writer:
        for acc in all_accs:
            # Filter rows where account is involved
            mask = (df['TK Nợ'] == acc) | (df['TK Có'] == acc)
            acc_df = df[mask].copy()
            acc_df['dt_sort'] = pd.to_datetime(acc_df['Ngày hạch toán'], dayfirst=True, errors='coerce')
            acc_df = acc_df.sort_values('dt_sort').drop(columns=['dt_sort'])
            
            # Subsidiary Ledger Structure
            ledger_rows = []
            
            # Opening Balance Row (Corrected)
            op_val = NEW_OPS.get(acc, 0)
            nature = 1 if acc.startswith(('1', '2', '6', '8')) else -1
            
            op_row = {
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '',
                'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'TK Đối ứng': '',
                'Đầu kỳ': op_val, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0, 'Cuối kỳ': op_val, 'Đối tượng': ''
            }
            ledger_rows.append(op_row)
            
            # Running Totals
            cur_bal = op_val
            total_dr = 0
            total_cr = 0
            
            for _, row in acc_df.iterrows():
                dr = row['Số tiền'] if row['TK Nợ'] == acc else 0
                cr = row['Số tiền'] if row['TK Có'] == acc else 0
                opp_acc = row['TK Có'] if row['TK Nợ'] == acc else row['TK Nợ']
                
                # Update running balance based on nature
                if nature == 1: cur_bal += (dr - cr)
                else: cur_bal += (cr - dr)
                
                total_dr += dr
                total_cr += cr
                
                ledger_rows.append({
                    'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'], 
                    'Số chứng từ': row['Số chứng từ'], 'Diễn giải': row['Diễn giải'],
                    'TK Đối ứng': opp_acc, 'Đầu kỳ': 0, 
                    'Phát sinh Nợ': dr, 'Phát sinh Có': cr,
                    'Cuối kỳ': cur_bal, 'Đối tượng': row.get('Đối tượng', '')
                })
            
            # Closing Totals Row
            ledger_rows.append({
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '',
                'Diễn giải': 'TỔNG PHÁT SINH TRONG KỲ', 'TK Đối ứng': '',
                'Đầu kỳ': 0, 'Phát sinh Nợ': total_dr, 'Phát sinh Có': total_cr,
                'Cuối kỳ': 0, 'Đối tượng': ''
            })
            ledger_rows.append({
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '',
                'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'TK Đối ứng': '',
                'Đầu kỳ': 0, 'Phát sinh Nợ': 0, 'Phát sinh Có': 0,
                'Cuối kỳ': cur_bal, 'Đối tượng': ''
            })
            
            # Create Sheet
            sheet_df = pd.DataFrame(ledger_rows)
            sheet_df.to_excel(writer, sheet_name=acc[:31], index=False)
            
            # Formatting
            workbook = writer.book
            worksheet = writer.sheets[acc[:31]]
            num_fmt = workbook.add_format({'num_format': '#,##0'})
            bold_fmt = workbook.add_format({'bold': True})
            worksheet.set_column('F:I', 15, num_fmt)
            worksheet.set_column('D:D', 40)
            worksheet.set_column('J:J', 30)

    print(f"✅ Professional Subsidiary Ledger V4 saved with Correct Opening Balances to {dst}")

if __name__ == "__main__":
    generate_professional_subsidiary_ledger_final_v4()
