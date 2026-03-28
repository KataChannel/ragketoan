import pandas as pd
import os
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, Border, Side

def create_accounting_excel():
    output_path = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SO_SACH_KE_TOAN_2023_HUYVU.xlsx"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # 1. Prepare Data for Nhật ký chung (SBN)
    # Monthly data from last run
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    mua_vao = [1154981168, 1745704060, 1536437740, 757550605, 600350982, 749561480, 895409562, 1812197510, 1552056808, 890284924, 1564643569, 2381764452]
    ban_ra = [890556850, 1062540911, 1702314546, 976118179, 856337274, 979997269, 1153648183, 1158949228, 1281113807, 1420458661, 1483313992, 3205182101]
    
    total_mua = sum(mua_vao)
    total_ban = sum(ban_ra)
    target_cogs = 17954811985
    opening_stock = 20528682383
    
    sbn_rows = []
    
    # Opening Bal Entry (Memo)
    sbn_rows.append({"Ngày": "01/01/2023", "Chứng từ": "SDDK", "Diễn giải": "Số dư đầu kỳ Hàng hóa", "Tài khoản Nợ": "1561", "Tài khoản Có": "", "Số tiền": opening_stock})
    
    # Monthly Entries
    for i, month in enumerate(months):
        date_str = f"28/{i+1:02d}/2023"
        # Mua hàng
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PN_{i+1:02d}", "Diễn giải": f"Nhập kho hàng hóa tháng {i+1}", "Tài khoản Nợ": "1561", "Tài khoản Có": "331", "Số tiền": mua_vao[i]})
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PN_{i+1:02d}", "Diễn giải": f"Thuế GTGT đầu vào tháng {i+1}", "Tài khoản Nợ": "1331", "Tài khoản Có": "331", "Số tiền": round(mua_vao[i]*0.1)})
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"UNC_{i+1:02d}", "Diễn giải": f"Thanh toán tiền hàng tháng {i+1}", "Tài khoản Nợ": "331", "Tài khoản Có": "112", "Số tiền": round(mua_vao[i]*1.1)})
        
        # Bán hàng
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PX_{i+1:02d}", "Diễn giải": f"Doanh thu bán lẻ tháng {i+1}", "Tài khoản Nợ": "131", "Tài khoản Có": "511", "Số tiền": ban_ra[i]})
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PX_{i+1:02d}", "Diễn giải": f"Thuế GTGT đầu ra tháng {i+1}", "Tài khoản Nợ": "131", "Tài khoản Có": "3331", "Số tiền": round(ban_ra[i]*0.1)})
        
        # Giá vốn (Distributed periodically)
        monthly_cogs = round((ban_ra[i] / total_ban) * target_cogs) if total_ban > 0 else 0
        sbn_rows.append({"Ngày": date_str, "Chứng từ": f"GV_{i+1:02d}", "Diễn giải": f"Giá vốn hàng bán tháng {i+1}", "Tài khoản Nợ": "632", "Tài khoản Có": "1561", "Số tiền": monthly_cogs})

    # Adjust last GV to be exact
    current_gv_sum = sum(r["Số tiền"] for r in sbn_rows if r["Tài khoản Nợ"] == "632")
    diff = target_cogs - current_gv_sum
    if diff != 0:
        for r in reversed(sbn_rows):
            if r["Tài khoản Nợ"] == "632":
                r["Số tiền"] += diff
                break

    # Closing Entries
    sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_01", "Diễn giải": "Kết chuyển doanh thu thuần sang 911", "Tài khoản Nợ": "511", "Tài khoản Có": "911", "Số tiền": total_ban})
    sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_02", "Diễn giải": "Kết chuyển giá vốn sang 911", "Tài khoản Nợ": "911", "Tài khoản Có": "632", "Số tiền": target_cogs})
    loss = target_cogs - total_ban
    if loss > 0:
        sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_03", "Diễn giải": "Kết chuyển lỗ sang 421", "Tài khoản Nợ": "421", "Tài khoản Có": "911", "Số tiền": loss})

    df_sbn = pd.DataFrame(sbn_rows)
    
    # 2. Create BangCDPS
    coa = ["112", "131", "1331", "1561", "331", "3331", "421", "511", "632", "911"]
    cdps_data = []
    for acc in coa:
        debit = df_sbn[df_sbn["Tài khoản Nợ"] == acc]["Số tiền"].sum()
        credit = df_sbn[df_sbn["Tài khoản Có"] == acc]["Số tiền"].sum()
        opening_n = opening_stock if acc == "1561" else 0
        closing_n = opening_n + debit - credit
        cdps_data.append({"TK": acc, "Dư Đầu Nợ": opening_n, "Phát sinh Nợ": debit, "Phát sinh Có": credit, "Dư Cuối Nợ": closing_n if closing_n > 0 else 0, "Dư Cuối Có": -closing_n if closing_n < 0 else 0})
    df_cdps = pd.DataFrame(cdps_data)

    # 3. Create Excel with Multiple Sheets
    with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
        df_sbn.to_excel(writer, sheet_name="SBN", index=False)
        df_cdps.to_excel(writer, sheet_name="BangCDPS", index=False)
        
        # P&L
        pl_data = [
            ["Doanh thu thuần", total_ban],
            ["Giá vốn hàng bán", target_cogs],
            ["Lợi nhuận gộp", total_ban - target_cogs]
        ]
        df_pl = pd.DataFrame(pl_data, columns=["Chỉ tiêu", "Số tiền"])
        df_pl.to_excel(writer, sheet_name="BaoCaoKQKD", index=False)
        
        # Detail Ledgers (Sổ cái chi tiết)
        for acc in coa:
            mask = (df_sbn["Tài khoản Nợ"] == acc) | (df_sbn["Tài khoản Có"] == acc)
            df_acc = df_sbn[mask].copy()
            sheet_name = f"SoCai_{acc}"[:30]
            df_acc.to_excel(writer, sheet_name=sheet_name, index=False)

    print(f"Successfully created: {output_path}")

if __name__ == "__main__":
    create_accounting_excel()
