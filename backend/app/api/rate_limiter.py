"""
IP-based in-memory rate limiter with sliding window.

Designed for low-traffic school project deployments where Redis
is overkill. Limits reset automatically via time window expiry.
"""
from __future__ import annotations

import time
import threading
from collections import defaultdict

from config import settings


# Thread-safe storage: { action: { ip: [timestamp, ...] } }
_state: dict[str, dict[str, list[float]]] = defaultdict(lambda: defaultdict(list))
_lock = threading.Lock()

# Action → (max_requests, window_seconds)
_LIMITS: dict[str, tuple[int, int]] = {
    "query":  (settings.rate_limit_queries,  settings.rate_limit_window),
    "upload": (settings.rate_limit_uploads,  settings.rate_limit_window),
}


def _cleanup(timestamps: list[float], window: int) -> list[float]:
    """Remove timestamps outside the sliding window."""
    cutoff = time.time() - window
    return [t for t in timestamps if t > cutoff]


def check_rate_limit(action: str, ip: str) -> tuple[bool, str]:
    """
    Check if `ip` is within the rate limit for `action`.

    Returns
    -------
    (allowed, message)
        ``allowed`` is True if the request can proceed.
        ``message`` is the rejection reason if denied.
    """
    if action not in _LIMITS:
        return True, ""

    max_requests, window = _LIMITS[action]

    with _lock:
        bucket = _state[action]
        bucket[ip] = _cleanup(bucket[ip], window)

        if len(bucket[ip]) >= max_requests:
            minutes = window // 60
            return False, (
                f"Rate limit exceeded: max {max_requests} {action} requests "
                f"per {minutes} minute(s). Please try again later."
            )

        bucket[ip].append(time.time())
        return True, ""


def get_remaining(action: str, ip: str) -> int:
    """Return how many requests remain for this IP/action."""
    if action not in _LIMITS:
        return 999

    max_requests, window = _LIMITS[action]

    with _lock:
        bucket = _state[action]
        bucket[ip] = _cleanup(bucket[ip], window)
        return max(0, max_requests - len(bucket[ip]))
