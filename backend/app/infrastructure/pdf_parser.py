"""
PDF loading and text chunking infrastructure.
"""
from __future__ import annotations

import logging
from hashlib import md5
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter

from config import settings

logger = logging.getLogger(__name__)


def load_pdf(file_path: str | Path) -> list[Document]:
    """
    Load a PDF and return LangChain ``Document`` objects (one per page).

    Raises
    ------
    ValueError
        If the file is not a PDF.
    FileNotFoundError
        If the file does not exist.
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Only PDF files are supported, got: {path.suffix}")

    loader = PyPDFLoader(str(path))
    docs = loader.load()
    logger.info("Loaded %d pages from %s", len(docs), path.name)
    return docs


def compute_file_hash(file_path: str | Path) -> str:
    """Return the MD5 hex digest of a file's contents."""
    path = Path(file_path)
    return md5(path.read_bytes()).hexdigest()


def chunk_documents(
    documents: list[Document],
    *,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[Document]:
    """
    Split documents into smaller chunks for embedding.

    Short documents (< 1 000 words total) are returned as-is.
    """
    cs = chunk_size or settings.chunk_size
    co = chunk_overlap or settings.chunk_overlap

    total_words = sum(len(doc.page_content.split()) for doc in documents)
    if total_words < 1000:
        logger.info("Document is short (%d words) — skipping chunking.", total_words)
        return documents

    splitter = RecursiveCharacterTextSplitter(chunk_size=cs, chunk_overlap=co)
    chunks = splitter.split_documents(documents)
    logger.info("Split %d docs into %d chunks (size=%d, overlap=%d).", len(documents), len(chunks), cs, co)
    return chunks


def create_plain_text_documents(text: str, source: str = "user_input") -> list[Document]:
    """Wrap raw user text into a LangChain ``Document``."""
    return [Document(page_content=text, metadata={"source": source})]
