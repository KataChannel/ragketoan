import json
import glob
import pandas as pd
import os
from datetime import datetime

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%d/%m/%Y")
    except:
        return None

def aggregate():
    json_files = glob.glob('docs/nganhang/quetnganhang2/text-data/transactions_batch_manual_*.json')
    all_transactions = []
    
    for f in json_files:
        with open(f, 'r') as jfile:
            data = json.load(jfile)
            all_transactions.extend(data)
    
    if not all_transactions:
        print("No transactions found.")
        return

    df = pd.DataFrame(all_transactions)
    
    # Clean numeric columns
    df['debit'] = pd.to_numeric(df['debit'], errors='coerce').fillna(0)
    df['credit'] = pd.to_numeric(df['credit'], errors='coerce').fillna(0)
    
    # Parse dates for summary
    df['parsed_date'] = df['date'].apply(parse_date)
    
    summary_data = {
        'STT': [1],
        'Ngân Hàng': ['Sacombank'],
        'Số Tài Khoản': ['040019911911'],
        'Số GD': [len(df)],
        'Tổng Nợ (Debit)': [df['debit'].sum()],
        'Tổng Có (Credit)': [df['credit'].sum()],
        'Ngày Đầu': [df['parsed_date'].min().strftime("%d/%m/%Y") if df['parsed_date'].notnull().any() else "N/A"],
        'Ngày Cuối': [df['parsed_date'].max().strftime("%d/%m/%Y") if df['parsed_date'].notnull().any() else "N/A"]
    }
    
    summary_df = pd.DataFrame(summary_data)
    
    output_path = 'docs/nganhang/quetnganhang2/tong_hop_saoke_quetnganhang2.xlsx'
    
    # Create Excel with header similar to reference
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        # Write some header info manually if needed, but for now just the table
        summary_df.to_excel(writer, index=False, startrow=4)
        
        workbook = writer.book
        worksheet = writer.sheets['Sheet1']
        worksheet['A1'] = 'TỔNG HỢP SAO KÊ NGÂN HÀNG - CÔNG TY TNHH MTV HUY VŨ (QUÉT 2)'
        worksheet['A2'] = f'Ngày tổng hợp: {datetime.now().strftime("%d/%m/%Y %H:%M")}'

    print(f"Summary saved to {output_path}")

if __name__ == "__main__":
    aggregate()
