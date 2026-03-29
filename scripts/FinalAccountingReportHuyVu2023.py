import pandas as pd
import os
import sys

def smart_remap(row):
    desc = str(row['Diễn giải']).upper()
    no = str(row['TK Nợ'])
    co = str(row['TK Có'])
    
    # Logic for Bank (1121)
    bank_keywords = ['PHÍ CT', 'SAO KÊ', 'PHÍ CK', 'ACB', 'VCB', 'MB', 'BIDV', 'CHUYỂN TIỀN', 'GD ', 'NETBANK', 'TRẢ TIỀN', 'DỊCH VỤ NGÂN HÀNG', 'VIETINBANK', 'VIETCOMBANK']
    if any(k in desc for k in bank_keywords):
        if no in ['1561', '331', '642']: no = '1121'
        if co in ['1561', '331']: co = '1121'
        
    # Logic for Admin Expenses (642)
    expense_keywords = ['CƯỚC', 'ĐIỆN', 'NƯỚC', 'XĂNG', 'VĂN PHÒNG PHẨM', 'VPP', 'CHUYỂN PHÁT', 'VIỄN THÔNG', 'INTERNET', 'PHÍ DỊCH VỤ', 'VIMO.VN']
    if any(k in desc for k in expense_keywords):
        if no in ['1561', '331']: no = '6422'
        
    # Logic for Interest (635)
    if 'LÃI VAY' in desc or 'TIỀN LÃI' in desc:
        if no in ['1561', '331']: no = '635'
        if co in ['1561', '331']: co = '1121' # Interest pay by bank
        
    # Logic for Revenue/AR (511/131)
    if 'XUẤT HĐ' in desc or 'BÁN HÀNG' in desc:
        if no in ['1561', '331']: no = '131'
        if co in ['1561', '331', '511']: co = '511'
        
    # Logic for Cash (1111)
    cash_keywords = ['THU TIỀN', 'CHI TIỀN', 'PHIẾU THU', 'PHIẾU CHI', 'TIỀN MẶT', 'THU TM', 'CHI TM', 'TRẢ CƯỚC']
    if any(k in desc for k in cash_keywords):
        if no in ['1561', '331']: no = '1111'
        if co in ['1561', '331']: co = '1111'
        
    # Special: Catch all 1561/331 that are obviously not inventory
    if 'KHÔNG CÓ TÊN' in desc or 'TÊN' not in desc:
        # Default to 642/1111 if unsure but sitting in inventory
        if no == '1561': no = '6422'
        if co == '331': co = '1111'

    return pd.Series([no, co], index=['TK Nợ', 'TK Có'])

def parse_master_nkc(file_path):
    print(f"Parsing Master NKC with Smart Remapping: {file_path}...")
    sys.stdout.flush()
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        data_rows = []
        for line in lines:
            if '|' in line and '---' not in line:
                parts = [p.strip() for p in line.split('|')]
                if not parts[0]: parts = parts[1:]
                if not parts[-1]: parts = parts[:-1]
                if len(parts) >= 6:
                    data_rows.append(parts[:6])
        
        df = pd.DataFrame(data_rows[1:], columns=['Ngày', 'Số HĐ', 'Diễn giải', 'TK Nợ', 'TK Có', 'Số tiền'])
        df['Số tiền'] = df['Số tiền'].astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False)
        df['Số tiền'] = pd.to_numeric(df['Số tiền'], errors='coerce').fillna(0)
        df['Ngày'] = pd.to_datetime(df['Ngày'], dayfirst=True, errors='coerce')
        df = df.dropna(subset=['Ngày']).sort_values('Ngày')
        
        # Apply Smart Remapping
        print("Applying Smart Account Correction...")
        sys.stdout.flush()
        df[['TK Nợ', 'TK Có']] = df.apply(smart_remap, axis=1)
        
        return df
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    base_path = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/"
    master_nkc_path = os.path.join(base_path, "ACTUAL_NKC_2023.md")
    output_dir = os.path.join(base_path, "ALL_LEDGERS_2023_CSV")
    os.makedirs(output_dir, exist_ok=True)
    
    df_nkc = parse_master_nkc(master_nkc_path)
    if df_nkc is None: return

    # Save Master Corrected NKC
    df_nkc.to_csv(os.path.join(output_dir, "NKC_CORRECTED_2023.csv"), index=False, encoding='utf-8-sig')
    
    # Extract Detailed Ledgers
    target_accs = ['1111', '1121', '131', '1561', '331', '3331', '1331', '511', '632', '642']
    for acc in target_accs:
        print(f"Generating CSV for {acc}...")
        sys.stdout.flush()
        mask = (df_nkc['TK Nợ'] == acc) | (df_nkc['TK Có'] == acc)
        df_acc = df_nkc[mask].copy()
        if not df_acc.empty:
            df_acc['TK Đ/Ứ'] = df_acc.apply(lambda r: r['TK Có'] if r['TK Nợ'] == acc else r['TK Nợ'], axis=1)
            df_acc['Nợ'] = df_acc.apply(lambda r: r['Số tiền'] if r['TK Nợ'] == acc else 0, axis=1)
            df_acc['Có'] = df_acc.apply(lambda r: r['Số tiền'] if r['TK Có'] == acc else 0, axis=1)
            out_df = df_acc[['Ngày', 'Số HĐ', 'Diễn giải', 'TK Đ/Ứ', 'Nợ', 'Có']]
            out_df.to_csv(os.path.join(output_dir, f"CT_{acc}_2023.csv"), index=False, encoding='utf-8-sig')

    print(f"COMPLETE! All 2023 ledgers (corrected) are in {output_dir}")
    sys.stdout.flush()

if __name__ == "__main__":
    main()
