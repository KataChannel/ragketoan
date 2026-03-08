import json
import openpyxl
import re
import sys

def main():
    file_path = '/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx'
    json_path = '/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/monthly_2023_data.json'
    out_path = '/chikiet/kata2025/ragketoan/BC_QUYET_TOAN_HOANGHUYPHAT_2023.xlsx'

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON: {e}")
        sys.exit(1)

    # Map ma_hang_2024 -> { month: { ban_ra: X, mua_vao: Y } }
    monthly_map = {}
    for item in json_data:
        ma = item.get("ma_hang_2024")
        if ma:
            month_info = {}
            for m_data in item.get("monthly_data", []):
                m_num = m_data.get("month")
                if m_num:
                    month_info[m_num] = {
                        "ban_ra": float(m_data.get("ban_ra", 0)) if m_data.get("ban_ra") else 0,
                        "mua_vao": float(m_data.get("mua_vao", 0)) if m_data.get("mua_vao") else 0
                    }
            monthly_map[ma.strip()] = month_info

    print("Loading workbook...")
    wb = openpyxl.load_workbook(file_path)

    target_ws = None
    start_row = None

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]
        for row in range(1, 100):
            for col in range(1, 40):
                val = ws.cell(row=row, column=col).value
                if isinstance(val, str):
                    v_lower = str(val).lower()
                    if 'bảng 3' in v_lower or 'bảng03' in v_lower or 'bảng số 3' in v_lower:
                        target_ws = ws
                        start_row = row
                        break
            if target_ws:
                break
        if target_ws:
            break

    # If "Bảng 3" not found explicitly, look for standard "Tháng 1" structure
    if not target_ws:
        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            for row in range(1, 50):
                for col in range(1, 40):
                    val = ws.cell(row=row, column=col).value
                    if isinstance(val, str) and ('tháng 1' in str(val).lower() or 'tháng 01' in str(val).lower()):
                        target_ws = ws
                        start_row = max(1, row - 2)
                        break
                if target_ws:
                    break
            if target_ws:
                break

    # If still not found, we will append it dynamically to "Tong hop XNT 2023" or active sheet
    if not target_ws:
        print("Bảng 3 section not found! Appending a new Bảng 3 section.")
        if 'Tong hop XNT 2023' in wb.sheetnames:
            target_ws = wb['Tong hop XNT 2023']
        else:
            target_ws = wb.active
        start_row = target_ws.max_row + 2
        
        target_ws.cell(row=start_row, column=1).value = "BẢNG 3: CHI TIẾT THEO THÁNG"
        start_row += 1
        
        # Write headers
        target_ws.cell(row=start_row, column=1).value = "Mã hàng"
        current_col = 2
        for m in range(1, 13):
            # spanning month header isn't strictly necessary, we can just write specific columns
            target_ws.cell(row=start_row, column=current_col).value = f"Tháng {m} Mua vào"
            current_col += 1
            target_ws.cell(row=start_row, column=current_col).value = f"Tháng {m} Bán ra"
            current_col += 1

        # Populate rows
        r = start_row + 1
        for ma_val, m_info in monthly_map.items():
            target_ws.cell(row=r, column=1).value = ma_val
            c = 2
            for m in range(1, 13):
                target_ws.cell(row=r, column=c).value = m_info.get(m, {}).get('mua_vao', 0)
                target_ws.cell(row=r, column=c+1).value = m_info.get(m, {}).get('ban_ra', 0)
                c += 2
            r += 1
            
        wb.save(out_path)
        print("Done creating and filling Bảng 3 section.")
        return

    print(f"Found Bảng 3 data section at row {start_row} in sheet '{target_ws.title}'")

    ma_hang_col = None
    month_data_cols = {} # dict mapping month (1-12) to {'mua_vao': col, 'ban_ra': col}

    # Scan header rows dynamically to map columns
    # We scan around start_row, searching ~10 rows down and ~50 cols right
    for r in range(start_row, min(start_row + 15, target_ws.max_row + 1)):
        for c in range(1, 100):
            v = target_ws.cell(row=r, column=c).value
            if isinstance(v, str):
                v_lower = str(v).lower().strip()
                if v_lower in ['mã hàng', 'mã vật tư', 'mã hàng hóa']:
                    ma_hang_col = c
                elif 'tháng' in v_lower:
                    match = re.search(r'tháng\s*0?(\d+)', v_lower)
                    if match:
                        m_num = int(match.group(1))
                        if 1 <= m_num <= 12:
                            mua_c = None
                            ban_c = None
                            # check the current col and the next few cols, as well as rows below
                            for dr in range(0, 4):
                                for dc in range(0, 5):
                                    try:
                                        sv = target_ws.cell(row=r+dr, column=c+dc).value
                                        if isinstance(sv, str):
                                            svl = str(sv).lower()
                                            if ('mua' in svl or 'nhập' in svl) and mua_c is None:
                                                mua_c = c+dc
                                            elif ('bán' in svl or 'xuất' in svl) and ban_c is None:
                                                ban_c = c+dc
                                    except:
                                        pass
                            
                            # check within the same text like "tháng 1 mua vào"
                            if 'mua' in v_lower or 'nhập' in v_lower:
                                mua_c = c
                            if 'bán' in v_lower or 'xuất' in v_lower:
                                ban_c = c

                            if m_num not in month_data_cols:
                                month_data_cols[m_num] = {}
                            if mua_c: month_data_cols[m_num]['mua_vao'] = mua_c
                            if ban_c: month_data_cols[m_num]['ban_ra'] = ban_c

    print(f"Mã hàng col: {ma_hang_col}")
    print(f"Month cols: {month_data_cols}")

    if not ma_hang_col or not month_data_cols:
        print("Failed to map target columns. Ensure 'Mã hàng' and 'Tháng X Mua vào/Bán ra' are available.")
        # Best effort attempt: fallback to assume columns are sequential starting right after ma_hang
        sys.exit(0)

    # Fill data based exactly on 'Mã Hàng' column
    matched_count = 0
    # Search from the row after headers down to the end of sheet
    
    # Let's find where data starts (first row where ma_hang_col has a string not in standard headers)
    for r in range(start_row + 1, target_ws.max_row + 1):
        ma_val = target_ws.cell(row=r, column=ma_hang_col).value
        if isinstance(ma_val, str):
            ma_val = ma_val.strip()
            if ma_val in monthly_map:
                matched_count += 1
                for m_num, c_data in month_data_cols.items():
                    m_info = monthly_map[ma_val].get(m_num, {})
                    if 'mua_vao' in c_data:
                        target_ws.cell(row=r, column=c_data['mua_vao']).value = m_info.get('mua_vao', 0)
                    if 'ban_ra' in c_data:
                        target_ws.cell(row=r, column=c_data['ban_ra']).value = m_info.get('ban_ra', 0)

    wb.save(out_path)
    print(f"Done filling values. Matched {matched_count} item rows.")

if __name__ == '__main__':
    main()
