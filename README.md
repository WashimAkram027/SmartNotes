# 📚 Smart Notes — AI-Powered Document Q&A

A production-grade **RAG (Retrieval-Augmented Generation)** system that lets you upload documents and ask natural-language questions about their content. Built with modern AI engineering patterns to demonstrate multi-provider LLM abstraction, agentic workflows, and clean architecture.

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-3.1-green?logo=flask)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![LangGraph](https://img.shields.io/badge/LangGraph-0.2-orange)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?logo=mongodb)

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite + Tailwind CSS)     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  ChatView    │  │ UploadPanel  │  │ ProviderSelect │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────┘  │
│         └────────────────┼────────────────────┘          │
│                          │  REST API                     │
├──────────────────────────┼───────────────────────────────┤
│  Backend (Flask + Clean Architecture)                    │
│  ┌───────────────────────┼───────────────────────────┐   │
│  │  API Layer (routes.py, errors.py)                 │   │
│  ├───────────────────────┼───────────────────────────┤   │
│  │  Application Layer                                │   │
│  │  ┌──────────────────┐ ┌─────────────────────────┐ │   │
│  │  │ rag_graph.py     │ │ document_service.py     │ │   │
│  │  │ (LangGraph RAG)  │ │ (Ingest orchestration)  │ │   │
│  │  └──────────────────┘ └─────────────────────────┘ │   │
│  ├───────────────────────────────────────────────────┤   │
│  │  Infrastructure Layer                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │llm_factory│ │embedding │ │vector_   │          │   │
│  │  │(Multi-LLM)│ │(OpenAI)  │ │store     │          │   │
│  │  └──────────┘ └──────────┘ │(MongoDB) │          │   │
│  │                            └──────────┘          │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### Multi-Provider LLM Abstraction
Switch between **OpenAI (GPT-4o-mini)** and **Anthropic Claude (3.5 Sonnet)** with a single dropdown. The `llm_factory.py` returns a `BaseChatModel` interface — the rest of the app is provider-agnostic.

### LangGraph Stateful RAG Agent
The retrieval chain is a **LangGraph `StateGraph`** with named nodes and conditional routing:
1. **Retrieve** — MMR-based vector search (diverse, non-redundant results)
2. **Grade Documents** — Checks if retrieved context is relevant
3. **Generate** (if relevant) — LLM call with full context
4. **No-Context Fallback** (if empty) — Returns a safe "I don't know" message instead of hallucinating

### Source Citation
Every answer includes the source documents and page numbers used to generate it, displayed as expandable citations in the UI.

### Clean Architecture
The backend follows a 3-layer pattern:
- **Domain** — Pure Pydantic models, no I/O
- **Application** — Use-case orchestration (RAG graph, document service)
- **Infrastructure** — I/O adapters (LLM factory, embeddings, MongoDB, PDF parser)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- MongoDB Atlas cluster with a **Vector Search index** named `vector_index`
- API keys: OpenAI (required), Anthropic (optional)

### 1. Clone

```bash
git clone https://github.com/NickEscc/InfoNoteTaking.git
cd InfoNoteTaking
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and MongoDB URI
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Locally

**Backend** (terminal 1):
```bash
cd backend
python main.py
# → API running at http://localhost:5000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm run dev
# → UI running at http://localhost:5173
```

The frontend proxies `/api` requests to the backend automatically.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/query` | Ask a question (JSON: `{question, provider}`) |
| `POST` | `/api/documents/upload` | Upload a PDF (multipart form) |
| `POST` | `/api/documents/text` | Upload plain text (JSON: `{text}`) |

---

## 🌐 Deployment

| Service | Platform | Config |
|---------|----------|--------|
| **Frontend** | Vercel | `frontend/vercel.json` — auto-deploys on push to `main` |
| **Backend** | Railway | `backend/railway.json` + `Procfile` — auto-deploys on push to `main` |
| **Database** | MongoDB Atlas | Cloud-hosted, no deployment needed |

### Environment Variables (Railway)
Set these in your Railway service settings:
```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
MONGO_URI=...
CORS_ORIGINS=https://your-vercel-app.vercel.app
```

### Environment Variables (Vercel)
```
VITE_API_URL=https://your-railway-backend.up.railway.app
```

---

## 🧪 CI/CD

GitHub Actions pipeline (`.github/workflows/deploy.yml`):
1. **Lint** — `ruff` (Python) + `tsc --noEmit` (TypeScript)
2. **Test** — `pytest` backend tests
3. **Build** — Vite production build
4. **Deploy** — Triggered on push to `main`

---

## 📁 Project Structure

```
SMARTNOTES/
├── backend/
│   ├── app/
│   │   ├── api/                    # Flask routes & error handlers
│   │   ├── application/            # LangGraph RAG agent, document service
│   │   ├── domain/                 # Pydantic models (no I/O)
│   │   └── infrastructure/         # LLM factory, embeddings, vector store, PDF parser
│   ├── config.py                   # pydantic-settings (.env loader)
│   ├── main.py                     # Flask app factory
│   ├── requirements.txt            # Pinned Python deps
│   ├── Procfile                    # Railway start command
│   └── railway.json                # Railway deploy config
├── frontend/
│   ├── src/
│   │   ├── components/             # ChatView, UploadPanel, ProviderSelector
│   │   ├── hooks/                  # useQuery, useUpload
│   │   ├── types/                  # TypeScript interfaces
│   │   ├── App.tsx                 # Main layout
│   │   └── index.css               # Tailwind + design tokens
│   ├── vercel.json                 # Vercel deploy config
│   └── package.json
├── .github/workflows/deploy.yml    # CI/CD pipeline
└── .gitignore
```

---

## 📝 License

MIT
