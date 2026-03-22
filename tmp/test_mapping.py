import pandas as pd
import json

def test():
    try:
        mapping = pd.read_csv('/chikiet/kata2025/ragketoan/docs/huyvu/raw_mapping_details.csv')
        # Map FULL STRING to target code
        map_dict = {str(r['hhpItem']).strip(): str(r['maNhom']).strip() for _, r in mapping.iterrows()}
        
        with open('/chikiet/kata2025/ragketoan/tmp/smart_start_stock.json', 'r', encoding='utf-8') as f:
            d = json.load(f)
            
        results_v = {}
        for k, v in d['v'].items():
            key = str(k).strip()
            target_code = map_dict.get(key, 'OTH-084')
            results_v[target_code] = results_v.get(target_code, 0) + v
        
        print(f"Total Sum V: {sum(results_v.values()):,.0f}")
        print(f"Count Groups with Value: {len(results_v)}")
        # Print top 5 groups by value
        top_v = sorted(results_v.items(), key=lambda x: x[1], reverse=True)[:5]
        print(f"Top 5 groups: {top_v}")
    except Exception as e:
        print(f"Error: {e}")

test()
