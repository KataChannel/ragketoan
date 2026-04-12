import pandas as pd
import os

xlsx_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'

xl = pd.ExcelFile(xlsx_path)

md_data = {
    1: {"muavao": 14226694560, "banra": 11386534989},
    2: {"muavao": 10040247266, "banra": 7934111935},
    3: {"muavao": 7381679783, "banra": 8830045997},
    4: {"muavao": 10255784083, "banra": 8927663945},
    5: {"muavao": 9491021714, "banra": 9501096775},
    6: {"muavao": 9379263229, "banra": 6476704680},
    7: {"muavao": 5949569368, "banra": 11809848916},
    8: {"muavao": 8159204686, "banra": 10392458795},
    9: {"muavao": 8670793221, "banra": 7688034440},
    10: {"muavao": 6963184455, "banra": 10074473309},
    11: {"muavao": 9802832916, "banra": 7702004013},
    12: {"muavao": 10199353340, "banra": 14349920815},
}

summary = []

for m in range(1, 13):
    sheet_name = f'Tháng {m}'
    if sheet_name in xl.sheet_names:
        df = xl.parse(sheet_name, header=None)
        # Columns: 6 is Nhập (VNĐ), 8 is Xuất (VNĐ)
        # Based on index check:
        # ['STT', 'Mã Hàng', 'Tên Hàng', 'Tồn Đầu Kỳ (SL)', 'Tồn Đầu Kỳ (VNĐ)', 'Nhập (SL)', 'Nhập (VNĐ)', 'Xuất (SL)', 'Xuất (VNĐ)', 'Giá Vốn', 'Xuất Theo Giá Vốn', 'Tồn Cuối (SL)', 'Tồn Cuối (VNĐ)']
        # Index 6: Nhập (VNĐ)
        # Index 8: Xuất (VNĐ)
        
        try:
            total_nhap = pd.to_numeric(df.iloc[1:, 6], errors='coerce').sum()
            total_xuat = pd.to_numeric(df.iloc[1:, 8], errors='coerce').sum()
            
            md_muavao = md_data[m]['muavao']
            md_banra = md_data[m]['banra']
            
            summary.append({
                "Month": m,
                "XLSX Nhập": total_nhap,
                "MD Mua vào": md_muavao,
                "Diff Nhập": total_nhap - md_muavao,
                "XLSX Xuất": total_xuat,
                "MD Bán ra": md_banra,
                "Diff Xuất": total_xuat - md_banra
            })
        except Exception as e:
            print(f"Error processing month {m}: {e}")

df_summary = pd.DataFrame(summary)
print(df_summary.to_string(index=False))
