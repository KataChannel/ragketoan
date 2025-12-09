# 📊 Review & Kế Hoạch Phát Triển Hệ Thống RAG Kế Toán Chuyên Nghiệp

> **Ngày tạo:** 09/12/2025  
> **Version:** 1.0  
> **Author:** Development Team

---

## Mục Lục

1. [Review Hệ Thống Hiện Tại](#1-review-hệ-thống-hiện-tại)
2. [Kế Hoạch Phát Triển Chi Tiết](#2-kế-hoạch-phát-triển-chi-tiết)
3. [Kiến Trúc Mục Tiêu](#3-kiến-trúc-mục-tiêu)
4. [Timeline & Milestones](#4-timeline--milestones)
5. [Next Steps](#5-next-steps)

---

## 1. Review Hệ Thống Hiện Tại

### 1.1 Kiến Trúc Hiện Tại

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

### 1.2 Stack Công Nghệ

| Component | Technology | Version |
|-----------|------------|---------|
| Frontend | Next.js + React + TypeScript | 16.x / 19.x |
| Backend API | Next.js API Routes | 16.x |
| RAG Service | Python FastAPI | 0.115.x |
| Database | PostgreSQL + Prisma | 16 / 6.8 |
| Vector DB | Qdrant | Latest |
| LLM (Local) | Ollama (llama3.2) | Latest |
| LLM (Cloud) | Google AI Studio (Gemini) | 1.5/2.0 |
| Embedding | sentence-transformers | 3.3.x |
| Container | Docker Compose | Latest |
| Workflow | n8n | Latest |

### 1.2.1 LLM Provider Options

Hệ thống hỗ trợ 2 LLM providers:

| Provider | Type | Advantages | Disadvantages |
|----------|------|------------|---------------|
| **Ollama** | Local | 100% private, no cost, offline capable | Cần GPU mạnh, chậm hơn |
| **Google AI Studio** | Cloud | Chất lượng cao, nhanh, free tier generous | Cần internet, data gửi lên cloud |

**Cấu hình chọn provider:**

```bash
# File: .env

# Option 1: Ollama (Local - Default)
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:latest

# Option 2: Google AI Studio (Cloud)
LLM_PROVIDER=google
GOOGLE_API_KEY=your-api-key
GOOGLE_MODEL=gemini-1.5-flash
```

**Google AI Studio Models:**
- `gemini-1.5-flash` - Nhanh, tốt cho hầu hết tác vụ
- `gemini-1.5-pro` - Chất lượng cao nhất, chậm hơn
- `gemini-2.0-flash-exp` - Mới nhất, experimental

### 1.3 Đánh Giá Components

#### ✅ Điểm Mạnh Đã Triển Khai

| Component | Status | Đánh giá |
|-----------|--------|----------|
| **FastAPI Backend** | ✅ Hoàn thành | Cấu trúc tốt, có health check, CORS |
| **Embedding Service** | ✅ Hoàn thành | Singleton pattern, multilingual model |
| **Vector Store (Qdrant)** | ✅ Hoàn thành | Indexes cho filtering |
| **RAG Chain** | ✅ Basic | System prompt, streaming support |
| **API Proxy (Next.js)** | ✅ Hoàn thành | `/api/rag/*` endpoints |
| **Docker Integration** | ✅ Hoàn thành | docker-compose.yml updated |
| **Database Schema** | ✅ Tốt | ext_tonghop denormalized cho RAG |

#### ⚠️ Điểm Cần Cải Thiện

| Vấn đề | Mức độ | Giải pháp đề xuất |
|--------|--------|-------------------|
| **Chưa có Caching** | 🔴 Cao | Redis cache cho queries |
| **Embedding Model chưa tối ưu** | 🟡 Trung bình | Fine-tune hoặc dùng model tốt hơn |
| **Thiếu Query Understanding** | 🔴 Cao | Intent classification |
| **Thiếu Aggregation** | 🔴 Cao | SQL queries cho tính toán |
| **Thiếu Conversation Memory** | 🟡 Trung bình | Chat history |
| **Thiếu Feedback Loop** | 🟡 Trung bình | User feedback collection |
| **Thiếu Monitoring** | 🔴 Cao | Prometheus/Grafana |
| **Thiếu Testing** | 🔴 Cao | Unit/Integration tests |
| **Thiếu Rate Limiting** | 🟡 Trung bình | API rate limiting |
| **UI Chat chưa có** | 🔴 Cao | Chat interface trong Next.js |

---

## 2. Kế Hoạch Phát Triển Chi Tiết

### 🗓️ PHASE 1: Foundation Enhancement (Tuần 1-2)

#### 2.1.1 Query Understanding & Classification

**Mục tiêu:** Hiểu intent của câu hỏi để xử lý phù hợp

**Các loại query cần hỗ trợ:**

| Query Type | Ví dụ | Xử lý |
|------------|-------|-------|
| **Aggregation** | "Tổng doanh thu tháng 10?" | SQL SUM/AVG/COUNT |
| **Search** | "Tìm hóa đơn mua vải" | Vector search |
| **Comparison** | "So sánh doanh thu Q1 và Q2" | Multiple queries |
| **Detail** | "Chi tiết hóa đơn số 123" | Direct lookup |
| **Time-based** | "Nhập hàng tuần này" | Date filter |
| **Top-N** | "Top 5 khách hàng lớn nhất" | SQL ORDER + LIMIT |

**Implementation:**

```python
class QueryClassifier:
    QUERY_TYPES = {
        "aggregation": ["tổng", "sum", "trung bình", "đếm", "bao nhiêu"],
        "search": ["tìm", "kiếm", "search", "hóa đơn nào"],
        "comparison": ["so sánh", "compare", "cao hơn", "thấp hơn"],
        "detail": ["chi tiết", "detail", "xem", "thông tin"],
        "top_n": ["top", "cao nhất", "lớn nhất", "nhiều nhất"],
    }
    
    def classify(self, query: str) -> str:
        # Intent classification logic
        pass
```

#### 2.1.2 Hybrid Search (Vector + SQL)

**Mục tiêu:** Kết hợp semantic search với SQL aggregation

**Workflow:**

```
User Query
    │
    ▼
┌─────────────────┐
│ Query Classifier │
└─────────────────┘
    │
    ├──► Aggregation → SQL Query → PostgreSQL
    │
    ├──► Search → Vector Search → Qdrant
    │
    └──► Hybrid → Both → Merge Results
            │
            ▼
    ┌─────────────────┐
    │  LLM Generate   │
    └─────────────────┘
```

**SQL Aggregation Examples:**

```sql
-- Tổng doanh thu theo tháng
SELECT thang, nam, SUM("tongTien") as total
FROM ext_tonghop
WHERE loaihd = 'banra' AND nam = 2024
GROUP BY thang, nam
ORDER BY thang;

-- Top 5 nhà cung cấp
SELECT nbten, SUM("tongTien") as total
FROM ext_tonghop  
WHERE loaihd = 'muavao'
GROUP BY nbten
ORDER BY total DESC
LIMIT 5;
```

#### 2.1.3 Caching Layer

**Mục tiêu:** Giảm latency, tiết kiệm compute

**Components:**

| Cache Type | Storage | TTL | Use Case |
|------------|---------|-----|----------|
| Query Cache | Redis | 5 min | Identical queries |
| Embedding Cache | LRU Memory | 1 hour | Repeated texts |
| Response Cache | Redis | 10 min | Full responses |
| Aggregation Cache | Redis | 15 min | SQL results |

**Redis Setup:**

```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - 6379:6379
  volumes:
    - redis_storage:/data
```

---

### 🗓️ PHASE 2: Advanced RAG Features (Tuần 3-4)

#### 2.2.1 Multi-Step RAG (Agentic RAG)

**Mục tiêu:** Xử lý câu hỏi phức tạp cần nhiều bước

**Ví dụ:**

```
Q: "Top 5 nhà cung cấp có giá trị mua hàng cao nhất quý 4?"

Agent Planning:
┌─────────────────────────────────────────────┐
│ Step 1: Parse query                         │
│   - Action: top_n                           │
│   - Entity: nhà cung cấp                    │
│   - Metric: giá trị mua hàng                │
│   - Filter: quý 4                           │
│   - Limit: 5                                │
├─────────────────────────────────────────────┤
│ Step 2: Execute SQL                         │
│   SELECT nbten, SUM(tongTien) as total      │
│   FROM ext_tonghop                          │
│   WHERE loaihd='muavao' AND quy=4           │
│   GROUP BY nbten                            │
│   ORDER BY total DESC LIMIT 5               │
├─────────────────────────────────────────────┤
│ Step 3: Format response                     │
│   Generate natural language answer          │
└─────────────────────────────────────────────┘
```

#### 2.2.2 Tool Calling / Function Calling

**Mục tiêu:** LLM có thể gọi các tools để lấy data

**Available Tools:**

```python
TOOLS = [
    {
        "name": "search_invoices",
        "description": "Tìm kiếm hóa đơn theo nội dung",
        "parameters": {
            "query": "string - Nội dung tìm kiếm",
            "loaihd": "string - banra/muavao (optional)",
            "limit": "int - Số kết quả (default: 10)"
        }
    },
    {
        "name": "aggregate_data",
        "description": "Tính toán thống kê (tổng, trung bình, đếm)",
        "parameters": {
            "metric": "string - tongTien/sluong/count",
            "group_by": "string - nbten/nmten/tenHang/thang",
            "filters": "object - Điều kiện lọc"
        }
    },
    {
        "name": "get_invoice_detail",
        "description": "Lấy chi tiết một hóa đơn",
        "parameters": {
            "invoice_id": "string - ID hóa đơn"
        }
    },
    {
        "name": "compare_periods",
        "description": "So sánh dữ liệu giữa 2 khoảng thời gian",
        "parameters": {
            "period1": "object - {thang, nam} hoặc {quy, nam}",
            "period2": "object - {thang, nam} hoặc {quy, nam}",
            "metric": "string - Chỉ số so sánh"
        }
    },
    {
        "name": "export_report",
        "description": "Xuất báo cáo",
        "parameters": {
            "report_type": "string - xnt/doanhthu/muahang",
            "format": "string - json/csv/excel",
            "filters": "object - Điều kiện lọc"
        }
    }
]
```

#### 2.2.3 Conversation Memory

**Mục tiêu:** Hỗ trợ hội thoại liên tục

**Features:**

- Session management (UUID per conversation)
- Context carry-over (last 5-10 messages)
- Reference resolution ("nó", "hóa đơn đó", "công ty này")
- Summarization for long conversations

**Schema:**

```python
class ConversationMessage:
    id: str
    session_id: str
    role: str  # user/assistant
    content: str
    sources: List[str]  # Referenced document IDs
    timestamp: datetime
    
class ConversationSession:
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    messages: List[ConversationMessage]
    context: Dict  # Extracted entities, filters
```

---

### 🗓️ PHASE 3: Production Ready (Tuần 5-6)

#### 2.3.1 Monitoring & Observability

**Mục tiêu:** Theo dõi performance và debug issues

**Stack:**

| Component | Purpose | Port |
|-----------|---------|------|
| Prometheus | Metrics collection | 9090 |
| Grafana | Visualization | 3001 |
| Loki | Log aggregation | 3100 |
| Jaeger | Distributed tracing | 16686 |

**Metrics to Track:**

```python
# RAG Service Metrics
rag_query_latency_seconds = Histogram(
    'rag_query_latency_seconds',
    'RAG query latency',
    ['query_type', 'status']
)

rag_embedding_latency_seconds = Histogram(
    'rag_embedding_latency_seconds',
    'Embedding generation latency'
)

rag_vector_search_latency_seconds = Histogram(
    'rag_vector_search_latency_seconds', 
    'Qdrant search latency'
)

rag_llm_latency_seconds = Histogram(
    'rag_llm_latency_seconds',
    'LLM response latency',
    ['model']
)

rag_cache_hits_total = Counter(
    'rag_cache_hits_total',
    'Cache hits',
    ['cache_type']
)

rag_errors_total = Counter(
    'rag_errors_total',
    'Total errors',
    ['error_type']
)
```

**Grafana Dashboard Panels:**

1. Request Rate & Latency
2. Cache Hit Rate
3. Error Rate by Type
4. Vector Store Stats
5. LLM Token Usage
6. Active Sessions

#### 2.3.2 Security & Rate Limiting

**Mục tiêu:** Bảo vệ API và manage resources

**Features:**

```python
# Rate Limiting
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/query")
@limiter.limit("10/minute")  # 10 requests per minute
async def rag_query(request: QueryRequest):
    pass

# API Key Auth
from fastapi.security import APIKeyHeader

api_key_header = APIKeyHeader(name="X-API-Key")

async def verify_api_key(api_key: str = Depends(api_key_header)):
    if api_key not in VALID_API_KEYS:
        raise HTTPException(status_code=403)
    return api_key
```

**Security Checklist:**

- [ ] API key authentication
- [ ] Rate limiting (per user/IP)
- [ ] Input validation & sanitization
- [ ] SQL injection prevention
- [ ] Prompt injection prevention
- [ ] Audit logging
- [ ] HTTPS only
- [ ] CORS configuration

#### 2.3.3 Testing Suite

**Mục tiêu:** Đảm bảo chất lượng code

**Test Types:**

```
tests/
├── unit/
│   ├── test_query_classifier.py
│   ├── test_embedding_service.py
│   ├── test_vector_store.py
│   └── test_aggregation.py
├── integration/
│   ├── test_rag_chain.py
│   ├── test_api_endpoints.py
│   └── test_database.py
├── e2e/
│   └── test_full_workflow.py
├── benchmark/
│   ├── test_latency.py
│   └── test_throughput.py
└── evaluation/
    ├── test_rag_quality.py  # Using RAGAS
    └── golden_dataset.json
```

**RAG Evaluation Metrics (RAGAS):**

- **Faithfulness**: Answer grounded in context?
- **Answer Relevancy**: Answer relevant to question?
- **Context Precision**: Retrieved docs relevant?
- **Context Recall**: All needed info retrieved?

---

### 🗓️ PHASE 4: User Experience (Tuần 7-8)

#### 2.4.1 Chat UI Component

**Mục tiêu:** Giao diện chat đẹp, dễ sử dụng

**Features:**

- Real-time streaming responses
- Message history với pagination
- Source citations (clickable)
- Quick action buttons
- Export conversations
- Mobile responsive
- Dark mode support

**Component Structure:**

```
app/
├── chat/
│   └── page.tsx           # Chat page
├── components/
│   └── chat/
│       ├── ChatContainer.tsx
│       ├── ChatMessage.tsx
│       ├── ChatInput.tsx
│       ├── SourceCard.tsx
│       ├── QuickActions.tsx
│       └── ChatHistory.tsx
```

**UI Mockup:**

```
┌─────────────────────────────────────────────────────────┐
│  🤖 RAG Kế Toán Assistant                    [History] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 User                                          │   │
│  │ Tổng doanh thu tháng 10/2024 là bao nhiêu?      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🤖 Assistant                                     │   │
│  │ Dựa trên dữ liệu hóa đơn bán ra, tổng doanh     │   │
│  │ thu tháng 10/2024 là **1,234,567,890 VNĐ**.     │   │
│  │                                                  │   │
│  │ Chi tiết:                                        │   │
│  │ • Số hóa đơn: 156                               │   │
│  │ • Giá trị TB: 7,913,896 VNĐ                     │   │
│  │                                                  │   │
│  │ 📎 Sources: [HD001] [HD002] [HD003]             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Quick Actions:                                   │   │
│  │ [So sánh với T9] [Chi tiết top 10] [Xuất báo cáo]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐ [Send]   │
│  │ Hỏi về hóa đơn, doanh thu, xuất nhập...  │          │
│  └─────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
```

#### 2.4.2 Auto-sync Pipeline

**Mục tiêu:** Tự động cập nhật vector store khi có data mới

**Workflow với n8n:**

```
┌──────────────────┐
│   PostgreSQL     │
│   ext_tonghop    │
│   (INSERT/UPDATE)│
└────────┬─────────┘
         │ Trigger
         ▼
┌──────────────────┐
│   n8n Workflow   │
│   - Scheduled    │
│   - or Webhook   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  RAG Service     │
│  POST /ingest    │
│  (incremental)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│     Qdrant       │
│   (Updated)      │
└──────────────────┘
```

**n8n Workflow Config:**

```json
{
  "name": "Auto Sync RAG",
  "trigger": {
    "type": "schedule",
    "interval": "*/30 * * * *"  // Every 30 minutes
  },
  "nodes": [
    {
      "name": "Check New Records",
      "type": "postgres",
      "query": "SELECT COUNT(*) FROM ext_tonghop WHERE \"syncedAt\" > NOW() - INTERVAL '30 minutes'"
    },
    {
      "name": "Trigger Ingest",
      "type": "httpRequest",
      "method": "POST",
      "url": "http://rag-service:8000/ingest",
      "body": {
        "from_date": "{{ $now.minus(30, 'minutes').toISO() }}"
      }
    }
  ]
}
```

#### 2.4.3 Feedback Collection

**Mục tiêu:** Thu thập feedback để cải thiện

**Features:**

- 👍/👎 rating per response
- Correct answer submission
- Issue reporting
- Analytics dashboard

**Schema:**

```sql
CREATE TABLE rag_feedback (
  id UUID PRIMARY KEY,
  session_id UUID,
  message_id UUID,
  rating INT,  -- 1 = bad, 5 = good
  correct_answer TEXT,
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Kiến Trúc Mục Tiêu

### 3.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Dashboard  │  │  Chat UI     │  │   Reports    │  │   Settings   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY (Next.js API)                        │
│              Rate Limiting │ Auth │ Caching │ Logging                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   RAG Service    │    │  Invoice Sync    │    │    n8n           │
│   (FastAPI)      │    │  (Next.js API)   │    │  Workflows       │
└──────────────────┘    └──────────────────┘    └──────────────────┘
          │                         │                         │
          ▼                         │                         │
┌──────────────────┐               │                         │
│ Query Classifier │               │                         │
│ ┌──────────────┐ │               │                         │
│ │   Search     │ │               │                         │
│ │ Aggregation  │ │               │                         │
│ │   Hybrid     │ │               │                         │
│ └──────────────┘ │               │                         │
└──────────────────┘               │                         │
          │                         │                         │
    ┌─────┴─────┐                   │                         │
    ▼           ▼                   ▼                         │
┌────────┐ ┌────────┐    ┌──────────────────┐                │
│ Qdrant │ │PostgreSQL│   │   Tax API       │                │
│        │ │          │   │  (External)     │                │
└────────┘ └────────┘    └──────────────────┘                │
                                                              │
┌─────────────────────────────────────────────────────────────┘
│                     SHARED SERVICES
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  │  Redis   │  │  Ollama  │  │Prometheus│  │  Grafana │
│  │  Cache   │  │   LLM    │  │ Metrics  │  │Dashboard │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘
└─────────────────────────────────────────────────────────────
```

### 3.2 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  User Query │────▶│   Gateway   │────▶│ RAG Service │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
           ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
           │    Cache      │          │Query Classifier│          │   Session     │
           │   (Redis)     │          │               │          │   Memory      │
           └───────┬───────┘          └───────┬───────┘          └───────────────┘
                   │                          │
                   │ Cache Miss               │
                   │                          ▼
                   │               ┌─────────────────────┐
                   │               │   Route by Type     │
                   │               └─────────────────────┘
                   │                    │         │
                   │           ┌────────┘         └────────┐
                   │           ▼                           ▼
                   │  ┌───────────────┐           ┌───────────────┐
                   │  │ Vector Search │           │SQL Aggregation│
                   │  │   (Qdrant)    │           │ (PostgreSQL)  │
                   │  └───────┬───────┘           └───────┬───────┘
                   │          │                           │
                   │          └─────────┬─────────────────┘
                   │                    │
                   │                    ▼
                   │           ┌───────────────┐
                   │           │ Merge Results │
                   │           └───────┬───────┘
                   │                   │
                   │                   ▼
                   │           ┌───────────────┐
                   └──────────▶│  LLM Generate │
                               │   (Ollama)    │
                               └───────┬───────┘
                                       │
                                       ▼
                               ┌───────────────┐
                               │   Response    │
                               └───────────────┘
```

---

## 4. Timeline & Milestones

### 4.1 Gantt Chart

```
Week    1    2    3    4    5    6    7    8    9    10
        ├────┼────┼────┼────┼────┼────┼────┼────┼────┤
Phase 1 ████████
        Query Classifier, Hybrid Search, Caching

Phase 2           ████████
                  Tools, Agent, Memory

Phase 3                     ████████
                            Monitoring, Security, Tests

Phase 4                               ████████
                                      Chat UI, Auto-sync, Feedback

Testing                                        ████
                                               QA & Bug fixes

Deploy                                              ████
                                                    Production
```

### 4.2 Detailed Task Breakdown

#### Phase 1: Foundation Enhancement (Tuần 1-2)

| Task | Priority | Est. Time | Status |
|------|----------|-----------|--------|
| Query Classifier | P0 | 2 days | 🔲 |
| SQL Aggregation Service | P0 | 2 days | 🔲 |
| Hybrid Search Logic | P0 | 2 days | 🔲 |
| Redis Setup | P1 | 0.5 day | 🔲 |
| Query Cache | P1 | 1 day | 🔲 |
| Embedding Cache | P1 | 0.5 day | 🔲 |
| Unit Tests Phase 1 | P1 | 2 days | 🔲 |

#### Phase 2: Advanced RAG (Tuần 3-4)

| Task | Priority | Est. Time | Status |
|------|----------|-----------|--------|
| Tool Definitions | P0 | 2 days | 🔲 |
| Agent Loop | P0 | 3 days | 🔲 |
| Session Management | P1 | 1 day | 🔲 |
| Conversation Memory | P1 | 2 days | 🔲 |
| Reference Resolution | P2 | 1 day | 🔲 |
| Multi-step Planning | P2 | 2 days | 🔲 |
| Unit Tests Phase 2 | P1 | 2 days | 🔲 |

#### Phase 3: Production Ready (Tuần 5-6)

| Task | Priority | Est. Time | Status |
|------|----------|-----------|--------|
| Prometheus Integration | P0 | 1 day | 🔲 |
| Grafana Dashboards | P0 | 1 day | 🔲 |
| Rate Limiting | P0 | 0.5 day | 🔲 |
| API Key Auth | P1 | 0.5 day | 🔲 |
| Input Validation | P1 | 1 day | 🔲 |
| Audit Logging | P1 | 1 day | 🔲 |
| Integration Tests | P1 | 2 days | 🔲 |
| Load Testing | P2 | 1 day | 🔲 |
| RAG Evaluation | P2 | 2 days | 🔲 |

#### Phase 4: User Experience (Tuần 7-8)

| Task | Priority | Est. Time | Status |
|------|----------|-----------|--------|
| Chat Container Component | P0 | 1 day | 🔲 |
| Chat Message Component | P0 | 1 day | 🔲 |
| Streaming UI | P0 | 1 day | 🔲 |
| Chat Input & Actions | P0 | 1 day | 🔲 |
| Source Citations | P1 | 0.5 day | 🔲 |
| Chat History | P1 | 1 day | 🔲 |
| n8n Auto-sync Workflow | P1 | 1 day | 🔲 |
| Feedback UI | P2 | 1 day | 🔲 |
| Feedback Backend | P2 | 1 day | 🔲 |
| Analytics Dashboard | P2 | 2 days | 🔲 |

### 4.3 Milestones

| Milestone | Target Date | Deliverables |
|-----------|-------------|--------------|
| M1: Hybrid Search | End Week 2 | Query classifier, SQL aggregation, caching |
| M2: Agent System | End Week 4 | Tools, multi-step, conversation memory |
| M3: Production Ready | End Week 6 | Monitoring, security, full test coverage |
| M4: MVP Complete | End Week 8 | Chat UI, auto-sync, feedback system |
| M5: Production Deploy | End Week 10 | Deployed, documented, monitored |

---

## 5. Next Steps

### 5.1 Immediate Actions (Tuần này)

1. **Query Classifier Implementation**
   - Define query types và patterns
   - Build classifier với rule-based + ML
   - Test với sample queries

2. **SQL Aggregation Service**
   - Define aggregation query templates
   - Build parameterized query builder
   - Add security (SQL injection prevention)

3. **Chat UI Skeleton**
   - Create basic chat component structure
   - Implement message display
   - Add input handling

### 5.2 Prerequisites

- [ ] Redis server added to docker-compose
- [ ] Prometheus/Grafana setup
- [ ] Test data prepared
- [ ] API documentation updated

### 5.3 Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| LLM latency high | High | Medium | Caching, model optimization |
| Embedding quality low | High | Low | Model fine-tuning, better preprocessing |
| SQL injection | Critical | Low | Parameterized queries, input validation |
| Rate limit exceeded | Medium | Medium | Redis rate limiting, queue system |
| Memory overflow | High | Low | Batch processing, pagination |

---

## Appendix

### A. Useful Commands

```bash
# Start all services
docker compose up -d

# Start RAG service only
docker compose up rag-service -d

# View logs
docker compose logs -f rag-service

# Test health
curl http://localhost:8000/health

# Ingest data
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: application/json" \
  -d '{"batch_size": 100}'

# Query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Tổng doanh thu tháng 10?"}'
```

### B. Environment Variables

```env
# RAG Service
DATABASE_URL=postgresql://user:pass@postgres:5432/db
QDRANT_HOST=qdrant
QDRANT_PORT=6333

# LLM Provider Configuration
LLM_PROVIDER=ollama    # 'ollama' (local) or 'google' (cloud)

# Ollama (Local)
OLLAMA_HOST=ollama
OLLAMA_PORT=11434
OLLAMA_MODEL=llama3.2:latest

# Google AI Studio (Cloud) - Optional
GOOGLE_API_KEY=your-api-key
GOOGLE_MODEL=gemini-1.5-flash

# Embedding
EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

# Caching (Phase 1)
REDIS_URL=redis://redis:6379

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001
```

### C. References

- [LangChain Documentation](https://python.langchain.com/)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [RAGAS Evaluation](https://docs.ragas.io/)
- [n8n Documentation](https://docs.n8n.io/)

---

*Document Version: 1.0*  
*Last Updated: 09/12/2025*
