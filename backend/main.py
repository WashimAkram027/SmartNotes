"""
Flask application factory — backend entry point.

Usage:
    flask run                 # development
    gunicorn main:app         # production
"""
from __future__ import annotations

import logging
import sys

from flask import Flask
from flask_cors import CORS

from config import settings
from app.api.errors import register_error_handlers
from app.api.routes import api_bp


def create_app() -> Flask:
    """Build and configure the Flask application."""
    # Logging
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(name)-30s  %(levelname)-7s  %(message)s",
        stream=sys.stdout,
    )

    app = Flask(__name__)

    # CORS — allow frontend origins
    CORS(app, origins=settings.cors_origins.split(","))

    # Register blueprints
    app.register_blueprint(api_bp)

    # Register global error handlers
    register_error_handlers(app)

    return app


# Module-level app instance for gunicorn / `flask run`
app = create_app()


if __name__ == "__main__":
    app.run(debug=settings.flask_debug, host="0.0.0.0", port=5000)
