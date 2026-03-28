import pandas as pd
import numpy as np
import re
import os

input_file = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/tong_hop_saoke_huyvu.xlsx'
output_file = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/so_chi_tiet_doi_ung_1121.xlsx'

def classify_account(desc, is_inflow):
    if pd.isna(desc):
        desc = ""
    # Add spaces around desc to help with parsing sometimes, but better to use \b
    desc = str(desc).lower().strip()
    
    if is_inflow:
        # Bank receives money (Nợ 1121)
        if re.search(r'\b(nop tien|nộp tiền|gui tien|gửi tiền mặt)\b', desc):
            return '1111'
        elif re.search(r'\b(tien lai|tiền lãi|tra lai|lãi tu|lãi từ)\b', desc):
            return '515'
        elif re.search(r'\b(hoan ung|hoàn ứng)\b', desc):
            return '141'
        else:
            return '131'  # Default for inflow
    else:
        # Bank pays money (Có 1121)
        if re.search(r'\b(rut tien|rút tiền|rut tm)\b', desc):
            return '1111'
        elif re.search(r'\b(phi|phí|ql tk|quan ly tk|phi gd|phi c\.khoan|quan ly tai khoan)\b', desc):
            return '6422'
        elif re.search(r'\b(lai vay|lãi vay|trich lai|trích lãi)\b', desc):
            return '635'  # Chi phí lãi vay
        elif re.search(r'\b(thue|thuế)\b', desc):
            return '333'
        elif re.search(r'\b(luong|lương|tra luong|trả lương)\b', desc):
            return '334'
        else:
            return '331'  # Default for outflow

def process_saoke():
    xl = pd.ExcelFile(input_file)
    sheets_to_process = [s for s in xl.sheet_names if s != 'Tong Hop']
    
    all_transactions = []
    
    for sheet in sheets_to_process:
        bank_info = sheet
        
        df = pd.read_excel(input_file, sheet_name=sheet, skiprows=3)
        df.columns = df.columns.str.strip()
        
        for idx, row in df.iterrows():
            if pd.isna(row.get('Ngày')) and pd.isna(row.get('Diễn Giải')):
                continue
            
            if str(row.get('STT')).lower() == 'nan' and pd.isna(row.get('Nợ (Debit)')) and pd.isna(row.get('Có (Credit)')):
                continue
                
            ngay = row.get('Ngày')
            desc = row.get('Diễn Giải')
            debit = row.get('Nợ (Debit)', 0)
            credit = row.get('Có (Credit)', 0)
            
            if pd.isna(debit): debit = 0
            if pd.isna(credit): credit = 0
            
            if debit == 0 and credit == 0:
                continue
            
            is_inflow = (credit > 0)
            
            if is_inflow:
                so_tien = credit
                tk_no = '1121'
                tk_co = classify_account(desc, True)
            else:
                so_tien = debit
                tk_co = '1121'
                tk_no = classify_account(desc, False)
                
            all_transactions.append({
                'Ngân hàng': bank_info,
                'Ngày hạch toán': ngay,
                'Ngày chứng từ': ngay,
                'Diễn giải': desc,
                'TK Nợ': tk_no,
                'TK Có': tk_co,
                'Số tiền': so_tien,
                'Ghi chú': 'Inflow' if is_inflow else 'Outflow'
            })
            
    res_df = pd.DataFrame(all_transactions)
    
    try:
        res_df['Date'] = pd.to_datetime(res_df['Ngày hạch toán'], format="%d/%m/%Y", errors='coerce')
        res_df = res_df.sort_values(by=['Ngân hàng', 'Date']).drop(columns=['Date'])
    except:
        pass

    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        res_df.to_excel(writer, index=False, sheet_name='Sổ Chi Tiết')
        
    print(f"Báo cáo cập nhật đã được lưu: {output_file}")
    print(f"Tổng số giao dịch đã xử lý: {len(res_df)}")

if __name__ == '__main__':
    process_saoke()
