import pandas as pd
import os
import glob
import re

def clean_amount(val):
    if pd.isna(val) or val == '':
        return 0.0
    if isinstance(val, str):
        # Remove commas and non-numeric chars except . and -
        cleaned = re.sub(r'[^\d.-]', '', val.replace(',', ''))
        try:
            return float(cleaned)
        except:
            return 0.0
    return float(val)

def get_first_visible_sheet(path):
    try:
        if path.endswith('.xls'):
            import xlrd
            book = xlrd.open_workbook(path)
            for i in range(book.nsheets):
                if book.sheet_by_index(i).visibility == 0:
                    return i # Return index for xlrd/pandas
        # For .xlsx or if xlrd fails, default to first sheet
        return 0
    except:
        return 0

def process_vtb(path):
    print(f"Processing VTB: {os.path.basename(path)}")
    try:
        sheet_idx = get_first_visible_sheet(path)
        df = pd.read_excel(path, header=24, sheet_name=sheet_idx)
        if df.columns[0] != 'STT/No.':
            return process_vay(path, "VietinBank (Vay)")
        
        df = df.rename(columns={
            'Ngày hạch toán/Accounting date': 'Date',
            'Mô tả giao dịch/ Transaction description': 'Description',
            'Nợ/ Debit': 'Debit',
            'Có / Credit': 'Credit',
            'Số dư TK/ Account Balance': 'Balance'
        })
        
        df = df[['Date', 'Description', 'Debit', 'Credit', 'Balance']]
        df['Bank'] = 'VietinBank'
        df['SourceFile'] = os.path.basename(path)
        df = df.dropna(subset=['Date'])
        return df
    except Exception as e:
        print(f"Error processing {path}: {e}")
        return None

def process_vcb(path):
    print(f"Processing VCB: {os.path.basename(path)}")
    try:
        sheet_idx = get_first_visible_sheet(path)
        df = pd.read_excel(path, header=13, sheet_name=sheet_idx)
        if 'STT\nNo.' not in df.columns:
             return process_vay(path, "Vietcombank (Vay)")
             
        date_col = [c for c in df.columns if 'Date' in c][0]
        debit_col = [c for c in df.columns if 'Debit' in c][0]
        credit_col = [c for c in df.columns if 'Credit' in c][0]
        balance_col = [c for c in df.columns if 'Balance' in c][0]
        desc_col = [c for c in df.columns if 'detail' in c][0]
        
        df = df.rename(columns={
            date_col: 'RawDate',
            debit_col: 'Debit',
            credit_col: 'Credit',
            balance_col: 'Balance',
            desc_col: 'Description'
        })
        
        df['Date'] = df['RawDate'].apply(lambda x: str(x).split('/')[0].strip() if pd.notna(x) else x)
        df = df[['Date', 'Description', 'Debit', 'Credit', 'Balance']]
        df['Bank'] = 'Vietcombank'
        df['SourceFile'] = os.path.basename(path)
        df = df.dropna(subset=['Date'])
        df = df[~df['Date'].astype(str).str.contains('Ngày', na=False)]
        return df
    except Exception as e:
        print(f"Error processing {path}: {e}")
        return None

def process_vay(path, bank_name):
    print(f"Processing Vay file: {os.path.basename(path)} as {bank_name}")
    try:
        sheet_idx = get_first_visible_sheet(path)
        df = pd.read_excel(path, header=11, sheet_name=sheet_idx)
        
        new_df = pd.DataFrame()
        new_df['Date'] = df.iloc[:, 3]
        new_df['Description'] = df.iloc[:, 6]
        new_df['Credit'] = df.iloc[:, 16] # THU
        new_df['Debit'] = df.iloc[:, 17]  # CHI
        new_df['Balance'] = df.iloc[:, 18] # TỒN
        new_df['Bank'] = bank_name
        new_df['SourceFile'] = os.path.basename(path)
        
        new_df = new_df.dropna(subset=['Date'])
        return new_df
    except Exception as e:
        print(f"Error processing {path} as Vay: {e}")
        return None

def main():
    vtb_dir = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NH VTB 2024 HHP"
    vcb_dir = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP"
    output_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/tong_hop_ngan_hang_2024.xlsx"
    
    all_dfs = []
    
    # Process VTB files
    for f in glob.glob(os.path.join(vtb_dir, "*.xls*")):
        df = process_vtb(f)
        if df is not None:
            all_dfs.append(df)
            
    # Process VCB files
    for f in glob.glob(os.path.join(vcb_dir, "*.xls*")):
        df = process_vcb(f)
        if df is not None:
            all_dfs.append(df)
            
    if not all_dfs:
        print("No data found!")
        return
        
    final_df = pd.concat(all_dfs, ignore_index=True)
    
    final_df['Debit'] = final_df['Debit'].apply(clean_amount)
    final_df['Credit'] = final_df['Credit'].apply(clean_amount)
    final_df['Balance'] = final_df['Balance'].apply(clean_amount)
    
    def try_parse_date(d):
        if pd.isna(d): return d
        d_str = str(d).strip()
        for fmt in ('%d/%m/%Y', '%Y-%m-%d %H:%M:%S', '%Y-%m-%d'):
            try:
                return pd.to_datetime(d_str, format=fmt)
            except:
                pass
        return pd.to_datetime(d_str, errors='coerce')

    final_df['SortDate'] = final_df['Date'].apply(try_parse_date)
    final_df = final_df.sort_values(by=['Bank', 'SortDate'], ascending=[True, True])
    final_df = final_df.drop(columns=['SortDate'])
    final_df = final_df[['Bank', 'Date', 'Description', 'Debit', 'Credit', 'Balance', 'SourceFile']]
    
    final_df.to_excel(output_path, index=False)
    print(f"Final report saved to: {output_path}")

if __name__ == "__main__":
    main()
