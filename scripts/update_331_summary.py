import pandas as pd
import os

def update_331_summary():
    so_sach_src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'
    
    # Target Data from User's Screenshots
    TARGETS = {
        "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG": {"start": 326472500, "end": 436912740},
        "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG": {"start": 638745241, "end": 396245780},
        "Công ty TNHH Phân phối Synnex FPT": {"start": 236879120, "end": 596080295},
        "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN": {"start": 1823753260, "end": 945621340},
        "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q": {"start": 126532140, "end": 326457632},
        "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ": {"start": 973654272, "end": 863487320},
        "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ": {"start": 1632594212, "end": 1065246321},
        "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT": {"start": 628542724, "end": 546812347}
    }

    print("Generating Summary sheet...")
    
    # We also need the "Phát sinh Nợ" and "Phát sinh Có" from the rebalanced NKC (or calculated)
    # Actually, I'll use the calculated values based on target Start/End and Buyvolume.
    # But it's safer to read from my new 331_REBALANCED sheet.
    
    df_rebal = pd.read_excel(so_sach_src, sheet_name='331_REBALANCED')
    
    summary_rows = []
    for s, bal in TARGETS.items():
        s_data = df_rebal[df_rebal['Đối tượng'] == s]
        buy = s_data['Có'].sum()
        pay = s_data['Nợ'].sum()
        
        summary_rows.append({
            'Tên nhà cung cấp': s,
            'Số dư đầu kỳ': bal['start'],
            'Phát sinh Nợ (Trả)': pay,
            'Phát sinh Có (Mua)': buy,
            'Số dư cuối kỳ': bal['end']
        })
    
    df_summary = pd.DataFrame(summary_rows)
    
    # Add Total row
    totals = {
        'Tên nhà cung cấp': 'TỔNG CỘNG',
        'Số dư đầu kỳ': df_summary['Số dư đầu kỳ'].sum(),
        'Phát sinh Nợ (Trả)': df_summary['Phát sinh Nợ (Trả)'].sum(),
        'Phát sinh Có (Mua)': df_summary['Phát sinh Có (Mua)'].sum(),
        'Số dư cuối kỳ': df_summary['Số dư cuối kỳ'].sum()
    }
    df_summary = pd.concat([df_summary, pd.DataFrame([totals])], ignore_index=True)
    
    print(f"Adding sheet '331_TONG_HOP_MOI' to {so_sach_src}...")
    import openpyxl
    with pd.ExcelWriter(so_sach_src, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_summary.to_excel(writer, sheet_name='331_TONG_HOP_MOI', index=False)
        
    print("✅ SUCCESS: Summary sheet created.")

if __name__ == "__main__":
    update_331_summary()
