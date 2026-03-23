import re

MD_PATH = "docs/huyvu/DANH_MUC_NHOM_SAN_PHAM.md"

kw_mapping = {
    "OTH-002": ["workstation", "trạm làm việc"],
    "OTH-003": ["hội nghị", "điểm cầu", "phòng họp", "polycom", "webcam logitech c", "hội truyền hình"],
    "OTH-004": ["cước", "truyền dẫn", "kênh thuê riêng"],
    "OTH-005": ["chuyển phát", "viettel post", "logistics", "vận chuyển", "ems"],
    "OTH-006": ["sim", "cước di động", "vinaphone", "mobifone", "viettel"],
    "OTH-007": ["cáp mạng", "cáp hdmi", "cáp vga", "cáp chuyển", "chuyển đổi", "converter", "hdmi", "vga"],
    "OTH-010": ["sms", "tin nhắn", "brandname"],
    "OTH-012": ["cisco", "băng thông rộng"],
    "OTH-013": ["mesh", "router", "wifi", "aruba", "unifi", "tplink", "ubiquiti", "phát wifi"],
    "OTH-022": ["thẻ nhớ", "usb", "flash", "sandisk", "kingston 32gb", "pen drive"],
    "OTH-027": ["kìm", "tua vít", "băng dính", "ốc vít", "bảo trì", "cơ điện"],
    "OTH-034": ["nas", "synology", "qnap", "hdd nas", "lưu trữ mạng"],
    "OTH-037": ["card đồ họa", "vga", "rtx", "gtx", "quadro", "rx "],
    "OTH-044": ["biên lai", "ấn chỉ", "hóa đơn", "tem", "vé"],
    "OTH-045": ["chiết khấu", "giảm giá", "khuyến mại"],
    "OTH-054": ["mainboard", "bo mạch chủ", "socket", "h61", "h81", "h110", "h310", "h410", "h510", "b365", "b460", "b660", "b760"],
    "OTH-061": ["intel", "core i3", "core i5", "core i7", "xeon", "pentium"],
    "OTH-063": ["kingston", "ram kingston", "ssd kingston"],
    "OTH-064": ["pabx", "tổng đài", "điện thoại bàn", "panasonic", "grandstream", "yealink"],
    "OTH-065": ["máy chiếu", "projector", "epson", "sony", "panasonic", "viewsonic"],
    "OTH-067": ["máy đếm tiền", "xiudun", "xinda", "kiểm định"],
    "OTH-073": ["hạt mạng", "rj45", "đầu hạt", "amp", "commscope", "đầu nối"],
    "OTH-075": ["ups", "santak", "bộ lưu điện", "apc", "maruson"],
    "OTH-077": ["tenda"],
    "OTH-083": ["chấm công", "ronald jack", "zkteco", "kiểm soát vào ra", "thẻ từ", "nhận diện khuôn mặt"],
    "PC-064": ["g102"],
    "PC-065": ["jetek"],
    "PC-067": ["logitech", "chuột logitech", "bàn phím logitech", "webcam logitech", "chuột quang logitech"],
    "PC-068": ["tuf"],
    "PC-069": ["tản nhiệt", "cooler master", "fan", "quat", "tảng nhiệt", "aio"],
    "VP-036": ["mực nước", "mực màu", "mực in epson"],
}

# General logic mappings
def get_aliases_for_code(code, name):
    name_low = name.lower()
    
    aliases = []
    
    if code in kw_mapping:
        aliases.extend(kw_mapping[code])
        
    parts = name.split(' - ')
    if len(parts) > 1:
        model = parts[-1].strip()
        if 'khác' not in model.lower() and 'tổng hợp' not in model.lower() and 'chưa phân loại' not in model.lower():
            if model.lower() not in [a.lower() for a in aliases]:
                aliases.insert(0, model)
                
    if not aliases:
        if 'máy tính (pc/laptop) - khác' in name_low:
            aliases.extend(["pc", "máy tính", "laptop", "màn hình", "cpu", "main", "ram", "vga", "ssd", "ổ cứng", "bo mạch", "desktop"])
        elif 'thiết bị văn phòng - khác' in name_low:
            aliases.extend(["máy in", "mực", "chuột", "bàn phím", "văn phòng", "máy photo", "giấy", "bút", "kẹp", "bìa", "băng dính"])
        elif 'ghi hình & hội nghị' in name_low or 'camera' in name_low:
            aliases.extend(["cam", "đầu ghi", "hikvision", "kbone", "imou", "ezviz", "camera"])
        elif 'dịch vụ & thi công - tổng hợp' in name_low:
            aliases.extend(["thi công", "dịch vụ", "cước", "lệ phí", "thu hộ"])
            
    return ", ".join(aliases)

with open(MD_PATH, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    stripped = line.strip()
    if stripped.startswith("|") and "STT" in stripped and "Mã Nhóm" in stripped:
        new_lines.append("| STT | Mã Nhóm (Đại diện) | Tên Nhóm Sản Phẩm | Từ khóa tương đồng (Alias) |")
    elif stripped.startswith("|:---:|:---") or stripped.startswith("|---"):
        new_lines.append("|:---:|:-------------------|:-------------------|:---------------------------|")
    elif stripped.startswith("|") and len(stripped.split("|")) >= 4:
        parts = [p.strip() for p in stripped.split("|")]
        stt_str = parts[1]
        
        if stt_str.isdigit():
            stt = stt_str
            code = parts[2]
            name = parts[3]
            aliases_str = get_aliases_for_code(code, name)
            new_lines.append(f"| {stt} | {code} | {name} | {aliases_str} |")
        else:
            new_lines.append(line.rstrip())
    else:
        new_lines.append(line.rstrip())

with open(MD_PATH, "w", encoding="utf-8") as f:
    for nl in new_lines:
        f.write(nl + "\n")

print("Done updating DANH_MUC_NHOM_SAN_PHAM.md")
