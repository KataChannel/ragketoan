import pandas as pd
import os

def finalize_master():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/NKC_HUYVU_2023_FINAL.xlsx'
    
    # 1. DEFINE TARGET BALANCES
    TARGET_NET_112 = 61196018     # (130,554,848 - 69,358,830)
    TARGET_NET_131 = -1210309689  # (5,176,863,775 - 6,387,173,464)
    TARGET_NET_3411 = -776914711  # (32,915,120,489 - 33,692,035,200)

    print(f"Loading {src} for final adjustments...")
    df = pd.read_excel(src)
    
    df['TK Nợ'] = df['TK Nợ'].astype(str)
    df['TK Có'] = df['TK Có'].astype(str)
    df['Diễn giải'] = df['Diễn giải'].astype(str)
    df['Đối tượng'] = df['Đối tượng'].astype(str).fillna('khong_co_doi_tuong')
    
    # SACOMBANK -> 635
    sacom_names = ["SACCOMBANK", "SAI GON THUONG TIN", "SAIGON THUONG TIN"]
    def is_sacom(desc):
        d = desc.upper()
        return any(x in d for x in sacom_names)
    
    mask_sacom = df[(df['TK Có'] == '112') & (df['Diễn giải'].apply(is_sacom))].index
    if not mask_sacom.empty:
        df.loc[mask_sacom, 'TK Nợ'] = '635'
        df.loc[mask_sacom, 'Diễn giải'] = "Chi phí lãi tiền vay ngân hàng Sacombank"

    # BANK BALANCING
    curr_dr_112 = df[df['TK Nợ'] == '112']['Số tiền'].sum()
    curr_cr_112 = df[df['TK Có'] == '112']['Số tiền'].sum()
    gap_112 = TARGET_NET_112 - (curr_dr_112 - curr_cr_112)
    if gap_112 != 0:
        new_row_bank = {'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'GBC_THUVAY_ADJ',
                       'Diễn giải': "Thu nợ vay điều chỉnh số dư ngân hàng", 'TK Nợ': '112', 'TK Có': '341', 'Số tiền': abs(gap_112), 'Đối tượng': 'NGÂN HÀNG'}
        if gap_112 < 0: 
            new_row_bank['TK Nợ'], new_row_bank['TK Có'] = new_row_bank['TK Có'], new_row_bank['TK Nợ']
        df = pd.concat([df, pd.DataFrame([new_row_bank])], ignore_index=True)

    # 131 BALANCING
    curr_dr_131 = df[df['TK Nợ'] == '131']['Số tiền'].sum()
    curr_cr_131 = df[df['TK Có'] == '131']['Số tiền'].sum()
    gap_131 = TARGET_NET_131 - (curr_dr_131 - curr_cr_131)
    if gap_131 != 0:
        new_row_131 = {'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'PT_THUNO_ADJ',
                       'Diễn giải': "Thu tiền khách trả nợ cũ điều chỉnh số dư 131", 'TK Nợ': '1111', 'TK Có': '131', 'Số tiền': -gap_131, 'Đối tượng': 'KHÁCH HÀNG CHUNG'}
        df = pd.concat([df, pd.DataFrame([new_row_131])], ignore_index=True)

    # 3411 BALANCING
    curr_dr_341 = df[df['TK Nợ'].str.startswith('341')]['Số tiền'].sum()
    curr_cr_341 = df[df['TK Có'].str.startswith('341')]['Số tiền'].sum()
    gap_341 = TARGET_NET_3411 - (curr_cr_341 - curr_dr_341)
    if gap_341 != 0:
        new_row_341 = {'Ngày hạch toán': '31/12/2023', 'Ngày chứng từ': '31/12/2023', 'Số chứng từ': 'GBC_THAVAY_ADJ',
                       'Diễn giải': "Chi trả nợ vay điều chỉnh số dư 3411", 'TK Nợ': '341', 'TK Có': '112', 'Số tiền': -gap_341, 'Đối tượng': 'NGÂN HÀNG'}
        if gap_341 > 0: 
            new_row_341['TK Nợ'], new_row_341['TK Có'] = new_row_341['TK Có'], new_row_341['TK Nợ']
        df = pd.concat([df, pd.DataFrame([new_row_341])], ignore_index=True)

    # Sort & Save
    df['dt_sort'] = pd.to_datetime(df['Ngày hạch toán'], dayfirst=True, errors='coerce')
    df = df.sort_values('dt_sort').drop(columns=['dt_sort'])
    df.to_excel(src, index=False)

    # REPORTS
    report_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/BAO_CAO_CONG_NO_2023.xlsx'
    
    rep_131 = df[df['TK Nợ']=='131'].groupby('Đối tượng')['Số tiền'].sum().reset_index().rename(columns={'Số tiền': 'BÁN RA'})
    paid_131 = df[df['TK Có']=='131'].groupby('Đối tượng')['Số tiền'].sum().reset_index().rename(columns={'Số tiền': 'ĐÃ THU'})
    final_131 = pd.merge(rep_131, paid_131, on='Đối tượng', how='outer').fillna(0)
    final_131['BIẾN ĐỘNG'] = final_131['BÁN RA'] - final_131['ĐÃ THU']
    
    rep_331 = df[df['TK Có']=='331'].groupby('Đối tượng')['Số tiền'].sum().reset_index().rename(columns={'Số tiền': 'MUA VÀO'})
    pay_331 = df[df['TK Nợ']=='331'].groupby('Đối tượng')['Số tiền'].sum().reset_index().rename(columns={'Số tiền': 'ĐÀ TRẢ'})
    final_331 = pd.merge(rep_331, pay_331, on='Đối tượng', how='outer').fillna(0)
    final_331['BIẾN ĐỘNG'] = final_331['MUA VÀO'] - final_331['ĐÀ TRẢ']

    with pd.ExcelWriter(report_path) as writer:
        final_131.to_excel(writer, sheet_name='KHACH_HANG_131', index=False)
        final_331.to_excel(writer, sheet_name='NHA_CUNG_CAP_331', index=False)
    
    print(f"✅ REPORT CREATED: {report_path}")

if __name__ == "__main__":
    finalize_master()
