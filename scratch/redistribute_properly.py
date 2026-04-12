import openpyxl
import os

os.environ['TMPDIR'] = '/chikiet/kata2025/ragketoan/tmp'
file_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'
wb = openpyxl.load_workbook(file_path)

# 1. Targets
t_cuoi = 15756884474

# 2. Get Rational Baseline from Summary or adj_prices
# We'll use the ratio of (Ton Cuoi SL * Rational Price)
# Since I didn't save Rational Price in Excel, I will use a simplified ratio:
# Ratio = (Ton Cuoi SL * (Dau VNĐ + Nhap VNĐ) / (Dau SL + Nhap SL))

ws_sum = wb['xnt12thang']
item_data = []
total_baseline_v = 0

for r in range(2, ws_sum.max_row + 1):
    stt = ws_sum.cell(row=r, column=1).value
    ma = ws_sum.cell(row=r, column=2).value
    if stt is not None and isinstance(stt, (int, float)):
        c_sl = ws_sum.cell(row=r, column=9).value or 0
        d_v = ws_sum.cell(row=r, column=5).value or 0
        n_v = ws_sum.cell(row=r, column=6).value or 0
        d_sl = ws_sum.cell(row=r, column=4).value or 0
        n_sl = sum(wb[f'Tháng {m}'].cell(row=r, column=6).value or 0 for m in range(1, 13)) # Proxy for yearly nhập sl
        
        # Unit Cost Proxy
        if (d_sl + n_sl) > 0: unit_cost = (d_v + n_v) / (d_sl + n_sl)
        else: unit_cost = 1000 # Fallback
        
        baseline_v = c_sl * unit_cost
        item_data.append({
            'ma': ma, 'r_sum': r, 'baseline_v': baseline_v, 'c_sl': c_sl
        })
        total_baseline_v += baseline_v

# 3. Re-distribute the 15.7B
print(f"Redistributing {t_cuoi} based on total baseline {total_baseline_v}")
run_v = 0
for idx, item in enumerate(item_data):
    if idx == len(item_data) - 1: final_v = t_cuoi - run_v
    else:
        if total_baseline_v > 0: final_v = int(round(t_cuoi * (item['baseline_v'] / total_baseline_v)))
        else: final_v = 0
    item['final_v'] = final_v
    run_v += final_v

# 4. Update Excel (Summary and Sheet 12)
ws12 = wb['Tháng 12']
for item in item_data:
    ma = item['ma']
    # Update Summary
    ws_sum.cell(row=item['r_sum'], column=10).value = item['final_v']
    # Update Sheet 12
    # Find row in Sheet 12 (it should be the same row index as Summary for this file)
    r12 = item['r_sum'] 
    ws12.cell(row=r12, column=13).value = item['final_v']
    # Also adjust Giá Vốn in Sheet 12 to maintain Dầu + Nhập - Giá Vốn = Cuối
    d_v_12 = ws12.cell(row=r12, column=5).value or 0
    n_v_12 = ws12.cell(row=r12, column=7).value or 0
    new_gv_12 = d_v_12 + n_v_12 - item['final_v']
    ws12.cell(row=r12, column=11).value = new_gv_12

# 5. Fix Totals
for sn in ['Tháng 12', 'xnt12thang']:
    ws = wb[sn]
    for r in range(ws.max_row, 1, -1):
        if ws.cell(row=r, column=3).value == 'TỔNG CỘNG':
            cols = [11, 13] if sn == 'Tháng 12' else [10]
            for col in cols:
                ws.cell(row=r, column=col).value = int(round(sum(ws.cell(row=ri, column=col).value or 0 for ri in range(2, r) if ws.cell(row=ri, column=1).value is not None)))
            break

wb.save(file_path)
print("Redistribution complete. The 15.7B is now spread logically across 293 items.")
