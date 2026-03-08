import os
import logging
from typing import List, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import requests
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ketoan RAG Service")

# Environment variables
QDRANT_HOST = os.getenv("QDRANT_HOST", "qdrant")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", 6333))
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "ketoan_invoices")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")  # 'ollama' or 'google'
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "ollama")
OLLAMA_PORT = os.getenv("OLLAMA_PORT", "11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")

# Initialize clients
try:
    qdrant_client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
    logger.info(f"Connected to Qdrant at {QDRANT_HOST}:{QDRANT_PORT}")
except Exception as e:
    logger.error(f"Failed to connect to Qdrant: {e}")
    qdrant_client = None

# Initialize embedding model
logger.info(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)

# Models
class IngestRequest(BaseModel):
    text: str
    metadata: Optional[dict] = None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None

@app.on_event("startup")
async def startup_event():
    # Ensure collection exists
    if qdrant_client:
        collections = qdrant_client.get_collections().collections
        exists = any(c.name == QDRANT_COLLECTION for c in collections)
        if not exists:
            logger.info(f"Creating Qdrant collection: {QDRANT_COLLECTION}")
            qdrant_client.recreate_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=qmodels.VectorParams(
                    size=embedding_model.get_sentence_embedding_dimension(),
                    distance=qmodels.Distance.COSINE
                )
            )

@app.get("/health")
async def health():
    return {"status": "ok", "provider": LLM_PROVIDER}

@app.post("/ingest")
async def ingest(request: IngestRequest):
    if not qdrant_client:
        raise HTTPException(status_code=500, detail="Qdrant client not initialized")
    
    try:
        vector = embedding_model.encode(request.text).tolist()
        qdrant_client.upsert(
            collection_name=QDRANT_COLLECTION,
            points=[
                qmodels.PointStruct(
                    id=os.urandom(16).hex(),
                    vector=vector,
                    payload={"text": request.text, **(request.metadata or {})}
                )
            ]
        )
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: ChatRequest):
    if not qdrant_client:
        raise HTTPException(status_code=500, detail="Qdrant client not initialized")

    # 1. Retrieve context
    try:
        query_vector = embedding_model.encode(request.message).tolist()
        search_result = qdrant_client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=query_vector,
            limit=5
        )
        context = "\n---\n".join([r.payload.get("text", "") for r in search_result])
    except Exception as e:
        logger.error(f"Search error: {e}")
        context = ""

    # 2. Generate response
    prompt = f"""
Sử dụng thông tin ngữ cảnh dưới đây để trả lời câu hỏi. 
Nếu thông tin không có trong ngữ cảnh, hãy nói là bạn không biết và sử dụng kiến thức chung để hỗ trợ nếu có thể, nhưng ưu tiên dữ liệu thực tế từ ngữ cảnh.

Ngữ cảnh:
{context}

Câu hỏi: {request.message}

Trả lời (bằng tiếng Việt):
"""

    try:
        if LLM_PROVIDER == "google" and GOOGLE_API_KEY:
            genai.configure(api_key=GOOGLE_API_KEY)
            model = genai.GenerativeModel(GOOGLE_MODEL)
            response = model.generate_content(prompt)
            answer = response.text
        else:
            # Default to Ollama
            ollama_url = f"http://{OLLAMA_HOST}:{OLLAMA_PORT}/api/generate"
            payload = {
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False
            }
            res = requests.post(ollama_url, json=payload)
            if res.status_code == 200:
                answer = res.json().get("response", "Không nhận được phản hồi từ AI.")
            else:
                answer = f"Lỗi từ Ollama: {res.status_code}"
                
        return {"response": answer}
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
