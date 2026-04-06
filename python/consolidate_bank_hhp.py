import pandas as pd
import glob
import os
from datetime import datetime

# ============================================================
# CONFIGURATION
# ============================================================
BANK_DIR = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/SAO KÊ NH NĂ 2023"
OUTPUT_PATH = "/chikiet/kata2025/ragketoan/docs/hoang-huy-phat/sosach2023/SAO_KE_TONG_HOP_HHP_2023.xlsx"
YEAR = 2023

def consolidate_bank_statements_v2():
    print(f"🚀 Starting consolidation V2 from: {BANK_DIR}")
    all_rows = []
    files = sorted(glob.glob(os.path.join(BANK_DIR, "*.xls*")))
    
    for f in files:
        filename = os.path.basename(f)
        print(f"  - Processing: {filename}")
        try:
            df_raw = pd.read_excel(f, header=None)
            
            header_row = -1
            for i, row in df_raw.iterrows():
                row_str = " ".join([str(x).upper() for x in row.values if not pd.isna(x)])
                if 'STT' in row_str and 'NGÀY' in row_str:
                    header_row = i
                    break
            
            if header_row == -1: header_row = 10
            
            df = pd.read_excel(f, skiprows=header_row)
            
            # Bidv pattern: Date(3), SH(5), Desc(6), Obj(12), Thu(16), Chi(17)
            # Vay patterns: Similar but checking actual content
            date_col, sh_col, desc_col, obj_col, thu_col, chi_col = 3, 5, 6, 12, 16, 17
            
            # Auto-detect by keywords in the first data row if needed
            # But let's refine based on the peek result
            
            for _, row in df.iterrows():
                try:
                    def get_val(idx):
                        if idx < len(row):
                            v = row.iloc[idx]
                            return "" if pd.isna(v) or str(v).lower() == 'nan' else str(v).strip()
                        return ""

                    dt_val = row.iloc[date_col] if date_col < len(row) else None
                    dt = pd.to_datetime(dt_val, errors='coerce')
                    if pd.isna(dt) or dt.year != YEAR:
                        continue
                    
                    def clean_numeric(idx):
                        if idx < len(row):
                            v = row.iloc[idx]
                            if pd.isna(v) or str(v).lower() == 'nan': return 0.0
                            return float(str(v).replace(',', '').replace(' ', ''))
                        return 0.0
                    
                    thu = clean_numeric(thu_col)
                    chi = clean_numeric(chi_col)
                    
                    if thu == 0 and chi == 0: continue
                        
                    all_rows.append({
                        'Ngày': dt,
                        'Số chứng từ': get_val(sh_col),
                        'Diễn giải': get_val(desc_col),
                        'Đối tượng': get_val(obj_col),
                        'Số tiền Thu': thu,
                        'Số tiền Chi': chi,
                        'Tên Ngân hàng / File gốc': filename
                    })
                except Exception:
                    continue
        except Exception as e:
            print(f"    ❌ Error: {e}")

    if all_rows:
        df_final = pd.DataFrame(all_rows)
        df_final = df_final.sort_values(by=['Ngày', 'Tên Ngân hàng / File gốc'])
        with pd.ExcelWriter(OUTPUT_PATH, engine='openpyxl') as writer:
            df_final.to_excel(writer, sheet_name='Tổng hợp Sao kê 2023', index=False)
            df_final.groupby('Tên Ngân hàng / File gốc').agg({
                'Số tiền Thu': 'sum', 'Số tiền Chi': 'sum', 'Ngày': 'count'
            }).rename(columns={'Ngày': 'Số lượng giao dịch'}).to_excel(writer, sheet_name='Báo cáo tóm tắt')
        print(f"✅ Consolidation V2 complete: {OUTPUT_PATH}")
    else:
        print("⚠️ No data found.")

if __name__ == "__main__":
    consolidate_bank_statements_v2()
