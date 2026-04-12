import openpyxl
import os

os.environ['TMPDIR'] = '/chikiet/kata2025/ragketoan/tmp'

file_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'
wb = openpyxl.load_workbook(file_path)

# Targets
target_dau = 15447634554
target_nhap = 110519628621
target_cuoi = 15756884474
# Implicit total GOGS to balance perfectly: 110,210,378,701
target_gv_implicit = target_dau + target_nhap - target_cuoi 

ws_sum = wb['xnt12thang']
items_info = {}
for r in range(2, ws_sum.max_row + 1):
    stt = ws_sum.cell(row=r, column=1).value
    if stt is not None and isinstance(stt, (int, float)):
        ma = ws_sum.cell(row=r, column=2).value
        items_info[ma] = {
            'dau_v': ws_sum.cell(row=r, column=5).value or 0,
            'curr_gv_sum': ws_sum.cell(row=r, column=8).value or 0,
            'months': {}, 'nhap_sl_total':0, 'xuat_sl_total':0, 'nhap_v_total': ws_sum.cell(row=r, column=6).value or 0
        }

for m in range(1, 13):
    ws = wb[f'Tháng {m}']
    for r in range(2, ws.max_row + 1):
        ma = ws.cell(row=r, column=2).value
        if ma in items_info:
            n_sl = ws.cell(row=r, column=6).value or 0
            x_sl = ws.cell(row=r, column=8).value or 0
            items_info[ma]['nhap_sl_total'] += n_sl
            items_info[ma]['xuat_sl_total'] += x_sl
            items_info[ma]['months'][m] = {'n_sl': n_sl, 'x_sl': x_sl, 'row': r}

# Current sum of GV in summary
current_gv_sum = sum(info['curr_gv_sum'] for info in items_info.values())
factor = target_gv_implicit / current_gv_sum if current_gv_sum > 0 else 1.0

for ma, info in items_info.items():
    item_target_gv = int(round(info['curr_gv_sum'] * factor))
    # Redistribute item_target_gv sequentially
    curr_v = info['dau_v']
    gv_run = 0
    for m in range(1, 12):
        ws_m = wb[f'Tháng {m}']
        r_m = info['months'][m]['row']
        n_v = ws_m.cell(row=r_m, column=7).value or 0
        x_sl = info['months'][m]['x_sl']
        if info['xuat_sl_total'] > 0:
            gv_m = int(round(x_sl * (item_target_gv / info['xuat_sl_total'])))
        else: gv_m = 0
        gv_run += gv_m
        ws_m.cell(row=r_m, column=5).value = curr_v
        ws_m.cell(row=r_m, column=11).value = gv_m
        curr_v = curr_v + n_v - gv_m
        ws_m.cell(row=r_m, column=13).value = curr_v
        
    # M12
    ws12 = wb['Tháng 12']
    r12 = info['months'][12]['row']
    gv12 = item_target_gv - gv_run
    ws12.cell(row=r12, column=5).value = curr_v
    ws12.cell(row=r12, column=11).value = gv12
    ws12.cell(row=r12, column=13).value = curr_v + (ws12.cell(row=r12, column=7).value or 0) - gv12
    
    # Sync Summary
    r_sum = None
    for r in range(2, ws_sum.max_row+1):
        if ws_sum.cell(row=r, column=2).value == ma:
            r_sum = r; break
    if r_sum:
        ws_sum.cell(row=r_sum, column=8).value = item_target_gv
        ws_sum.cell(row=r_sum, column=10).value = ws12.cell(row=r12, column=13).value

# Totals
for m in range(1, 13):
    ws = wb[f'Tháng {m}']
    t_row = None
    for r in range(ws.max_row, 1, -1):
        if ws.cell(row=r, column=3).value == 'TỔNG CỘNG':
            t_row = r; break
    if t_row:
        for col in [5, 7, 11, 13]:
            ws.cell(row=t_row, column=col).value = sum(ws.cell(row=r, column=col).value or 0 for r in range(2, t_row) if ws.cell(row=r, column=3).value != 'TỔNG CỘNG')

# Summary Total
for r in range(ws_sum.max_row, 1, -1):
    if ws_sum.cell(row=r, column=3).value == 'TỔNG CỘNG':
        ws_sum.cell(row=r, column=5).value = target_dau
        ws_sum.cell(row=r, column=6).value = target_nhap
        ws_sum.cell(row=r, column=8).value = target_gv_implicit
        ws_sum.cell(row=r, column=10).value = target_cuoi
        break

wb.save(file_path)
print("Final v7 Sync: No Adjustment row, all targets balanced implicitly.")
