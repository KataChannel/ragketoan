"""
Embedding Service
Tạo embeddings cho dữ liệu hóa đơn sử dụng sentence-transformers
"""

from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer
import logging

from app.config import get_settings


settings = get_settings()
logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service tạo embeddings cho text"""
    
    _instance: Optional["EmbeddingService"] = None
    _model: Optional[SentenceTransformer] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._model is None:
            logger.info(f"Loading embedding model: {settings.embedding_model}")
            self._model = SentenceTransformer(settings.embedding_model)
            logger.info("Embedding model loaded successfully")
    
    @property
    def model(self) -> SentenceTransformer:
        return self._model
    
    def embed_text(self, text: str) -> List[float]:
        """Tạo embedding cho một đoạn text"""
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Tạo embeddings cho nhiều đoạn text (batch)"""
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    def embed_query(self, query: str) -> List[float]:
        """Tạo embedding cho câu query (có thể có prefix khác)"""
        # Với một số models như e5, query cần prefix "query: "
        # Với paraphrase-multilingual không cần
        return self.embed_text(query)


def format_invoice_for_embedding(record: Dict[str, Any]) -> str:
    """
    Format dữ liệu hóa đơn thành text để tạo embedding
    Kết hợp các trường quan trọng thành một đoạn văn bản có ý nghĩa
    
    Args:
        record: Dict chứa dữ liệu từ ext_tonghop
    
    Returns:
        Formatted text string
    """
    # Xác định loại hóa đơn
    loai = "Bán ra" if record.get("loaihd") == "banra" else "Mua vào"
    
    # Format ngày
    tdlap = record.get("tdlap")
    ngay = tdlap.strftime("%d/%m/%Y") if tdlap else "N/A"
    
    # Format số tiền
    def format_money(value):
        if value is None:
            return "0"
        try:
            return f"{float(value):,.0f}"
        except:
            return str(value)
    
    # Build text content
    parts = []
    
    # Header info
    parts.append(f"Hóa đơn {loai}")
    parts.append(f"Số: {record.get('shdon', 'N/A')}")
    parts.append(f"Ký hiệu: {record.get('khhdon', 'N/A')}")
    parts.append(f"Ngày: {ngay}")
    
    # Người bán
    if record.get("nbten"):
        parts.append(f"Người bán: {record['nbten']}")
    if record.get("nbmst"):
        parts.append(f"MST bán: {record['nbmst']}")
    
    # Người mua
    if record.get("nmten"):
        parts.append(f"Người mua: {record['nmten']}")
    if record.get("nmmst"):
        parts.append(f"MST mua: {record['nmmst']}")
    
    # Chi tiết hàng hóa - QUAN TRỌNG nhất cho RAG
    ten_hang = record.get("tenHang", "")
    ten_hang_chuan = record.get("tenHangChuan", "")
    
    parts.append(f"Hàng hóa: {ten_hang}")
    if ten_hang_chuan and ten_hang_chuan != ten_hang:
        parts.append(f"Tên chuẩn: {ten_hang_chuan}")
    
    if record.get("maHang"):
        parts.append(f"Mã hàng: {record['maHang']}")
    
    if record.get("nhomHang"):
        parts.append(f"Nhóm hàng: {record['nhomHang']}")
    
    # Số lượng và giá
    sluong = record.get("sluong", 0)
    dvtinh = record.get("dvtinh", "")
    dgia = format_money(record.get("dgia"))
    thtien = format_money(record.get("thtien"))
    thue = format_money(record.get("tthue"))
    tong = format_money(record.get("tongTien"))
    
    parts.append(f"Số lượng: {sluong} {dvtinh}".strip())
    parts.append(f"Đơn giá: {dgia} VNĐ")
    parts.append(f"Thành tiền: {thtien} VNĐ")
    parts.append(f"Thuế: {thue} VNĐ")
    parts.append(f"Tổng: {tong} VNĐ")
    
    # Xuất nhập tồn
    if record.get("loaihd") == "muavao":
        parts.append(f"Nhập: {record.get('soLuongNhap', 0)} {dvtinh}")
    else:
        parts.append(f"Xuất: {record.get('soLuongXuat', 0)} {dvtinh}")
    
    # Thời gian
    parts.append(f"Tháng {record.get('thang', 'N/A')}/{record.get('nam', 'N/A')}")
    parts.append(f"Quý {record.get('quy', 'N/A')}")
    
    return " | ".join(parts)


def create_metadata_from_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Tạo metadata để lưu cùng vector trong Qdrant
    Metadata giúp filter khi search
    
    Args:
        record: Dict chứa dữ liệu từ ext_tonghop
    
    Returns:
        Dict metadata
    """
    return {
        "id": str(record.get("id", "")),
        "idDetailServer": str(record.get("idDetailServer", "")),
        "idHoadonServer": str(record.get("idHoadonServer", "")),
        "congtyId": str(record.get("congtyId", "")),
        "congtyMst": str(record.get("congtyMst", "")),
        "loaihd": str(record.get("loaihd", "")),
        "shdon": str(record.get("shdon", "")),
        "khhdon": str(record.get("khhdon", "")),
        "nbmst": str(record.get("nbmst", "")),
        "nbten": str(record.get("nbten", "")),
        "nmmst": str(record.get("nmmst", "")),
        "nmten": str(record.get("nmten", "")),
        "tenHang": str(record.get("tenHang", "")),
        "tenHangChuan": str(record.get("tenHangChuan", "")),
        "maHang": str(record.get("maHang", "")),
        "nhomHang": str(record.get("nhomHang", "")),
        "dvtinh": str(record.get("dvtinh", "")),
        "sluong": float(record.get("sluong", 0)),
        "dgia": float(record.get("dgia", 0)),
        "tongTien": float(record.get("tongTien", 0)),
        "nam": int(record.get("nam", 0)),
        "thang": int(record.get("thang", 0)),
        "quy": int(record.get("quy", 0)),
        "tdlap": record.get("tdlap").isoformat() if record.get("tdlap") else None,
    }


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get singleton embedding service instance"""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
