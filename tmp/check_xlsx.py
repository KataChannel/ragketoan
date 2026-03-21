
import pandas as pd
total_in = 0
total_out = 0
for m in range(1, 13):
    try:
        df = pd.read_excel('/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx', sheet_name=f'Tháng {m}')
        row = df[df['Mã - Tên Hàng'] == 'TỔNG CỘNG']
        if not row.empty:
            total_in += row['Nhập (Tiền)'].values[0]
            total_out += row['Xuất (Tiền)'].values[0]
    except Exception as e:
        print(f"Error reading month {m}: {e}")
print(f"Total In: {int(total_in)}")
print(f"Total Out: {int(total_out)}")
