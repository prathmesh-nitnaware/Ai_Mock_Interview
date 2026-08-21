"""
utils/auth_helpers.py — JWT token validation using Neon PostgreSQL
"""
import jwt
from functools import wraps
from flask import request, jsonify
from config import Config
from extensions import get_db, dict_cursor

SECRET_KEY = Config.SECRET_KEY


def _get_user_by_email(email: str) -> dict | None:
    with get_db() as conn:
        with dict_cursor(conn) as cur:
            cur.execute("SELECT * FROM users WHERE email = %s", (email,))
            row = cur.fetchone()
            return dict(row) if row else None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = token.split(" ")[1] if " " in token else token
            data  = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

            # Verify token purpose is access (not reset or verify)
            token_type = data.get("type", "access")
            if token_type not in ("access", None):
                return jsonify({"error": "Invalid token purpose"}), 401

            user  = _get_user_by_email(data.get("email", ""))

            if not user:
                return jsonify({"error": "User not found"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(user, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == "OPTIONS":
            return jsonify({"status": "ok"}), 200

        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Token missing"}), 401

        try:
            token = token.split(" ")[1] if " " in token else token
            data  = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

            token_type = data.get("type", "access")
            if token_type not in ("access", None):
                return jsonify({"error": "Invalid token purpose"}), 401

            user  = _get_user_by_email(data.get("email", ""))

            if not user:
                return jsonify({"error": "User not found"}), 401
            if user.get("role") != "admin":
                return jsonify({"error": "Admin privileges required"}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(user, *args, **kwargs)
    return decorated