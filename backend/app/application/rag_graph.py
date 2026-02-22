"""
LangGraph-based RAG agent with conditional routing.

Graph topology:
  START → retrieve → grade_docs ─┬─ (relevant)   → generate → END
                                  └─ (no context) → no_context_response → END

This replaces the flat LCEL chain with an explicit state machine,
enabling observability, conditional logic, and future extension
(e.g., self-corrective RAG, multi-hop retrieval, tool use).
"""
from __future__ import annotations

import logging
from typing import Any, Literal, TypedDict

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langgraph.graph import END, StateGraph
from app.domain.models import QueryResponse, SourceDocument
from app.infrastructure.llm_factory import get_llm, get_provider_info
from app.infrastructure.vector_store import get_retriever

logger = logging.getLogger(__name__)

# ── Prompt ───────────────────────────────────────────────────────────

RAG_TEMPLATE = """You are a helpful research assistant. Answer the question using ONLY the provided context.
If the context does not contain enough information, reply: "I don't know based on the provided context."

Always cite which document(s) you drew your answer from when possible.

Context:
{context}

Question: {question}

Answer:"""

RAG_PROMPT = PromptTemplate.from_template(RAG_TEMPLATE)

# ── Graph State ──────────────────────────────────────────────────────


class GraphState(TypedDict, total=False):
    """Typed state shared across all graph nodes."""

    question: str
    provider: Literal["openai", "anthropic"]
    documents: list[Document]
    generation: str
    has_relevant_docs: bool


# ── Node functions ───────────────────────────────────────────────────


def retrieve(state: GraphState) -> dict[str, Any]:
    """Retrieve relevant documents from the vector store."""
    question = state["question"]
    logger.info("Retrieving documents for: %s", question[:80])
    retriever = get_retriever()
    documents = retriever.invoke(question)
    logger.info("Retrieved %d documents.", len(documents))
    return {"documents": documents}


def grade_documents(state: GraphState) -> dict[str, Any]:
    """Check if we have any retrieved documents with content."""
    docs = state.get("documents", [])
    has_relevant = len(docs) > 0 and any(
        doc.page_content.strip() for doc in docs
    )
    logger.info("Document grading: has_relevant=%s (count=%d)", has_relevant, len(docs))
    return {"has_relevant_docs": has_relevant}


def generate(state: GraphState) -> dict[str, Any]:
    """Generate an answer using the LLM with retrieved context."""
    question = state["question"]
    provider = state.get("provider", "openai")
    documents = state.get("documents", [])

    context = "\n\n".join(doc.page_content for doc in documents)
    llm = get_llm(provider)
    chain = RAG_PROMPT | llm | StrOutputParser()

    generation = chain.invoke({"context": context, "question": question})
    logger.info("Generated answer via %s (%d chars).", provider, len(generation))
    return {"generation": generation}


def no_context_response(state: GraphState) -> dict[str, Any]:
    """Return a canned response when no relevant context is found."""
    return {
        "generation": "I don't know based on the provided context. "
        "Please upload relevant documents first."
    }


# ── Routing logic ────────────────────────────────────────────────────


def route_after_grading(state: GraphState) -> str:
    """Decide whether to generate or return a no-context message."""
    if state.get("has_relevant_docs"):
        return "generate"
    return "no_context_response"


# ── Build the graph ──────────────────────────────────────────────────


def build_rag_graph() -> StateGraph:
    """
    Construct the LangGraph RAG agent.

    Returns an uncompiled ``StateGraph`` that can be compiled and invoked.
    """
    workflow = StateGraph(GraphState)

    # Add nodes
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("grade_docs", grade_documents)
    workflow.add_node("generate", generate)
    workflow.add_node("no_context_response", no_context_response)

    # Wire edges
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "grade_docs")
    workflow.add_conditional_edges(
        "grade_docs",
        route_after_grading,
        {
            "generate": "generate",
            "no_context_response": "no_context_response",
        },
    )
    workflow.add_edge("generate", END)
    workflow.add_edge("no_context_response", END)

    return workflow


# ── Public API ───────────────────────────────────────────────────────

# Compile once at module level for reuse
_compiled_graph = None


def _get_graph():
    global _compiled_graph  # noqa: PLW0603
    if _compiled_graph is None:
        _compiled_graph = build_rag_graph().compile()
    return _compiled_graph


def query_rag(
    question: str,
    provider: Literal["openai", "anthropic"] = "openai",
) -> QueryResponse:
    """
    Run the full RAG pipeline and return a structured response.

    Parameters
    ----------
    question : str
        The user's question.
    provider : str
        Which LLM provider to use.

    Returns
    -------
    QueryResponse
        Answer text, provider info, and source documents.
    """
    graph = _get_graph()
    result = graph.invoke({"question": question, "provider": provider})

    # Build source list
    sources: list[SourceDocument] = []
    for doc in result.get("documents", []):
        meta = doc.metadata or {}
        sources.append(
            SourceDocument(
                content=doc.page_content[:300],
                source=meta.get("source", "unknown"),
                page=meta.get("page"),
            )
        )

    info = get_provider_info(provider)
    return QueryResponse(
        answer=result.get("generation", ""),
        provider=info["provider"],
        model=info["model"],
        sources=sources,
    )
