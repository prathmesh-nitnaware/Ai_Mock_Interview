"""
backend/utils/cache.py
======================
Pluggable Cache Abstraction Layer for PrepAI.
Supports InMemoryCacheBackend (default) and prepared for RedisCacheBackend.
Preserves Neon PostgreSQL as the single source of persistent truth.
"""
import os
import time
import json
import logging
import threading
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)


class CacheBackend(ABC):
    """Abstract base class for caching backends."""

    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """Retrieves a cached value by key. Returns None if missing or expired."""
        pass

    @abstractmethod
    def set(self, key: str, value: Any, ttl: float = 60.0) -> None:
        """Stores a value in the cache with a specified TTL in seconds."""
        pass

    @abstractmethod
    def delete(self, key: str) -> None:
        """Removes an individual key from the cache."""
        pass

    @abstractmethod
    def invalidate_prefix(self, prefix: str) -> None:
        """Evicts all keys matching the specified prefix."""
        pass

    @abstractmethod
    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics about the cache backend."""
        pass


class InMemoryCacheBackend(CacheBackend):
    """
    Thread-safe in-memory cache with per-key TTL expiration.
    Note: Operates per-backend instance; Neon DB remains the authoritative shared state.
    """

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry and time.monotonic() < entry["expires"]:
                return entry["value"]
            if entry:
                del self._store[key]
            return None

    def set(self, key: str, value: Any, ttl: float = 60.0) -> None:
        with self._lock:
            self._store[key] = {
                "value": value,
                "expires": time.monotonic() + ttl,
            }

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def invalidate_prefix(self, prefix: str) -> None:
        with self._lock:
            for key in list(self._store.keys()):
                if key.startswith(prefix):
                    del self._store[key]

    def get_stats(self) -> Dict[str, Any]:
        with self._lock:
            now = time.monotonic()
            valid = sum(1 for e in self._store.values() if now < e["expires"])
            return {
                "backend": "memory",
                "total_keys": len(self._store),
                "valid_keys": valid,
                "is_distributed": False,
            }


class RedisCacheBackend(CacheBackend):
    """
    Redis cache backend placeholder for future distributed deployment.
    Falls back gracefully to memory if Redis is unavailable.
    """

    def __init__(self, redis_url: str):
        self.redis_url = redis_url
        self._allow_fallback = os.getenv("REDIS_ALLOW_FALLBACK", "false").lower() == "true"
        self._memory_fallback = InMemoryCacheBackend()
        self._client = None
        try:
            import redis
            self._client = redis.from_url(redis_url, decode_responses=True)
            self._client.ping()
            logger.info("Connected to distributed Redis cache.")
        except Exception as e:
            if not self._allow_fallback:
                logger.error(f"Redis cache connection failed: {e}. Set REDIS_ALLOW_FALLBACK=true to allow in-memory fallback.")
                raise RuntimeError(f"FATAL: Redis cache unavailable and REDIS_ALLOW_FALLBACK is disabled: {e}")
            logger.warning(f"Redis cache init failed: {e}. Falling back to in-memory cache.")
            self._client = None

    def get(self, key: str) -> Optional[Any]:
        if not self._client:
            return self._memory_fallback.get(key)
        try:
            val = self._client.get(key)
            return json.loads(val) if val else None
        except Exception as e:
            logger.warning(f"Redis get error for {key}: {e}")
            return self._memory_fallback.get(key)

    def set(self, key: str, value: Any, ttl: float = 60.0) -> None:
        if not self._client:
            return self._memory_fallback.set(key, value, ttl)
        try:
            self._client.setex(key, int(ttl), json.dumps(value))
        except Exception as e:
            logger.warning(f"Redis set error for {key}: {e}")
            self._memory_fallback.set(key, value, ttl)

    def delete(self, key: str) -> None:
        if not self._client:
            return self._memory_fallback.delete(key)
        try:
            self._client.delete(key)
        except Exception as e:
            logger.warning(f"Redis delete error for {key}: {e}")
            self._memory_fallback.delete(key)

    def invalidate_prefix(self, prefix: str) -> None:
        if not self._client:
            return self._memory_fallback.invalidate_prefix(prefix)
        try:
            keys = self._client.keys(f"{prefix}*")
            if keys:
                self._client.delete(*keys)
        except Exception as e:
            logger.warning(f"Redis invalidate_prefix error for {prefix}: {e}")
            self._memory_fallback.invalidate_prefix(prefix)

    def get_stats(self) -> Dict[str, Any]:
        if not self._client:
            return self._memory_fallback.get_stats()
        try:
            info = self._client.info()
            return {
                "backend": "redis",
                "connected_clients": info.get("connected_clients"),
                "used_memory_human": info.get("used_memory_human"),
                "is_distributed": True,
            }
        except Exception:
            return {"backend": "redis", "status": "unreachable", "is_distributed": True}


def create_cache_backend() -> CacheBackend:
    """Factory to instantiate the configured cache backend."""
    backend_type = os.getenv("CACHE_BACKEND", "memory").lower().strip()
    redis_url = os.getenv("REDIS_URL")

    if backend_type == "redis" and redis_url:
        return RedisCacheBackend(redis_url)
    return InMemoryCacheBackend()


# Singleton cache backend instance
default_cache = create_cache_backend()
