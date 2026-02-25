# Smart Notes — Future Improvements

## Current Limitations

### 1. No Conversation Memory
The system processes each query independently with no context from prior messages. Users must repeat context across questions, and multi-turn reasoning (e.g., "tell me more about that") is unsupported.

### 2. Single-Step Retrieval
The current RAG pipeline performs a single retrieval pass. For complex or multi-faceted questions, a single retrieval may miss relevant chunks that would be found through query decomposition or iterative retrieval.

### 3. No Chain-of-Thought Reasoning
The LLM generates answers directly from retrieved context without intermediate reasoning steps. This limits accuracy on questions requiring logical deduction, comparison, or synthesis across multiple documents.

### 4. Basic Document Grading
Document relevance is assessed with a simple "is there content?" check rather than semantic relevance scoring. Irrelevant chunks can pollute the context window and reduce answer quality.

### 5. No Query Rewriting
User queries are passed directly to the vector store. Ambiguous, poorly worded, or conversational queries can lead to poor retrieval results.

### 6. Limited File Format Support
Only PDF and plain text are supported. Common formats like DOCX, PPTX, CSV, Markdown, and HTML cannot be ingested.

### 7. No Streaming Responses
Answers are returned only after the full generation is complete. For longer answers, users must wait with no feedback.

### 8. No User Authentication
The application has no user accounts or access control. All documents and queries are shared across all users of the same deployment.

---

## Proposed Improvements

### Phase 1: Core RAG Enhancements

#### Conversation Memory (LangGraph State)
- Add a `ConversationBufferWindowMemory` or `ChatMessageHistory` to the graph state
- Maintain a sliding window of the last N messages
- Inject prior conversation context into the prompt template
- **Impact**: Enables multi-turn dialogues and follow-up questions

#### Query Rewriting / HyDE
- Add a "rewrite" node before retrieval that reformulates the user's query
- Implement HyDE (Hypothetical Document Embeddings) — generate a hypothetical answer, then use it as the search query
- **Impact**: Dramatically improves retrieval recall for vague or conversational queries

#### Advanced Document Grading
- Replace the binary relevance check with an LLM-based grader
- Score each retrieved chunk on a 1-5 relevance scale
- Filter out chunks below a threshold before passing to the generator
- **Impact**: Reduces hallucination by removing irrelevant context

### Phase 2: Advanced Reasoning

#### Chain-of-Thought (CoT) Prompting
- Modify the RAG prompt to instruct the LLM to reason step-by-step
- Add a "scratchpad" field in the graph state for intermediate reasoning
- **Impact**: More accurate answers on complex, multi-step questions

#### Self-Corrective RAG (CRAG)
- After generation, add a "hallucination check" node that verifies the answer against the retrieved context
- If the answer isn't grounded, trigger a re-retrieval with a refined query
- **Impact**: Significantly reduces hallucination

#### Multi-Hop Retrieval
- Decompose complex questions into sub-questions
- Retrieve separately for each sub-question
- Merge and deduplicate retrieved contexts
- **Impact**: Handles questions that span multiple documents or topics

### Phase 3: Infrastructure & UX

#### Streaming Responses (SSE)
- Switch from synchronous `/api/query` to Server-Sent Events
- Stream tokens as they are generated
- Display incremental text in the chat UI
- **Impact**: Dramatically better perceived performance

#### Expanded File Format Support
- Add loaders for DOCX (python-docx), PPTX (python-pptx), CSV, Markdown, HTML
- Support URL ingestion (scrape and index web pages)
- **Impact**: Much broader document intake capability

#### User Authentication & Multi-Tenancy
- Add JWT-based auth with user accounts
- Namespace documents per user in MongoDB
- **Impact**: Production-ready access control

#### Hybrid Search (Semantic + Keyword)
- Combine vector similarity search with BM25 full-text search
- Use Reciprocal Rank Fusion (RRF) to merge results
- **Impact**: Better retrieval for keyword-heavy queries (names, codes, IDs)

#### Evaluation & Observability
- Integrate LangSmith or Phoenix for tracing every RAG pipeline run
- Add RAGAS metrics (faithfulness, answer relevancy, context precision)
- **Impact**: Data-driven improvement cycle

---

## Priority Roadmap

| Priority | Improvement | Effort | Impact |
|----------|------------|--------|--------|
| 🔴 High | Conversation Memory | Medium | High |
| 🔴 High | Query Rewriting / HyDE | Low | High |
| 🔴 High | Streaming Responses | Medium | High |
| 🟡 Medium | Chain-of-Thought Prompting | Low | Medium |
| 🟡 Medium | Advanced Document Grading | Medium | Medium |
| 🟡 Medium | Self-Corrective RAG | High | High |
| 🟢 Low | Multi-Hop Retrieval | High | Medium |
| 🟢 Low | Hybrid Search | Medium | Medium |
| 🟢 Low | User Authentication | Medium | Medium |
| 🟢 Low | Expanded File Formats | Low | Low |
