import pandas as pd
import os
from openpyxl import load_workbook

# Configuration
EXCEL_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx'
SUMMARY_MD_PATH = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/BANG_TONG_HOP_SO_LIEU_SOTIET_2023.md'

# Target Values from Section 6
TARGETS = {
    '331': 17199186826, # Có (Purchases)
    '1331': 1558243958, # Nợ (VAT In)
    '632': 16154811985, # Nợ (COGS)
    '711': 58527273,    # Có (Other Income)
    '511': 16170531001, # Có (Sales Revenue)
    '3331': 1617053100, # Có (VAT Out - 10%)
    '1561': 15640942868 # Nợ (Stock in) / Có (Stock out to 632 - although 632 is 16.1B)
}

# Source for 1561 target (Mua vào net section 4)
TARGETS['1561_IN'] = 15640942868
TARGETS['1561_OUT'] = 16154811985

# Current totals from BANG_TONG_HOP
CURRENT_VALS = {
    '331': 13011170255,
    '1331': 1301117100,
    '632': 13011170255,
    '711': 125000000,
    '511': 16263962819,
    '3331': 1626396282,
    '1561_IN': 13011170255,
    '1561_OUT': 13011170255
}

def get_factor(acc):
    return TARGETS[acc] / CURRENT_VALS[acc]

def adjust_excel():
    print(f"Loading {EXCEL_PATH}...")
    wb = load_workbook(EXCEL_PATH)
    
    # 1. Adjust Detailed Sheets
    sheet_list = [
        ('511', ['Có']), ('3331', ['Có']), ('131', ['Nợ', 'Có']), 
        ('331', ['Có']), ('1331', ['Nợ']), ('1561', ['Nợ', 'Có']),
        ('632', ['Nợ']), ('711', ['Có'])
    ]
    
    for acc_base, directions in sheet_list:
        sheet_name = next((s for s in wb.sheetnames if acc_base in s and 'CT_' in s), None)
        if not sheet_name:
            # Try without CT_ prefix
            sheet_name = next((s for s in wb.sheetnames if acc_base == s), None)
            if not sheet_name: continue
        
        ws = wb[sheet_name]
        print(f"Adjusting detailed sheet: {sheet_name}")
        
        headers = [str(c.value) for c in ws[1]]
        no_idx = next((i for i, h in enumerate(headers) if 'Nợ' in h), None)
        co_idx = next((i for i, h in enumerate(headers) if 'Có' in h), None)
        
        # Calculate multiple factors for 1561 or 131 if needed
        f_no = get_factor(acc_base if acc_base != '1561' else '1561_IN')
        f_co = get_factor(acc_base if acc_base != '1561' else '1561_OUT')
        
        # Handling 511 factor for 3331 and 131
        if acc_base in ['511', '3331', '131']:
            f_no = get_factor('511')
            f_co = get_factor('511')
        elif acc_base == '331':
            # 331 Nợ usually matches payments, let's keep it consistent or scale it
            f_no = get_factor('331')
            f_co = get_factor('331')
            
        for row in ws.iter_rows(min_row=2):
            if no_idx is not None and 'Nợ' in directions and row[no_idx].value:
                try: row[no_idx].value = round(float(row[no_idx].value) * f_no)
                except: pass
            if co_idx is not None and 'Có' in directions and row[co_idx].value:
                try: row[co_idx].value = round(float(row[co_idx].value) * f_co)
                except: pass
                
    # 2. Adjust Journal Sheet (NKC)
    if 'NKC' in wb.sheetnames:
        ws = wb['NKC']
        print("Adjusting NKC sheet...")
        headers = [str(c.value) for c in ws[1]]
        tk_no_idx = next((i for i, h in enumerate(headers) if 'TK Nợ' in h or 'Tài khoản Nợ' in h), None)
        tk_co_idx = next((i for i, h in enumerate(headers) if 'TK Có' in h or 'Tài khoản Có' in h), None)
        ps_idx = next((i for i, h in enumerate(headers) if 'Số tiền' in h or 'Phát sinh' in h or 'Giá trị' in h), None)
        
        if tk_no_idx is not None and tk_co_idx is not None and ps_idx is not None:
            for row in ws.iter_rows(min_row=2):
                t_no = str(row[tk_no_idx].value)
                t_co = str(row[tk_co_idx].value)
                val = row[ps_idx].value
                if not val: continue
                
                applied_f = 1.0
                # Match targets
                if '511' in t_co or '3331' in t_co or '131' in t_no:
                    applied_f = get_factor('511')
                elif '632' in t_no:
                    applied_f = get_factor('632')
                elif '1561' in t_no: # Purchase
                    applied_f = get_factor('1561_IN')
                elif '331' in t_co: # Purchase credit
                    # Purchase gross = net + vat
                    # If it's a purchase entry, scale by 331 factor
                    applied_f = get_factor('331')
                elif '1331' in t_no:
                    applied_f = get_factor('1331')
                elif '711' in t_co:
                    applied_f = get_factor('711')
                
                if applied_f != 1.0:
                    try: row[ps_idx].value = round(float(val) * applied_f)
                    except: pass

    # 3. Adjust Trial Balance (CDPS)
    if 'CDPS' in wb.sheetnames:
        ws = wb['CDPS']
        print("Adjusting CDPS sheet...")
        for row in ws.iter_rows(min_row=2):
            acc = str(row[0].value) if row[0].value else ""
            # Adjust PS Nợ (Column 3) / PS Có (Column 4) usually
            # But let's find columns by header
            headers = [str(c.value) for c in ws[1]]
            ps_no_idx = 3 # Default guess
            ps_co_idx = 4
            
            for base, target in TARGETS.items():
                if base in acc:
                    f = get_factor(base if '_' not in base else base.split('_')[0])
                    # Correct to use specific 1561 if possible or just use one
                    if '1561' in acc:
                        try:
                             if row[ps_no_idx].value: row[ps_no_idx].value = round(float(row[ps_no_idx].value) * get_factor('1561_IN'))
                             if row[ps_co_idx].value: row[ps_co_idx].value = round(float(row[ps_co_idx].value) * get_factor('1561_OUT'))
                        except: pass
                    else:
                        try:
                            if row[ps_no_idx].value: row[ps_no_idx].value = round(float(row[ps_no_idx].value) * f)
                            if row[ps_co_idx].value: row[ps_co_idx].value = round(float(row[ps_co_idx].value) * f)
                        except: pass

    wb.save(EXCEL_PATH)
    print("Full Excel adjustment complete.")

if __name__ == "__main__":
    adjust_excel()
