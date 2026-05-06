import pandas as pd
import re

def create_perfect_allocation_v2():
    file_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/TK 331.xlsx'
    master_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
    
    # NEW Target Objectives from the latest image
    targets_info = {
        'CÔNG TY TNHH XUẤT NHẬP KHẨU LÊ TRẦN GIA': {'dau': 0, 'cuoi': 136120700},
        'CÔNG TY TNHH THẢO NHIÊN': {'dau': 0, 'cuoi': 126329100},
        'CÔNG TY CỔ PHẦN THƯƠNG MẠI - DỊCH VỤ SAO NAM AN': {'dau': 0, 'cuoi': 359208302},
        'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG': {'dau': 436912740, 'cuoi': 0},
        'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG': {'dau': 396245780, 'cuoi': 296245780},
        'Công ty TNHH Phân phối Synnex FPT': {'dau': 596080295, 'cuoi': 596080295},
        'CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN': {'dau': 945621340, 'cuoi': 868745100},
        'CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q': {'dau': 326457632, 'cuoi': 426378230},
        'CÔNG TY CỔ PHẦN THẾ GIỚI SỐ': {'dau': 863487320, 'cuoi': 663487320},
        'CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ': {'dau': 1065246321, 'cuoi': 537425327},
        'CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT': {'dau': 546812347, 'cuoi': 622735946}
    }
    
    # 2. Get All Transactions
    df_ledger = pd.read_excel(master_path, sheet_name='331')
    df_1111 = pd.read_excel(master_path, sheet_name='1111')
    df_112 = pd.read_excel(master_path, sheet_name='112')
    
    trans = []
    for _, r in df_ledger[df_ledger['TK Đối ứng'] != 911].dropna(subset=['Ngày hạch toán']).iterrows():
        trans.append({
            'Ngày': r['Ngày hạch toán'], 'Số CT': r['Số chứng từ'], 'Diễn giải': r['Diễn giải'],
            'Đối ứng': r['TK Đối ứng'], 'Nợ': r['Phát sinh Nợ'] or 0, 'Có': r['Phát sinh Có'] or 0
        })
    for df_src, tk in [(df_1111, '1111'), (df_112, '112')]:
        for _, r in df_src[df_src['TK Đối ứng'] == 331].iterrows():
            trans.append({
                'Ngày': r['Ngày hạch toán'], 'Số CT': r['Số chứng từ'], 'Diễn giải': rf"Thanh toán {tk} - {r['Diễn giải']}",
                'Đối ứng': tk, 'Nợ': r['Phát sinh Có'] or 0, 'Có': 0
            })
            
    df_all = pd.DataFrame(trans).sort_values('Ngày')
    
    # 3. Allocation mapping
    sorted_targets = sorted(targets_info.keys(), key=len, reverse=True)
    def find_target(desc):
        d = str(desc).upper()
        if 'THẾ GIỚI SỐ' in d:
            if 'ĐÀ NẴNG' in d: return 'CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG'
            return 'CÔNG TY CỔ PHẦF THẾ GIỚI SỐ'
        if 'VĨNH XUÂN' in d: return 'CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG'
        for t in sorted_targets:
            if t.upper() in d: return t
        return 'PHÂN BỔ CHUNG'

    df_all['Target'] = df_all['Diễn giải'].apply(find_target)
    
    # 4. Final Rows
    final_output = []
    for target in targets_info.keys():
        v_df = df_all[df_all['Target'] == target]
        opening = targets_info[target]['dau']
        closing = targets_info[target]['cuoi']
        final_output.append({'Tên nhà cung cấp': target, 'Ngày': None, 'Số CT': 'ĐẦU KỲ', 'Diễn giải': f'Dư đầu kỳ {target}', 'Nợ': 0, 'Có': 0, 'Số dư': opening})
        rb = opening
        for _, r in v_df.iterrows():
            rb += (r['Có'] - r['Nợ'])
            final_output.append({'Tên nhà cung cấp': target, 'Ngày': r['Ngày'], 'Số CT': r['Số CT'], 'Diễn giải': r['Diễn giải'], 'Nợ': r['Nợ'], 'Có': r['Có'], 'Số dư': rb})
        if abs(rb - closing) > 1:
            diff = closing - rb
            final_output.append({'Tên nhà cung cấp': target, 'Ngày': None, 'Số CT': 'PB', 'Diễn giải': 'Phân bổ chênh lệch công nợ trong năm', 'Nợ': -diff if diff < 0 else 0, 'Có': diff if diff > 0 else 0, 'Số dư': closing})

    others = df_all[df_all['Target'] == 'PHÂN BỔ CHUNG']
    if len(others) > 0:
        final_output.append({'Tên nhà cung cấp': 'CÁC ĐƠN VỊ KHÁC (PHÂN BỔ HẾT)', 'Ngày': None, 'Số CT': 'START', 'Diễn giải': 'Dư đầu kỳ các đơn vị khác', 'Nợ': 0, 'Có': 0, 'Số dư': 0})
        rb_o = 0
        for _, r in others.iterrows():
            rb_o += (r['Có'] - r['Nợ'])
            final_output.append({'Tên nhà cung cấp': 'CÁC ĐƠN VỊ KHÁC (PHÂN BỔ HẾT)', 'Ngày': r['Ngày'], 'Số CT': r['Số CT'], 'Diễn giải': r['Diễn giải'], 'Nợ': r['Nợ'], 'Có': r['Có'], 'Số dư': rb_o})
        final_output.append({'Tên nhà cung cấp': 'CÁC ĐƠN VỊ KHÁC (PHÂN BỔ HẾT)', 'Ngày': None, 'Số CT': 'CLEAR', 'Diễn giải': 'Kết chuyển phân bổ về 0', 'Nợ': rb_o if rb_o > 0 else 0, 'Có': -rb_o if rb_o < 0 else 0, 'Số dư': 0})

    df_final = pd.DataFrame(final_output)
    with pd.ExcelWriter(file_path, engine='openpyxl', mode='a', if_sheet_exists='replace') as writer:
        df_final.to_excel(writer, sheet_name='Phân bổ', index=False)

if __name__ == '__main__':
    create_perfect_allocation_v2()
    print("Phân bổ updated to new image targets.")
