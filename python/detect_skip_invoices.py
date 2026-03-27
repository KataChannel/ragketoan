"""
detect_skip_invoices.py - Tự động phát hiện HĐ dịch vụ cần loại khỏi XNT
Dựa vào: tên sản phẩm trong detail + so sánh tổng theo tháng vs mục tiêu kế toán

Usage:
  python3 detect_skip_invoices.py --year 2023 --target-file targets_2023.json
  python3 detect_skip_invoices.py --year 2023 --auto  (tự detect từ DB)
"""
import argparse
import json
import os
import re
import pandas as pd
from sqlalchemy import create_engine, text

DB_URI = os.environ.get("XNT_DB_URI", "postgresql://root:password@localhost:5432/ketoan")
CID = "db88c924-206b-4544-9256-c1cd79d417e4"
SKIP_DIR = "/chikiet/kata2025/ragketoan/python/skip_lists"

# ============================================================
# PHÂN LOẠI HĐ: HÀNG HÓA vs DỊCH VỤ
# ============================================================
# Nhóm 1: Chắc chắn dịch vụ (loại bỏ)
SKIP_PATTERNS = [
    # Phí ngân hàng
    (r'phí\s*(ngân|nh|bank|chuyển|duy\s*trì|sms|giao\s*dịch|tk|tài\s*khoản)', 'PHI_NGAN_HANG'),
    (r'lãi\s*(vay|suất)', 'PHI_NGAN_HANG'),
    # Bảo hiểm
    (r'bảo\s*hiểm|phí\s*bh\b|insurance', 'BAO_HIEM'),
    # Vận chuyển
    (r'vận\s*chuyển|cước\s*vận|ship|giao\s*hàng|freight|phí\s*giao', 'VAN_CHUYEN'),
    # Thuê mặt bằng
    (r'tiền\s*thuê|thuê\s*(mặt\s*bằng|văn\s*phòng|kho|nhà)|rent', 'THUE_MAT_BANG'),
    # Điện nước internet
    (r'tiền\s*(điện|nước|internet|wifi)|hóa\s*đơn\s*(điện|nước)', 'DIEN_NUOC'),
    # Ăn uống
    (r'cơm\b|suất\s*ăn|nước\s*uống|trà\b|cà\s*phê|đồ\s*ăn|bữa\s*ăn|lunch|dinner', 'AN_UONG'),
    # Xăng dầu
    (r'xăng|dầu\s*diesel|nhiên\s*liệu|gas|petrol', 'XANG_DAU'),
    # Quảng cáo marketing
    (r'quảng\s*cáo|marketing|pr\b|truyền\s*thông|ads|google\s*ads|facebook', 'QUANG_CAO'),
    # Đào tạo
    (r'đào\s*tạo|tập\s*huấn|training|khóa\s*học|học\s*phí', 'DAO_TAO'),
    # Tư vấn pháp lý
    (r'tư\s*vấn|pháp\s*lý|luật\s*sư|legal|consulting', 'TU_VAN'),
    # Công chứng, lệ phí nhà nước
    (r'công\s*chứng|lệ\s*phí|thuế\s*môn\s*bài|chứng\s*thực', 'LE_PHI'),
    # Sửa chữa bảo trì (dịch vụ, không phải hàng)
    (r'(phí|công)\s*sửa\s*chữa|(phí|công)\s*bảo\s*trì|maintenance\s*fee', 'SUA_CHUA_DV'),
    # Thuế, kế toán
    (r'dịch\s*vụ\s*kế\s*toán|dịch\s*vụ\s*thuế|kê\s*khai\s*thuế', 'KE_TOAN'),
    # Văn phòng phẩm nhỏ (tem, phong bì, giấy photo)
    (r'tem\s*thư|phong\s*bì|bưu\s*phẩm|bưu\s*điện', 'VAN_PHONG_PHAM'),
    # Phí hosting, domain, phần mềm dạng dịch vụ
    (r'hosting|domain|cloud\s*service|saas|phí\s*phần\s*mềm', 'PHI_CNTT_DV'),
]

# Compile patterns
SKIP_COMPILED = [(re.compile(p, re.IGNORECASE), cat) for p, cat in SKIP_PATTERNS]


def classify_product(product_name):
    """Phân loại sản phẩm: trả về (is_service, category)"""
    if not product_name:
        return False, 'UNKNOWN'
    name = str(product_name)
    for pattern, category in SKIP_COMPILED:
        if pattern.search(name):
            return True, category
    return False, 'HANG_HOA'


def fetch_invoices_with_detail(engine, company_id, year):
    """Lấy toàn bộ HĐ muavao + detail"""
    q_list = text("""
        SELECT "idServer", shdon,
            tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh' as tdlap_ict,
            tgtcthue, tgtttbso
        FROM ext_listhoadon
        WHERE "congtyId" = :cid AND loaihd='muavao'
          AND tthai IN ('1','2','4','5')
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') >= :start
          AND (tdlap AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh') < :end
        ORDER BY tdlap
    """)
    with engine.connect() as conn:
        df_list = pd.read_sql(q_list, conn, params={
            'cid': company_id, 'start': f'{year}-01-01', 'end': f'{year+1}-01-01'
        })
    df_list['month'] = pd.to_datetime(df_list['tdlap_ict']).dt.month

    # Detail
    ids = df_list['idServer'].tolist()
    all_details = []
    batch_size = 500
    for i in range(0, len(ids), batch_size):
        batch = ids[i:i+batch_size]
        ph = ','.join([f"'{x}'" for x in batch])
        q = f'SELECT "idhdonServer", ten, thtien FROM ext_detailhoadon WHERE "idhdonServer" IN ({ph})'
        with engine.connect() as conn:
            all_details.append(pd.read_sql(text(q), conn))
    df_detail = pd.concat(all_details, ignore_index=True) if all_details else pd.DataFrame()
    return df_list, df_detail


def detect_service_invoices(df_list, df_detail):
    """Phát hiện HĐ dịch vụ dựa trên tên sản phẩm trong detail"""
    # Classify each detail line
    df_detail['is_service'], df_detail['service_cat'] = zip(
        *df_detail['ten'].apply(classify_product)
    )
    
    # Tổng hợp theo HĐ: nếu >50% giá trị là dịch vụ → đánh dấu HĐ dịch vụ
    hd_summary = df_detail.groupby('idhdonServer').agg(
        total_value=('thtien', 'sum'),
        service_value=('thtien', lambda x: x[df_detail.loc[x.index, 'is_service']].sum()),
        service_items=('is_service', 'sum'),
        total_items=('is_service', 'count'),
        categories=('service_cat', lambda x: ','.join(set(x[df_detail.loc[x.index, 'is_service']]))),
        sample_name=('ten', 'first')
    ).reset_index()
    
    hd_summary['service_ratio'] = hd_summary['service_value'] / hd_summary['total_value'].replace(0, 1)
    
    # HĐ dịch vụ: 100% dòng đều là dịch vụ
    full_service = hd_summary[hd_summary['service_items'] == hd_summary['total_items']]
    
    # HĐ hỗn hợp: có cả hàng hóa lẫn dịch vụ
    mixed = hd_summary[
        (hd_summary['service_items'] > 0) & 
        (hd_summary['service_items'] < hd_summary['total_items'])
    ]
    
    return full_service, mixed, hd_summary


def generate_skip_list(df_list, full_service, mixed, year, targets=None):
    """Tạo skip list JSON"""
    # Merge với list để lấy shdon, tháng
    skip_ids = set(full_service['idhdonServer'].tolist())
    
    skip_entries = []
    for _, row in df_list.iterrows():
        if row['idServer'] in skip_ids:
            svc = full_service[full_service['idhdonServer'] == row['idServer']].iloc[0]
            skip_entries.append({
                'shdon': str(row['shdon']),
                'month': int(row['month']),
                'tgtcthue': float(row['tgtcthue']),
                'reason': svc['categories'],
                'sample': str(svc['sample_name'])[:80]
            })
    
    # Tổng theo tháng
    skip_by_month = {}
    for e in skip_entries:
        m = e['month']
        if m not in skip_by_month:
            skip_by_month[m] = {'count': 0, 'total': 0, 'invoices': []}
        skip_by_month[m]['count'] += 1
        skip_by_month[m]['total'] += e['tgtcthue']
        skip_by_month[m]['invoices'].append(e['shdon'])
    
    result = {
        'year': year,
        'generated_at': pd.Timestamp.now().isoformat(),
        'total_skip_invoices': len(skip_entries),
        'total_skip_value': sum(e['tgtcthue'] for e in skip_entries),
        'skip_by_month': skip_by_month,
        'skip_entries': skip_entries,
    }
    
    if targets:
        result['target_comparison'] = {}
        for m in range(1, 13):
            dm = df_list[df_list['month'] == m]
            db_total = dm['tgtcthue'].sum()
            skip_total = skip_by_month.get(m, {}).get('total', 0)
            adjusted = db_total - skip_total
            tgt = targets.get(m, 0)
            result['target_comparison'][str(m)] = {
                'db_total': float(db_total),
                'skip_total': float(skip_total),
                'adjusted': float(adjusted),
                'target': float(tgt),
                'diff': float(adjusted - tgt)
            }
    
    return result


def main():
    parser = argparse.ArgumentParser(description='Phát hiện HĐ dịch vụ cần loại khỏi XNT')
    parser.add_argument('--year', type=int, default=2023)
    parser.add_argument('--company-id', type=str, default=CID)
    parser.add_argument('--output', type=str, default=None)
    parser.add_argument('--targets', type=str, default=None, help='JSON file with monthly targets')
    args = parser.parse_args()

    os.makedirs(SKIP_DIR, exist_ok=True)
    output = args.output or os.path.join(SKIP_DIR, f'skip_list_{args.year}.json')

    # Targets 2023 (từ BAO_CAO_GIAI_TRINH)
    default_targets = {
        1:1154981164, 2:1745704064, 3:1536437738, 4:757550609,
        5:600350985, 6:749561478, 7:895409563, 8:1812197507,
        9:1552056812, 10:890284926, 11:1564643572, 12:2381764450
    }
    targets = default_targets if args.year == 2023 else None

    print(f"{'='*60}")
    print(f"DETECT SERVICE INVOICES - NĂM {args.year}")
    print(f"{'='*60}")

    engine = create_engine(DB_URI)
    df_list, df_detail = fetch_invoices_with_detail(engine, args.company_id, args.year)
    print(f"  Tổng HĐ muavao: {len(df_list)}")
    print(f"  Tổng detail: {len(df_detail)}")

    full_service, mixed, hd_summary = detect_service_invoices(df_list, df_detail)
    print(f"\n  HĐ 100% dịch vụ: {len(full_service)} (loại bỏ)")
    print(f"  HĐ hỗn hợp:      {len(mixed)} (cần review)")

    skip_data = generate_skip_list(df_list, full_service, mixed, args.year, targets)

    # Report
    print(f"\n  Tổng giá trị loại bỏ: {skip_data['total_skip_value']:,.0f}")
    
    if targets:
        print(f"\n  SO SÁNH THEO THÁNG:")
        print(f"  {'Tháng':>6} | {'DB':>16} | {'Loại':>14} | {'Còn lại':>16} | {'Mục tiêu':>16} | {'Chênh':>14}")
        print(f"  {'-'*90}")
        total_diff = 0
        for m in range(1, 13):
            c = skip_data['target_comparison'][str(m)]
            print(f"  T{m:02d}    | {c['db_total']:>16,.0f} | {c['skip_total']:>14,.0f} | "
                  f"{c['adjusted']:>16,.0f} | {c['target']:>16,.0f} | {c['diff']:>14,.0f}")
            total_diff += c['diff']
        print(f"  {'-'*90}")
        print(f"  Tổng chênh lệch còn lại: {total_diff:,.0f}")
        print(f"  (Phần chênh này cần kế toán cung cấp skip list bổ sung)")

    # HĐ hỗn hợp cần review
    if len(mixed) > 0:
        print(f"\n  HĐ HỖN HỢP CẦN REVIEW (có cả hàng hóa & dịch vụ):")
        for _, r in mixed.head(10).iterrows():
            hd = df_list[df_list['idServer'] == r['idhdonServer']].iloc[0]
            print(f"    SHĐ={hd['shdon']} T{int(hd['month']):02d} | "
                  f"DV={r['service_value']:,.0f}/{r['total_value']:,.0f} | {r['sample_name'][:60]}")

    # Save
    with open(output, 'w', encoding='utf-8') as f:
        json.dump(skip_data, f, ensure_ascii=False, indent=2)
    print(f"\n  ✅ Skip list saved: {output}")


if __name__ == "__main__":
    main()
