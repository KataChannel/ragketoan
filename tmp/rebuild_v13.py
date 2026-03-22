import pandas as pd
import numpy as np
import json
import os

PATHS = {
    'goc': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023_goc.xlsx",
    'details_24_25': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/details_24_25.csv",
    'summary': "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_23_25.csv",
    'smart': "/chikiet/kata2025/ragketoan/tmp/smart_start_stock.json"
}

with open(PATHS['smart'], 'r') as f:
    SMART = json.load(f)

xl_goc = pd.ExcelFile(PATHS['goc'])
MASTER_ITEMS = sorted(list(SMART['q'].keys()))
DVT_MAP = {}
for s in xl_goc.sheet_names:
    if 'Tháng' in s:
        df = pd.read_excel(xl_goc, sheet_name=s); df = df[df['Mã - Tên Hàng'] != 'TỔNG CỘNG']
        for _, r in df.iterrows(): DVT_MAP[str(r['Mã - Tên Hàng']).strip()] = str(r['ĐVT']).strip()

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
            it = str(r['Mã - Tên Hàng']).strip()
            if r['Nhập (Tiền)'] > 0: res.append({'Mapped': it, 'loaihd': 'muavao', 'val': r['Nhập (Tiền)'], 'qty': int(r['Nhập (SL)'])})
            if r['Xuất (Tiền)'] > 0: res.append({'Mapped': it, 'loaihd': 'banra', 'val': r['Xuất (Tiền)'], 'qty': int(r['Xuất (SL)'])})
    else:
        df = df_2425[df_2425['month'] == month]
        for _, r in df.iterrows(): res.append({'Mapped': map_item(r['ten']), 'loaihd': r['loaihd'], 'val': r['thtien'], 'qty': int(r['sluong'])})
    return pd.DataFrame(res)

def process_year(year, targets_df, start_stock):
    targets_yr = targets_df[targets_df['year'] == year].sort_values('month')
    all_sheets = {}; current_stock = start_stock.copy(); hoadon_data = []
    for m in range(1, 13):
        t_m = targets_yr[targets_yr['month'] == m].iloc[0]
        weights = get_monthly_weights(year, m)
        nv = {it: 0.0 for it in MASTER_ITEMS}; nq = {it: 0 for it in MASTER_ITEMS}
        xv = {it: 0.0 for it in MASTER_ITEMS}; xq = {it: 0 for it in MASTER_ITEMS}
        pv = weights[weights['loaihd'] == 'muavao'].groupby('Mapped')[['val', 'qty']].sum()
        sv = weights[weights['loaihd'] == 'banra'].groupby('Mapped')[['val', 'qty']].sum()
        if pv['val'].sum() > 0:
            scale = t_m['muavao'] / pv['val'].sum()
            for it, row in pv.iterrows(): nv[it] = row['val']*scale; nq[it] = int(row['qty'])
        elif t_m['muavao'] > 0: nv[MASTER_ITEMS[0]] = t_m['muavao']; nq[MASTER_ITEMS[0]] = 1
        if sv['val'].sum() > 0:
            scale = t_m['banra'] / sv['val'].sum()
            for it, row in sv.iterrows(): xv[it] = row['val']*scale; xq[it] = int(row['qty'])
        elif t_m['banra'] > 0: xv[MASTER_ITEMS[0]] = t_m['banra']; xq[MASTER_ITEMS[0]] = 1
        
        sq = {r['Mã - Tên Hàng']: int(r['Đầu Kỳ (SL)']) for _, r in current_stock.iterrows()}
        svv = {r['Mã - Tên Hàng']: r['Đầu Kỳ (Tiền)'] for _, r in current_stock.iterrows()}
        # Prevention (Integers focus)
        for it in MASTER_ITEMS:
            aq = sq.get(it, 0) + nq[it]
            if xq[it] > aq and xq[it] > 0:
                short_q = xq[it]-aq; donors = sorted([d for d in MASTER_ITEMS if d != it and nq[d]>0], key=lambda x: nq[x], reverse=True)
                for d in donors:
                    mq = min(short_q, nq[d]); mv = nv[d]*(mq/nq[d]); nq[d]-=mq; nv[d]-=mv; nq[it]+=mq; nv[it]+=mv; short_q-=mq
                    if short_q <= 0: break
                if short_q > 0:
                    dq = short_q; xq[it]-=dq; dv = (dq/(xq[it]+dq))*xv[it]; xv[it]-=dv
                    rps = sorted([r for r in MASTER_ITEMS if r!=it], key=lambda x: sq.get(x,0)+nq[x]-xq[x], reverse=True)
                    if rps: xq[rps[0]]+=dq; xv[rps[0]]+=dv
        
        rows = []
        for it in MASTER_ITEMS:
            cq = sq.get(it, 0) + nq[it] - xq[it]
            cv = svv.get(it, 0) + nv[it] - xv[it]
            rows.append({
                'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP.get(it,'Cái'),
                'Đầu Kỳ (SL)': int(sq.get(it, 0)), 'Đầu Kỳ (Tiền)': round(svv.get(it, 0), 0),
                'Nhập (SL)': int(nq[it]), 'Nhập (Tiền)': round(nv[it], 0),
                'Xuất (SL)': int(xq[it]), 'Xuất (Tiền)': round(xv[it], 0),
                'Cuối Kỳ (SL)': int(cq), 'Cuối Kỳ (Tiền)': round(cv, 0)
            })
        final_sheet = pd.DataFrame(rows)
        all_sheets[f'Tháng {m}'] = pd.concat([final_sheet, pd.DataFrame([['TỔNG CỘNG', ''] + final_sheet.select_dtypes(include=[np.number]).sum().tolist()], columns=final_sheet.columns)], ignore_index=True)
        current_stock = final_sheet[['Mã - Tên Hàng', 'ĐVT', 'Cuối Kỳ (SL)', 'Cuối Kỳ (Tiền)']].copy(); current_stock.columns = ['Mã - Tên Hàng', 'ĐVT', 'Đầu Kỳ (SL)', 'Đầu Kỳ (Tiền)']
        hoadon_data.append([f"{m:02d}/{year}", "Bán ra", "1 (Hợp lệ)", int(sum(xq.values())), sum(xv.values())])
        hoadon_data.append([f"{m:02d}/{year}", "Mua vào", "1 (Hợp lệ)", int(sum(nq.values())), sum(nv.values())])

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

targets = get_targets()
start_23 = pd.DataFrame([{'Mã - Tên Hàng': it, 'ĐVT': DVT_MAP.get(it,'Cái'), 'Đầu Kỳ (SL)': int(SMART['q'][it]), 'Đầu Kỳ (Tiền)': round(SMART['v'][it],0)} for it in MASTER_ITEMS])
st_24 = process_year(2023, targets, start_23); st_25 = process_year(2024, targets, st_24); process_year(2025, targets, st_25)
print("Complete.")
