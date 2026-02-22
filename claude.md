# SmartNotes — Project Context for Claude

> This file provides Claude (or any AI assistant) with a complete understanding of the SmartNotes project architecture, data flow, and conventions.

---

## Project Overview

SmartNotes is a **RAG (Retrieval-Augmented Generation)** document Q&A system. Users upload PDFs or plain text, which are chunked, embedded, and stored in MongoDB Atlas Vector Search. When a user asks a question, the system retrieves relevant chunks via MMR similarity search, then generates an answer using a configurable LLM provider (OpenAI or Anthropic Claude).

**Status:** Locally tested and fully operational. Backend serves API, frontend connects to it, documents are uploaded, embedded, stored, and successfully retrieved for Q&A.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Python 3.14, Flask, Gunicorn | Flask 3.1.0 |
| **AI/ML** | LangChain, LangGraph | langchain 1.2.10, langgraph 1.0.9 |
| **LLM Providers** | OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet | langchain-openai 1.1.10, langchain-anthropic 1.3.3 |
| **Embeddings** | OpenAI `text-embedding-3-small` (1536 dims) | via langchain-openai |
| **Vector DB** | MongoDB Atlas Vector Search (MMR retrieval) | langchain-mongodb 0.11.0, pymongo 4.16.0 |
| **Frontend** | React 18, TypeScript 5, Vite 7.3, Tailwind CSS | |
| **Deployment** | Railway (backend), Vercel (frontend) | |
| **CI/CD** | GitHub Actions | |

---

## Architecture — Clean Layers

```
backend/
├── config.py                    # pydantic-settings, loads .env
├── main.py                      # Flask app factory (entry point)
└── app/
    ├── api/                     # Thin controller layer
    │   ├── routes.py            # Flask blueprints: /api/query, /api/documents/*
    │   └── errors.py            # Global error → JSON handlers
    ├── application/             # Use-case orchestration (NO direct I/O)
    │   ├── rag_graph.py         # LangGraph StateGraph (retrieve → grade → generate)
    │   └── document_service.py  # Ingest pipeline (load → dedup → chunk → store)
    ├── domain/                  # Pure data models (NO I/O, NO side effects)
    │   └── models.py            # Pydantic: QueryRequest, QueryResponse, SourceDocument, etc.
    └── infrastructure/          # I/O adapters (external services)
        ├── llm_factory.py       # Multi-provider LLM factory (OpenAI | Anthropic)
        ├── embedding.py         # Singleton OpenAI embeddings
        ├── vector_store.py      # MongoDB Atlas Vector Search + MMR retriever
        └── pdf_parser.py        # PDF loading + RecursiveCharacterTextSplitter
```

**Dependency rule:** `api → application → infrastructure` and `domain` is used by all layers but depends on none.

---

## Data Flow

### 1. Document Ingestion

```
User uploads PDF/text
       │
       ▼
  POST /api/documents/upload  (or /text)
       │
       ▼
  document_service.ingest_pdf()
       │
       ├── pdf_parser.load_pdf()           → list[Document]
       ├── pdf_parser.compute_file_hash()  → MD5 dedup check
       ├── pdf_parser.chunk_documents()    → RecursiveCharacterTextSplitter (1200/300)
       └── vector_store.store_documents()  → Embed via OpenAI → Insert into MongoDB Atlas
```

### 2. Query (RAG Pipeline)

```
User asks a question + selects provider
       │
       ▼
  POST /api/query  { question, provider }
       │
       ▼
  rag_graph.query_rag()
       │
       ▼
  ┌─────────────────────────────────────────────┐
  │  LangGraph StateGraph                       │
  │                                             │
  │  START                                      │
  │    ▼                                        │
  │  retrieve ← vector_store.get_retriever()    │
  │    │         (MMR, k=8, fetch_k=20)         │
  │    ▼                                        │
  │  grade_docs ── any relevant? ──┐            │
  │    │ YES                       │ NO         │
  │    ▼                           ▼            │
  │  generate                 no_context_resp   │
  │    │ (llm_factory.get_llm)     │            │
  │    ▼                           ▼            │
  │  END (answer + sources)   END ("I don't     │
  │                            know...")         │
  └─────────────────────────────────────────────┘
       │
       ▼
  QueryResponse { answer, provider, model, sources[] }
```

### 3. Multi-Provider LLM Abstraction

```python
# infrastructure/llm_factory.py
get_llm("openai")     → ChatOpenAI(model="gpt-4o-mini")
get_llm("anthropic")  → ChatAnthropic(model="claude-3-5-sonnet-20241022")
# Both return BaseChatModel — caller is provider-agnostic
```

The `provider` field is passed from the frontend dropdown → API request → LangGraph state → `llm_factory.get_llm()`.

---

## Key Configuration

All config lives in `backend/config.py` via `pydantic-settings`, loaded from `.env`:

| Variable | Purpose | Default |
|----------|---------|---------|
| `OPENAI_API_KEY` | OpenAI API key | (required) |
| `ANTHROPIC_API_KEY` | Anthropic API key | (optional) |
| `MONGO_URI` | MongoDB Atlas connection string | (required) |
| `DEFAULT_LLM_PROVIDER` | Default provider | `openai` |
| `RETRIEVAL_K` | Number of MMR results | `8` |
| `CHUNK_SIZE` / `CHUNK_OVERLAP` | Text splitting params | `1200` / `300` |

---

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Liveness probe |
| `POST` | `/api/query` | RAG Q&A (body: `{question, provider}`) |
| `POST` | `/api/documents/upload` | PDF upload (multipart form) |
| `POST` | `/api/documents/text` | Plain text upload (body: `{text}`) |

---

## Frontend Structure

```
frontend/src/
├── App.tsx                      # Layout: sidebar + chat
├── components/
│   ├── ChatView.tsx             # Conversation UI + source citations
│   ├── UploadPanel.tsx          # Drag-and-drop PDF + text input
│   └── ProviderSelector.tsx     # OpenAI / Claude toggle
├── hooks/
│   ├── useQuery.ts              # Fetch wrapper for /api/query
│   └── useUpload.ts             # Fetch wrapper for /api/documents/*
├── types/index.ts               # Strict TypeScript interfaces
└── index.css                    # Tailwind + design tokens (dark theme)
```

---

## Important Implementation Notes

### LangChain 1.x Migration
The project uses LangChain 1.x (not 0.3.x). Key import paths:
- `MongoDBAtlasVectorSearch` → from `langchain_mongodb` (NOT `langchain_community`)
- `RecursiveCharacterTextSplitter` → from `langchain_text_splitters` (NOT `langchain.text_splitter`)
- `PyPDFLoader` → from `langchain_community.document_loaders` (still valid)

### Vector Store Auto-Index
The `MongoDBAtlasVectorSearch` is configured with `auto_create_index=True` and `auto_index_timeout=120`. On first query after a fresh deployment, it will auto-create the Atlas Vector Search index (~1-3 min build time). Subsequent requests are instant.

### Conventions
- **Type hints everywhere** — all Python functions have full type annotations
- **Pydantic for validation** — every API input/output is a Pydantic model
- **Singleton infrastructure** — MongoDB client, embeddings, and LangGraph are initialized once
- **Lazy imports** — provider SDKs imported inside `get_llm()` to avoid loading unused libraries
- **No secrets in code** — everything via `.env` / environment variables
- **Source citations** — every `QueryResponse` includes truncated source chunks with file names and page numbers

---

## Deployment

| Service | Platform | Config File |
|---------|----------|-------------|
| Backend | Railway | `backend/Procfile`, `backend/railway.json` |
| Frontend | Vercel | `frontend/vercel.json` |
| CI/CD | GitHub Actions | `.github/workflows/deploy.yml` |
| Database | MongoDB Atlas | Cloud-hosted (no local container) |
