"""
Pydantic models cho API requests/responses
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# =============================================================================
# Request Models
# =============================================================================

class IngestRequest(BaseModel):
    """Request để ingest dữ liệu từ DB vào vector store"""
    congty_id: Optional[str] = Field(None, description="Filter theo công ty")
    from_date: Optional[datetime] = Field(None, description="Từ ngày")
    to_date: Optional[datetime] = Field(None, description="Đến ngày")
    loaihd: Optional[str] = Field(None, description="Loại hóa đơn: banra/muavao")
    batch_size: int = Field(100, description="Số records mỗi batch", ge=1, le=500)
    clear_existing: bool = Field(False, description="Xóa dữ liệu cũ trước khi ingest")


class QueryRequest(BaseModel):
    """Request để query RAG"""
    question: str = Field(..., min_length=1, description="Câu hỏi")
    congty_id: Optional[str] = Field(None, description="Filter công ty")
    loaihd: Optional[str] = Field(None, description="Filter loại hóa đơn")
    nam: Optional[int] = Field(None, description="Filter năm")
    thang: Optional[int] = Field(None, description="Filter tháng", ge=1, le=12)
    top_k: int = Field(5, description="Số kết quả retrieval", ge=1, le=20)
    stream: bool = Field(False, description="Streaming response")


class SearchRequest(BaseModel):
    """Request để semantic search"""
    query: str = Field(..., min_length=1, description="Query text")
    limit: int = Field(10, description="Số kết quả tối đa", ge=1, le=50)
    congty_id: Optional[str] = Field(None, description="Filter công ty")
    loaihd: Optional[str] = Field(None, description="Filter loại hóa đơn")
    nam: Optional[int] = Field(None, description="Filter năm")
    thang: Optional[int] = Field(None, description="Filter tháng", ge=1, le=12)
    score_threshold: float = Field(0.5, description="Ngưỡng điểm tối thiểu", ge=0, le=1)


# =============================================================================
# Response Models
# =============================================================================

class HealthResponse(BaseModel):
    """Response cho health check"""
    status: str
    timestamp: datetime
    services: Dict[str, bool]


class CollectionInfoResponse(BaseModel):
    """Response cho collection info"""
    success: bool
    data: Dict[str, Any]


class IngestResponse(BaseModel):
    """Response cho ingest operation"""
    success: bool
    message: str
    stats: Dict[str, int]


class SearchResultItem(BaseModel):
    """Một item trong search results"""
    id: str
    score: float
    payload: Dict[str, Any]


class SearchResponse(BaseModel):
    """Response cho search"""
    success: bool
    results: List[SearchResultItem]
    total: int


class QueryResponse(BaseModel):
    """Response cho RAG query"""
    success: bool
    answer: str
    sources: List[SearchResultItem]
    model: str


class ErrorResponse(BaseModel):
    """Response cho errors"""
    success: bool = False
    error: str
    detail: Optional[str] = None
