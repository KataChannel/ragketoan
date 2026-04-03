import pandas as pd
import os

def generate_full_so_chi_tiet():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    out = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SO_CHI_TIET_HUYVU_2023_FINAL.xlsx'

    # 1. FIXED OPENING BALANCES (PROVIDED BY USER)
    # Using format {account_id: (Dr, Cr)}
    OPENING_BALANCES = {
        '112': (69358830, 0),
        '131': (6387173464, 0),
        '3411': (0, 33692035200),
        '341': (0, 33692035200), # Mapping generic 341 to specified 3411 balance
    }
    
    # Normally Debit accounts
    ASSET_ACCOUNTS = ['111', '112', '131', '133', '152', '156', '1561', '632', '642']
    # Normally Credit accounts
    LIABIL_ACCOUNTS = ['331', '333', '3331', '341', '3411', '411', '511', '5111', '515', '711', '811']

    print(f"Loading {src} to generate detailed subsidiary ledger with opening balances...")
    df = pd.read_excel(src)
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)

    # Get unique accounts used in NKC
    all_accounts = sorted(pd.concat([df['TK Nợ'], df['TK Có']]).unique())

    with pd.ExcelWriter(out) as writer:
        for acc in all_accounts:
            if acc == 'nan' or not acc: continue
            
            # Find relevant entries
            is_dr = df[df['TK Nợ'] == acc].copy()
            is_dr['Phát sinh Nợ'] = is_dr['Số tiền']
            is_dr['Phát sinh Có'] = 0
            is_dr['TK Đối ứng'] = is_dr['TK Có']

            is_cr = df[df['TK Có'] == acc].copy()
            is_cr['Phát sinh Nợ'] = 0
            is_cr['Phát sinh Có'] = is_cr['Số tiền']
            is_cr['TK Đối ứng'] = is_cr['TK Nợ']

            entries = pd.concat([is_dr, is_cr]).sort_values('Ngày hạch toán')
            
            # GET OPENING BALANCES
            op_dr, op_cr = OPENING_BALANCES.get(acc, (0, 0))
            
            # PREPARE THE DATA SHEET
            sheet_rows = []
            
            # 1. Opening Balance Row
            sheet_rows.append({
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '', 'Diễn giải': 'SỐ DƯ ĐẦU KỲ',
                'TK Đối ứng': '', 'Phát sinh Nợ': op_dr if op_dr > 0 else 0, 'Phát sinh Có': op_cr if op_cr > 0 else 0,
                'Đối tượng': ''
            })
            
            # 2. Add Transactions
            for _, row in entries.iterrows():
                sheet_rows.append({
                    'Ngày hạch toán': row['Ngày hạch toán'], 'Ngày chứng từ': row['Ngày chứng từ'],
                    'Số chứng từ': row['Số chứng từ'], 'Diễn giải': row['Diễn giải'],
                    'TK Đối ứng': row['TK Đối ứng'], 'Phát sinh Nợ': row['Phát sinh Nợ'],
                    'Phát sinh Có': row['Phát sinh Có'], 'Đối tượng': row.get('Đối tượng', '')
                })
            
            # 3. Summing rows
            sum_dr = entries['Phát sinh Nợ'].sum()
            sum_cr = entries['Phát sinh Có'].sum()
            
            sheet_rows.append({
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '', 'Diễn giải': 'CỘNG PHÁT SINH TRONG NĂM',
                'TK Đối ứng': '', 'Phát sinh Nợ': sum_dr, 'Phát sinh Có': sum_cr, 'Đối tượng': ''
            })
            
            # 4. Closing Balance Calculation
            # Closing = Opening + Dr - Cr (If results in negative Dr, it becomes Cr)
            net_change = sum_dr - sum_cr
            final_dr = op_dr - op_cr + net_change
            
            res_dr, res_cr = 0, 0
            if final_dr >= 0:
                res_dr = final_dr
            else:
                res_cr = abs(final_dr)
            
            sheet_rows.append({
                'Ngày hạch toán': '', 'Ngày chứng từ': '', 'Số chứng từ': '', 'Diễn giải': 'SỐ DƯ CUỐI KỲ',
                'TK Đối ứng': '', 'Phát sinh Nợ': res_dr, 'Phát sinh Có': res_cr, 'Đối tượng': ''
            })
            
            # Final output for this sheet
            out_df = pd.DataFrame(sheet_rows)
            out_df.to_excel(writer, sheet_name=acc[:31], index=False)
            
    print(f"✅ Full Sổ chi tiết with Opening/Closing balances saved to {out}")

if __name__ == "__main__":
    generate_full_so_chi_tiet()
