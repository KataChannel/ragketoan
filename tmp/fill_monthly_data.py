import json
import openpyxl

# Load data
with open("/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/monthly_2023_data.json", "r", encoding="utf-8") as f:
    monthly_data = json.load(f)

# we map ma_hang_2024 to its data for easy lookup
data_map = {item["ma_hang_2024"]: item["monthly_data"] for item in monthly_data}

# Load workbook
wb = openpyxl.load_workbook("/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx")
sheet = wb.active

# In the template, the Bảng 3 rows start at row 427, wait, let me search for "Bảng 3".
# We can just iterate through the rows, look for the "ma_hang_2024" in column C (or index 3)
# Let's find out exactly where the products are listed under Bảng 3.
# Let's read the sheet and print rows starting near Bảng 3.

print("Running...")
