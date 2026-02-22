"""
Configuration management via pydantic-settings.
All secrets loaded from environment variables / .env file.
"""
from __future__ import annotations

from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide configuration backed by env vars / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── LLM Provider Keys ─────────────────────────────────────────────
    openai_api_key: str = ""
    anthropic_api_key: str = ""

    # ── MongoDB ───────────────────────────────────────────────────────
    mongo_uri: str = ""
    mongo_db_name: str = "RagProject"
    mongo_collection_name: str = "Notes"
    atlas_vector_search_index: str = "vector_index"

    # ── Defaults ──────────────────────────────────────────────────────
    default_llm_provider: Literal["openai", "anthropic"] = "openai"
    default_openai_model: str = "gpt-4o-mini"
    default_anthropic_model: str = "claude-3-5-sonnet-20241022"
    embedding_model: str = "text-embedding-3-small"

    # ── Retrieval ─────────────────────────────────────────────────────
    retrieval_k: int = 8
    retrieval_fetch_k: int = 20

    # ── Chunking ──────────────────────────────────────────────────────
    chunk_size: int = 1200
    chunk_overlap: int = 300

    # ── Server ────────────────────────────────────────────────────────
    flask_debug: bool = False
    cors_origins: str = "*"


# Global singleton — import `settings` everywhere
settings = Settings()
