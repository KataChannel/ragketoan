import pandas as pd
import os
import sys

def build_tax_report():
    base_dir = "/chikiet/kata2025/ragketoan"
    input_sosach = os.path.join(base_dir, "docs/huyvu/sosach/SO_SACH_KE_TOAN_TONG_HOP_2023_HUYVU.xlsx")
    output_tax = os.path.join(base_dir, "docs/huyvu/sosach/HO_SO_QUYET_TOAN_THUE_2023.xlsx")
    log_file = os.path.join(base_dir, "docs/huyvu/sosach/LOG_QUYET_TOAN_THUE.txt")
    
    with open(log_file, "w", encoding="utf-8") as f:
        f.write("BẮT ĐẦU XỬ LÝ HỒ SƠ QUYẾT TOÁN THUẾ 2023\n")
        f.write("-" * 50 + "\n")
        
        # 1. Read input data
        try:
            df_cdps = pd.read_excel(input_sosach, sheet_name="CDPS")
            df_kqkd = pd.read_excel(input_sosach, sheet_name="KQKD")
            df_1331 = pd.read_excel(input_sosach, sheet_name="So_Chi_Tiet_1331")
            df_3331 = pd.read_excel(input_sosach, sheet_name="So_Chi_Tiet_3331")
            df_511 = pd.read_excel(input_sosach, sheet_name="So_Chi_Tiet_511")
            df_1561 = pd.read_excel(input_sosach, sheet_name="So_Chi_Tiet_1561")
            df_632 = pd.read_excel(input_sosach, sheet_name="So_Chi_Tiet_632")
        except Exception as e:
            msg = f"Lỗi đọc file kế toán gốc: {e}\n"
            f.write(msg)
            print(msg)
            return

        # Utilities
        def get_cdps_val(tk, col):
            rows = df_cdps[df_cdps["Tài khoản"].astype(str) == str(tk)]
            if not rows.empty:
                return float(rows[col].iloc[0])
            return 0.0
            
        # 2. B01-DN (Bảng cân đối kế toán simplified)
        # B01 summarizes CDPS into Assets and Liabilities.
        f.write("Bước 1: Trích xuất B01-DN...\n")
        assets = [
            {"Mã số": "111", "Chỉ tiêu": "Tiền và các khoản tương đương tiền", "Số cuối năm": get_cdps_val("112", "Dư Cuối Nợ") + get_cdps_val("111", "Dư Cuối Nợ")},
            {"Mã số": "131", "Chỉ tiêu": "Phải thu ngắn hạn của khách hàng", "Số cuối năm": get_cdps_val("131", "Dư Cuối Nợ")},
            {"Mã số": "136", "Chỉ tiêu": "Tài sản thiế khác (VAT KHẤU TRỪ)", "Số cuối năm": get_cdps_val("1331", "Dư Cuối Nợ")},
            {"Mã số": "140", "Chỉ tiêu": "Hàng tồn kho", "Số cuối năm": get_cdps_val("1561", "Dư Cuối Nợ")},
            {"Mã số": "270", "Chỉ tiêu": "TỔNG TÀI SẢN", "Số cuối năm": 0} # Computed later
        ]
        
        liabilities = [
            {"Mã số": "311", "Chỉ tiêu": "Phải trả người bán ngắn hạn", "Số cuối năm": get_cdps_val("331", "Dư Cuối Có")},
            {"Mã số": "313", "Chỉ tiêu": "Thuế và các khoản phải nộp NN", "Số cuối năm": get_cdps_val("3331", "Dư Cuối Có")},
            {"Mã số": "411", "Chỉ tiêu": "Vốn đầu tư của chủ sở hữu", "Số cuối năm": get_cdps_val("411", "Dư Cuối Có")},
            {"Mã số": "421", "Chỉ tiêu": "Lợi nhuận sau thuế chưa phân phối", "Số cuối năm": get_cdps_val("421", "Dư Cuối Có") - get_cdps_val("421", "Dư Cuối Nợ")},
            {"Mã số": "440", "Chỉ tiêu": "TỔNG NGUỒN VỐN", "Số cuối năm": 0} # Computed later
        ]
        
        sum_assets = sum(x["Số cuối năm"] for x in assets if x["Chỉ tiêu"] != "TỔNG TÀI SẢN")
        sum_liab = sum(x["Số cuối năm"] for x in liabilities if x["Chỉ tiêu"] != "TỔNG NGUỒN VỐN")
        assets[-1]["Số cuối năm"] = sum_assets
        liabilities[-1]["Số cuối năm"] = sum_liab
        
        # B01 could also include Dư Đầu năm but we focus on end of year for simplified tax processing
        df_b01_assets = pd.DataFrame(assets)
        df_b01_liab = pd.DataFrame(liabilities)
        
        # 3. B02-DN (Báo cáo KQKD)
        f.write("Bước 2: Trích xuất B02-DN...\n")
        # Direct from KQKD sheet + standardized format
        doanh_thu_thuan = float(df_kqkd.loc[0, "Số tiền (VNĐ)"])
        gia_von = float(df_kqkd.loc[1, "Số tiền (VNĐ)"])
        loi_nhuan_gop = float(df_kqkd.loc[2, "Số tiền (VNĐ)"])
        ln_truoc_thue = loi_nhuan_gop # Simplified (No financial revenue/expense, no overhead in this model)
        
        b02_data = [
            {"Mã số": "01", "Chỉ tiêu": "Doanh thu bán hàng và cung cấp dịch vụ", "Năm nay": doanh_thu_thuan},
            {"Mã số": "10", "Chỉ tiêu": "Doanh thu thuần", "Năm nay": doanh_thu_thuan},
            {"Mã số": "11", "Chỉ tiêu": "Giá vốn hàng bán", "Năm nay": gia_von},
            {"Mã số": "20", "Chỉ tiêu": "Lợi nhuận gộp", "Năm nay": loi_nhuan_gop},
            {"Mã số": "50", "Chỉ tiêu": "Tổng lợi nhuận kế toán trước thuế", "Năm nay": ln_truoc_thue},
            {"Mã số": "51", "Chỉ tiêu": "Chi phí thuế TNDN hiện hành", "Năm nay": max(0, ln_truoc_thue * 0.2)}, # 20% if profit
            {"Mã số": "60", "Chỉ tiêu": "Lợi nhuận sau thuế", "Năm nay": ln_truoc_thue - max(0, ln_truoc_thue * 0.2)}
        ]
        df_b02 = pd.DataFrame(b02_data)

        # 4. Tờ khai thuế GTGT
        f.write("Bước 3: Lập Tờ Khai Thuế GTGT...\n")
        total_vat_in = df_1331["Số tiền"].sum()
        total_purchases_untaxed = df_1561[df_1561["Chứng từ"].str.startswith("PN_")]["Số tiền"].sum()
        
        total_vat_out = df_3331["Số tiền"].sum()
        total_sales_untaxed = df_511["Số tiền"].sum()
        
        gtgt_data = [
            {"Chỉ tiêu": "[23] Giá trị Hàng hóa, dịch vụ mua vào", "Số liệu": total_purchases_untaxed},
            {"Chỉ tiêu": "[24] Thuế GTGT Hàng hóa, dịch vụ mua vào", "Số liệu": total_vat_in},
            {"Chỉ tiêu": "[25] Thuế GTGT được khấu trừ kỳ này", "Số liệu": total_vat_in},
            {"Chỉ tiêu": "[32] Hàng hóa dịch vụ bán ra chịu thuế 10%", "Số liệu": total_sales_untaxed},
            {"Chỉ tiêu": "[33] Thuế GTGT Hàng hóa, dịch vụ bán ra chịu thuế 10%", "Số liệu": total_vat_out},
            {"Chỉ tiêu": "[36] Tổng thuế GTGT đầu ra phát sinh kỳ này", "Số liệu": total_vat_out},
            {"Chỉ tiêu": "[40] Thuế GTGT còn phải nộp trong kỳ", "Số liệu": max(0, total_vat_out - total_vat_in)},
            {"Chỉ tiêu": "[43] Thuế GTGT còn được khấu trừ chuyển kỳ sau", "Số liệu": max(0, total_vat_in - total_vat_out)}
        ]
        df_gtgt = pd.DataFrame(gtgt_data)

        # 5. Quyết toán TNDN (03/TNDN)
        f.write("Bước 4: Quyết toán Thuế TNDN (03/TNDN)...\n")
        tndn_data = [
            {"Chỉ tiêu": "A1 - Tổng lợi nhuận kế toán trước thuế TN DOANH NGHIỆP", "Số liệu": ln_truoc_thue},
            {"Chỉ tiêu": "B - Điều chỉnh tăng/giảm Lợi nhuận", "Số liệu": 0},
            {"Chỉ tiêu": "C4 - Thu nhập tính thuế", "Số liệu": max(0, ln_truoc_thue)},
            {"Chỉ tiêu": "C7 - Thuế TNDN từ hoạt động SXKD (20%)", "Số liệu": max(0, ln_truoc_thue * 0.2)},
            {"Chỉ tiêu": "G - Thuế TNDN còn phải nộp", "Số liệu": max(0, ln_truoc_thue * 0.2)}
        ]
        df_tndn = pd.DataFrame(tndn_data)

        # 6. Cross-Check Verification
        f.write("Bước 5: Cross-check đối soát số liệu hệ thống...\n")
        check_doanhthu = (total_sales_untaxed == doanh_thu_thuan)
        
        # TK 1561 Mua vào (is Nợ) and XNT Mua Vào
        sum_1561_ps_no = get_cdps_val("1561", "Phát sinh Nợ") # Typo in general code might be considered, use exact sum
        # Re-calc manually
        sum_1561_no = df_cdps[df_cdps["Tài khoản"].astype(str) == "1561"]["Phát sinh Nợ"].sum()
        check_muavao = (sum_1561_no == total_purchases_untaxed)
        check_giavon = (gia_von == get_cdps_val("632", "Phát sinh Nợ"))
        
        cross_check_data = [
            {"Hạng mục": "Doanh thu (TK 511 vs Tờ khai GTGT [32])", "Trạng thái": "Hợp lệ" if check_doanhthu else "Lệch", "Chênh lệch": total_sales_untaxed - doanh_thu_thuan},
            {"Hạng mục": "Mua vào (NKC/TK 1561 vs Tờ khai GTGT [23])", "Trạng thái": "Hợp lệ" if check_muavao else "Lệch", "Chênh lệch": sum_1561_no - total_purchases_untaxed},
            {"Hạng mục": "Giá vốn hàng bán (KQKD vs TK 632)", "Trạng thái": "Hợp lệ" if check_giavon else "Lệch", "Chênh lệch": gia_von - get_cdps_val("632", "Phát sinh Nợ")}
        ]
        df_cross_check = pd.DataFrame(cross_check_data)
        
        # Write Output
        f.write(f"Đang ghi file báo cáo khai thuế cuối cùng tại: {output_tax}\n")
        with pd.ExcelWriter(output_tax, engine='openpyxl') as writer:
            df_b01_assets.to_excel(writer, sheet_name="B01_TaiSan", index=False)
            df_b01_liab.to_excel(writer, sheet_name="B01_NguonVon", index=False)
            df_b02.to_excel(writer, sheet_name="B02_KQKD", index=False)
            df_gtgt.to_excel(writer, sheet_name="To_khai_GTGT", index=False)
            df_tndn.to_excel(writer, sheet_name="Quyet_toan_TNDN", index=False)
            df_cross_check.to_excel(writer, sheet_name="Cross_Check", index=False)
            
        f.write("HOÀN TẤT XUẤT HỒ SƠ QUYẾT TOÁN THUẾ 2023!\n")
        print(f"Created Tax Report: {output_tax}")

if __name__ == "__main__":
    build_tax_report()
