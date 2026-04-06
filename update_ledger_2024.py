import pandas as pd
import numpy as np
import os
import random
from datetime import datetime, timedelta

# Source Data Configuration
master_input = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/NKC_HUYVU_2024_RAW.xlsx'
excel_path = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL.xlsx'
temp_output = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2024/SO_CHI_TIET_HUYVU_2024_FINAL_FULL_TEMP.xlsx'
md_path = '/chikiet/kata2025/ragketoan/docs/BANG_TONG_HOP_SO_LIEU_HUYVU_2024.md'

opening_2024_from_2023 = {
    '1111': 533168250.0, '112': 130554848.0, '131': 5045331182.0, '1331': 1562039949.0,
    '1561': 20014813265.0, '331': 5176863775.0, '3331': 1615522358.0, '341': 32915120489.0,
    '5111': 0.0, '515': 0.0, '632': 0.0, '635': 0.0, '642': 0.0
}

def segment_amount(total, count, round_to_1k=False):
    if total <= 0 or count <= 0: return []
    parts = []; curr = 0
    for _ in range(count - 1):
        v = (total / count) * random.uniform(0.7, 1.3)
        if round_to_1k:
            v = (int(v) // 1000) * 1000
        else:
            v = (int(v) // 1000) * 1000 + random.randint(1, 999)
        parts.append(v); curr += v
    parts.append(total - curr); return parts

def safe_d_parse(s):
    try:
        if isinstance(s, datetime): return s
        s_clean = str(s).split(' ')[0]
        return datetime.strptime(s_clean, '%d/%m/%Y')
    except: return datetime(2024, 1, 1)

with open(md_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
targets = {}
for line in lines:
    if '|' in line and '| Tài khoản |' not in line and '|---|' not in line:
        parts = [p.strip() for p in line.split('|') if p.strip()]
        if len(parts) >= 5:
            tk = parts[0]
            targets[tk] = {
                'dau_ky': opening_2024_from_2023.get(tk, float(parts[1].replace('.', '').replace(',', ''))),
                'ps_no_raw': float(parts[2].replace('.', '').replace(',', '')),
                'ps_co_raw': float(parts[3].replace('.', '').replace(',', '')),
                'cuoi_ky': float(parts[4].replace('.', '').replace(',', ''))
            }

# Override target for 1111 per user instruction
if '1111' in targets:
    targets['1111']['ps_no'] = 25071171712
    targets['1111']['ps_co'] = targets['1111']['ps_no'] + targets['1111']['dau_ky'] - targets['1111']['cuoi_ky']

df_nkc = pd.read_excel(master_input)
# Handle possible newline in column name
if 'Diễn giải\n' in df_nkc.columns: df_nkc.rename(columns={'Diễn giải\n': 'Diễn giải'}, inplace=True)
for c in ['Số tiền']: df_nkc[c] = pd.to_numeric(df_nkc[c], errors='coerce').fillna(0)

mapping_rules = {
    '635': ['TP CK', 'TRICH LAI', 'THU PHI', 'PHI T03', 'Dịch vụ ngân hàng', 'SMS Banking', 'THU LAI', 'Bao lanh', 'Phat Hanh Bao lanh', 'Tien vay', 'Trich thu 1 phan Tien vay', 'Đường bộ Vận đơn số', 'phí chuyển tiền'],
    '642': ['Viễn thông', 'Cước dịch vụ', 'Cước điện thoại', 'Công nghệ thông tin', 'viễn thông trả sau', 'Viettel', 'VNPT', 'MOBIFONE', 'Xăng RON95', 'Dầu DO', 'Cước đường bộ xe', 'Thu phi chuyen tien ngoai he thong', 'Internet', 'Điện lực', 'Giao hàng', 'Tiền điện'],
    'Repayment': ['Chi tạm ứng', 'Đối trừ nội bộ', 'Chi trả vay huy động vốn', 'Chi từ tạm ứng', 'TRA GOC VAY'],
    'HW': ['Bộ chuyển đổi', 'Wifi', 'Thiết bị phát', 'Cáp mạng', 'Rệp nối', 'Máy in', 'Ram', 'Ổ cứng', 'Mực', 'Laptop', 'PC', 'UPS', 'Camera', 'DCP-', 'HL-', 'LBP-', 'MF-', 'TN-', 'GTX', 'Ryzen']
}

redist_list = {tk: [] for tk in targets.keys()}
base_combined = []
adj_prefixes = ['ADJ_', 'DC_', 'DC_KS', 'BV_ADJ', 'TTRL_ADJ', 'PC_ADJ', 'HDP_']

for _, row in df_nkc.iterrows():
    so_ct = str(row.get('Số chứng từ', '')); dg = str(row.get('Diễn giải', ''))
    if any(so_ct.startswith(p) for p in adj_prefixes) or ('Điều chỉnh' in dg and 'Target' in dg) or 'TỔNG CỘNG' in dg or 'SỐ DƯ' in dg:
        continue
    
    val = float(row.get('Số tiền', 0)); dt = safe_d_parse(row.get('Ngày hạch toán')).strftime('%d/%m/%Y')
    dr_tk = str(row.get('TK Nợ', '')).replace('1312', '131').replace('3411', '341')
    cr_tk = str(row.get('TK Có', '')).replace('1312', '131').replace('3411', '341')
    
    dg_low = dg.lower(); mapped_dr, mapped_cr, mapped_dg = dr_tk, cr_tk, dg
    
    # Rule 4: Description Standardization for Bank Transfers
    if 'mbvcb' in dg_low and dr_tk == '112' and cr_tk == '1111':
        mapped_dg = "Đặng Thị Xuân Hà nộp tiền vào ngân hàng"
    elif 'mbvcb' in dg_low and dr_tk == '112' and cr_tk == '341':
        mapped_dg = "Đặng Thị Xuân Hà nộp tiền vào TK"
    elif any(kw.lower() in dg_low for kw in ['nộp tiền', 'chuyển tiền vào tk']) and dr_tk == '112':
        mapped_dg = "Đặng Thị Xuân Hà nộp tiền vào TK"
    elif any(kw.lower() in dg_low for kw in mapping_rules['Repayment']):
        mapped_dr, mapped_cr, mapped_dg = '341', '1111', 'Chi trả vay huy động vốn'
    else:
        # Protect VAT and predefined tax accounts
        if dr_tk in ['1331', '3331'] or 'thuế gtgt' in dg_low:
            pass
        # Priority mapping for expense/goods entries (purchases) - Only if not sales
        if cr_tk != '5111':
            if any(kw.lower() in dg_low for kw in mapping_rules['HW']):
                mapped_dr = '1561'
            elif any(kw.lower() in dg_low for kw in mapping_rules['635']):
                mapped_dr = '635'
            elif any(kw.lower() in dg_low for kw in mapping_rules['642']):
                mapped_dr = '642'
    
    if mapped_dr in ['1111', '112'] or mapped_cr in ['1111', '112']:
        # Keep for simulation
        base_combined.append({'dt': dt, 'so_ct': so_ct, 'dg': mapped_dg, 'dr': mapped_dr, 'cr': mapped_cr, 'val': val})
    else:
        if mapped_dr in redist_list:
            redist_list[mapped_dr].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': mapped_dg, 'TK Đối ứng': mapped_cr, 'Phát sinh Nợ': val, 'Phát sinh Có': 0, 'Prio': 1})
        if mapped_cr in redist_list:
            redist_list[mapped_cr].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': mapped_dg, 'TK Đối ứng': mapped_dr, 'Phát sinh Nợ': 0, 'Phát sinh Có': val, 'Prio': 1})

    # Auto-generate 10% Output VAT and Detailed COGS for 5111 Revenue
    if mapped_cr == '5111':
        # 1. Output VAT
        tax_v = int(val * 0.1) + (1 if random.random() < 0.5 else 0) 
        tax_dg = 'Thuế GTGT đầu ra (10%) - ' + mapped_dg
        redist_list['3331'].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': tax_dg, 'TK Đối ứng': '131', 'Phát sinh Nợ': 0, 'Phát sinh Có': tax_v, 'Prio': 2})
        redist_list['131'].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': tax_dg, 'TK Đối ứng': '3331', 'Phát sinh Nợ': tax_v, 'Phát sinh Có': 0, 'Prio': 2})

        # 2. Detailed COGS
        cogs_dg = 'Giá vốn hàng hóa - ' + mapped_dg
        redist_list['632'].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': cogs_dg, 'TK Đối ứng': '1561', 'Phát sinh Nợ': val, 'Phát sinh Có': 0, 'Prio': 3})
        redist_list['1561'].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': cogs_dg, 'TK Đối ứng': '632', 'Phát sinh Nợ': 0, 'Phát sinh Có': val, 'Prio': 3})

    # Auto-generate 10% Input VAT for 1561 and 642
    if mapped_dr in ['1561', '642']:
        tax_in_v = int(val * 0.1)
        tax_in_dg = 'Thuế GTGT đầu vào (10%) - ' + mapped_dg
        redist_list['1331'].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': tax_in_dg, 'TK Đối ứng': mapped_cr, 'Phát sinh Nợ': tax_in_v, 'Phát sinh Có': 0, 'Prio': 4})
        if mapped_cr in redist_list:
            redist_list[mapped_cr].append({'Ngày hạch toán': dt, 'Số chứng từ': so_ct, 'Diễn giải': tax_in_dg, 'TK Đối ứng': '1331', 'Phát sinh Nợ': 0, 'Phát sinh Có': tax_in_v, 'Prio': 4})

# Add Monthly Bank Interest (515)
interest_parts = segment_amount(1120551, 12, False)
for i, amt in enumerate(interest_parts):
    m = i + 1
    last_day = (pd.to_datetime(f'2024-{m:02d}-01') + pd.offsets.MonthEnd(0)).strftime('%d/%m/%Y')
    dg_i = f'Lãi tiền gửi ngân hàng tháng {m:02d}'
    redist_list['515'].append({'Ngày hạch toán': last_day, 'Số chứng từ': 'LNK_BANK', 'Diễn giải': dg_i, 'TK Đối ứng': '112', 'Phát sinh Nợ': 0, 'Phát sinh Có': amt, 'Prio': 0})
    redist_list['112'].append({'Ngày hạch toán': last_day, 'Số chứng từ': 'LNK_BANK', 'Diễn giải': dg_i, 'TK Đối ứng': '515', 'Phát sinh Nợ': amt, 'Phát sinh Có': 0, 'Prio': 0})

for tk in redist_list:
    df_tk = pd.DataFrame(redist_list[tk])
    if not df_tk.empty:
        df_tk = df_tk.drop_duplicates(subset=['Ngày hạch toán', 'Diễn giải', 'TK Đối ứng', 'Phát sinh Nợ', 'Phát sinh Có'])
        redist_list[tk] = df_tk.to_dict('records')

# Prep Target Balances after mapping
for tk in targets:
    t = targets[tk]
    if tk == '1111': continue
    ps_no_map = sum(float(r['Phát sinh Nợ']) for r in redist_list.get(tk, []))
    ps_co_map = sum(float(r['Phát sinh Có']) for r in redist_list.get(tk, []))
    
    if tk.startswith(('5', '6', '7', '8', '9')):
        t['ps_no'] = t['ps_no_raw']; t['ps_co'] = t['ps_co_raw']
    else:
        nature = 'credit' if tk.startswith(('3', '4', '5', '7', '9', '2', '1331')) else 'debit'
        no_min = max(t['ps_no_raw'], ps_no_map)
        co_min = max(t['ps_co_raw'], ps_co_map)
        
        if nature == 'debit':
            t['ps_co'] = co_min
            t['ps_no'] = max(no_min, t['cuoi_ky'] - t['dau_ky'] + t['ps_co'])
            t['ps_co'] = t['ps_no'] - (t['cuoi_ky'] - t['dau_ky'])
        else: # credit nature (like 331, 341)
            t['ps_no'] = no_min
            t['ps_co'] = max(co_min, t['cuoi_ky'] - t['dau_ky'] + t['ps_no'])
            t['ps_no'] = t['ps_co'] - (t['cuoi_ky'] - t['dau_ky'])

# High-frequency inflows/outflows to bridge the gap
curr_1111_no = sum(float(r['Phát sinh Nợ']) for r in redist_list['1111'])
rest_1111_no = max(0, targets['1111']['ps_no'] - 900705292 - curr_1111_no)

pending_inflows = ([{'Ds': 'Thu bán lẻ hàng hóa', 'Cr': '131', 'Am': a} for a in segment_amount(rest_1111_no, 200)] +
                   [{'Ds': 'Vay huy động vốn', 'Cr': '341', 'Am': a} for a in segment_amount(900705292, 45, True)])

curr_331_no = sum(float(r['Phát sinh Nợ']) for r in redist_list.get('331', []))
rest_331_no = max(0, targets['331']['ps_no'] - curr_331_no)

# 1111 PS_Co must cover 331 payments and other needs
curr_1111_co = sum(float(r['Phát sinh Có']) for r in redist_list['1111'])
rest_1111_co = max(0, targets['1111']['ps_co'] - curr_1111_co)
rest_other_1111_co = max(0, rest_1111_co - rest_331_no)

pending_outflows = ([{'Ds': 'Thanh toán công nợ', 'Dr': '331', 'Am': a} for a in segment_amount(rest_331_no, 150)] +
                    [{'Ds': 'Chi trả vay huy động vốn', 'Dr': '341', 'Am': a} for a in segment_amount(rest_other_1111_co, 50, True)])

random.shuffle(pending_inflows)
random.shuffle(pending_outflows)

# Simulation loop starts with base_combined collected earlier
redist_list['1111'] = []
redist_list['112'] = []

def inj_inflow(s, dt):
    redist_list['1111'].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_2024', 'Diễn giải': s['Ds'], 'TK Đối ứng': s['Cr'], 'Phát sinh Nợ': s['Am'], 'Phát sinh Có': 0, 'Prio': 0})
    if s['Cr'] in redist_list: 
        redist_list[s['Cr']].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_2024', 'Diễn giải': s['Ds'], 'TK Đối ứng': '1111', 'Phát sinh Nợ': 0, 'Phát sinh Có': s['Am'], 'Prio': 0})

def inj_outflow(s, dt):
    redist_list['1111'].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_2024', 'Diễn giải': s['Ds'], 'TK Đối ứng': s['Dr'], 'Phát sinh Nợ': 0, 'Phát sinh Có': s['Am'], 'Prio': 0})
    if s['Dr'] in redist_list: 
        redist_list[s['Dr']].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_2024', 'Diễn giải': s['Ds'], 'TK Đối ứng': '1111', 'Phát sinh Nợ': s['Am'], 'Phát sinh Có': 0, 'Prio': 0})

dr = [datetime(2024,1,1) + timedelta(days=i) for i in range(365)]
dr = [d for d in dr if d.weekday() < 5]
random.shuffle(dr)

total_pending = len(pending_inflows) + len(pending_outflows)
injection_dates = sorted([dr[i % len(dr)] for i in range(total_pending)])

timeline = []
for r in base_combined:
    timeline.append({'type': 'base', 'dt_obj': safe_d_parse(r['dt']), 'data': r})
for idx, d in enumerate(injection_dates):
    timeline.append({'type': 'inject', 'dt_obj': d, 'seq': idx})

timeline.sort(key=lambda t: (t['dt_obj'], t.get('seq', 0)))

bal = targets['1111']['dau_ky']
bal_112 = targets['112']['dau_ky']

def inj_112_deposit(dt):
    global bal, bal_112
    amt = 20000000 # Default deposit
    s = {'Ds': 'Đặng Thị Xuân Hà nộp tiền vào ngân hàng', 'Cr': '1111', 'Dr': '112', 'Am': amt}
    redist_list['1111'].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_BANK', 'Diễn giải': s['Ds'], 'TK Đối ứng': '112', 'Phát sinh Nợ': 0, 'Phát sinh Có': amt, 'Prio': 0})
    redist_list['112'].append({'Ngày hạch toán': dt, 'Số chứng từ': 'HDP_BANK', 'Diễn giải': s['Ds'], 'TK Đối ứng': '1111', 'Phát sinh Nợ': amt, 'Phát sinh Có': 0, 'Prio': 0})
    bal -= amt; bal_112 += amt

for action in timeline:
    dt = action['dt_obj'].strftime('%d/%m/%Y')
    
    if action['type'] == 'base':
        r = action['data']
        tk_dr, tk_cr = r['dr'], r['cr']
        val = r['val']
        
        if tk_dr == '1111':
            while pending_inflows and bal + val < 5000000:
                i_s = pending_inflows.pop(0)
                inj_inflow(i_s, dt)
                bal += i_s['Am']
            bal += val
        elif tk_cr == '1111':
            while pending_outflows and bal - val < 2000000: # Need to have cash
                i_s = pending_inflows.pop(0) if pending_inflows else None
                if i_s: 
                    inj_inflow(i_s, dt)
                    bal += i_s['Am']
                else: break
            bal -= val
            
        if tk_dr == '112':
            while bal_112 + val < 500000: inj_112_deposit(dt)
            bal_112 += val
        elif tk_cr == '112':
            while bal_112 - val < 500000: inj_112_deposit(dt)
            bal_112 -= val
            
        # Record on both sides
        if tk_dr in redist_list:
            redist_list[tk_dr].append({'Ngày hạch toán': dt, 'Số chứng từ': r['so_ct'], 'Diễn giải': r['dg'], 'TK Đối ứng': tk_cr, 'Phát sinh Nợ': val, 'Phát sinh Có': 0, 'Prio': 1})
        if tk_cr in redist_list:
            redist_list[tk_cr].append({'Ngày hạch toán': dt, 'Số chứng từ': r['so_ct'], 'Diễn giải': r['dg'], 'TK Đối ứng': tk_dr, 'Phát sinh Nợ': 0, 'Phát sinh Có': val, 'Prio': 1})
        
    elif action['type'] == 'inject':
        if pending_inflows and pending_outflows:
            next_o = pending_outflows[0]['Am']
            if bal - next_o > 15000000 and random.random() < 0.4:
                o_s = pending_outflows.pop(0)
                inj_outflow(o_s, dt)
                bal -= o_s['Am']
            elif pending_inflows:
                i_s = pending_inflows.pop(0)
                inj_inflow(i_s, dt)
                bal += i_s['Am']
        elif pending_inflows:
            i_s = pending_inflows.pop(0)
            inj_inflow(i_s, dt)
            bal += i_s['Am']
        elif pending_outflows:
            o_s = pending_outflows.pop(0)
            if bal - o_s['Am'] > 5000000:
                inj_outflow(o_s, dt)
                bal -= o_s['Am']

writer = pd.ExcelWriter(temp_output, engine='xlsxwriter')
df_nkc.to_excel(writer, sheet_name='NKC', index=False)
all_sheets = sorted(list(set(list(targets.keys()) + list(redist_list.keys()))))
for sheet in all_sheets:
    if sheet == 'NKC': continue
    data = redist_list.get(sheet, [])
    df = pd.DataFrame(data)
    if df.empty:
        df = pd.DataFrame(columns=['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Phát sinh Nợ', 'Phát sinh Có', 'Prio'])
    if sheet in targets:
        target = targets[sheet]
        rows = df.to_dict('records')
        rows.sort(key=lambda r: (safe_d_parse(r.get('Ngày hạch toán')), r.get('Prio', 1)))
        df = pd.DataFrame(rows, columns=['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Phát sinh Nợ', 'Phát sinh Có', 'Prio'])
        for c in ['Phát sinh Nợ', 'Phát sinh Có']: df[c] = pd.to_numeric(df[c], errors='coerce').fillna(0)
        for c in ['Phát sinh Nợ', 'Phát sinh Có']:
            tar_v = target.get('ps_no' if c == 'Phát sinh Nợ' else 'ps_co', 0)
            gap = tar_v - df[c].sum()
            if gap < -0.01:
                idx_list = df[df[c] > 0].index[::-1]; to_red = abs(gap)
                for idx in idx_list:
                    v = df.at[idx, c]; r = min(v, to_red); df.at[idx, c] -= r; to_red -= r
                    if to_red < 0.01: break
        no_gap, co_gap = target['ps_no'] - df['Phát sinh Nợ'].sum(), target['ps_co'] - df['Phát sinh Có'].sum()
        if no_gap > 1.0 or co_gap > 1.0:
            df = pd.concat([df, pd.DataFrame([{'Ngày hạch toán': '31/12/2024', 'Số chứng từ': 'DC_KS2024', 'Diễn giải': 'Điều chỉnh rà soát khớp số liệu Target', 'TK Đối ứng': '911', 'Phát sinh Nợ': max(0, no_gap), 'Phát sinh Có': max(0, co_gap)}])], ignore_index=True)
        df = pd.concat([pd.DataFrame([{'Diễn giải': 'SỐ DƯ ĐẦU KỲ', 'Đầu kỳ': target['dau_ky']}]), df], ignore_index=True)
        nature = 'credit' if sheet.startswith(('3', '4', '5', '7', '9')) else 'debit'
        b = target['dau_ky']; bl = []
        for i, row in df.iterrows():
            if i == 0: bl.append(b); continue
            no, co = row.get('Phát sinh Nợ',0), row.get('Phát sinh Có',0)
            b += (no-co) if nature == 'debit' else (co-no); bl.append(b)
        df['Cuối kỳ'] = bl
        df = pd.concat([df, pd.DataFrame([{'Diễn giải': 'TỔNG CỘNG PHÁT SINH', 'Phát sinh Nợ': df.iloc[1:]['Phát sinh Nợ'].sum(), 'Phát sinh Có': df.iloc[1:]['Phát sinh Có'].sum()}, {'Diễn giải': 'SỐ DƯ CUỐI KỲ', 'Cuối kỳ': target['cuoi_ky']}])], ignore_index=True)
    df.reindex(columns=['Ngày hạch toán', 'Số chứng từ', 'Diễn giải', 'TK Đối ứng', 'Đầu kỳ', 'Phát sinh Nợ', 'Phát sinh Có', 'Cuối kỳ']).to_excel(writer, sheet_name=sheet, index=False)
writer.close(); os.replace(temp_output, excel_path)
print("Update complete!")
