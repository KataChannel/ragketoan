import pandas as pd
import os
import datetime

def parse_md_table_carefully(file_path):
    """Parses a markdown table even with extra pipes in cells."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        headers = []
        data_rows = []
        in_table = False
        for line in lines:
            line = line.strip()
            if '|' in line:
                if '---' in line: continue
                parts = [p.strip() for p in line.split('|')]
                if not parts[0]: parts = parts[1:]
                if not parts[-1]: parts = parts[:-1]
                if not in_table:
                    headers = parts
                    in_table = True
                else:
                    if len(parts) >= 7:
                        # Col 0: Date, 1: Doc No, 2: Desc, 3: Partner, 4: TK, 5: Nợ, 6: Có
                        new_parts = [
                            parts[0], # Date
                            parts[1], # Doc No
                            " ".join(parts[2:-4]), # Desc
                            parts[-4] if len(parts) > 4 else "", # Partner
                            parts[-3] if len(parts) > 3 else "", # TK Đ/Ứ
                            parts[-2] if len(parts) > 2 else "0", # Nợ
                            parts[-1] if len(parts) > 1 else "0", # Có
                        ]
                        data_rows.append(new_parts)
            elif in_table:
                if not line: continue
                else: break
        if not data_rows: return None
        df = pd.DataFrame(data_rows, columns=['Ngày', 'Số HĐ', 'Diễn giải', 'Đối tác', 'TK Đ/Ứ', 'Nợ', 'Có'])
        for col in ['Nợ', 'Có']:
            df[col] = df[col].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False)
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        return df
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        return None

def main():
    base_path = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/"
    output_file = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx"
    
    # 1. Load Data
    files = {
        '131': 'ACTUAL_DETAIL_131_2023.md',
        '331': 'ACTUAL_DETAIL_331_2023.md',
        '1561': 'ACTUAL_DETAIL_1561_2023.md',
        '511': 'ACTUAL_DETAIL_511_2023.md',
        '632': 'ACTUAL_DETAIL_632_2023.md',
        '642': 'ACTUAL_DETAIL_642_2023.md'
    }
    
    all_data = {}
    for acc, filename in files.items():
        path = os.path.join(base_path, filename)
        if os.path.exists(path):
            df = parse_md_table_carefully(path)
            if df is not None:
                all_data[acc] = df

    # Bank 112
    bank_file = os.path.join(base_path, "so_chi_tiet_doi_ung_1121.xlsx")
    if os.path.exists(bank_file):
        all_data['112'] = pd.read_excel(bank_file)

    # 2. Synthetic Ledgers
    # 1111 from 511
    if '511' in all_data:
        df_511 = all_data['511']
        df_1111 = df_511.copy()
        df_1111['Diễn giải'] = "Thu tiền mặt từ khách hàng"
        df_1111['TK Đ/Ứ'] = '131'
        df_1111['Nợ'] = df_511['Có']
        df_1111['Có'] = 0
        all_data['1111'] = df_1111
        
    # 3331 (VAT Output) from 511
    if '511' in all_data:
        df_511 = all_data['511']
        df_3331 = df_511.copy()
        df_3331['Diễn giải'] = "Thuế GTGT đầu ra (10%)"
        df_3331['TK Đ/Ứ'] = '131'
        df_3331['Nợ'] = 0
        df_3331['Có'] = df_511['Có'] * 0.1
        all_data['3331'] = df_3331

    # 1331 (VAT Input) from 1561 + Move LAI VAY to 635 (BUG 1)
    if '1561' in all_data:
        df_1561 = all_data['1561']
        # Filter Interest Expenses (BUG 1)
        mask_laivay = df_1561['Diễn giải'].str.contains('LAI VAY', case=False, na=False)
        if mask_laivay.any():
            df_635 = df_1561[mask_laivay].copy()
            all_data['635'] = df_635
            df_1561 = df_1561[~mask_laivay].copy()
            all_data['1561'] = df_1561
            print(f"Moved {len(df_635)} rows of interest expenses from 1561 to 635.")

        df_1331 = df_1561[df_1561['Nợ'] > 0].copy() # Purchases
        df_1331['Diễn giải'] = "Thuế GTGT đầu vào (10%)"
        df_1331['TK Đ/Ứ'] = '331'
        df_1331['Nợ'] = df_1331['Nợ'] * 0.1
        df_1331['Có'] = 0
        all_data['1331'] = df_1331

    # 3411 from 112 (BUG 4)
    if '112' in all_data:
        df_112_raw = all_data['112']
        # Keyword list for loans (BUG 4)
        mask_loan = df_112_raw['Diễn giải'].astype(str).str.contains('vay|LD2|PDLD|Giai ngan|GN', case=False, na=False)
        df_3411 = df_112_raw[mask_loan].copy()
        if not df_3411.empty:
            df_3411 = df_3411.rename(columns={'Ngày hạch toán': 'Ngày'})
            df_3411['TK Đ/Ứ'] = '112'
            if 'Ghi chú' in df_3411.columns:
                df_3411['Nợ'] = df_3411.apply(lambda r: r['Số tiền'] if r['Ghi chú'] == 'Outflow' else 0, axis=1)
                df_3411['Có'] = df_3411.apply(lambda r: r['Số tiền'] if r['Ghi chú'] == 'Inflow' else 0, axis=1)
            all_data['3411'] = df_3411


    # 641 (Selling Fees)
    df_641_list = []
    keywords_641 = ['vận chuyển', 'cước', 'ship', 'quảng cáo']
    for acc in ['1561', '331', '642']:
        if acc in all_data:
            df_acc = all_data[acc]
            mask = df_acc['Diễn giải'].astype(str).str.contains('|'.join(keywords_641), case=False, na=False)
            if mask.any():
                df_641_part = df_acc[mask].copy()
                df_641_list.append(df_641_part)
    if df_641_list:
        all_data['641'] = pd.concat(df_641_list)

    # 3. NKC (Nhật ký chung)
    nkc_rows = []
    for acc, df in all_data.items():
        if acc == '112': continue # 112 has different schema, handle later or normalize
        for _, row in df.iterrows():
            date = row.get('Ngày', '')
            doc = row.get('Số HĐ', '')
            desc = row.get('Diễn giải', '')
            debit_val = row.get('Nợ', 0)
            credit_val = row.get('Có', 0)
            contra_acc = row.get('TK Đ/Ứ', '')
            
            if debit_val > 0:
                nkc_rows.append({'Ngày': date, 'Số HĐ': doc, 'Diễn giải': desc, 'TK Nợ': acc, 'TK Có': contra_acc, 'Số tiền': debit_val})
            if credit_val > 0:
                nkc_rows.append({'Ngày': date, 'Số HĐ': doc, 'Diễn giải': desc, 'TK Nợ': contra_acc, 'TK Có': acc, 'Số tiền': credit_val})
    
    # Add 112 to NKC
    if '112' in all_data:
        df_112_norm = all_data['112']
        for _, row in df_112_norm.iterrows():
            date = row.get('Ngày hạch toán', '')
            desc = str(row.get('Diễn giải', ''))
            amount = row.get('Số tiền', 0)
            status = row.get('Ghi chú', '')
            
            # IMPROVED MAPPING FOR BUG 2, 3, 4
            tk_no_raw = str(row.get('TK Nợ', ''))
            tk_co_raw = str(row.get('TK Có', ''))
            
            # Normalize bank account codes
            if tk_no_raw == '1121': tk_no_raw = ''
            if tk_co_raw == '1121': tk_co_raw = ''
            
            desc_l = desc.lower()
            if 'vay' in desc_l or 'pdld' in desc_l or 'ld2' in desc_l or 'giai ngan' in desc_l:
                if status == 'Inflow': tk_no, tk_co = '112', '3411'
                else: tk_no, tk_co = '3411', '112'
            elif 'lai' in desc_l:
                if status == 'Inflow': tk_no, tk_co = '112', '515'
                else: tk_no, tk_co = '635', '112'
            elif any(k in desc_l for k in ['tien mat', 'nop tm', 'rut tm', 'nop tien mat', 'rut tien mat']):
                if status == 'Inflow': tk_no, tk_co = '112', '1111'
                else: tk_no, tk_co = '1111', '112'
            else:
                if status == 'Inflow':
                    tk_no = '112'
                    tk_co = tk_co_raw if tk_co_raw and tk_co_raw != 'nan' else '131'
                else:
                    tk_no = tk_no_raw if tk_no_raw and tk_no_raw != 'nan' else '331'
                    tk_co = '112'
            
            nkc_rows.append({'Ngày': date, 'Số HĐ': 'Bank', 'Diễn giải': desc, 'TK Nợ': tk_no, 'TK Có': tk_co, 'Số tiền': amount})


    df_nkc = pd.DataFrame(nkc_rows)
    df_nkc['Ngày'] = pd.to_datetime(df_nkc['Ngày'], dayfirst=True, errors='coerce')
    df_nkc = df_nkc.sort_values('Ngày')
    
    # 4. CDPS (Bảng Cân đối phát sinh)
    # Opening balances from BAO_CAO_TONG_HOP_HAY_THU_2023.md
    opening = {'1561': 20528682383, '411': 20528682383}
    
    unique_accs = sorted(list(set(df_nkc['TK Nợ'].unique()) | set(df_nkc['TK Có'].unique())))
    cdps_data = []
    for acc in unique_accs:
        if not acc or str(acc) == 'nan': continue
        ps_no = df_nkc[df_nkc['TK Nợ'] == acc]['Số tiền'].sum()
        ps_co = df_nkc[df_nkc['TK Có'] == acc]['Số tiền'].sum()
        dau_no = opening.get(acc, 0)
        dau_co = opening.get(acc, 0) if acc == '411' else 0 # 411 is Credit
        if acc == '411': dau_no = 0
        
        # Balance calculation
        # Assets (1xx, 2xx, 6xx, 8xx): Final = Dau_No + PS_No - PS_Co
        # Liabilities (3xx, 4xx, 5xx, 7xx): Final = Dau_Co + PS_Co - PS_No
        if acc.startswith(('1', '2', '6', '8')):
            final_no = max(0, dau_no + ps_no - ps_co)
            final_co = abs(min(0, dau_no + ps_no - ps_co))
        else:
            final_co = max(0, dau_co + ps_co - ps_no)
            final_no = abs(min(0, dau_co + ps_co - ps_no))
            
        cdps_data.append({
            'TK': acc, 'Dư Đầu Nợ': dau_no, 'Dư Đầu Có': dau_co,
            'PS Nợ': ps_no, 'PS Có': ps_co,
            'Dư Cuối Nợ': final_no, 'Dư Cuối Có': final_co
        })
    df_cdps = pd.DataFrame(cdps_data)

    # 5. KQKD (Báo cáo kết quả kinh doanh)
    rev = df_nkc[df_nkc['TK Có'] == '511']['Số tiền'].sum()
    cogs = df_nkc[df_nkc['TK Nợ'] == '632']['Số tiền'].sum()
    s_exp = df_nkc[df_nkc['TK Nợ'] == '641']['Số tiền'].sum() if '641' in df_nkc['TK Nợ'].values else 0
    a_exp = df_nkc[df_nkc['TK Nợ'] == '642']['Số tiền'].sum()
    profit = rev - cogs - s_exp - a_exp
    
    kqkd_data = [
        {'Chỉ tiêu': '1. Doanh thu bán hàng', 'Số tiền': rev},
        {'Chỉ tiêu': '2. Giá vốn hàng bán', 'Số tiền': cogs},
        {'Chỉ tiêu': '3. Lợi nhuận gộp', 'Số tiền': rev - cogs},
        {'Chỉ tiêu': '4. Chi phí bán hàng', 'Số tiền': s_exp},
        {'Chỉ tiêu': '5. Chi phí quản lý doanh nghiệp', 'Số tiền': a_exp},
        {'Chỉ tiêu': '6. Lợi nhuận thuần từ HĐKD', 'Số tiền': profit},
        {'Chỉ tiêu': '7. Tổng lợi nhuận trước thuế', 'Số tiền': profit},
        {'Chỉ tiêu': '8. Lợi nhuận sau thuế', 'Số tiền': profit}
    ]
    df_kqkd = pd.DataFrame(kqkd_data)

    # 6. Save to Excel
    writer = pd.ExcelWriter(output_file, engine='openpyxl')
    
    # Summary Sheets First
    df_nkc.to_excel(writer, sheet_name='NKC', index=False)
    df_cdps.to_excel(writer, sheet_name='CDPS', index=False)
    df_kqkd.to_excel(writer, sheet_name='KQKD', index=False)
    
    # Account summary (Sổ Cái)
    df_nkc.to_excel(writer, sheet_name='So_Cai_Chung', index=False)
    
    # Detailed Sheets
    for acc, df in all_data.items():
        sheet_name = f"CT_{acc}" if len(acc) > 3 else f"CT_{acc}"
        df.to_excel(writer, sheet_name=sheet_name[:31], index=False)
        
    writer.close()
    print(f"Final Accounting Report generated: {output_file}")

if __name__ == "__main__":
    main()
