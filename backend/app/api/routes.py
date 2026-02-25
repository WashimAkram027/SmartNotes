"""
Flask API routes — thin controller layer.

All business logic lives in the application layer;
routes simply validate input, call services, and return JSON.
"""
from __future__ import annotations

import logging
import os
import tempfile

from flask import Blueprint, jsonify, request
from pydantic import ValidationError
from werkzeug.utils import secure_filename

from app.application.document_service import ingest_pdf, ingest_plain_text
from app.application.rag_graph import query_rag
from app.domain.models import QueryRequest
from app.api.rate_limiter import check_rate_limit, get_remaining
from config import settings

logger = logging.getLogger(__name__)

api_bp = Blueprint("api", __name__, url_prefix="/api")

MAX_UPLOAD_BYTES = settings.max_upload_size_mb * 1024 * 1024


def _client_ip() -> str:
    """Get the real client IP, respecting reverse-proxy headers."""
    return request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()


# ── Health Check ─────────────────────────────────────────────────────


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Lightweight liveness probe."""
    return jsonify({"status": "healthy"}), 200


# ── Rate Limit Status ────────────────────────────────────────────────


@api_bp.route("/limits", methods=["GET"])
def rate_limit_status():
    """Return remaining rate limits for the current client IP."""
    ip = _client_ip()
    return jsonify({
        "queries_remaining": get_remaining("query", ip),
        "uploads_remaining": get_remaining("upload", ip),
        "max_queries_per_hour": settings.rate_limit_queries,
        "max_uploads_per_hour": settings.rate_limit_uploads,
        "max_upload_size_mb": settings.max_upload_size_mb,
    }), 200


# ── Query Endpoint ───────────────────────────────────────────────────


@api_bp.route("/query", methods=["POST"])
def query():
    """
    POST /api/query
    Body: { "question": "...", "provider": "openai" | "anthropic" }
    """
    # Rate limit check
    ip = _client_ip()
    allowed, msg = check_rate_limit("query", ip)
    if not allowed:
        return jsonify({"error": msg}), 429

    data = request.get_json(silent=True) or {}

    try:
        req = QueryRequest(**data)
    except ValidationError as exc:
        return jsonify({"error": "Validation error", "detail": exc.errors()}), 422

    logger.info("Query request: question=%s provider=%s", req.question[:60], req.provider)
    response = query_rag(question=req.question, provider=req.provider)
    return jsonify(response.model_dump()), 200


# ── Document Upload ──────────────────────────────────────────────────


@api_bp.route("/documents/upload", methods=["POST"])
def upload_document():
    """
    POST /api/documents/upload
    Multipart form-data with a "file" field (PDF).
    """
    # Rate limit check
    ip = _client_ip()
    allowed, msg = check_rate_limit("upload", ip)
    if not allowed:
        return jsonify({"error": msg}), 429

    if "file" not in request.files:
        return jsonify({"error": "No file provided. Use form field 'file'."}), 400

    file = request.files["file"]
    if not file.filename:
        return jsonify({"error": "Empty filename."}), 400

    filename = secure_filename(file.filename)
    if not filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported."}), 400

    # File size check
    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    if size > MAX_UPLOAD_BYTES:
        return jsonify({
            "error": f"File too large ({size / (1024*1024):.1f} MB). "
                     f"Maximum allowed size is {settings.max_upload_size_mb} MB."
        }), 413

    # Save to temp dir, process, then clean up
    tmp_dir = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, filename)
    try:
        file.save(tmp_path)
        result = ingest_pdf(tmp_path)
        status_code = 200 if result.already_existed else 201
        return jsonify(result.model_dump()), status_code
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
        if os.path.exists(tmp_dir):
            os.rmdir(tmp_dir)


# ── Plain Text Import ───────────────────────────────────────────────


@api_bp.route("/documents/text", methods=["POST"])
def upload_text():
    """
    POST /api/documents/text
    Body: { "text": "...", "source": "user_input" }
    """
    # Rate limit check (counts toward upload limit)
    ip = _client_ip()
    allowed, msg = check_rate_limit("upload", ip)
    if not allowed:
        return jsonify({"error": msg}), 429

    data = request.get_json(silent=True) or {}
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "No text provided."}), 400

    source = data.get("source", "user_input")
    result = ingest_plain_text(text, source=source)
    return jsonify(result.model_dump()), 201
