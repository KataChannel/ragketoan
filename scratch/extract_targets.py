import pandas as pd

# Load the target Excel file
src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/SỔ SÁCH CÁC TK 2023 HUY VŨ FINAL.xlsx'
df_detail = pd.read_excel(src, sheet_name='331_Chi_Tiet')

# 8 specific suppliers from the user's screenshots
suppliers = [
    "CÔNG TY CỔ PHẦN MÁY TÍNH VĨNH XUÂN - CHI NHÁNH ĐÀ NẴNG",
    "CHI NHÁNH CÔNG TY CỔ PHẦN THẾ GIỚI SỐ TẠI ĐÀ NẴNG",
    "Công ty TNHH Phân phối Synnex FPT",
    "CÔNG TY TNHH MỘT THÀNH VIÊN CÔNG NGHỆ TIN HỌC VIỄN SƠN",
    "CHI NHÁNH CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ PHÁT TRIỂN CÔNG NGHỆ Q",
    "CÔNG TY CỔ PHẦN THẾ GIỚI SỐ",
    "CÔNG TY CỔ PHẦN DỊCH VỤ PHÂN PHỐI TỔNG HỢP DẦU KHÍ",
    "CÔNG TY TNHH ĐIỆN TỬ TIN HỌC KIM PHÁT"
]

# We want to find their Opening balance (first appearance) and Closing balance (last appearance)
# Looking at the columns: Date, Journal Date, Voucher, Description, Debit, Credit, Start Balance, End Balance, Supplier
# Wait, I need to know the column names
print("Columns in 331_Chi_Tiet:", df_detail.columns.tolist())

targets = {}
for s in suppliers:
    # Filter rows for this supplier
    s_rows = df_detail[df_detail['Đối tượng'].str.contains(s, na=False, case=False)]
    if not s_rows.empty:
        # Assuming the sheet is sorted chronologically
        # Start balance is the balance before first transaction, or we take it from the first row's "start"
        # Since this is a detailed ledger, usually "SỐ DƯ ĐẦU KỲ" rows exist or the first row has the start balance.
        
        # Let's try to find the row with "DƯ ĐẦU KỲ" for this supplier
        start_row = s_rows[s_rows['Diễn giải'].str.contains('DƯ ĐẦU KỲ|SỐ DƯ ĐẦU KỲ', na=False, case=False)]
        if not start_row.empty:
            start_bal = start_row.iloc[0]['Số dư'] # Adjust column name if needed
        else:
            # Maybe the first transaction row has the start balance? Or we need to infer
            # In some ledgers, 'Số dư' is the running balance.
            start_bal = s_rows.iloc[0]['Số dư'] # This might be wrong, need to check
            
        # Closing balance
        end_bal = s_rows.iloc[-1]['Số dư']
        
        targets[s] = {'start': start_bal, 'end': end_bal}
    else:
        print(f"Warning: {s} not found in sheet.")

for s, val in targets.items():
    print(f"{s}: {val['start']:,.0f} -> {val['end']:,.0f}")
