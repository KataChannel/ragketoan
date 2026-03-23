import re
import os

MD_PATH = "/chikiet/kata2025/ragketoan/docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

groups = []
kw_mapping = {}

# Regex to match STT like 1.1, 10.1 or just 1
stt_regex = re.compile(r'^\d+(\.\d+)?$')

if not os.path.exists(MD_PATH):
    print(f"Error: {MD_PATH} not found.")
else:
    with open(MD_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("|") and len(line.split("|")) >= 5:
                # Example: | 1.1 | **PC-DELL-LAT** | Laptop DELL Latitude Series | dell latitude, latitude 3420, 3520, 5420 |
                parts = [p.strip() for p in line.split("|")]
                if len(parts) < 5: continue
                stt_str = parts[1]
                # Match 1.1, 1, 12.1
                if stt_regex.match(stt_str):
                    code = parts[2].replace('**', '').strip()
                    name = parts[3].strip()
                    aliases_raw = parts[4].strip()
                    aliases = [a.strip().lower() for a in aliases_raw.split(',') if a.strip()]
                    groups.append({"code": code, "name": name, "aliases": aliases})
                    kw_mapping[code] = aliases

    print(f"Total groups found: {len(groups)}")
    for g in groups[:5]:
        print(f"{g['code']}: {g['name']} ({len(g['aliases'])} aliases)")
    print("...")
    for g in groups[-5:]:
        print(f"{g['code']}: {g['name']} ({len(g['aliases'])} aliases)")
