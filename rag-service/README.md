# RAG Kế Toán Service

Python FastAPI service cho RAG (Retrieval-Augmented Generation) dữ liệu hóa đơn điện tử.

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                          │
│                  /ketoan + Dashboard UI                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Next.js API Routes (/api/rag/*)                    │
│              Proxy requests to Python service                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Python RAG Service (FastAPI)                    │
│                    Port: 8000                                │
└─────────────────────────────────────────────────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │    Qdrant    │   │   Ollama     │
│  (ext_*)     │   │ Vector Store │   │    LLM       │
└──────────────┘   └──────────────┘   └──────────────┘
```

## 📦 Stack Công Nghệ

| Component | Technology |
|-----------|------------|
| Framework | FastAPI |
| Embedding | sentence-transformers |
| Vector DB | Qdrant |
| LLM | Ollama (llama3.2) |
| Database | PostgreSQL + SQLAlchemy |
| Runtime | Python 3.11 |

## 🚀 Cài Đặt & Chạy

### Với Docker Compose (Recommended)

```bash
# Từ root project
docker compose up rag-service -d

# Xem logs
docker compose logs -f rag-service
```

### Local Development

```bash
cd rag-service

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc: venv\Scripts\activate  # Windows

# Cài đặt dependencies
pip install -r requirements.txt

# Copy và cấu hình env
cp .env.example .env
# Sửa .env theo môi trường

# Chạy service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 API Endpoints

### Health & Info

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/` | Root info |
| GET | `/health` | Health check |
| GET | `/stats` | Thống kê tổng quan |
| GET | `/collection` | Info về Qdrant collection |
| GET | `/companies` | Danh sách công ty |

### Ingest (Đồng bộ dữ liệu)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/ingest` | Ingest dữ liệu từ DB vào Qdrant |
| DELETE | `/ingest?confirm=true` | Xóa toàn bộ vector store |

**Request Body (POST /ingest):**
```json
{
  "congty_id": "optional-company-id",
  "from_date": "2024-01-01T00:00:00",
  "to_date": "2024-12-31T23:59:59",
  "loaihd": "banra",
  "batch_size": 100,
  "clear_existing": false
}
```

### Search (Tìm kiếm ngữ nghĩa)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/search` | Semantic search |
| GET | `/search?query=...` | Semantic search (GET) |

**Request Body (POST /search):**
```json
{
  "query": "hóa đơn mua vải từ công ty ABC",
  "limit": 10,
  "congty_id": null,
  "loaihd": null,
  "nam": 2024,
  "thang": null,
  "score_threshold": 0.5
}
```

### RAG Query (Hỏi đáp AI)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/query` | RAG Query với AI |
| GET | `/query?question=...` | RAG Query (GET) |

**Request Body (POST /query):**
```json
{
  "question": "Tổng doanh thu tháng 10/2024 là bao nhiêu?",
  "congty_id": null,
  "loaihd": "banra",
  "nam": 2024,
  "thang": 10,
  "top_k": 5,
  "stream": false
}
```

**Response:**
```json
{
  "success": true,
  "answer": "Dựa trên dữ liệu hóa đơn, tổng doanh thu tháng 10/2024 là...",
  "sources": [
    {
      "id": "...",
      "score": 0.89,
      "payload": {...}
    }
  ],
  "model": "llama3.2:latest"
}
```

## 📖 Hướng Dẫn Sử Dụng

### 1. Đồng bộ dữ liệu ban đầu

```bash
# Ingest toàn bộ dữ liệu
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"batch_size": 100}'

# Ingest theo công ty
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"congty_id": "abc-123", "clear_existing": true}'
```

### 2. Tìm kiếm

```bash
# Semantic search
curl "http://localhost:8000/search?query=hóa%20đơn%20vải&limit=5"
```

### 3. Hỏi đáp

```bash
# RAG Query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Ai là nhà cung cấp vải lớn nhất?"}'
```

## 🔧 Cấu Hình

### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| `DATABASE_URL` | - | PostgreSQL connection string |
| `QDRANT_HOST` | localhost | Qdrant host |
| `QDRANT_PORT` | 6333 | Qdrant port |
| `QDRANT_COLLECTION` | ketoan_invoices | Tên collection |
| `OLLAMA_HOST` | localhost | Ollama host |
| `OLLAMA_PORT` | 11434 | Ollama port |
| `OLLAMA_MODEL` | llama3.2:latest | Model LLM |
| `EMBEDDING_MODEL` | paraphrase-multilingual-MiniLM-L12-v2 | Model embedding |
| `EMBEDDING_DIMENSION` | 384 | Số chiều vector |
| `TOP_K_RESULTS` | 5 | Số kết quả mặc định |

## 📁 Cấu Trúc Project

```
rag-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── models.py            # Pydantic models
│   └── services/
│       ├── __init__.py
│       ├── database.py      # PostgreSQL queries
│       ├── embedding.py     # Sentence transformers
│       ├── vector_store.py  # Qdrant operations
│       └── rag.py           # RAG chain
├── Dockerfile
├── requirements.txt
├── .env.example
└── README.md
```

## 🧪 Testing

```bash
# Kiểm tra health
curl http://localhost:8000/health

# Kiểm tra stats
curl http://localhost:8000/stats

# Test search
curl "http://localhost:8000/search?query=test&limit=3"
```

## 📝 License

MIT
