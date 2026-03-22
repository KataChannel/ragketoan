import pandas as pd
import numpy as np
import json
import os

PATHS = {
    'goc': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_goc.xlsx",
    'details_24_25': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv",
    'summary': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_23_25.csv"
}

TARGET_START_CORE_TIEN = 20528682383
CURRENT_START_CORE_TIEN = 4241000000
FACTOR = TARGET_START_CORE_TIEN / CURRENT_START_CORE_TIEN

# 1. Extract Items
xl_goc = pd.ExcelFile(PATHS['goc'])
MASTER_ITEMS = set(); DVT_MAP = {}
for s in xl_goc.sheet_names:
    if 'Tháng' in s:
        df = pd.read_excel(xl_goc, sheet_name=s); df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for _, r in df.iterrows():
            it = str(r['Mã - Tên Hàng']).strip(); MASTER_ITEMS.add(it); DVT_MAP[it] = str(r['ĐVT']).strip()
MASTER_ITEMS = sorted(list(MASTER_ITEMS))

def get_targets():
    df_sodung = pd.read_excel(PATHS['goc'], sheet_name='Sodung')
    t23 = []
    for _, row in df_sodung.iterrows():
        t23.append({'year': 2023, 'month': int(row['Tháng']),
                    'banra': row['Doanh Thu Bán Ra'] + row['Doanh Thu Bán Ra Không Chịu Thuế'],
                    'muavao': row['Doanh Thu Mua Vào']})
    df_sum = pd.read_csv(PATHS['summary'])
    pivoted = df_sum.pivot_table(index=['year', 'month'], columns='loaihd', values='tgtcthue').reset_index()
    return pd.concat([pd.DataFrame(t23), pivoted[pivoted['year'] > 2023]], ignore_index=True)

df_2425 = pd.read_csv(PATHS['details_24_25'])

def map_item(name):
    name_low = str(name).lower()
    for it in MASTER_ITEMS:
        if it.split(' - ')[0].lower() in name_low: return it
    return MASTER_ITEMS[0]

def get_monthly_weights(year, month):
    res = []
    if year == 2023:
        df = pd.read_excel(xl_goc, sheet_name=f'Tháng {month}'); df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for _, r in df.iterrows():
            if r['Nhập (Tiền)'] > 0: res.append({'Mapped': r['Mã - Tên Hàng'], 'loaihd': 'muavao', 'val': r['Nhập (Tiền)'], 'qty': r['Nhập (SL)']})
            if r['Xuất (Tiền)'] > 0: res.append({'Mapped': r['Mã - Tên Hàng'], 'loaihd': 'banra', 'val': r['Xuất (Tiền)'], 'qty': r['Xuất (SL)']})
    else:
        df = df_2425[df_2425['month'] == month]
        for _, r in df.iterrows(): res.append({'Mapped': map_item(r['ten']), 'loaihd': r['loaihd'], 'val': r['thtien'], 'qty': r['sluong']})
    return pd.DataFrame(res)

def process_year(year, targets_df, start_stock):
    targets_yr = targets_df[targets_df['year'] == year].sort_values('month')
    all_sheets = {}; current_stock = start_stock.copy(); hoadon_data = []
    for m in range(1, 13):
        t_m = targets_yr[targets_yr['month'] == m].iloc[0]
        weights = get_monthly_weights(year, m)
        nhap_val = {it: 0.0 for it in MASTER_ITEMS}; nhap_qty = {it: 0.0 for it in MASTER_ITEMS}
        xuat_val = {it: 0.0 for it in MASTER_ITEMS}; xuat_qty = {it: 0.0 for it in MASTER_ITEMS}
        pv = weights[weights['loaihd'] == 'muavao'].groupby('Mapped')[['val', 'qty']].sum()
        sv = weights[weights['loaihd'] == 'banra'].groupby('Mapped')[['val', 'qty']].sum()
        if pv['val'].sum() > 0:
            scale = t_m['muavao'] / pv['val'].sum()
            for it, row in pv.iterrows(): nhap_val[it] = row['val']*scale; nhap_qty[it] = row['qty']
        elif t_m['muavao'] > 0: nhap_val[MASTER_ITEMS[0]] = t_m['muavao']; nhap_qty[MASTER_ITEMS[0]] = 1
        if sv['val'].sum() > 0:
            scale = t_m['banra'] / sv['val'].sum()
            for it, row in sv.iterrows(): xuat_val[it] = row['val']*scale; xuat_qty[it] = row['qty']
        elif t_m['banra'] > 0: xuat_val[MASTER_ITEMS[0]] = t_m['banra']; xuat_qty[MASTER_ITEMS[0]] = 1
        
        sq = {r['Mã - Tên Hàng']: r['Đầu Kỳ (SL)'] for _, r in current_stock.iterrows()}
        svv = {r['Mã - Tên Hàng']: r['Đầu Kỳ (Tiền)'] for _, r in current_stock.iterrows()}
        for it in MASTER_ITEMS:
            aq = sq.get(it, 0) + nhap_qty[it]
            if xuat_qty[it] > aq and xuat_qty[it] > 0:
                sqq = xuat_qty[it]-aq; donors = sorted([d for d in MASTER_ITEMS if d != it and nhap_qty[d]>0], key=lambda x: nhap_qty[x], reverse=True)
                for d in donors:
                    mq = min(sqq, nhap_qty[d]); mv = nhap_val[d]*(mq/nhap_qty[d])
                    nhap_qty[d]-=mq; nhap_val[d]-=mv; nhap_qty[it]+=mq; nhap_val[it]+=mv; sqq-=mq
                    if sqq <= 0: break
                if sqq > 0:
                    dq = sqq; xuat_qty[it]-=dq; dv = (dq/(xuat_qty[it]+dq))*xuat_val[it]; xuat_val[it]-=dv
                    rps = sorted([r for r in MASTER_ITEMS if r!=it], key=lambda x: sq.get(x,0)+nhap_qty[x]-xuat_qty[x], reverse=True)
                    if rps: xuat_qty[rps[0]]+=dq; xuat_val[rps[0]]+=dv
        
        rows = []
        for it in MASTER_ITEMS:
            rows.append({
                'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP.get(it, 'Cái'),
                'Đầu Kỳ (SL)': round(sq.get(it, 0), 2), 'Đầu Kỳ (Tiền)': round(svv.get(it, 0), 0),
                'Nhập (SL)': round(nhap_qty[it], 2), 'Nhập (Tiền)': round(nhap_val[it], 0),
                'Xuất (SL)': round(xuat_qty[it], 2), 'Xuất (Tiền)': round(xuat_val[it], 0),
                'Cuối Kỳ (SL)': round(sq.get(it, 0)+nhap_qty[it]-xuat_qty[it], 2),
                'Cuối Kỳ (Tiền)': round(svv.get(it, 0)+nhap_val[it]-xuat_val[it], 0)
            })
        final_sheet = pd.DataFrame(rows)
        all_sheets[f'Tháng {m}'] = pd.concat([final_sheet, pd.DataFrame([['TỔNG CỘNG', ''] + final_sheet.select_dtypes(include=[np.number]).sum().tolist()], columns=final_sheet.columns)], ignore_index=True)
        current_stock = final_sheet[['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy(); current_stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
        hoadon_data.append([f"{m:02d}/{year}", "Bán ra", "1 (Hợp lệ)", int(sum(xuat_qty.values())), sum(xuat_val.values())])
        hoadon_data.append([f"{m:02d}/{year}", "Mua vào", "1 (Hợp lệ)", int(sum(nhap_qty.values())), sum(nhap_val.values())])

    out_file = f"/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu{year}.xlsx"
    with pd.ExcelWriter(out_file) as writer:
        pd.DataFrame(hoadon_data, columns=['Tháng', 'Loại HD', 'Tình trạng (Mã)', 'Số lượng', 'Tổng giá tiền (VNĐ)']).to_excel(writer, sheet_name='Hoadon', index=False)
        for m in range(1, 13): all_sheets[f'Tháng {m}'].to_excel(writer, sheet_name=f'Tháng {m}', index=False)
        m1 = all_sheets['Tháng 1'].iloc[:-1]; m12 = all_sheets['Tháng 12'].iloc[:-1]
        xnt12 = m1[['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']].copy()
        iq = np.zeros(len(xnt12)); iv = np.zeros(len(xnt12)); oq = np.zeros(len(xnt12)); ov = np.zeros(len(xnt12))
        for m in range(1, 13):
            cur = all_sheets[f'Tháng {m}'].iloc[:-1]
            iq += cur['Nhập (SL)'].values; iv += cur['Nhập (Tiền)'].values; oq += cur['Xuất (SL)'].values; ov += cur['Xuất (Tiền)'].values
        xnt12['Nhập (SL)'] = iq; xnt12['Nhập (Tiền)'] = iv; xnt12['Xuất (SL)'] = oq; xnt12['Xuất (Tiền)'] = ov
        xnt12['Cuối Kỳ (SL)'] = m12['Cuối Kỳ (SL)'].values; xnt12['Cuối Kỳ (Tiền)'] = m12['Cuối Kỳ (Tiền)'].values
        pd.concat([xnt12, pd.DataFrame([['TỔNG CỘNG', ''] + xnt12.select_dtypes(include=[np.number]).sum().tolist()], columns=xnt12.columns)], ignore_index=True).to_excel(writer, sheet_name='xnt12thang', index=False)
    return current_stock

# Runner
targets = get_targets(); df1 = pd.read_excel(xl_goc, sheet_name='Tháng 1'); df1 = df1[df1['Mã - Tên Hàng'] != 'TỔNG CỘNG']
s_q = {str(r['Mã - Tên Hàng']).strip(): r['Đầu Kỳ (SL)'] for _, r in df1.iterrows()}; s_v = {str(r['Mã - Tên Hàng']).strip(): r['Đầu Kỳ (Tiền)'] for _, r in df1.iterrows()}
start_23 = pd.DataFrame([{'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP[it], 'Đầu Kỳ (SL)': s_q.get(it,0)*FACTOR, 'Đầu Kỳ (Tiền)': s_v.get(it,0)*FACTOR} for it in MASTER_ITEMS])
st_24 = process_year(2023, targets, start_23); st_25 = process_year(2024, targets, st_24); process_year(2025, targets, st_25)
print("Complete.")
