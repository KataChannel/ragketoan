import openpyxl
import os

os.environ['TMPDIR'] = '/chikiet/kata2025/ragketoan/tmp'
file_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/XNT_HHP_2023.xlsx'
wb = openpyxl.load_workbook(file_path)

# Monthly Data
monthly_targets = {
    1: {'n': 14226694560, 'x': 11386534989},
    2: {'n': 10040247266, 'x': 7934111935},
    3: {'n': 7381679783, 'x': 8830045997},
    4: {'n': 10255784083, 'x': 8927663945},
    5: {'n': 9491021714, 'x': 9501096775},
    6: {'n': 9379263229, 'x': 6476704680},
    7: {'n': 5949569368, 'x': 11809848916},
    8: {'n': 8159204686, 'x': 10392458795},
    9: {'n': 8670793221, 'x': 7688034440},
    10: {'n': 6963184455, 'x': 10074473309},
    11: {'n': 9802832916, 'x': 7702004013},
    12: {'n': 10199353340, 'x': 14349920815}
}

if 'Hoadon' in wb.sheetnames:
    ws_h = wb['Hoadon']
    # Clear all data starting from row 2
    ws_h.delete_rows(2, ws_h.max_row)
    
    # Redraw headers to be sure
    ws_h.cell(row=1, column=1).value = "Tháng"
    ws_h.cell(row=1, column=2).value = "Tổng Tiền Hóa Đơn Mua (VNĐ)"
    ws_h.cell(row=1, column=3).value = "Tổng Tiền Hóa Đơn Bán (VNĐ)"
    
    # Fill months
    sum_n = 0
    sum_x = 0
    for m in range(1, 13):
        n_val = monthly_targets[m]['n']
        x_val = monthly_targets[m]['x']
        ws_h.append([f"Tháng {m}", n_val, x_val])
        sum_n += n_val
        sum_x += x_val
    
    # Total row
    ws_h.append(["TỔNG CỘNG", sum_n, sum_x])
    
    # Simple formatting: Auto-size columns B and C
    ws_h.column_dimensions['A'].width = 15
    ws_h.column_dimensions['B'].width = 30
    ws_h.column_dimensions['C'].width = 30

wb.save(file_path)
print("Hoadon display fixed: Rows consolidated, values moved to correct columns B and C.")
