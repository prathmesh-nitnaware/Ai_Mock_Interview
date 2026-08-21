"""
middleware.py — PrepAI Backend System Design Layer
===================================================
Implements:
  1. Rate Limiting   — per-IP token bucket algorithm
  2. Response Cache  — TTL-based in-memory cache with decorator
  3. Structured Logging — JSON-formatted request logger
"""

import time
import json
import logging
import threading
import functools
from collections import defaultdict
from flask import request, jsonify, g

# ============================================================
# 1. STRUCTURED LOGGING
# ============================================================

class JsonFormatter(logging.Formatter):
    """Emits logs as single-line JSON for easy parsing/shipping."""
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "ts":       self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level":    record.levelname,
            "logger":   record.name,
            "message":  record.getMessage(),
        }
        # Merge any extra keys set on the record
        for key in ("request_id", "endpoint", "method", "status", "latency_ms", "ip"):
            if hasattr(record, key):
                log_obj[key] = getattr(record, key)
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_obj, ensure_ascii=False)


def setup_logger(name: str = "prepai", level: int = logging.INFO) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JsonFormatter())
        logger.addHandler(handler)
    logger.setLevel(level)
    logger.propagate = False
    return logger


logger = setup_logger()


from utils.cache import default_cache, CacheBackend
from utils.rate_limiter import default_rate_limiter, RateLimiterBackend

# Expose backend singletons
_rate_limiter = default_rate_limiter
_cache = default_cache


def rate_limit(fn):
    """
    Route decorator. Returns HTTP 429 if the request IP is throttled.
    Usage:
        @interview_bp.route("/initiate", methods=["POST"])
        @token_required
        @rate_limit
        def initiate_session(current_user): ...
    """
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        ip = request.headers.get("X-Forwarded-For", request.remote_addr or "0.0.0.0").split(",")[0].strip()
        if not _rate_limiter.is_allowed(ip):
            remaining = _rate_limiter.remaining(ip)
            logger.warning("Rate limit exceeded", extra={"ip": ip, "endpoint": request.path})
            resp = jsonify({
                "error": "Too many requests. Please slow down.",
                "retry_after_seconds": 5
            })
            resp.headers["X-RateLimit-Remaining"] = str(remaining)
            resp.headers["Retry-After"] = "5"
            return resp, 429
        return fn(*args, **kwargs)
    return wrapper


def cache_response(ttl: float = 60.0, include_user: bool = True):
    """
    Route decorator that caches the JSON response.
    Cache key strictly isolated by endpoint and user_id.
    """
    def decorator(fn):
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            user_id = ""
            if include_user:
                # current_user is the first positional arg from @token_required
                cu = args[0] if args else None
                if cu:
                    user_id = str(cu.get("id") or cu.get("_id") or "")
                if not user_id:
                    # Do not cache user-specific data if user ID cannot be determined
                    return fn(*args, **kwargs)
            cache_key = f"{request.path}:{user_id}"

            cached = _cache.get(cache_key)
            if cached is not None:
                logger.debug("Cache HIT", extra={"endpoint": request.path})
                from flask import Response
                resp = Response(
                    json.dumps(cached),
                    status=200,
                    mimetype="application/json"
                )
                resp.headers["X-Cache"] = "HIT"
                return resp

            # Execute handler
            result = fn(*args, **kwargs)

            # Store the JSON body if it's a 2xx response
            try:
                status = result[1] if isinstance(result, tuple) else 200
                response_obj = result[0] if isinstance(result, tuple) else result
                if 200 <= status < 300:
                    body = response_obj.get_json()
                    if body is not None:
                        _cache.set(cache_key, body, ttl=ttl)
                        logger.debug("Cache SET", extra={"endpoint": request.path})
            except Exception:
                pass  # Never let caching break the response

            if isinstance(result, tuple):
                result[0].headers["X-Cache"] = "MISS"
            return result
        return wrapper
    return decorator


def invalidate_user_cache(user_id: str) -> None:
    """Call this after writes to clear stale data for a user."""
    _cache.invalidate_prefix(f"/api/interview/history:{user_id}")
    _cache.invalidate_prefix(f"/api/profile:{user_id}")


# ============================================================
# 4. REQUEST LOGGER HOOKS (register on the Flask app)
# ============================================================

def register_request_logger(app):
    """
    Attach before/after_request hooks to log every API call as JSON.
    """
    import uuid

    @app.before_request
    def _before():
        g.request_id  = uuid.uuid4().hex[:12]
        g.start_time  = time.monotonic()

    @app.after_request
    def _after(response):
        latency_ms = round((time.monotonic() - getattr(g, "start_time", time.monotonic())) * 1000, 2)
        ip = request.headers.get("X-Forwarded-For", request.remote_addr or "")
        logger.info(
            f"{request.method} {request.path} → {response.status_code}",
            extra={
                "request_id": getattr(g, "request_id", ""),
                "endpoint":   request.path,
                "method":     request.method,
                "status":     response.status_code,
                "latency_ms": latency_ms,
                "ip":         ip.split(",")[0].strip(),
            }
        )
        response.headers["X-Request-ID"] = getattr(g, "request_id", "")
        return response


# ============================================================
# 5. METRICS ENDPOINT DATA
# ============================================================

def get_metrics() -> dict:
    """Return aggregated health / cache / rate-limiter stats."""
    return {
        "cache":        _cache.get_stats(),
        "rate_limiter": _rate_limiter.get_stats(),
        "status":       "healthy",
    }
