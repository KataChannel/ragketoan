"""
Vector Store Service
Tích hợp với Qdrant để lưu trữ và tìm kiếm vectors
"""

from typing import List, Dict, Any, Optional
from uuid import uuid4
import logging

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    Range,
)

from app.config import get_settings
from app.services.embedding import (
    get_embedding_service,
    format_invoice_for_embedding,
    create_metadata_from_record,
)


settings = get_settings()
logger = logging.getLogger(__name__)


class VectorStoreService:
    """Service quản lý Qdrant vector store"""
    
    _instance: Optional["VectorStoreService"] = None
    _client: Optional[QdrantClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            logger.info(f"Connecting to Qdrant at {settings.qdrant_url}")
            self._client = QdrantClient(
                host=settings.qdrant_host,
                port=settings.qdrant_port,
            )
            self._ensure_collection()
            logger.info("Qdrant client initialized successfully")
    
    @property
    def client(self) -> QdrantClient:
        return self._client
    
    def _ensure_collection(self):
        """Tạo collection nếu chưa tồn tại"""
        collections = self.client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if settings.qdrant_collection not in collection_names:
            logger.info(f"Creating collection: {settings.qdrant_collection}")
            self.client.create_collection(
                collection_name=settings.qdrant_collection,
                vectors_config=VectorParams(
                    size=settings.embedding_dimension,
                    distance=Distance.COSINE,
                ),
            )
            
            # Tạo payload indexes cho filtering
            self.client.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name="congtyId",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            self.client.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name="loaihd",
                field_schema=models.PayloadSchemaType.KEYWORD,
            )
            self.client.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name="nam",
                field_schema=models.PayloadSchemaType.INTEGER,
            )
            self.client.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name="thang",
                field_schema=models.PayloadSchemaType.INTEGER,
            )
            self.client.create_payload_index(
                collection_name=settings.qdrant_collection,
                field_name="tenHang",
                field_schema=models.PayloadSchemaType.TEXT,
            )
            
            logger.info(f"Collection {settings.qdrant_collection} created with indexes")
        else:
            logger.info(f"Collection {settings.qdrant_collection} already exists")
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Lấy thông tin collection"""
        info = self.client.get_collection(settings.qdrant_collection)
        return {
            "name": settings.qdrant_collection,
            "vectors_count": info.vectors_count,
            "points_count": info.points_count,
            "status": info.status.value,
        }
    
    def upsert_records(
        self,
        records: List[Dict[str, Any]],
        batch_size: int = 100
    ) -> Dict[str, Any]:
        """
        Tạo embeddings và upsert vào Qdrant
        
        Args:
            records: List dữ liệu từ ext_tonghop
            batch_size: Số records mỗi batch
        
        Returns:
            Dict với thống kê
        """
        embedding_service = get_embedding_service()
        total = len(records)
        upserted = 0
        errors = 0
        
        # Process in batches
        for i in range(0, total, batch_size):
            batch = records[i:i + batch_size]
            
            try:
                # Prepare texts for embedding
                texts = [format_invoice_for_embedding(r) for r in batch]
                
                # Generate embeddings
                embeddings = embedding_service.embed_texts(texts)
                
                # Prepare points for Qdrant
                points = []
                for j, record in enumerate(batch):
                    point_id = record.get("idDetailServer") or str(uuid4())
                    metadata = create_metadata_from_record(record)
                    metadata["text"] = texts[j]  # Store original text
                    
                    points.append(PointStruct(
                        id=point_id,
                        vector=embeddings[j],
                        payload=metadata,
                    ))
                
                # Upsert to Qdrant
                self.client.upsert(
                    collection_name=settings.qdrant_collection,
                    points=points,
                )
                
                upserted += len(batch)
                logger.info(f"Upserted batch {i // batch_size + 1}: {len(batch)} records")
                
            except Exception as e:
                errors += len(batch)
                logger.error(f"Error upserting batch: {e}")
        
        return {
            "total": total,
            "upserted": upserted,
            "errors": errors,
        }
    
    def search(
        self,
        query: str,
        limit: int = None,
        congty_id: Optional[str] = None,
        loaihd: Optional[str] = None,
        nam: Optional[int] = None,
        thang: Optional[int] = None,
        score_threshold: float = 0.5,
    ) -> List[Dict[str, Any]]:
        """
        Semantic search trong Qdrant
        
        Args:
            query: Câu hỏi/query text
            limit: Số kết quả tối đa
            congty_id: Lọc theo công ty
            loaihd: Lọc theo loại hóa đơn
            nam: Lọc theo năm
            thang: Lọc theo tháng
            score_threshold: Ngưỡng điểm tối thiểu
        
        Returns:
            List kết quả với score và payload
        """
        if limit is None:
            limit = settings.top_k_results
        
        embedding_service = get_embedding_service()
        query_vector = embedding_service.embed_query(query)
        
        # Build filter
        filter_conditions = []
        
        if congty_id:
            filter_conditions.append(
                FieldCondition(field="congtyId", match=MatchValue(value=congty_id))
            )
        
        if loaihd:
            filter_conditions.append(
                FieldCondition(field="loaihd", match=MatchValue(value=loaihd))
            )
        
        if nam:
            filter_conditions.append(
                FieldCondition(field="nam", match=MatchValue(value=nam))
            )
        
        if thang:
            filter_conditions.append(
                FieldCondition(field="thang", match=MatchValue(value=thang))
            )
        
        search_filter = Filter(must=filter_conditions) if filter_conditions else None
        
        # Search
        results = self.client.search(
            collection_name=settings.qdrant_collection,
            query_vector=query_vector,
            query_filter=search_filter,
            limit=limit,
            score_threshold=score_threshold,
        )
        
        return [
            {
                "id": str(r.id),
                "score": r.score,
                "payload": r.payload,
            }
            for r in results
        ]
    
    def delete_by_filter(
        self,
        congty_id: Optional[str] = None,
        loaihd: Optional[str] = None,
    ) -> int:
        """Xóa vectors theo filter"""
        filter_conditions = []
        
        if congty_id:
            filter_conditions.append(
                FieldCondition(field="congtyId", match=MatchValue(value=congty_id))
            )
        
        if loaihd:
            filter_conditions.append(
                FieldCondition(field="loaihd", match=MatchValue(value=loaihd))
            )
        
        if not filter_conditions:
            raise ValueError("At least one filter condition is required")
        
        result = self.client.delete(
            collection_name=settings.qdrant_collection,
            points_selector=models.FilterSelector(
                filter=Filter(must=filter_conditions)
            ),
        )
        
        return result
    
    def clear_collection(self):
        """Xóa toàn bộ collection và tạo lại"""
        try:
            self.client.delete_collection(settings.qdrant_collection)
            logger.info(f"Deleted collection: {settings.qdrant_collection}")
        except Exception as e:
            logger.warning(f"Error deleting collection: {e}")
        
        self._ensure_collection()


# Singleton instance
_vector_store: Optional[VectorStoreService] = None


def get_vector_store() -> VectorStoreService:
    """Get singleton vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStoreService()
    return _vector_store
