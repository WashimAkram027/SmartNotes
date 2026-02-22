"""
Global error handling for the Flask API.
"""
from __future__ import annotations

import logging
import traceback

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask) -> None:
    """Attach global error handlers to the Flask app."""

    @app.errorhandler(400)
    def bad_request(error: HTTPException):
        return jsonify({"error": "Bad request", "detail": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error: HTTPException):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(422)
    def unprocessable(error: HTTPException):
        return jsonify({"error": "Validation error", "detail": str(error)}), 422

    @app.errorhandler(500)
    def internal_error(error: Exception):
        logger.error("Unhandled server error: %s\n%s", error, traceback.format_exc())
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(RuntimeError)
    def runtime_error(error: RuntimeError):
        logger.error("Runtime error: %s", error)
        return jsonify({"error": str(error)}), 503

    @app.errorhandler(ValueError)
    def value_error(error: ValueError):
        return jsonify({"error": str(error)}), 400
