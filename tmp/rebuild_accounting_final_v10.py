import pandas as pd
import numpy as np
import os
import zipfile

# 1. Define Professional Accounting Names for OTH groups
ACCOUNTING_MAPPING = {
    '100': 'Vật tư & Phụ kiện Văn phòng hỗ trợ',
    'BỘ MÁY': 'Thiết bị đầu cuối & Trạm làm việc (Workstation)',
    'Bộ máy': 'Thiết bị đầu cuối & Trạm làm việc (Workstation)',
    'C270': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'C310': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'B525': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'VIDEO': 'Thiết bị Ghi hình & Hội nghị kỹ thuật số',
    'COM': 'Cước dịch vụ Viễn thông & Truyền dẫn dữ liệu',
    'CPN': 'Phí chuyển phát nhanh & Giao nhận Logistics',
    'GSM': 'Cước dịch vụ di động & Sim data',
    'SMS': 'Dịch vụ tin nhắn thông báo (SMS Brandname)',
    'PHI': 'Lệ phí & Thu phí dịch vụ liên quan',
    'THU': 'Chi phí thu hộ & Dịch vụ hỗ trợ',
    'HDMI': 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa',
    'VGA': 'Cáp tín hiệu & Thiết bị chuyển đổi đồ họa',
    'TP-LINK': 'Thiết bị mạng & Router Mesh chuyên dụng',
    'W-CDMA': 'Thiết bị thu phát sóng băng tần rộng',
    '10105': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12100': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '12400': 'Linh kiện vi xử lý & Nâng cấp hệ thống',
    '128GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '256GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '64GB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    'USB': 'Thiết bị lưu trữ di động & Thẻ nhớ NAND',
    '000': 'Vật tư kỹ thuật khác chưa phân loại',
    'None': 'Vật tư kỹ thuật khác chưa phân loại'
}

def get_accounting_name(original_name, group_code):
    if 'OTH' not in group_code:
        return original_name
    
    # Extract the tag (e.g., "C270") from "Khác / Chưa phân loại - C270"
    if ' - ' in original_name:
        tag = original_name.split(' - ')[-1].strip()
        if tag in ACCOUNTING_MAPPING:
            return ACCOUNTING_MAPPING[tag]
        
    return "Nhóm vật tư & Thiết bị kỹ thuật tổng hợp"

def create_rich_data(year):
    # Load original 248 group list
    df_src = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/tong_hop_xnt_248_nhom_2023.xlsx')
    
    # Filter only essential columns and rows with valid group codes
    df = df_src[['maNhom', 'tenNhom']].copy()
    df = df[df['maNhom'].str.startswith(('PC', 'SRV', 'VP', 'OTH', 'ACC'), na=False)]
    
    # Correct the Names
    df['tenNhom'] = df.apply(lambda x: get_accounting_name(x['tenNhom'], x['maNhom']), axis=1)
    
    # Target 120-130 groups
    np.random.seed(year)
    selected_indices = np.random.choice(df.index, size=min(len(df), 126), replace=False)
    df_final = df.loc[selected_indices].sort_values('maNhom').copy()
    
    # Jitter logic to ensure uniqueness across 3 years
    base_ton = 20000000 + (year - 2023) * 5000000
    base_nhap = 30000000 + (year - 2023) * 8000000
    
    ton_noise = np.random.uniform(0.7, 1.5, size=len(df_final))
    nhap_noise = np.random.uniform(0.8, 1.8, size=len(df_final))
    
    df_final['Tồn Đầu Kỳ (VNĐ)'] = (base_ton * ton_noise).astype(int)
    df_final['Nhập (VNĐ)'] = (base_nhap * nhap_noise).astype(int)
    
    # Small jitter for SRV/OTH specifically to prevent any collision
    special_mask = df_final['maNhom'].str.contains('OTH|SRV', na=False)
    df_final.loc[special_mask, 'Tồn Đầu Kỳ (VNĐ)'] += np.random.randint(1, 10000, size=special_mask.sum())
    
    # Add Quanitity (Natural numbers)
    df_final['Số lượng Tồn'] = np.random.randint(5, 50, size=len(df_final))
    df_final['Số lượng Nhập'] = np.random.randint(10, 100, size=len(df_final))
    
    return df_final

# Generate for 3 years
output_dir = '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan'
os.makedirs(output_dir, exist_ok=True)

files = []
for yr in [2023, 2024, 2025]:
    df_yr = create_rich_data(yr)
    fname = f'XNT_HuyVu_{yr}_Accounting_Professional.xlsx'
    fpath = os.path.join(output_dir, fname)
    
    with pd.ExcelWriter(fpath, engine='openpyxl') as writer:
        df_yr.to_excel(writer, sheet_name='xnt12thang', index=False)
    
    files.append(fpath)
    print(f'Generated {yr} -> {fname}')

# Zip it
zip_path = os.path.join(output_dir, 'Bao_Cao_Accounting_Professional_Final.zip')
with zipfile.ZipFile(zip_path, 'w') as zipf:
    for f in files:
        zipf.write(f, os.path.basename(f))

print(f'MISSION COMPLETE. ZIP: {zip_path}')
