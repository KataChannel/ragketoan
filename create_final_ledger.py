import pandas as pd

def create_final_ledger_sheet():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    
    # 1. Load the Phân bổ sheet
    df_pb = pd.read_excel(file_path, sheet_name='Phân bổ')
    
    # 2. Map to Ledger Form
    # Current PB columns: [Tên nhà cung cấp, Ngày, Số CT, Diễn giải, Nợ, Có, Số dư]
    # Ledger columns: [Ngày hạch toán, Số chứng từ, Diễn giải, TK Đối ứng, Đầu kỳ, Phát sinh Nợ, Phát sinh Có, Cuối kỳ]
    
    ledger_rows = []
    
    for _, r in df_pb.iterrows():
        # Identify TK Đối ứng (approximate from context or previous mapping)
        # In Phân bổ, we didn't store TK Đối ứng for every row, but we can infer or leave blank for adj
        desc = str(r['Diễn giải'])
        tk_du = ""
        if '112' in desc: tk_du = '112'
        elif '1111' in desc: tk_du = '1111'
        elif 'PB' in str(r['Số CT']): tk_du = 'PB'
        
        # Format the description to include vendor if needed (standard in ledgers)
        # Actually, let's keep it as is since it's already specific.
        
        ledger_rows.append({
            'Ngày hạch toán': r['Ngày'],
            'Số chứng từ': r['Số CT'],
            'Diễn giải': r['Diễn giải'],
            'TK Đối ứng': tk_du,
            'Đầu kỳ': 0, # Usually only first row has it, but in grouped ledger it varies
            'Phát sinh Nợ': r['Nợ'] or 0,
            'Phát sinh Có': r['Có'] or 0,
            'Cuối kỳ': r['Số dư']
        })
        
    df_ledger_new = pd.DataFrame(ledger_rows)
    
    # 3. Save to workbook
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_ledger_new.to_excel(writer, sheet_name='331_Hoàn_thiện', index=False)
    
    print("New sheet '331_Hoàn_thiện' created successfully.")

if __name__ == '__main__':
    create_final_ledger_sheet()
