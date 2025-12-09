"""
Database Service
Kết nối PostgreSQL để đọc dữ liệu từ bảng ext_tonghop
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from contextlib import contextmanager

from app.config import get_settings


settings = get_settings()

# Create SQLAlchemy engine
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@contextmanager
def get_db():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_tonghop_records(
    limit: int = 1000,
    offset: int = 0,
    congty_id: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    loaihd: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Lấy dữ liệu từ bảng ext_tonghop để tạo embeddings
    
    Args:
        limit: Số lượng records tối đa
        offset: Vị trí bắt đầu
        congty_id: Lọc theo công ty
        from_date: Lọc từ ngày
        to_date: Lọc đến ngày
        loaihd: Loại hóa đơn (banra/muavao)
    
    Returns:
        List các records dạng dict
    """
    with get_db() as db:
        # Build dynamic query
        conditions = []
        params = {"limit": limit, "offset": offset}
        
        if congty_id:
            conditions.append('"congtyId" = :congty_id')
            params["congty_id"] = congty_id
        
        if from_date:
            conditions.append("tdlap >= :from_date")
            params["from_date"] = from_date
        
        if to_date:
            conditions.append("tdlap <= :to_date")
            params["to_date"] = to_date
        
        if loaihd:
            conditions.append("loaihd = :loaihd")
            params["loaihd"] = loaihd
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        query = text(f"""
            SELECT 
                id,
                "idDetailServer",
                "idHoadonServer",
                "congtyId",
                "congtyMst",
                "congtyTen",
                khmshdon,
                khhdon,
                shdon,
                tdlap,
                tthai,
                loaihd,
                nbmst,
                nbten,
                nbdchi,
                nmmst,
                nmten,
                nmdchi,
                stt,
                "tenHang",
                "tenHangChuan",
                "maHang",
                "nhomHang",
                dvtinh,
                sluong,
                dgia,
                thtien,
                tsuat,
                tthue,
                "tongTien",
                "soLuongNhap",
                "soLuongXuat",
                "giaTriNhap",
                "giaTriXuat",
                "searchText",
                nam,
                thang,
                quy
            FROM ext_tonghop
            WHERE {where_clause}
            ORDER BY tdlap DESC
            LIMIT :limit OFFSET :offset
        """)
        
        result = db.execute(query, params)
        columns = result.keys()
        records = [dict(zip(columns, row)) for row in result.fetchall()]
        
        return records


def get_tonghop_count(
    congty_id: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    loaihd: Optional[str] = None
) -> int:
    """Đếm số records trong ext_tonghop theo điều kiện"""
    with get_db() as db:
        conditions = []
        params = {}
        
        if congty_id:
            conditions.append('"congtyId" = :congty_id')
            params["congty_id"] = congty_id
        
        if from_date:
            conditions.append("tdlap >= :from_date")
            params["from_date"] = from_date
        
        if to_date:
            conditions.append("tdlap <= :to_date")
            params["to_date"] = to_date
        
        if loaihd:
            conditions.append("loaihd = :loaihd")
            params["loaihd"] = loaihd
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        query = text(f"SELECT COUNT(*) FROM ext_tonghop WHERE {where_clause}")
        result = db.execute(query, params)
        return result.scalar()


def fetch_companies() -> List[Dict[str, Any]]:
    """Lấy danh sách công ty"""
    with get_db() as db:
        query = text("""
            SELECT id, mst, ten, "tenVietTat", "diaChi", "isActive", "isDefault"
            FROM ext_congty
            WHERE "isActive" = true
            ORDER BY "isDefault" DESC, ten ASC
        """)
        result = db.execute(query)
        columns = result.keys()
        return [dict(zip(columns, row)) for row in result.fetchall()]
