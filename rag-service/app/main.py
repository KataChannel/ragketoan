"""
RAG Service - FastAPI Main Application
API service cho RAG kế toán, tích hợp với Next.js app
"""

from datetime import datetime
from typing import Optional
import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import json

from app.config import get_settings
from app.models import (
    HealthResponse,
    CollectionInfoResponse,
    IngestRequest,
    IngestResponse,
    SearchRequest,
    SearchResponse,
    SearchResultItem,
    QueryRequest,
    QueryResponse,
    ErrorResponse,
)
from app.services import (
    fetch_tonghop_records,
    get_tonghop_count,
    fetch_companies,
    get_vector_store,
    get_rag_service,
)
from app.services.rag import get_current_llm_info


# =============================================================================
# Setup
# =============================================================================

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RAG Kế Toán Service",
    description="API service cho RAG hóa đơn điện tử, tích hợp Qdrant + Ollama",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware - cho phép Next.js app gọi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên giới hạn
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Health & Info Endpoints
# =============================================================================

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Kiểm tra trạng thái các services"""
    services = {
        "api": True,
        "qdrant": False,
        "ollama": False,
        "database": False,
    }
    
    # Check Qdrant
    try:
        vector_store = get_vector_store()
        vector_store.get_collection_info()
        services["qdrant"] = True
    except Exception as e:
        logger.warning(f"Qdrant check failed: {e}")
    
    # Check Ollama
    try:
        import httpx
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.ollama_base_url}/api/tags")
            services["ollama"] = response.status_code == 200
    except Exception as e:
        logger.warning(f"Ollama check failed: {e}")
    
    # Check Database
    try:
        count = get_tonghop_count()
        services["database"] = count >= 0
    except Exception as e:
        logger.warning(f"Database check failed: {e}")
    
    status = "healthy" if all(services.values()) else "degraded"
    
    return HealthResponse(
        status=status,
        timestamp=datetime.now(),
        services=services,
    )


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    llm_info = get_current_llm_info()
    return {
        "service": "RAG Kế Toán",
        "version": "1.0.0",
        "docs": "/docs",
        "llm": llm_info,
    }


@app.get("/llm-info", tags=["Health"])
async def get_llm_info():
    """Lấy thông tin về LLM provider đang sử dụng"""
    llm_info = get_current_llm_info()
    
    # Check if provider is accessible
    is_available = False
    error_message = None
    
    if llm_info["provider"] == "google":
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.google_api_key)
            # Quick test
            model = genai.GenerativeModel(settings.google_model)
            is_available = True
        except Exception as e:
            error_message = str(e)
    else:
        try:
            import httpx
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{settings.ollama_base_url}/api/tags")
                is_available = response.status_code == 200
        except Exception as e:
            error_message = str(e)
    
    return {
        **llm_info,
        "is_available": is_available,
        "error": error_message,
    }


@app.get("/collection", response_model=CollectionInfoResponse, tags=["Vector Store"])
async def get_collection_info():
    """Lấy thông tin collection trong Qdrant"""
    try:
        vector_store = get_vector_store()
        info = vector_store.get_collection_info()
        return CollectionInfoResponse(success=True, data=info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/companies", tags=["Data"])
async def get_companies():
    """Lấy danh sách công ty"""
    try:
        companies = fetch_companies()
        return {"success": True, "data": companies}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Ingest Endpoints - Đồng bộ dữ liệu vào Vector Store
# =============================================================================

@app.post("/ingest", response_model=IngestResponse, tags=["Ingest"])
async def ingest_data(request: IngestRequest):
    """
    Ingest dữ liệu từ ext_tonghop vào Qdrant
    
    Quy trình:
    1. Đọc dữ liệu từ PostgreSQL (ext_tonghop)
    2. Tạo embeddings cho mỗi record
    3. Lưu vào Qdrant vector store
    """
    try:
        vector_store = get_vector_store()
        
        # Clear if requested
        if request.clear_existing:
            logger.info("Clearing existing data...")
            vector_store.clear_collection()
        
        # Get total count
        total_count = get_tonghop_count(
            congty_id=request.congty_id,
            from_date=request.from_date,
            to_date=request.to_date,
            loaihd=request.loaihd,
        )
        
        logger.info(f"Total records to ingest: {total_count}")
        
        if total_count == 0:
            return IngestResponse(
                success=True,
                message="Không có dữ liệu để ingest",
                stats={"total": 0, "upserted": 0, "errors": 0},
            )
        
        # Fetch and ingest in batches
        total_upserted = 0
        total_errors = 0
        offset = 0
        
        while offset < total_count:
            records = fetch_tonghop_records(
                limit=request.batch_size,
                offset=offset,
                congty_id=request.congty_id,
                from_date=request.from_date,
                to_date=request.to_date,
                loaihd=request.loaihd,
            )
            
            if not records:
                break
            
            result = vector_store.upsert_records(records, batch_size=request.batch_size)
            total_upserted += result["upserted"]
            total_errors += result["errors"]
            
            offset += len(records)
            logger.info(f"Progress: {offset}/{total_count}")
        
        return IngestResponse(
            success=True,
            message=f"Đã ingest {total_upserted} records vào vector store",
            stats={
                "total": total_count,
                "upserted": total_upserted,
                "errors": total_errors,
            },
        )
    
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/ingest", tags=["Ingest"])
async def clear_vector_store(
    confirm: bool = Query(False, description="Xác nhận xóa")
):
    """Xóa toàn bộ dữ liệu trong vector store"""
    if not confirm:
        raise HTTPException(
            status_code=400,
            detail="Cần xác nhận xóa bằng query param: ?confirm=true"
        )
    
    try:
        vector_store = get_vector_store()
        vector_store.clear_collection()
        return {"success": True, "message": "Đã xóa toàn bộ vector store"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Search Endpoints - Semantic Search
# =============================================================================

@app.post("/search", response_model=SearchResponse, tags=["Search"])
async def semantic_search(request: SearchRequest):
    """
    Semantic search trong vector store
    Trả về các documents liên quan nhất với query
    """
    try:
        vector_store = get_vector_store()
        
        results = vector_store.search(
            query=request.query,
            limit=request.limit,
            congty_id=request.congty_id,
            loaihd=request.loaihd,
            nam=request.nam,
            thang=request.thang,
            score_threshold=request.score_threshold,
        )
        
        return SearchResponse(
            success=True,
            results=[SearchResultItem(**r) for r in results],
            total=len(results),
        )
    
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/search", response_model=SearchResponse, tags=["Search"])
async def semantic_search_get(
    query: str = Query(..., min_length=1, description="Query text"),
    limit: int = Query(10, ge=1, le=50),
    congty_id: Optional[str] = Query(None),
    loaihd: Optional[str] = Query(None),
    nam: Optional[int] = Query(None),
    thang: Optional[int] = Query(None, ge=1, le=12),
):
    """Semantic search (GET method cho convenience)"""
    request = SearchRequest(
        query=query,
        limit=limit,
        congty_id=congty_id,
        loaihd=loaihd,
        nam=nam,
        thang=thang,
    )
    return await semantic_search(request)


# =============================================================================
# RAG Query Endpoints - Hỏi đáp với AI
# =============================================================================

@app.post("/query", tags=["RAG"])
async def rag_query(request: QueryRequest):
    """
    RAG Query - Hỏi đáp với AI về dữ liệu kế toán
    
    Quy trình:
    1. Semantic search để tìm documents liên quan
    2. Build context từ results
    3. Gọi LLM (Ollama) để generate câu trả lời
    """
    try:
        rag_service = get_rag_service()
        
        if request.stream:
            # Streaming response
            result = await rag_service.query(
                question=request.question,
                congty_id=request.congty_id,
                loaihd=request.loaihd,
                nam=request.nam,
                thang=request.thang,
                top_k=request.top_k,
                stream=True,
            )
            
            async def generate():
                # First, send sources
                sources_data = {
                    "type": "sources",
                    "data": result["sources"],
                }
                yield f"data: {json.dumps(sources_data, ensure_ascii=False)}\n\n"
                
                # Then stream answer
                async for chunk in result["stream"]:
                    chunk_data = {
                        "type": "chunk",
                        "data": chunk,
                    }
                    yield f"data: {json.dumps(chunk_data, ensure_ascii=False)}\n\n"
                
                # Final done signal
                yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
            return StreamingResponse(
                generate(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            )
        
        else:
            # Non-streaming response
            result = await rag_service.query(
                question=request.question,
                congty_id=request.congty_id,
                loaihd=request.loaihd,
                nam=request.nam,
                thang=request.thang,
                top_k=request.top_k,
                stream=False,
            )
            
            return QueryResponse(
                success=True,
                answer=result["answer"],
                sources=[SearchResultItem(**s) for s in result["sources"]],
                model=result["model"],
            )
    
    except Exception as e:
        logger.error(f"RAG Query error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/query", tags=["RAG"])
async def rag_query_get(
    question: str = Query(..., min_length=1, description="Câu hỏi"),
    congty_id: Optional[str] = Query(None),
    loaihd: Optional[str] = Query(None),
    nam: Optional[int] = Query(None),
    thang: Optional[int] = Query(None, ge=1, le=12),
    top_k: int = Query(5, ge=1, le=20),
):
    """RAG Query (GET method, không hỗ trợ streaming)"""
    request = QueryRequest(
        question=question,
        congty_id=congty_id,
        loaihd=loaihd,
        nam=nam,
        thang=thang,
        top_k=top_k,
        stream=False,
    )
    return await rag_query(request)


# =============================================================================
# Stats Endpoints
# =============================================================================

@app.get("/stats", tags=["Stats"])
async def get_stats():
    """Lấy thống kê tổng quan"""
    try:
        # Database stats
        db_total = get_tonghop_count()
        
        # Vector store stats
        vector_store = get_vector_store()
        collection_info = vector_store.get_collection_info()
        
        return {
            "success": True,
            "data": {
                "database": {
                    "total_records": db_total,
                },
                "vector_store": {
                    "collection": collection_info["name"],
                    "vectors_count": collection_info["vectors_count"],
                    "status": collection_info["status"],
                },
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Startup/Shutdown Events
# =============================================================================

@app.on_event("startup")
async def startup_event():
    """Khởi tạo services khi start"""
    logger.info("Starting RAG Service...")
    
    # Pre-initialize services
    try:
        # Initialize vector store (creates collection if not exists)
        get_vector_store()
        logger.info("Vector store initialized")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}")
    
    logger.info(f"RAG Service started on {settings.host}:{settings.port}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup khi shutdown"""
    logger.info("Shutting down RAG Service...")


# =============================================================================
# Run
# =============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
    )
