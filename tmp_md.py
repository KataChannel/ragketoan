thue = [
    1154981164, 1745704064, 1536437738, 757550609, 600350985, 749561478,
    895409563, 1812197507, 1552056812, 890284926, 1564643572, 2381764450
]
db = [
    1197616856, 1897175108, 1591439738, 800189817, 622106763, 799536710,
    931286129, 1962390092, 1584093149, 939632323, 1609036005, 2616103198
]

total_thue = sum(thue)
total_db = sum(db)
total_chenh = total_db - total_thue

lines = []
for i in range(12):
    chenh = db[i] - thue[i]
    lines.append(f"| 2023-{i+1:02d} | {db[i]:,.0f} | {thue[i]:,.0f} | +{chenh:,.0f} | Lệch do hđ Bank & Ngoài lề |")

lines.append(f"| **TỔNG** | **{total_db:,.0f}** | **{total_thue:,.0f}** | **+{total_chenh:,.0f}** | Tổng lệch ~{total_chenh/1e9:.2f} Tỷ (Phí NH + Hàng ngoài lề) |")

print("\n".join(lines))
