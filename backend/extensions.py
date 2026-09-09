"""
extensions.py — PostgreSQL (Neon) connection layer
====================================================
Replaces PyMongo with psycopg2 thread-safe connection pool.
All routes import `get_db` to obtain a connection from the pool.
"""

import os
import psycopg2
import psycopg2.extras
from psycopg2.pool import ThreadedConnectionPool
from contextlib import contextmanager
from config import Config

# ── Connection pool (min 1, max 10 connections) ───────────────
_pool: ThreadedConnectionPool | None = None

def init_pool():
    global _pool
    if _pool is None:
        _pool = ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=Config.DATABASE_URL,
        )
        print("[OK] Neon PostgreSQL pool initialized")


@contextmanager
def get_db():
    """
    Context manager — yields a resilient psycopg2 connection from the pool.
    Auto-commits on success, rolls back on exception, returns conn to pool.
    Gracefully handles serverless idle connection terminations and stale TCP sockets.
    """
    global _pool
    if _pool is None:
        init_pool()

    conn = _pool.getconn()
    try:
        # Verify connection liveness against Neon serverless idle timeout
        is_stale = False
        if conn.closed != 0:
            is_stale = True
        else:
            try:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
            except Exception:
                is_stale = True

        if is_stale:
            try:
                _pool.putconn(conn, close=True)
            except Exception:
                pass
            conn = _pool.getconn()

        yield conn
        if conn.closed == 0:
            conn.commit()
    except (psycopg2.OperationalError, psycopg2.InterfaceError):
        if conn and conn.closed == 0:
            try:
                conn.rollback()
            except Exception:
                pass
        try:
            _pool.putconn(conn, close=True)
        except Exception:
            pass
        conn = None
        raise
    except Exception:
        if conn and conn.closed == 0:
            try:
                conn.rollback()
            except Exception:
                pass
        raise
    finally:
        if conn:
            _pool.putconn(conn)


def dict_cursor(conn):
    """Returns a cursor that yields rows as dicts (RealDictCursor)."""
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def init_db():
    """
    Create all tables if they don't exist yet.
    Safe to call on every startup — uses IF NOT EXISTS.
    """
    schema = """
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
        id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name                 TEXT NOT NULL,
        email                TEXT UNIQUE NOT NULL,
        password_hash        TEXT NOT NULL,
        role                 TEXT DEFAULT 'candidate',
        is_verified          BOOLEAN DEFAULT FALSE,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        bio                  TEXT,
        github               TEXT,
        linkedin             TEXT,
        website              TEXT,
        education            TEXT,
        current_job          TEXT,
        target_job           TEXT,
        resume_filename      TEXT,
        resume_data          TEXT,
        resume_text          TEXT,
        resume_updated_at    TIMESTAMPTZ,
        email_verified       BOOLEAN DEFAULT FALSE,
        email_verified_at    TIMESTAMPTZ,
        verification_email_sent_at TIMESTAMPTZ,
        verification_email_send_count INTEGER DEFAULT 0,
        created_at           TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS interviews (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
        role              TEXT,
        experience        TEXT,
        focus             TEXT,
        difficulty        TEXT DEFAULT 'Medium',
        status            TEXT DEFAULT 'active',
        overall_score     INTEGER,
        category_scores   JSONB DEFAULT '{}',
        evaluation_status TEXT DEFAULT 'completed',
        report            JSONB DEFAULT NULL,
        questions         JSONB DEFAULT '[]',
        answers           JSONB DEFAULT '[]',
        created_at        TIMESTAMPTZ DEFAULT NOW()
    );

    -- Safe idempotent migrations for existing databases
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_email_sent_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_email_send_count INTEGER DEFAULT 0;

    -- Backfill email_verified from is_verified if needed
    UPDATE users SET email_verified = is_verified WHERE email_verified IS DISTINCT FROM is_verified;

    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS report JSONB DEFAULT NULL;
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS category_scores JSONB DEFAULT '{}';
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS evaluation_status TEXT DEFAULT 'completed';
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interview_state JSONB DEFAULT '{}';
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS strategy JSONB DEFAULT '{}';
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS resume_context TEXT DEFAULT '';
    ALTER TABLE interviews ADD COLUMN IF NOT EXISTS recording_url TEXT DEFAULT '';

    CREATE TABLE IF NOT EXISTS resumes (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        role       TEXT,
        score      INTEGER,
        summary    TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS coding_submissions (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
        challenge_id     TEXT,
        code             TEXT,
        success          BOOLEAN DEFAULT FALSE,
        clarity_score    INTEGER,
        confidence_score INTEGER,
        feedback         TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ai_usage (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        interview_id             UUID REFERENCES interviews(id) ON DELETE SET NULL,
        user_id                  UUID REFERENCES users(id) ON DELETE SET NULL,
        request_type             TEXT NOT NULL,
        model                    TEXT,
        provider                 TEXT DEFAULT 'gemini',
        prompt_version           TEXT DEFAULT 'v1',
        pricing_version          TEXT DEFAULT 'google_gemini_2026_01',
        pricing_effective_date   TEXT DEFAULT '2026-01-01',
        input_price_per_million  NUMERIC(10, 6) DEFAULT 0.10,
        output_price_per_million NUMERIC(10, 6) DEFAULT 0.40,
        status                   TEXT NOT NULL,
        input_tokens             INTEGER,
        output_tokens            INTEGER,
        total_tokens             INTEGER,
        input_cost               NUMERIC(10, 6) DEFAULT 0.0,
        output_cost              NUMERIC(10, 6) DEFAULT 0.0,
        estimated_cost           NUMERIC(10, 6) DEFAULT 0.0,
        latency_ms               INTEGER,
        provider_latency_ms      INTEGER,
        retry_delay_ms           INTEGER DEFAULT 0,
        retry_count              INTEGER DEFAULT 0,
        cache_hit                BOOLEAN DEFAULT FALSE,
        validation_failed        BOOLEAN DEFAULT FALSE,
        truncation_detected      BOOLEAN DEFAULT FALSE,
        created_at               TIMESTAMPTZ DEFAULT NOW()
    );

    -- Safe idempotent migrations for ai_usage table
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'gemini';
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS prompt_version TEXT DEFAULT 'v1';
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS pricing_version TEXT DEFAULT 'google_gemini_2026_01';
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS pricing_effective_date TEXT DEFAULT '2026-01-01';
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS input_price_per_million NUMERIC(10, 6) DEFAULT 0.10;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS output_price_per_million NUMERIC(10, 6) DEFAULT 0.40;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS input_cost NUMERIC(10, 6) DEFAULT 0.0;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS output_cost NUMERIC(10, 6) DEFAULT 0.0;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC(10, 6) DEFAULT 0.0;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS provider_latency_ms INTEGER;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS retry_delay_ms INTEGER DEFAULT 0;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN DEFAULT FALSE;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS validation_failed BOOLEAN DEFAULT FALSE;
    ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS truncation_detected BOOLEAN DEFAULT FALSE;
    """
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(schema)
    print("[OK] Neon DB schema ready")


# Initialize on import
init_pool()