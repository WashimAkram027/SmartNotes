"""
Document ingestion service — application layer orchestration.
"""
from __future__ import annotations

import logging
from pathlib import Path

from app.domain.models import DocumentUploadResponse
from app.infrastructure.pdf_parser import (
    load_pdf,
    compute_file_hash,
    chunk_documents,
    create_plain_text_documents,
)
from app.infrastructure.vector_store import (
    get_vector_store,
    store_documents,
)

logger = logging.getLogger(__name__)


def _file_hash_exists(file_hash: str) -> bool:
    """Check whether a document with this hash is already in the store."""
    try:
        collection = get_vector_store()._collection
        existing = collection.distinct("metadata.file_hash")
        return file_hash in existing
    except Exception:
        logger.warning("Could not check for duplicate file hash.", exc_info=True)
        return False


def ingest_pdf(file_path: str | Path) -> DocumentUploadResponse:
    """
    Full pipeline: load PDF → deduplicate → chunk → embed → store.

    Returns a response indicating what happened.
    """
    path = Path(file_path)
    file_hash = compute_file_hash(path)

    if _file_hash_exists(file_hash):
        logger.info("PDF already uploaded: %s (hash=%s)", path.name, file_hash)
        return DocumentUploadResponse(
            filename=path.name,
            chunks_stored=0,
            already_existed=True,
            message=f"'{path.name}' has already been uploaded.",
        )

    docs = load_pdf(path)
    chunks = chunk_documents(docs)

    # Tag every chunk with the file hash for future dedup
    for chunk in chunks:
        chunk.metadata["file_hash"] = file_hash

    count = store_documents(chunks)
    logger.info("Ingested %s → %d chunks stored.", path.name, count)
    return DocumentUploadResponse(
        filename=path.name,
        chunks_stored=count,
        message=f"Successfully processed '{path.name}'.",
    )


def ingest_plain_text(text: str, source: str = "user_input") -> DocumentUploadResponse:
    """
    Ingest raw text into the vector store.
    """
    docs = create_plain_text_documents(text, source=source)
    chunks = chunk_documents(docs)
    count = store_documents(chunks)
    return DocumentUploadResponse(
        filename=source,
        chunks_stored=count,
        message=f"Stored {count} chunk(s) from plain text.",
    )
