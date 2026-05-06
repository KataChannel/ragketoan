import pandas as pd

file_path = '/chikiet/kata2025/ragketoan/xulyfile/XNT_HuyVu_2025.xlsx'
df = pd.read_excel(file_path)

# Look for total columns
# Usually XNT files have columns like 'Tồn đầu kỳ VNĐ', 'Nhập trong kỳ VNĐ', 'Xuất trong kỳ VNĐ', 'Tồn cuối kỳ VNĐ'
# Or 'Tổng Nhập', 'Tổng Xuất'

print("Columns:", df.columns.tolist())

ton_dau = df['Tồn đầu kỳ VNĐ'].sum() if 'Tồn đầu kỳ VNĐ' in df.columns else 0
nhap = df[[c for c in df.columns if 'Nhập' in c and 'VNĐ' in c]].sum().sum()
xuat = df[[c for c in df.columns if 'Xuất' in c and 'VNĐ' in c]].sum().sum()
ton_cuoi = df['Tồn cuối kỳ VNĐ'].sum() if 'Tồn cuối kỳ VNĐ' in df.columns else 0

print(f"Current Totals:")
print(f"  Tồn đầu: {ton_dau:,.0f}")
print(f"  Nhập:    {nhap:,.0f}")
print(f"  Xuất:    {xuat:,.0f}")
print(f"  Tồn cuối: {ton_cuoi:,.0f}")

# Check monthly totals
monthly_nhap = {}
monthly_xuat = {}
for i in range(1, 13):
    col_n = f'Nhập T{i} VNĐ'
    col_x = f'Xuất T{i} VNĐ'
    if col_n in df.columns:
        monthly_nhap[i] = df[col_n].sum()
    if col_x in df.columns:
        monthly_xuat[i] = df[col_x].sum()

print("\nMonthly Nhap:")
for m, v in monthly_nhap.items():
    print(f"  T{m}: {v:,.0f}")

print("\nMonthly Xuat:")
for m, v in monthly_xuat.items():
    print(f"  T{m}: {v:,.0f}")
