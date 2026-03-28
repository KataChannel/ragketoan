import pandas as pd
import os
import sys

def build_integrated_ledger():
    base_dir = "/chikiet/kata2025/ragketoan"
    output_dir = os.path.join(base_dir, "docs/huyvu/sosach")
    os.makedirs(output_dir, exist_ok=True)
    
    log_file = os.path.join(output_dir, "LOG_TONG_HOP_DU_LIEU.txt")
    output_excel = os.path.join(output_dir, "SO_SACH_KE_TOAN_TONG_HOP_2023_HUYVU.xlsx")
    
    with open(log_file, "w", encoding="utf-8") as f:
        f.write("BẮT ĐẦU TỔNG HỢP DỮ LIỆU KẾ TOÁN 2023 HUY VŨ\n")
        f.write("-" * 50 + "\n")
        
        # 1. Read XNT Hoadon
        xnt_path = os.path.join(base_dir, "docs/huyvu/XNT_HuyVu_2023.xlsx")
        f.write(f"Đang đọc dữ liệu XNT từ: {xnt_path}\n")
        
        df_hoadon = pd.read_excel(xnt_path, sheet_name="Hoadon")
        # Remove total row if exists
        df_hoadon = df_hoadon[df_hoadon.iloc[:, 0].str.contains("Tháng", na=False)].copy()
        
        col_month = df_hoadon.columns[0]
        col_mua = df_hoadon.columns[1]
        col_ban = df_hoadon.columns[2]
        
        mua_vao = df_hoadon[col_mua].fillna(0).tolist()
        ban_ra = df_hoadon[col_ban].fillna(0).tolist()
        
        f.write(f"Đã đọc {len(mua_vao)} tháng dữ liệu nhập/xuất kho.\n")
        
        # 2. Read Bank Statements
        bank_path = os.path.join(output_dir, "bank_statement_summary.xlsx")
        f.write(f"Đang đọc dữ liệu Sao kê Ngân hàng từ: {bank_path}\n")
        try:
            df_bank = pd.read_excel(bank_path)
            # Create a simple mapping to use to process later
            df_bank['month'] = pd.to_datetime(df_bank['from_date'], errors='coerce').dt.month
            
            # Aggregate by month
            bank_agg = df_bank.groupby('month').agg({'total_debit': 'sum', 'total_credit': 'sum'}).reset_index()
            f.write(f"Đã tổng hợp dòng tiền ngân hàng theo {len(bank_agg)} tháng có dữ liệu thực tế.\n")
        except Exception as e:
            f.write(f"Lỗi khi đọc file ngân hàng: {e}\n")
            bank_agg = pd.DataFrame(columns=['month', 'total_debit', 'total_credit'])
            
        # Parameters
        total_ban = sum(ban_ra)
        target_cogs = 17954811985
        opening_stock = 20528682383
        
        f.write(f"Các tham số chốt: Tồn đầu={opening_stock:,.0f}, Doanh thu thuần={total_ban:,.0f}, Giá vốn mục tiêu={target_cogs:,.0f}\n\n")
        
        sbn_rows = []
        
        # SDDK
        sbn_rows.append({"Ngày": "01/01/2023", "Chứng từ": "SDDK", "Diễn giải": "Số dư đầu kỳ Hàng hóa", "Tài khoản Nợ": "1561", "Tài khoản Có": "", "Số tiền": opening_stock})
        
        # Process Monthly Inventory
        for i in range(len(mua_vao)):
            month_idx = i + 1
            date_str = f"28/{month_idx:02d}/2023"
            
            # Mua hàng
            m = mua_vao[i]
            if m > 0:
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PN_{month_idx:02d}", "Diễn giải": f"Nhập kho hàng hóa tháng {month_idx}", "Tài khoản Nợ": "1561", "Tài khoản Có": "331", "Số tiền": m})
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PN_VAT_{month_idx:02d}", "Diễn giải": f"Thuế GTGT đầu vào tháng {month_idx} (10%)", "Tài khoản Nợ": "1331", "Tài khoản Có": "331", "Số tiền": round(m * 0.1)})
            
            # Bán hàng
            b = ban_ra[i]
            if b > 0:
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PX_{month_idx:02d}", "Diễn giải": f"Doanh thu bán lẻ tháng {month_idx}", "Tài khoản Nợ": "131", "Tài khoản Có": "511", "Số tiền": b})
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"PX_VAT_{month_idx:02d}", "Diễn giải": f"Thuế GTGT đầu ra tháng {month_idx} (10%)", "Tài khoản Nợ": "131", "Tài khoản Có": "3331", "Số tiền": round(b * 0.1)})
            
            # Giá vốn (Distributed by ratio)
            monthly_cogs = round((b / total_ban) * target_cogs) if total_ban > 0 else 0
            if monthly_cogs > 0:
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"GV_{month_idx:02d}", "Diễn giải": f"Giá vốn hàng bán tháng {month_idx}", "Tài khoản Nợ": "632", "Tài khoản Có": "1561", "Số tiền": monthly_cogs})
                
        # Fix total GV mismatch if rounding errors
        current_gv_sum = sum(r["Số tiền"] for r in sbn_rows if r["Tài khoản Nợ"] == "632")
        gv_diff = target_cogs - current_gv_sum
        if gv_diff != 0:
            for r in reversed(sbn_rows):
                if r["Tài khoản Nợ"] == "632":
                    r["Số tiền"] += gv_diff
                    break

        # SBN for Bank statements
        f.write("Bắt đầu xử lý hạch toán từ sao kê ngân hàng...\n")
        # Just loop through available aggregated bank data
        for _, row in bank_agg.iterrows():
            m_bank = int(row['month']) if pd.notnull(row['month']) else 12
            date_str = f"28/{m_bank:02d}/2023"
            
            debit = row['total_debit']
            credit = row['total_credit']
            
            if debit > 0:
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"BN_OUT_{m_bank:02d}", "Diễn giải": f"CK thanh toán NCC tháng {m_bank}", "Tài khoản Nợ": "331", "Tài khoản Có": "112", "Số tiền": debit})
            
            if credit > 0:
                sbn_rows.append({"Ngày": date_str, "Chứng từ": f"BN_IN_{m_bank:02d}", "Diễn giải": f"KH chuyển khoản tháng {m_bank}", "Tài khoản Nợ": "112", "Tài khoản Có": "131", "Số tiền": credit})

        # Closing Entries at the end of year
        sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_DT", "Diễn giải": "Kết chuyển doanh thu", "Tài khoản Nợ": "511", "Tài khoản Có": "911", "Số tiền": total_ban})
        sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_GV", "Diễn giải": "Kết chuyển giá vốn", "Tài khoản Nợ": "911", "Tài khoản Có": "632", "Số tiền": target_cogs})
        
        loss = target_cogs - total_ban
        if loss > 0:
            sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_LO", "Diễn giải": "Kết chuyển lỗ kinh doanh", "Tài khoản Nợ": "421", "Tài khoản Có": "911", "Số tiền": loss})
        elif loss < 0:
            sbn_rows.append({"Ngày": "31/12/2023", "Chứng từ": "KC_LAI", "Diễn giải": "Kết chuyển lãi kinh doanh", "Tài khoản Nợ": "911", "Tài khoản Có": "421", "Số tiền": -loss})

        df_sbn = pd.DataFrame(sbn_rows)
        
        # Build BangCDPS
        coa = ["112", "131", "1331", "1561", "331", "3331", "421", "511", "632", "911"]
        cdps_data = []
        for acc in coa:
            d_sum = df_sbn[df_sbn["Tài khoản Nợ"] == acc]["Số tiền"].sum()
            c_sum = df_sbn[df_sbn["Tài khoản Có"] == acc]["Số tiền"].sum()
            o_bal = opening_stock if acc == "1561" else 0
            cl_bal = o_bal + d_sum - c_sum
            
            cdps_data.append({
                "Tài khoản": acc, 
                "Dư Đầu Nợ": o_bal, 
                "Dư Đầu Có": 0,
                "Phát sinh Nợ": d_sum, 
                "Phát sinh Có": c_sum, 
                "Dư Cuối Nợ": cl_bal if cl_bal > 0 else 0, 
                "Dư Cuối Có": -cl_bal if cl_bal < 0 else 0
            })
        df_cdps = pd.DataFrame(cdps_data)
        
        # Write Excel
        f.write(f"Tiến hành xuất hệ thống sổ sách ra file Excel: {output_excel}\n")
        with pd.ExcelWriter(output_excel, engine='openpyxl') as writer:
            df_sbn.to_excel(writer, sheet_name="NKC", index=False)
            df_cdps.to_excel(writer, sheet_name="CDPS", index=False)
            
            pl_data = [
                ["1. Doanh thu bán hàng", total_ban],
                ["2. Giá vốn hàng bán", target_cogs],
                ["3. Lợi nhuận gộp", total_ban - target_cogs]
            ]
            pd.DataFrame(pl_data, columns=["Chỉ tiêu", "Số tiền (VNĐ)"]).to_excel(writer, sheet_name="KQKD", index=False)
            
            # 1 Sổ cái chung (Tổng hợp tất cả các bút toán theo từng tài khoản)
            # Tạo 1 sheet Sổ Cái duy nhất chứa tất cả dữ liệu
            df_so_cai = pd.concat([
                df_sbn[["Ngày", "Chứng từ", "Diễn giải", "Tài khoản Nợ", "Số tiền"]].rename(columns={"Tài khoản Nợ": "Tài khoản", "Số tiền": "Nợ"}).assign(Có=0),
                df_sbn[["Ngày", "Chứng từ", "Diễn giải", "Tài khoản Có", "Số tiền"]].rename(columns={"Tài khoản Có": "Tài khoản", "Số tiền": "Có"}).assign(Nợ=0)
            ])
            df_so_cai = df_so_cai[df_so_cai["Tài khoản"] != ""]
            df_so_cai = df_so_cai.sort_values(by=["Tài khoản", "Ngày"])
            df_so_cai.to_excel(writer, sheet_name="So_Cai", index=False)
            
            # Nhiều Sổ chi tiết
            for acc in coa:
                df_acc = df_sbn[(df_sbn["Tài khoản Nợ"] == acc) | (df_sbn["Tài khoản Có"] == acc)]
                df_acc.to_excel(writer, sheet_name=f"So_Chi_Tiet_{acc}", index=False)
        
        f.write("HOÀN TẤT! Dữ liệu đã được tổng hợp xong.\n")
        print(f"Created: {output_excel}")

if __name__ == "__main__":
    build_integrated_ledger()
