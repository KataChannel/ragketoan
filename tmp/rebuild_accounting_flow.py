import pandas as pd
import numpy as np
import os
import zipfile

def generate_report_fixed_total():
    # 1. READ CATEGORIES
    md_path = '/chikiet/kata2025/ragketoan/docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md'
    with open(md_path, 'r') as f:
        lines = f.readlines()
    
    data = []
    for line in lines:
        if line.startswith('|') and 'STT' not in line and '---' not in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 4:
                data.append({'Mã Nhóm': parts[2], 'Tên Nhóm Sản Phẩm': parts[3]})
    
    df_base = pd.DataFrame(data)
    num_groups = len(df_base)
    
    # 2. TARGETS
    TARGET_TOTAL_2023 = 20528682383
    
    output_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan'
    os.makedirs(output_dir, exist_ok=True)
    
    # Seed everything for reproducibility
    np.random.seed(42)
    
    # Weighted allocation for initial VNĐ
    weights = np.random.dirichlet(np.ones(num_groups), size=1)[0]
    initial_vnd = (weights * TARGET_TOTAL_2023).round(0)
    # Adjust last group to match exactly
    initial_vnd[-1] += (TARGET_TOTAL_2023 - initial_vnd.sum())
    
    # Initial SL based on random prices
    initial_prices = np.random.randint(500000, 5000000, size=num_groups)
    initial_sl = (initial_vnd / initial_prices).round(0).astype(int)
    initial_sl = np.maximum(initial_sl, 5) # Minimum 5 units
    
    # Sync VNĐ to match SL exactly for a clean start price? 
    # Actually, user gave a fixed TOTAL VNĐ, so let's keep VNĐ fixed and let Price vary slightly.
    
    cur_sl = initial_sl.copy().astype(float)
    cur_vnd = initial_vnd.copy().astype(float)

    files = []
    for yr in [2023, 2024, 2025]:
        fname = f'XNT_HuyVu_{yr}_Official_Accounting.xlsx'
        fpath = os.path.join(output_dir, fname)
        writer = pd.ExcelWriter(fpath, engine='openpyxl')
        
        monthly_dfs = []
        
        for m in range(1, 13):
            # Monthly simulation
            np.random.seed(yr * 100 + m)
            
            # Transactions
            in_sl = np.random.randint(2, 20, size=num_groups).astype(float)
            in_vnd = (in_sl * initial_prices * (1 + np.random.uniform(-0.1, 0.1, size=num_groups))).round(0)
            
            out_sl = np.random.randint(1, 15, size=num_groups).astype(float)
            out_sl = np.minimum(out_sl, cur_sl + in_sl - 1) # Guard
            
            # COGS = average price of current stock
            avg_price = cur_vnd / (cur_sl + 1e-9)
            out_vnd = (out_sl * avg_price).round(0)
            
            # Create DataFrame
            df_m = df_base.copy()
            df_m['Tồn Đầu Kỳ (SL)'] = cur_sl
            df_m['Tồn Đầu Kỳ (VNĐ)'] = cur_vnd
            df_m['Nhập (SL)'] = in_sl
            df_m['Nhập (VNĐ)'] = in_vnd
            df_m['Xuất (SL)'] = out_sl
            df_m['Xuất (VNĐ)'] = out_vnd
            
            df_m['Tồn Cuối (SL)'] = df_m['Tồn Đầu Kỳ (SL)'] + df_m['Nhập (SL)'] - df_m['Xuất (SL)']
            df_m['Tồn Cuối (VNĐ)'] = df_m['Tồn Đầu Kỳ (VNĐ)'] + df_m['Nhập (VNĐ)'] - df_m['Xuất (VNĐ)']
            
            # Prepare state for next
            cur_sl = df_m['Tồn Cuối (SL)'].values
            cur_vnd = df_m['Tồn Cuối (VNĐ)'].values
            
            # Format
            df_m['STT'] = range(1, num_groups + 1)
            cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 
                    'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 
                    'Nhập (SL)', 'Nhập (VNĐ)', 
                    'Xuất (SL)', 'Xuất (VNĐ)', 
                    'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
            df_m = df_m[cols]
            
            # Add Total Row
            total_vals = df_m.iloc[:, 3:].sum()
            total_row = {'STT': '', 'Mã Nhóm': '', 'Tên Nhóm Sản Phẩm': 'TỔNG CỘNG'}
            total_row.update(total_vals.to_dict())
            
            df_m_final = pd.concat([df_m, pd.DataFrame([total_row])], ignore_index=True)
            df_m_final.to_excel(writer, sheet_name=str(m), index=False)
            monthly_dfs.append(df_m) # Keep without total row for yearly sum
            
        # Yearly Summary (xnt12thang)
        df_yr = df_base.copy()
        df_yr['Tồn Đầu Kỳ (SL)'] = monthly_dfs[0]['Tồn Đầu Kỳ (SL)'].values
        df_yr['Tồn Đầu Kỳ (VNĐ)'] = monthly_dfs[0]['Tồn Đầu Kỳ (VNĐ)'].values
        
        df_yr['Nhập (SL)'] = sum(m['Nhập (SL)'] for m in monthly_dfs)
        df_yr['Nhập (VNĐ)'] = sum(m['Nhập (VNĐ)'] for m in monthly_dfs)
        df_yr['Xuất (SL)'] = sum(m['Xuất (SL)'] for m in monthly_dfs)
        df_yr['Xuất (VNĐ)'] = sum(m['Xuất (VNĐ)'] for m in monthly_dfs)
        
        df_yr['Tồn Cuối (SL)'] = monthly_dfs[-1]['Tồn Cuối (SL)'].values
        df_yr['Tồn Cuối (VNĐ)'] = monthly_dfs[-1]['Tồn Cuối (VNĐ)'].values
        
        df_yr['STT'] = range(1, num_groups + 1)
        df_yr = df_yr[cols]
        
        yr_total_vals = df_yr.iloc[:, 3:].sum()
        yr_total_row = {'STT': '', 'Mã Nhóm': '', 'Tên Nhóm Sản Phẩm': 'TỔNG CỘNG'}
        yr_total_row.update(yr_total_vals.to_dict())
        
        df_yr_final = pd.concat([df_yr, pd.DataFrame([yr_total_row])], ignore_index=True)
        df_yr_final.to_excel(writer, sheet_name='xnt12thang', index=False)
        
        writer.close()
        files.append(fpath)
        print(f"Generated {fname}. Yearly Tôn Đầu (VNĐ): {yr_total_row['Tồn Đầu Kỳ (VNĐ)']}")

    # Zip
    zip_name = 'Bao_Cao_Nghiep_Vu_HuyVu_Official_Final.zip'
    zip_path = os.path.join(output_dir, zip_name)
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for f in files:
            zipf.write(f, os.path.basename(f))
    
    print(f"PROCESS COMPLETED. ZIP: {zip_path}")

if __name__ == '__main__':
    generate_report_fixed_total()
