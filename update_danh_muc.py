import re
import os

MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

kw_mapping = {
    "PC-026": ["dell", "inspiron", "vostro", "latitude", "xps"],
    "PC-020": ["asus", "vivobook", "zenbook", "expertbook"],
    "PC-040": ["lenovo", "thinkpad", "ideapad", "v14", "v15"],
    "PC-047": ["msi", "modern", "prestige"],
    "PC-057": ["pc", "máy tính", "desktop", "laptop", "workstation", "bộ máy"],
    "IT-001": ["màn hình", "tivi", "lcd", "monitor", "display", "samsung", "dell", "lg", "viewsonic"],
    "VP-009": ["canon", "lbp", "imageclass", "pixma"],
    "VP-006": ["brother", "hl-l", "dcp", "mfc"],
    "IT-003": ["máy quét", "scanner", "scanjet", "fujitsu", "hp scan", "máy đọc mã vạch", "máy đọc", "scan", "bar code", "đầu đọc mã vạch", "od7200"],
    "VP-001": ["12a", "canon 303", "fx9"],
    "VP-003": ["35a", "85a", "78a"],
    "VP-043": ["tn-2385", "tnb027", "tn-1010", "tn-2280", "mực brother"],
    "VP-036": ["mực nước", "mực màu", "mực in epson", "gi-71", "003"],
    "VP-049": ["máy in", "văn phòng phẩm", "giấy in", "mực", "cartridge", "hộp mực", "ru lô", "photo", "chíp m", "bộ cò", "máy đếm tiền", "đếm tiền", "chấm công", "màn chiếu", "giá treo", "projector", "máy chiếu", "máy hủy", "drum", "trống in", "su adf", "cò sấy"],
    "VP-050": ["ghế", "bàn", "tủ", "kệ mica", "nội thất", "giường", "đệm"],
    "OTH-061": ["intel", "core i3", "core i5", "core i7", "i9", "xeon", "pentium", "cpu"],
    "OTH-054": ["mainboard", "bo mạch chủ", "h61", "h510", "b660", "b760", "asus main", "msi main"],
    "OTH-063": ["ram", "ddr4", "ddr5", "kingston", "hx", "lexar", "bộ nhớ"],
    "LNK-010": ["ssd", "hdd", "ổ cứng", "ổ đĩa", "western", "seagate", "m.2", "nvme"],
    "OTH-037": ["card đồ họa", "vga", "rtx", "gtx", "quadro", "rx "],
    "OTH-022": ["thẻ nhớ", "usb", "flash", "sandisk", "pen drive"],
    "LNK-020": ["vỏ máy", "case", "psu", "bộ nguồn", "nguồn máy tính", "jetek", "adapter", "sạc"],
    "PC-069": ["tản nhiệt", "cooler master", "fan", "quạt", "aio"],
    "ACC-001": ["tai nghe", "headphone", "chuột", "bàn phím", "mouse", "keyboard", "logitech", "rapoo", "soundmax", "loa", "balo", "ổ cắm", "pin ", "điện thoại", "micro", "headset", "bút trình chiếu", "presenter", "cliptec", "hub", "bộ chia cổng"],
    "OTH-075": ["ups", "santak", "apc", "maruson", "bộ lưu điện", "lưu điện"],
    "CAM-001": ["camera", "hikvision", "ezviz", "imou", "đầu ghi", "cctv", "quan sát", "kbone", "khóa chốt", "bát dưới"],
    "OTH-013": ["router", "wifi", "mesh", "aruba", "unifi", "tplink", "tp-link", "switch", "tenda", "totolink", "chuyển mạch", "bộ định tuyến", "rg-ew", "cudy"],
    "OTH-007": ["cáp", "hdmi", "vga", "chuyển đổi", "converter", "ugreen"],
    "OTH-073": ["hạt mạng", "rj45", "đầu hạt", "amp", "commscope", "đầu nối"],
    "OTH-085": ["bộ đàm", "kenwood", "motorola", "máy định vị", "gps"],
    "OTH-003": ["họp trực tuyến", "polycom", "webcam", "microphone", "hội nghị"],
    "SW-001": ["windows", "office", "kaspersky", "diệt virus", "license", "bản quyền", "chữ ký số"],
    "OTH-044": ["biên lai", "hóa đơn", "tem", "vé", "ấn chỉ"],
    "FUEL-001": ["xăng", "dầu", "ron95", "ron92", "diesel"],
    "SRV-001": ["thi công", "lắp đặt", "triển khai", "phí dịch vụ", "vệ sinh", "bảo trì", "cài đặt", "công sửa"],
    "OTH-010": ["sms", "tin nhắn", "brandname"],
    "SRV-003": ["cước vận chuyển", "phí ship", "viettel post", "chuyển phát"],
    "FIN-001": ["phí ngân hàng", "lãi vay", "phí duy trì"],
    "OTH-045": ["chiết khấu", "giảm giá", "khuyến mại"],
    "PC-004": ["12100"],
    "PC-006": ["13100"],
    "PC-007": ["13400"],
}

# Mapping custom titles for specific codes in the TAX report
custom_titles = {
    "VP-049": "Vật tư in ấn, Máy hủy tài liệu & Linh kiện thay thế",
    "ACC-001": "Phụ kiện, Bút trình chiếu & Điện thoại bàn",
    "OTH-085": "Thiết bị Liên lạc & Định vị (Bộ đàm, GPS)",
    "CAM-001": "Camera quan sát & Hệ thống Kiểm soát an ninh",
}

def get_aliases_for_code(code, name):
    name_low = name.lower()
    clean_code = code.replace("*", "").strip()
    aliases = []
    
    if clean_code in kw_mapping:
        aliases.extend(kw_mapping[clean_code])
        
    # Extra logic: extract model from name if common suffix pattern
    parts = name.split(' - ')
    if len(parts) > 1:
        model = parts[-1].strip()
        if 'khác' not in model.lower() and 'tổng hợp' not in model.lower() and 'chưa phân loại' not in model.lower():
            if model.lower() not in [a.lower() for a in aliases]:
                aliases.insert(0, model)
                
    return ", ".join(aliases)

if not os.path.exists(MD_PATH):
    print(f"Error: {MD_PATH} not found.")
    exit(1)

with open(MD_PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith("|") and ("STT" in stripped or "Mã Nhóm" in stripped) and "Alias" in stripped:
        new_lines.append("| STT | Mã Nhóm | Tên Nhóm Sản Phẩm (Hạch toán Thuế) | Từ khóa tương đồng (Alias) |")
    elif stripped.startswith("|:---:|:---") or stripped.startswith("|:---|:---"):
        new_lines.append("|:---:|:--------|:-----------------------------------|:---------------------------|")
    elif stripped.startswith("|") and len(stripped.split("|")) >= 4:
        parts = [p.strip() for p in stripped.split("|")]
        # Check if it's a data row (STT is numeric)
        if parts[1].isdigit():
            stt = parts[1]
            code = parts[2].replace("*", "").strip()
            name = parts[3]
            # Use custom title if defined to reflect the 10 representative items
            display_name = custom_titles.get(code, name)
            aliases_str = get_aliases_for_code(code, name)
            new_lines.append(f"| {stt} | **{code}** | {display_name} | {aliases_str} |")
        else:
            new_lines.append(line.rstrip())
    else:
        new_lines.append(line.rstrip())

with open(MD_PATH, "w", encoding="utf-8") as f:
    for nl in new_lines:
        f.write(nl + "\n")

print(f"Done updating {MD_PATH} with representative items (Phones, GPS, Shredders, etc.)")
