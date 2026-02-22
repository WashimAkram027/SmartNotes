"""
Embedding provider — wraps OpenAI text-embedding-3-small.
"""
from __future__ import annotations

import logging

from langchain_openai import OpenAIEmbeddings

from config import settings

logger = logging.getLogger(__name__)

_embeddings: OpenAIEmbeddings | None = None


def get_embeddings() -> OpenAIEmbeddings:
    """
    Return a singleton ``OpenAIEmbeddings`` instance.

    Using a singleton avoids rebuilding the HTTP client on every request.
    """
    global _embeddings  # noqa: PLW0603
    if _embeddings is None:
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is required for embeddings.")
        logger.info("Initialising OpenAI embeddings: %s", settings.embedding_model)
        _embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key,
            disallowed_special=(),
        )
    return _embeddings
