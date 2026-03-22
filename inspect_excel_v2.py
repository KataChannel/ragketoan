import pandas as pd
import json

files = [
    '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu2023.xlsx',
    '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu2024.xlsx',
    '/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/Huyvu2025.xlsx'
]

results = {}

for f in files:
    xl = pd.ExcelFile(f)
    file_info = {"sheets": xl.sheet_names}
    for sheet in xl.sheet_names:
        df = xl.parse(sheet)
        file_info[sheet] = {
            "columns": list(df.columns),
            "head": df.head(5).to_dict(orient='records')
        }
    results[f] = file_info

with open('/chikiet/kata2025/ragketoan/inspect_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
