import pandas as pd
import json

def get_excel_summary(file_path):
    try:
        # Load the file
        df = pd.read_excel(file_path)
        # Summarize structure
        summary = {
            "columns": df.columns.tolist(),
            "first_5_rows": df.head(5).to_dict(orient='records'),
            "shape": df.shape,
            "all_data": df.to_dict(orient='records') # Small enough probably
        }
        return summary
    except Exception as e:
        return str(e)

files = [
    "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/SL QUYẾT TOÁN 2023 HV.xlsx",
    "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Xuatnhaptonhv2023.xlsx"
]

results = {}
for f in files:
    results[f] = get_excel_summary(f)

# Use a specific output file in the workspace to read back
output_file = "/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/summary_data.json"
with open(output_file, 'w') as f:
    json.dump(results, f, indent=2)

print(f"Summary saved to {output_file}")
