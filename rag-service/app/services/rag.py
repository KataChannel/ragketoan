"""
RAG Chain Service
Kết hợp retrieval với LLM để trả lời câu hỏi về dữ liệu kế toán
Hỗ trợ: Ollama (local) và Google AI Studio (cloud)
"""

from typing import List, Dict, Any, Optional, AsyncIterator
import logging
import httpx
import json

from app.config import get_settings
from app.services.vector_store import get_vector_store

# Google AI Studio
try:
    import google.generativeai as genai
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    GOOGLE_AI_AVAILABLE = False
    genai = None

settings = get_settings()
logger = logging.getLogger(__name__)


def setup_google_ai():
    """Configure Google AI Studio với API key"""
    if not GOOGLE_AI_AVAILABLE:
        raise RuntimeError(
            "Google AI SDK not installed. Run: pip install google-generativeai"
        )
    if not settings.google_api_key:
        raise ValueError(
            "GOOGLE_API_KEY is required when using 'google' provider. "
            "Get your key at: https://aistudio.google.com/app/apikey"
        )
    genai.configure(api_key=settings.google_api_key)


# System prompt cho LLM - chuyên về kế toán
SYSTEM_PROMPT = """Bạn là trợ lý AI chuyên về kế toán và hóa đơn điện tử. 
Nhiệm vụ của bạn là trả lời các câu hỏi về hóa đơn, hàng hóa, xuất nhập tồn dựa trên dữ liệu được cung cấp.

Quy tắc:
1. Chỉ trả lời dựa trên thông tin từ dữ liệu được cung cấp (Context)
2. Nếu không có đủ thông tin, hãy nói rõ
3. Trả lời bằng tiếng Việt, ngắn gọn và chính xác
4. Khi nói về số tiền, format với dấu phẩy phân cách hàng nghìn
5. Khi liệt kê, sử dụng định dạng bảng nếu phù hợp
6. Nếu câu hỏi không liên quan đến kế toán/hóa đơn, từ chối lịch sự

Ví dụ câu hỏi bạn có thể trả lời:
- Tổng doanh thu tháng X là bao nhiêu?
- Đã mua những mặt hàng gì từ nhà cung cấp Y?
- Số lượng nhập/xuất của sản phẩm Z?
- Hóa đơn nào có giá trị cao nhất?
"""


def build_context_from_results(search_results: List[Dict[str, Any]]) -> str:
    """
    Xây dựng context từ kết quả search để đưa vào LLM
    
    Args:
        search_results: Kết quả từ vector search
    
    Returns:
        Formatted context string
    """
    if not search_results:
        return "Không tìm thấy dữ liệu liên quan."
    
    context_parts = []
    
    for i, result in enumerate(search_results, 1):
        payload = result.get("payload", {})
        score = result.get("score", 0)
        
        # Format mỗi kết quả
        item = f"""
--- Kết quả {i} (Độ liên quan: {score:.2%}) ---
Hóa đơn: {payload.get('shdon', 'N/A')} | Ký hiệu: {payload.get('khhdon', 'N/A')}
Loại: {'Bán ra' if payload.get('loaihd') == 'banra' else 'Mua vào'}
Ngày: {payload.get('tdlap', 'N/A')}
Người bán: {payload.get('nbten', 'N/A')} (MST: {payload.get('nbmst', 'N/A')})
Người mua: {payload.get('nmten', 'N/A')} (MST: {payload.get('nmmst', 'N/A')})
Hàng hóa: {payload.get('tenHang', 'N/A')}
Số lượng: {payload.get('sluong', 0)} {payload.get('dvtinh', '')}
Đơn giá: {payload.get('dgia', 0):,.0f} VNĐ
Tổng tiền: {payload.get('tongTien', 0):,.0f} VNĐ
Tháng/Năm: {payload.get('thang', 'N/A')}/{payload.get('nam', 'N/A')}
"""
        context_parts.append(item.strip())
    
    return "\n\n".join(context_parts)


async def query_ollama(
    prompt: str,
    context: str,
    model: str = None,
) -> str:
    """
    Gọi Ollama API để generate response (LOCAL)
    
    Args:
        prompt: Câu hỏi từ user
        context: Context từ RAG retrieval
        model: Tên model (default từ settings)
    
    Returns:
        Response text từ LLM
    """
    if model is None:
        model = settings.ollama_model
    
    full_prompt = f"""{SYSTEM_PROMPT}

### Context (Dữ liệu hóa đơn):
{context}

### Câu hỏi:
{prompt}

### Trả lời:"""

    url = f"{settings.ollama_base_url}/api/generate"
    
    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,  # Lower = more deterministic
            "top_p": 0.9,
            "num_predict": 1000,
        }
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
        result = response.json()
        return result.get("response", "")


async def query_google_ai(
    prompt: str,
    context: str,
    model: str = None,
) -> str:
    """
    Gọi Google AI Studio (Gemini) API để generate response (CLOUD)
    
    Args:
        prompt: Câu hỏi từ user
        context: Context từ RAG retrieval  
        model: Tên model (default từ settings)
    
    Returns:
        Response text từ LLM
    """
    setup_google_ai()
    
    if model is None:
        model = settings.google_model
    
    full_prompt = f"""{SYSTEM_PROMPT}

### Context (Dữ liệu hóa đơn):
{context}

### Câu hỏi:
{prompt}

### Trả lời:"""

    # Initialize Gemini model
    gemini = genai.GenerativeModel(
        model_name=model,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            top_p=0.9,
            max_output_tokens=1000,
        ),
    )
    
    response = await gemini.generate_content_async(full_prompt)
    return response.text


async def query_ollama_stream(
    prompt: str,
    context: str,
    model: str = None,
) -> AsyncIterator[str]:
    """
    Gọi Ollama API với streaming response (LOCAL)
    
    Args:
        prompt: Câu hỏi từ user
        context: Context từ RAG retrieval
        model: Tên model
    
    Yields:
        Response chunks từ LLM
    """
    if model is None:
        model = settings.ollama_model
    
    full_prompt = f"""{SYSTEM_PROMPT}

### Context (Dữ liệu hóa đơn):
{context}

### Câu hỏi:
{prompt}

### Trả lời:"""

    url = f"{settings.ollama_base_url}/api/generate"
    
    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": True,
        "options": {
            "temperature": 0.3,
            "top_p": 0.9,
            "num_predict": 1000,
        }
    }
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", url, json=payload) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
                        if data.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue


async def query_google_ai_stream(
    prompt: str,
    context: str,
    model: str = None,
) -> AsyncIterator[str]:
    """
    Gọi Google AI Studio (Gemini) với streaming response (CLOUD)
    
    Args:
        prompt: Câu hỏi từ user
        context: Context từ RAG retrieval
        model: Tên model
    
    Yields:
        Response chunks từ LLM
    """
    setup_google_ai()
    
    if model is None:
        model = settings.google_model
    
    full_prompt = f"""{SYSTEM_PROMPT}

### Context (Dữ liệu hóa đơn):
{context}

### Câu hỏi:
{prompt}

### Trả lời:"""

    # Initialize Gemini model
    gemini = genai.GenerativeModel(
        model_name=model,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            top_p=0.9,
            max_output_tokens=1000,
        ),
    )
    
    response = await gemini.generate_content_async(
        full_prompt,
        stream=True
    )
    
    async for chunk in response:
        if chunk.text:
            yield chunk.text


async def query_llm(
    prompt: str,
    context: str,
    stream: bool = False,
) -> str | AsyncIterator[str]:
    """
    Unified LLM query function - routes to appropriate provider
    
    Args:
        prompt: Câu hỏi từ user
        context: Context từ RAG retrieval
        stream: Enable streaming response
    
    Returns:
        Response text hoặc AsyncIterator for streaming
    """
    provider = settings.llm_provider.lower()
    
    if provider == "google":
        logger.info(f"Using Google AI Studio model: {settings.google_model}")
        if stream:
            return query_google_ai_stream(prompt, context)
        return await query_google_ai(prompt, context)
    else:
        # Default to Ollama (local)
        logger.info(f"Using Ollama model: {settings.ollama_model}")
        if stream:
            return query_ollama_stream(prompt, context)
        return await query_ollama(prompt, context)


def get_current_llm_info() -> Dict[str, str]:
    """Get information about currently configured LLM provider"""
    provider = settings.llm_provider.lower()
    
    if provider == "google":
        return {
            "provider": "google",
            "model": settings.google_model,
            "type": "cloud",
            "description": "Google AI Studio (Gemini)",
        }
    else:
        return {
            "provider": "ollama",
            "model": settings.ollama_model,
            "type": "local",
            "description": f"Ollama Local ({settings.ollama_host}:{settings.ollama_port})",
        }


class RAGService:
    """Service chính để xử lý RAG queries"""
    
    def __init__(self):
        self.vector_store = get_vector_store()
    
    async def query(
        self,
        question: str,
        congty_id: Optional[str] = None,
        loaihd: Optional[str] = None,
        nam: Optional[int] = None,
        thang: Optional[int] = None,
        top_k: int = None,
        stream: bool = False,
    ) -> Dict[str, Any]:
        """
        Xử lý câu hỏi RAG
        
        Args:
            question: Câu hỏi từ user
            congty_id: Filter công ty
            loaihd: Filter loại hóa đơn
            nam: Filter năm
            thang: Filter tháng
            top_k: Số kết quả retrieval
            stream: Streaming response
        
        Returns:
            Dict với answer và sources
        """
        if top_k is None:
            top_k = settings.top_k_results
        
        # Step 1: Retrieve relevant documents
        logger.info(f"RAG Query: {question}")
        search_results = self.vector_store.search(
            query=question,
            limit=top_k,
            congty_id=congty_id,
            loaihd=loaihd,
            nam=nam,
            thang=thang,
        )
        
        logger.info(f"Found {len(search_results)} relevant documents")
        
        # Step 2: Build context
        context = build_context_from_results(search_results)
        
        # Step 3: Generate answer using unified LLM function
        llm_info = get_current_llm_info()
        
        if stream:
            # Return async generator for streaming
            stream_generator = await query_llm(question, context, stream=True)
            
            async def generate_stream():
                async for chunk in stream_generator:
                    yield chunk
            
            return {
                "stream": generate_stream(),
                "sources": search_results,
                "context": context,
                "llm": llm_info,
            }
        else:
            answer = await query_llm(question, context, stream=False)
            
            return {
                "answer": answer,
                "sources": search_results,
                "context": context,
                "llm": llm_info,
            }
    
    def search_only(
        self,
        query: str,
        limit: int = None,
        congty_id: Optional[str] = None,
        loaihd: Optional[str] = None,
        nam: Optional[int] = None,
        thang: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Chỉ semantic search, không generate answer
        Useful cho autocomplete, suggestions
        """
        if limit is None:
            limit = settings.top_k_results
        
        return self.vector_store.search(
            query=query,
            limit=limit,
            congty_id=congty_id,
            loaihd=loaihd,
            nam=nam,
            thang=thang,
        )


# Singleton instance
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    """Get singleton RAG service instance"""
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
