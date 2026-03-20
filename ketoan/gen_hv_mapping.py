import json
import re

with open('/tmp/hv_tonghop_items.json', 'r') as f:
    items = json.load(f)

mappings = []

def generate_mapped_data(idx, ten_goc):
    ten_goc_upper = ten_goc.upper()
    ma_hang = "-"
    ten_chuan = "-"
    
    # Logic nhóm Máy Tính (Laptop/Tablet/PC)
    if any(keyword in ten_goc_upper for keyword in ["LAPTOP", "MÁY TÍNH XÁCH TAY"]):
        ma_hang = "LT-AI"
        ten_chuan = "Laptop"
        if "DELL" in ten_goc_upper: 
            ten_chuan = "Laptop Dell"
            ma_hang = "LT-DELL"
        elif "HP" in ten_goc_upper: 
            ten_chuan = "Laptop HP"
            ma_hang = "LT-HP"
        elif "ASUS" in ten_goc_upper: 
            ten_chuan = "Laptop ASUS"
            ma_hang = "LT-ASUS"
        elif "LENOVO" in ten_goc_upper: 
            ten_chuan = "Laptop Lenovo"
            ma_hang = "LT-LNV"
        elif "MACBOOK" in ten_goc_upper or "APPLE" in ten_goc_upper:
            ten_chuan = "Apple MacBook"
            ma_hang = "LT-MAC"
            
    elif "MÁY VI TÍNH" in ten_goc_upper or "BỘ MÁY" in ten_goc_upper or "DESKTOP" in ten_goc_upper:
        ma_hang = "PC-AI"
        ten_chuan = "Bộ máy vi tính để bàn"

    # Logic nhóm Máy In / Linh kiện in
    elif "MÁY IN" in ten_goc_upper:
        ma_hang = "PR-AI"
        ten_chuan = "Máy in"
        if "CANON" in ten_goc_upper:
            ten_chuan = "Máy in Canon"
            ma_hang = "PR-CANON"
        elif "BROTHER" in ten_goc_upper:
            ten_chuan = "Máy in Brother"
            ma_hang = "PR-BRT"
        elif "EPSON" in ten_goc_upper:
            ten_chuan = "Máy in Epson"
            ma_hang = "PR-EPSON"
            
    elif "MỰC" in ten_goc_upper or "CATRIDGE" in ten_goc_upper or "CARTRIDGE" in ten_goc_upper:
        ma_hang = "INK-AI"
        ten_chuan = "Mực in / Hộp mực"
        if "CANON" in ten_goc_upper:
            ten_chuan = "Mực in Canon"
            ma_hang = "INK-CANON"
        elif "BROTHER" in ten_goc_upper:
            ten_chuan = "Mực in Brother"
            ma_hang = "INK-BRT"
        elif "EPSON" in ten_goc_upper:
            ten_chuan = "Mực in Epson"
            ma_hang = "INK-EPSON"

    # Logic nhóm Linh kiện
    elif "SSD" in ten_goc_upper or "Ổ CỨNG" in ten_goc_upper or "HDD" in ten_goc_upper:
        ma_hang = "SSD-AI"
        ten_chuan = "Ổ cứng"
    elif "RAM" in ten_goc_upper or "BỘ NHỚ TRONG" in ten_goc_upper:
        ma_hang = "RAM-AI"
        ten_chuan = "Bộ nhớ RAM"
    elif "CHUỘT" in ten_goc_upper or "MOUSE" in ten_goc_upper:
        ma_hang = "MOUSE-AI"
        ten_chuan = "Chuột máy tính"
        if "LOGITECH" in ten_goc_upper: ma_hang = "MOUSE-LOGI"; ten_chuan = "Chuột máy tính Logitech"
        elif "RAPOO" in ten_goc_upper: ma_hang = "MOUSE-RAPOO"; ten_chuan = "Chuột máy tính Rapoo"
    elif "BÀN PHÍM" in ten_goc_upper or "KEYBOARD" in ten_goc_upper:
        ma_hang = "KB-AI"
        ten_chuan = "Bàn phím máy tính"
    elif "MÀN HÌNH" in ten_goc_upper or "MONITOR" in ten_goc_upper or "DISPLAY" in ten_goc_upper:
        ma_hang = "MON-AI"
        ten_chuan = "Màn hình máy tính"
        if "DELL" in ten_goc_upper: ma_hang = "MON-DELL"; ten_chuan = "Màn hình máy tính Dell"
        elif "SAMSUNG" in ten_goc_upper: ma_hang = "MON-SAM"; ten_chuan = "Màn hình máy tính Samsung"
        elif "VIEWSONIC" in ten_goc_upper: ma_hang = "MON-VIEW"; ten_chuan = "Màn hình máy tính ViewSonic"
    elif "USB" in ten_goc_upper or "BỘ NHỚ NGOÀI" in ten_goc_upper:
        ma_hang = "USB-AI"
        ten_chuan = "Bộ nhớ ngoài USB"
        
    # Logic Thiết bị văn phòng khác
    elif "CAMERA" in ten_goc_upper:
        ma_hang = "CAM-AI"
        ten_chuan = "Camera quan sát"
    elif "WEBCAM" in ten_goc_upper or "GHÌNH" in ten_goc_upper or "TRUYỀN HÌNH ẢNH" in ten_goc_upper:
        ma_hang = "CAM-WCAM"
        ten_chuan = "Webcam máy tính"
    elif "NGUỒN" in ten_goc_upper or "POWER" in ten_goc_upper:
        ma_hang = "PSU-AI"
        ten_chuan = "Nguồn máy tính"
    elif "MAINBOARD" in ten_goc_upper or "BO MẠCH CHỦ" in ten_goc_upper or "BẢNG MẠCH CHÍNH" in ten_goc_upper:
        ma_hang = "MAIN-AI"
        ten_chuan = "Bo mạch chủ"
    elif "CHÍP VI XỬ LÝ" in ten_goc_upper or "BỘ VI XỬ LÝ" in ten_goc_upper or "PROCESSOR" in ten_goc_upper:
        ma_hang = "CPU-AI"
        ten_chuan = "Bộ vi xử lý (CPU)"
    elif "CÁP" in ten_goc_upper and ("DỮ LIỆU" in ten_goc_upper or "TÍN HIỆU" in ten_goc_upper or "HDMI" in ten_goc_upper):
        ma_hang = "CBL-AI"
        ten_chuan = "Cáp tín hiệu"
    elif "LOA" in ten_goc_upper or "SPEAKER" in ten_goc_upper:
        ma_hang = "SPK-AI"
        ten_chuan = "Loa vi tính"
    elif "TAI NGHE" in ten_goc_upper or "HEADPHONE" in ten_goc_upper:
        ma_hang = "HP-AI"
        ten_chuan = "Tai nghe vi tính"
    elif "BẢO MẬT" in ten_goc_upper or "PHẦN MỀM" in ten_goc_upper or "SOFTWARE" in ten_goc_upper or "KASPERSKY" in ten_goc_upper or "BẢN QUYỀN" in ten_goc_upper:
        ma_hang = "SW-AI"
        ten_chuan = "Bản quyền phần mềm"
    elif "BỘ LƯU ĐIỆN" in ten_goc_upper or "UPS" in ten_goc_upper:
        ma_hang = "UPS-AI"
        ten_chuan = "Bộ lưu điện (UPS)"
    elif "MÁY CHIẾU" in ten_goc_upper or "PROJECTOR" in ten_goc_upper:
        ma_hang = "PRJ-AI"
        ten_chuan = "Máy chiếu"
    elif "MÀN CHIẾU" in ten_goc_upper:
        ma_hang = "SCR-PRJ"
        ten_chuan = "Màn chiếu"
    elif "MÁY QUÉT" in ten_goc_upper or "MÁY ĐỌC MÃ" in ten_goc_upper or "MÁY CHẤM CÔNG" in ten_goc_upper or "MÁY IN HÓA ĐƠN" in ten_goc_upper:
        ma_hang = "OFFICE-EQ"
        ten_chuan = "Thiết bị văn phòng (Quyét mã/Chấm công/In bills)"
        
    # Logic nhóm Thiết bị Mạng
    elif "ROUTER" in ten_goc_upper or "BỘ ĐỊNH TUYẾN" in ten_goc_upper or "THIẾT BỊ ĐỊNH TUYẾN" in ten_goc_upper:
        ma_hang = "NW-ROUT"
        ten_chuan = "Thiết bị định tuyến (Router)"
    elif "SWITCH" in ten_goc_upper or "CHUYỂN MẠCH" in ten_goc_upper:
        ma_hang = "NW-SW"
        ten_chuan = "Thiết bị chuyển mạch (Switch)"
    elif "WIFI" in ten_goc_upper or "THU PHÁT" in ten_goc_upper or "BỘ CHUYỂN ĐỔI" in ten_goc_upper:
        ma_hang = "NW-WIFI"
        ten_chuan = "Thiết bị Wifi/Chuyển đổi"
    elif "CÁP MẠNG" in ten_goc_upper:
        ma_hang = "NW-CBL"
        ten_chuan = "Cáp mạng"
        
    # Logic nhóm Dịch Vụ
    elif "BẢO TRÌ" in ten_goc_upper or "CÀI ĐẶT" in ten_goc_upper or "DỊCH VỤ" in ten_goc_upper or "THI CÔNG" in ten_goc_upper or "SỬA CHỮA" in ten_goc_upper or "THIẾT KẾ" in ten_goc_upper:
        ma_hang = "SV-IT"
        ten_chuan = "Dịch vụ IT / Bảo trì"
    elif "PHÍ" in ten_goc_upper or "CƯỚC" in ten_goc_upper or "DỊCH VỤ NGÂN HÀNG" in ten_goc_upper:
        ma_hang = "FEE-AI"
        ten_chuan = "Phí dịch vụ"
    elif "CHIẾT KHẤU" in ten_goc_upper or "GIẢM GIÁ" in ten_goc_upper:
        ma_hang = "DISC-AI"
        ten_chuan = "Chiết khấu thương mại"
    elif "KHUYẾN" in ten_goc_upper or "HÀNG TẶNG" in ten_goc_upper:
        ma_hang = "GIFT-AI"
        ten_chuan = "Hàng khuyến mãi"
    elif "LÃI" in ten_goc_upper and "VAY" in ten_goc_upper:
        ma_hang = "FIN-AI"
        ten_chuan = "Lãi ngân hàng/Lãi vay"
    elif "THANH TOÁN" in ten_goc_upper:
        ma_hang = "PAY-AI"
        ten_chuan = "Thanh toán giao dịch"
        
    # Mặc định
    else:
        # Nhóm đồ phụ kiện lặt vặt (vỏ máy, ốc vít, ...)
        words = [w for w in ten_goc_upper.replace('-',' ').split() if len(w) > 0]
        if len(words) >= 2:
            ma_hang = f"IT-{words[0][:2]}{words[1][:2]}-{idx}"
        else:
            ma_hang = f"IT-GEN-{idx}"
        ten_chuan = ten_goc.replace('\n', ' ').strip()
        
    return {
        'stt': idx,
        'maHang': ma_hang,
        'tenChuan': ten_chuan,
        'tenGoc': ten_goc.replace('\n', ' ').strip()
    }


# Write back
out = []
for idx, item in enumerate(items, 1):
    ten_goc = item['tenGoc']
    if not isinstance(ten_goc, str):
        ten_goc = str(ten_goc)
    mappings.append(generate_mapped_data(idx, ten_goc))

out.append(f"# Bảng Đối Chiếu Mã Hàng 2024 vs Tên Hàng 2023 - CÔNG TY TNHH HUY VŨ ({len(mappings)} Mặt Hàng)")
out.append("")
out.append("| STT | Mã Hàng (2024) | Tên Hàng Khớp (2024) | Tên Hàng Khớp (2023) |")
out.append("| :--- | :--- | :--- | :--- |")

for map_data in mappings:
    out.append(f"| {map_data['stt']} | {map_data['maHang']} | {map_data['tenChuan']} | {map_data['tenGoc']} |")

out.append("")
out.append(f"*Bảng mapping này được tạo tự động bởi **Antigravity AI Agent** bao gồm toàn bộ {len(mappings)} mặt hàng, dựa trên thực tế phát sinh (loại trừ các tên gọi chỉ xuất hiện 1 lần đề phòng lỗi gõ văn bản) từ các hóa đơn của cty Huy Vũ. File dùng làm cơ sở cấu hình từ điển đồng nghĩa (Synonyms) cho quy trình RAG.*")

with open('/mnt/chikiet/kata2025/ragketoan/docs/huyvu/dulieuchuan/mapping_items.md', 'w') as f:
    f.write('\n'.join(out))
