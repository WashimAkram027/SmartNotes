"""
MongoDB Atlas Vector Search adapter.

Provides a configured retriever and document insertion helpers.
"""
from __future__ import annotations

import logging
from typing import Any

from langchain_community.vectorstores import MongoDBAtlasVectorSearch
from langchain_core.vectorstores import VectorStoreRetriever
from pymongo import MongoClient
from pymongo.collection import Collection

from config import settings
from app.infrastructure.embedding import get_embeddings

logger = logging.getLogger(__name__)

# ── Module-level singletons ──────────────────────────────────────────

_client: MongoClient | None = None
_collection: Collection | None = None
_vector_store: MongoDBAtlasVectorSearch | None = None


def _get_mongo_collection() -> Collection:
    """Return the MongoDB collection, creating the client once."""
    global _client, _collection  # noqa: PLW0603
    if _collection is None:
        if not settings.mongo_uri:
            raise RuntimeError("MONGO_URI is not set in the environment.")
        _client = MongoClient(settings.mongo_uri)
        # Verify connectivity
        _client.admin.command("ping")
        logger.info("Connected to MongoDB Atlas successfully.")
        db = _client[settings.mongo_db_name]
        _collection = db[settings.mongo_collection_name]
    return _collection


def get_vector_store() -> MongoDBAtlasVectorSearch:
    """Return a singleton ``MongoDBAtlasVectorSearch`` instance."""
    global _vector_store  # noqa: PLW0603
    if _vector_store is None:
        _vector_store = MongoDBAtlasVectorSearch(
            collection=_get_mongo_collection(),
            embedding=get_embeddings(),
            index_name=settings.atlas_vector_search_index,
        )
    return _vector_store


def get_retriever() -> VectorStoreRetriever:
    """
    Build a retriever with MMR (Maximum Marginal Relevance) for
    diverse, non-redundant context.
    """
    return get_vector_store().as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": settings.retrieval_k,
            "fetch_k": settings.retrieval_fetch_k,
        },
    )


def store_documents(documents: list[Any]) -> int:
    """
    Embed and insert document chunks into MongoDB Atlas.

    Returns the number of documents stored.
    """
    vs = MongoDBAtlasVectorSearch.from_documents(
        documents=documents,
        embedding=get_embeddings(),
        collection=_get_mongo_collection(),
        index_name=settings.atlas_vector_search_index,
    )
    count = len(documents)
    logger.info("Stored %d document chunks in MongoDB.", count)
    return count
