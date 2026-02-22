"""
Domain models — pure data structures with no I/O dependencies.
Used across every layer for type safety and serialization.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ── Request / Response Models ────────────────────────────────────────


class QueryRequest(BaseModel):
    """Incoming question payload from the frontend."""

    question: str = Field(..., min_length=1, description="User question")
    provider: Literal["openai", "anthropic"] = Field(
        default="openai",
        description="LLM provider to use for generation",
    )


class SourceDocument(BaseModel):
    """Metadata about a single retrieved source chunk."""

    content: str = Field(..., description="Chunk text used as context")
    source: str = Field(default="unknown", description="File name or origin")
    page: int | None = Field(default=None, description="Page number if PDF")


class QueryResponse(BaseModel):
    """Answer payload returned to the frontend."""

    answer: str
    provider: str
    model: str
    sources: list[SourceDocument] = Field(default_factory=list)


# ── Document Ingestion Models ────────────────────────────────────────


class DocumentUploadResponse(BaseModel):
    """Result of a document upload operation."""

    filename: str
    chunks_stored: int
    already_existed: bool = False
    message: str = ""
