import pandas as pd
import os
import glob

def combine_csv_to_excel():
    input_dir = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/ALL_LEDGERS_2023_CSV"
    output_excel = "/chikiet/kata2025/ragketoan/docs/huyvu/sosach/SAO_KE_TONG_HOP_SO_CHI_TIET_2023.xlsx"
    
    print(f"Combining CSVs from {input_dir} into {output_excel}...")
    
    # Priority order for sheets
    priority_accs = ['1111', '1121', '131', '331', '1561', '511', '632', '642', 'NKC_CORRECTED']
    
    with pd.ExcelWriter(output_excel, engine='xlsxwriter') as writer:
        # First process priority accounts
        for acc in priority_accs:
            file_pattern = f"CT_{acc}_2023.csv" if acc != 'NKC_CORRECTED' else "NKC_CORRECTED_2023.csv"
            file_path = os.path.join(input_dir, file_pattern)
            
            if os.path.exists(file_path):
                print(f"Adding sheet: {acc}")
                df = pd.read_csv(file_path)
                # Limit NKC size if it's too big, but for 10k rows it should be fine
                df.to_excel(writer, sheet_name=acc[:31], index=False)
    
    print("Excel creation COMPLETE!")

if __name__ == "__main__":
    combine_csv_to_excel()
