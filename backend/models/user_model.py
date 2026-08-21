"""
models/user_model.py — User CRUD for Neon PostgreSQL
"""
from werkzeug.security import generate_password_hash
from extensions import get_db, dict_cursor


def create_user(name: str, email: str, password: str) -> dict:
    hashed = generate_password_hash(password)
    with get_db() as conn:
        with dict_cursor(conn) as cur:
            cur.execute(
                """
                INSERT INTO users (name, email, password_hash, role, is_verified, email_verified, email_verified_at, verification_email_sent_at, verification_email_send_count, onboarding_completed)
                VALUES (%s, %s, %s, 'candidate', TRUE, TRUE, NOW(), NULL, 0, FALSE)
                RETURNING id, name, email, role, is_verified, email_verified, onboarding_completed
                """,
                (name, email, hashed)
            )
            return dict(cur.fetchone())


def get_user_by_email(email: str) -> dict | None:
    with get_db() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            return dict(row) if row else None


def get_user_by_id(user_id: str) -> dict | None:
    with get_db() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            row = cur.fetchone()
            return dict(row) if row else None


def verify_user(email: str) -> None:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET is_verified = TRUE,
                    email_verified = TRUE,
                    email_verified_at = NOW()
                WHERE email = %s
                """,
                (email,)
            )


def record_verification_email_sent(email: str) -> None:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET verification_email_sent_at = NOW(),
                    verification_email_send_count = COALESCE(verification_email_send_count, 0) + 1
                WHERE email = %s
                """,
                (email,)
            )



def update_password(email: str, new_password: str) -> None:
    hashed = generate_password_hash(new_password)
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE users SET password_hash = %s WHERE email = %s",
                (hashed, email)
            )


def update_user_fields(user_id: str, fields: dict) -> None:
    """Generic field updater — only updates provided keys."""
    if not fields:
        return
    allowed = {
        "name", "bio", "github", "linkedin", "website",
        "education", "current_job", "target_job", "onboarding_completed",
        "resume_filename", "resume_data", "resume_text", "resume_updated_at",
    }
    valid = {k: v for k, v in fields.items() if k in allowed}
    if not valid:
        return
    set_clause = ", ".join(f"{k} = %s" for k in valid)
    values = list(valid.values()) + [user_id]
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"UPDATE users SET {set_clause} WHERE id = %s",
                values
            )


def clear_resume_fields(user_id: str) -> None:
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE users
                SET resume_filename = NULL,
                    resume_data     = NULL,
                    resume_text     = NULL,
                    resume_updated_at = NULL
                WHERE id = %s
                """,
                (user_id,)
            )