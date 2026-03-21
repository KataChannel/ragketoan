
import pandas as pd
for y in [2023, 2024, 2025]:
    file_path = f'/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv{y}.xlsx'
    total_in = 0
    total_out = 0
    xl = pd.ExcelFile(file_path)
    for m in range(1, 13):
        df = pd.read_excel(xl, sheet_name=f'Tháng {m}')
        row = df[df['Mã - Tên Hàng'] == 'TỔNG CỘNG']
        if not row.empty:
            total_in += row['Nhập (Tiền)'].values[0]
            total_out += row['Xuất (Tiền)'].values[0]
    print(f"Year {y}: In={int(total_in)}, Out={int(total_out)}")
