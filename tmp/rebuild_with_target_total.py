import pandas as pd
import numpy as np
import os
import zipfile

def generate_report_fixed_total():
    # 1. READ CATEGORIES
    md_path = '/chikiet/kata2025/ragketoan/docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md'
    # Simple extraction of the table
    with open(md_path, 'r') as f:
        lines = f.readlines()
    
    data = []
    for line in lines:
        if line.startswith('|') and 'STT' not in line and '---' not in line:
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 4:
                # parts[1] is STT, parts [2] is Mã Nhóm, parts[3] is Tên Nhóm
                data.append({'Mã Nhóm': parts[2], 'Tên Nhóm Sản Phẩm': parts[3]})
    
    df_base = pd.DataFrame(data)
    num_groups = len(df_base)
    
    # 2. TARGETS
    TOTAL_TON_DAU_2023 = 20528682383
    
    output_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan'
    os.makedirs(output_dir, exist_ok=True)
    
    # Current balances (Value and SL)
    # Weight random allocation
    weights = np.random.dirichlet(np.ones(num_groups), size=1)[0]
    ton_dau_vnd = (weights * TOTAL_TON_DAU_2023).round(0)
    
    # Prices vary by group
    prices = np.random.randint(500000, 5000000, size=num_groups)
    ton_dau_sl = (ton_dau_vnd / prices).round(0).astype(int)
    # Re-adjust VNĐ slightly to match SL * prices or keep as is? Let's fix VNĐ and derive Price.
    
    current_sl = ton_dau_sl.copy()
    current_vnd = ton_dau_vnd.copy()

    files = []
    for yr in [2023, 2024, 2025]:
        fname = f'XNT_HuyVu_{yr}_Final_Accounting_V15.xlsx'
        fpath = os.path.join(output_dir, fname)
        writer = pd.ExcelWriter(fpath, engine='openpyxl')
        
        monthly_data = [] # To store df for each month
        
        # We simulate month by month to ensure Tồn Cuối (M-1) = Tồn Đầu (M)
        for m in range(1, 13):
            df_m = df_base.copy()
            df_m['Tồn Đầu Kỳ (SL)'] = current_sl
            df_m['Tồn Đầu Kỳ (VNĐ)'] = current_vnd
            
            # Simulate Nhập/Xuất
            np.random.seed(yr * 100 + m)
            nhap_sl = np.random.randint(5, 50, size=num_groups)
            # Roughly same price as initial
            nhap_vnd = nhap_sl * prices * (1 + np.random.uniform(-0.05, 0.05, size=num_groups))
            
            xuat_sl = np.random.randint(5, 50, size=num_groups)
            # Ensure xuat <= ton_dau + nhap
            xuat_sl = np.minimum(xuat_sl, current_sl + nhap_sl - 1)
            # Cost of goods sold (weighted average approx)
            cost_coeff = current_vnd / (current_sl + 1e-9)
            xuat_vnd = xuat_sl * cost_coeff
            
            df_m['Nhập (SL)'] = nhap_sl
            df_m['Nhập (VNĐ)'] = nhap_vnd.round(0)
            df_m['Xuất (SL)'] = xuat_sl
            df_m['Xuất (VNĐ)'] = xuat_vnd.round(0)
            
            df_m['Tồn Cuối (SL)'] = df_m['Tồn Đầu Kỳ (SL)'] + df_m['Nhập (SL)'] - df_m['Xuất (SL)']
            df_m['Tồn Cuối (VNĐ)'] = df_m['Tồn Đầu Kỳ (VNĐ)'] + df_m['Nhập (VNĐ)'] - df_m['Xuất (VNĐ)']
            
            # Update state for next month
            current_sl = df_m['Tồn Cuối (SL)'].values
            current_vnd = df_m['Tồn Cuối (VNĐ)'].values
            
            # Format and Total
            df_m['STT'] = range(1, num_groups + 1)
            cols = ['STT', 'Mã Nhóm', 'Tên Nhóm Sản Phẩm', 
                    'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 
                    'Nhập (SL)', 'Nhập (VNĐ)', 
                    'Xuất (SL)', 'Xuất (VNĐ)', 
                    'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
            df_m = df_m[cols]
            
            # Add Total Row
            num_only = df_m.iloc[:, 3:].sum().to_dict()
            num_only['STT'] = ''
            num_only['Mã Nhóm'] = ''
            num_only['Tên Nhóm Sản Phẩm'] = 'TỔNG CỘNG'
            df_m = pd.concat([df_m, pd.DataFrame([num_only])], ignore_index=True)
            
            monthly_data.append(df_m)
            df_m.to_excel(writer, sheet_name=str(m), index=False)
            
        # Summary Sheet (xnt12thang) for the year
        # Ton Dau = ton dau of Month 1
        # Ton Cuoi = ton cuoi of Month 12
        # Nhap/Xuat = sum of all months
        df_sum = df_base.copy()
        df_sum['Tồn Đầu Kỳ (SL)'] = monthly_data[0]['Tồn Đầu Kỳ (SL)'].iloc[:-1].values
        df_sum['Tồn Đầu Kỳ (VNĐ)'] = monthly_data[0]['Tồn Đầu Kỳ (VNĐ)'].iloc[:-1].values
        
        df_sum['Nhập (SL)'] = sum(m['Nhập (SL)'].iloc[:-1] for m in monthly_data)
        df_sum['Nhập (VNĐ)'] = sum(m['Nhập (VNĐ)'].iloc[:-1] for m in monthly_data)
        df_sum['Xuất (SL)'] = sum(m['Xuất (SL)'].iloc[:-1] for m in monthly_data)
        df_sum['Xuất (VNĐ)'] = sum(m['Xuất (VNĐ)'].iloc[:-1] for m in monthly_data)
        
        df_sum['Tồn Cuối (SL)'] = monthly_data[-1]['Tồn Cuối (SL)'].iloc[:-1].values
        df_sum['Tồn Cuối (VNĐ)'] = monthly_data[-1]['Tồn Cuối (VNĐ)'].iloc[:-1].values
        
        df_sum['STT'] = range(1, num_groups + 1)
        df_sum = df_sum[cols]
        num_only_yr = df_sum.iloc[:, 3:].sum().to_dict()
        num_only_yr['STT'] = ''
        num_only_yr['Mã Nhóm'] = ''
        num_only_yr['Tên Nhóm Sản Phẩm'] = 'TỔNG CỘNG'
        df_sum = pd.concat([df_sum, pd.DataFrame([num_only_yr])], ignore_index=True)
        
        df_sum.to_excel(writer, sheet_name='xnt12thang', index=False)
        writer.close()
        files.append(fpath)
        print(f"Generated {fname}. Total Ton Dau 2023 Check: {df_sum['Tồn Đầu Kỳ (VNĐ)'].iloc[-1]}")

    # Zip
    zip_path = os.path.join(output_dir, 'Bao_Cao_HuyVu_Professional_V15_Final.zip')
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for f in files:
            zipf.write(f, os.path.basename(f))
    print(f"ZIP READY: {zip_path}")

if __name__ == '__main__':
    generate_report_fixed_total()
