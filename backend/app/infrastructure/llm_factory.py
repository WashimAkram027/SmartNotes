"""
Multi-provider LLM factory.

Returns a LangChain `BaseChatModel` regardless of the underlying provider,
so the rest of the application is provider-agnostic.
"""
from __future__ import annotations

import logging
from typing import Literal

from langchain_core.language_models.chat_models import BaseChatModel

from config import settings

logger = logging.getLogger(__name__)


def get_llm(
    provider: Literal["openai", "anthropic"] | None = None,
    *,
    temperature: float = 0,
    streaming: bool = False,
) -> BaseChatModel:
    """
    Instantiate and return a chat model for the requested provider.

    Parameters
    ----------
    provider : "openai" | "anthropic" | None
        Which LLM backend to use. Falls back to ``settings.default_llm_provider``.
    temperature : float
        Sampling temperature (0 = deterministic).
    streaming : bool
        Whether to enable token-by-token streaming.

    Returns
    -------
    BaseChatModel
        A LangChain-compatible chat model instance.

    Raises
    ------
    ValueError
        If the provider string is unrecognised.
    RuntimeError
        If the required API key for the chosen provider is missing.
    """
    provider = provider or settings.default_llm_provider

    if provider == "openai":
        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY is not set in the environment.")
        from langchain_openai import ChatOpenAI

        logger.info("Creating OpenAI model: %s", settings.default_openai_model)
        return ChatOpenAI(
            model=settings.default_openai_model,
            api_key=settings.openai_api_key,
            temperature=temperature,
            streaming=streaming,
        )

    if provider == "anthropic":
        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY is not set in the environment.")
        from langchain_anthropic import ChatAnthropic

        logger.info("Creating Anthropic model: %s", settings.default_anthropic_model)
        return ChatAnthropic(
            model=settings.default_anthropic_model,
            api_key=settings.anthropic_api_key,
            temperature=temperature,
            streaming=streaming,
        )

    raise ValueError(
        f"Unknown LLM provider: '{provider}'. Supported: 'openai', 'anthropic'."
    )


def get_provider_info(provider: Literal["openai", "anthropic"] | None = None) -> dict[str, str]:
    """Return human-readable provider + model name for API responses."""
    provider = provider or settings.default_llm_provider
    model_map: dict[str, str] = {
        "openai": settings.default_openai_model,
        "anthropic": settings.default_anthropic_model,
    }
    return {"provider": provider, "model": model_map.get(provider, "unknown")}
