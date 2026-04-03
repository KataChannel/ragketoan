import pandas as pd
import os

def extract_all_ops():
    src = '/chikiet/kata2025/ragketoan/docs/huyvu/sosach/nam2023/Candieuchinh_SO_CHI_TIET_HUYVU_2023_FINAL.xlsx'
    xl = pd.ExcelFile(src)
    op_map = {}
    
    for s in xl.sheet_names:
        df = pd.read_excel(xl, s)
        op_row = df[df['Diễn giải'].astype(str).str.contains('SỐ DƯ ĐẦU KỲ', na=False, case=False)]
        if not op_row.empty:
            dr = op_row.iloc[0].get('Phát sinh Nợ', 0)
            cr = op_row.iloc[0].get('Phát sinh Có', 0)
            op_map[s] = (int(dr), int(cr))
        else:
            dr = df.iloc[0].get('Phát sinh Nợ', 0)
            cr = df.iloc[0].get('Phát sinh Có', 0)
            op_map[s] = (int(dr), int(cr))
            
    import json
    print(json.dumps(op_map, indent=2))

if __name__ == "__main__":
    extract_all_ops()
