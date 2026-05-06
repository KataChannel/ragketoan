import xlrd

file_path = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2024/SAO KÊ NHVCB 2024 HHP/sao kê ngân hàng  Vay VCB năm  2024 gửi Cô Ngọc 04.06.25.xls"
book = xlrd.open_workbook(file_path)

print(f"File: {file_path}")
for i in range(book.nsheets):
    sheet = book.sheet_by_index(i)
    # Visibility: 0 = visible, 1 = hidden, 2 = very hidden
    # Check if the attribute exists
    vis = getattr(sheet, 'visibility', 'Unknown')
    print(f"Sheet {i}: '{sheet.name}', Visibility: {vis}")
