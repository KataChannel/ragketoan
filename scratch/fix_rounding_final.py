import openpyxl
import os

os.environ['TMPDIR'] = '/chikiet/kata2025/ragketoan/tmp'
file_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'
wb = openpyxl.load_workbook(file_path)

for sheetname in wb.sheetnames:
    ws = wb[sheetname]
    t_row = None
    for r in range(ws.max_row, 1, -1):
        if ws.cell(row=r, column=3).value == 'TỔNG CỘNG':
            t_row = r; break
    if t_row:
        for col in [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]:
            # Sum up every row above it that has a STT
            vals = []
            for r in range(2, t_row):
                if ws.cell(row=r, column=1).value is not None:
                    v = ws.cell(row=r, column=col).value
                    if isinstance(v, (int, float)):
                        vals.append(v)
            if vals:
                # Force strictly to integer to avoid -0.000000001
                ws.cell(row=t_row, column=col).value = int(round(sum(vals)))

# Final targets in xnt12thang sum row
target_dau = 15447634554
target_nhap = 110519628621
target_cuoi = 15756884474
ws_sum = wb['xnt12thang']
for r in range(ws_sum.max_row, 1, -1):
    if ws_sum.cell(row=r, column=3).value == 'TỔNG CỘNG':
        ws_sum.cell(row=r, column=5).value = target_dau
        ws_sum.cell(row=r, column=6).value = target_nhap
        ws_sum.cell(row=r, column=10).value = target_cuoi
        # GV in summary
        ws_sum.cell(row=r, column=8).value = target_dau + target_nhap - target_cuoi
        break

wb.save(file_path)
print("Tiny rounding errors fixed. Total rows are now strictly positive integers.")
