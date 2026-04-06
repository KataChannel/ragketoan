import pandas as pd

def check_xnt():
    try:
        f23_path = '/chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2023.xlsx'
        f24_path = '/chikiet/kata2025/ragketoan/docs/huyvu/XNT_HuyVu_2024.xlsx'
        
        # Load and let pandas identify headers (default header=0)
        df23 = pd.read_excel(f23_path)
        df24 = pd.read_excel(f24_path)
        
        # Identify columns for 'Mã hàng', 'Số lượng cuối' (2023), and 'Số lượng đầu' (2024)
        # Assuming Vietnamese column names commonly found in XNT reports
        col_map_23 = {'Mã hàng': 'item_code', 'Số lượng cuối kỳ': 'qty_end_2023', 'Cuối kỳ Số lượng': 'qty_end_2023'}
        col_map_24 = {'Mã hàng': 'item_code', 'Số lượng đầu kỳ': 'qty_start_2024', 'Đầu kỳ Số lượng': 'qty_start_2024'}
        
        # Helper to find column by name or partial match
        def find_col(df, options):
            for opt in options:
                # Direct match
                if opt in df.columns: return opt
            # Partial match
            for col in df.columns:
                col_str = str(col)
                if 'Mã' in col_str and 'hàng' in col_str: return col
                if 'Cuối' in col_str and 'lượng' in col_str: return col
                if 'Đầu' in col_str and 'lượng' in col_str: return col
            return None

        # Print columns for debugging
        print(f"2023 Columns: {df23.columns.tolist()}")
        print(f"2024 Columns: {df24.columns.tolist()}")

        # Try to guess columns
        ma_hang_23 = find_col(df23, ['Mã hàng', 'MAHANG', 'ITEMCODE'])
        cuoi_23 = find_col(df23, ['Cuối kỳ số lượng', 'Số lượng cuối kỳ', 'SL CUỐI'])
        
        ma_hang_24 = find_col(df24, ['Mã hàng', 'MAHANG', 'ITEMCODE'])
        dau_24 = find_col(df24, ['Đầu kỳ số lượng', 'Số lượng đầu kỳ', 'SL ĐẦU'])

        if not (ma_hang_23 and cuoi_23 and ma_hang_24 and dau_24):
            print("Failed to auto-detect columns. Inspecting first few rows:")
            print("2023 Preview:\n", df23.head(3).to_string())
            print("2024 Preview:\n", df24.head(3).to_string())
            return

        # Prepare for join
        df23_clean = df23[[ma_hang_23, cuoi_23]].dropna(subset=[ma_hang_23])
        df24_clean = df24[[ma_hang_24, dau_24]].dropna(subset=[ma_hang_24])
        
        df23_clean.columns = ['item_code', 'qty_end_23']
        df24_clean.columns = ['item_code', 'qty_start_24']
        
        # Merge
        comp = pd.merge(df23_clean, df24_clean, on='item_code', how='outer')
        
        # Fill NaNs with 0 (assuming newly added items in 2024 had 0 head)
        comp = comp.fillna(0)
        
        # Check tolerance (small decimals)
        comp['diff'] = comp['qty_end_23'] - comp['qty_start_24']
        mismatches = comp[abs(comp['diff']) > 0.001]
        
        if mismatches.empty:
            print("SUCCESS: All initial items' opening balances in 2024 match 2023 ending balances.")
        else:
            print(f"FAILED: Found {len(mismatches)} mismatches.")
            print(mismatches.head(20).to_string())

    except Exception as e:
        print(f"Error during check: {e}")

if __name__ == "__main__":
    check_xnt()
