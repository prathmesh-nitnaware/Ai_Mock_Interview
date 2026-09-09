"""
routes/auth.py — Auth routes using Neon PostgreSQL with enhanced security
"""
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt
import logging
import re
from datetime import datetime, timedelta, timezone

from config import Config
from models.user_model import create_user, get_user_by_email, verify_user, update_password
from utils.email_utils import send_verification_email, send_password_reset_email
from utils.middleware import rate_limit

auth_bp = Blueprint("auth", __name__)

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


@auth_bp.route("/signup", methods=["POST"])
@rate_limit
def signup():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        email    = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        if not EMAIL_REGEX.match(email):
            return jsonify({"error": "Please provide a valid email address."}), 400

        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long."}), 400

        if len(password) > 128:
            return jsonify({"error": "Password exceeds maximum allowed length."}), 400

        name = str(data.get("name", email.split("@")[0])).strip()[:100]

        if get_user_by_email(email):
            return jsonify({"error": "An account with this email already exists."}), 409

        create_user(name, email, password)

        return jsonify({
            "message": "Account created successfully. You can now log in.",
            "email_verification_required": False
        }), 201

    except Exception as e:
        logging.error("Signup Error: " + str(e))
        return jsonify({"error": "Signup failed. Please try again."}), 500


@auth_bp.route("/login", methods=["POST"])
@rate_limit
def login():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        email    = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = get_user_by_email(email)

        # Uniform error message to prevent account enumeration
        if not user:
            return jsonify({"error": "Invalid email or password"}), 401

        stored_hash = user.get("password_hash") or user.get("password", "")
        if not check_password_hash(stored_hash, password):
            return jsonify({"error": "Invalid email or password"}), 401

        # Issue access token with explicit type claim
        token = jwt.encode({
            "email": email,
            "type":  "access",
            "exp":   datetime.now(timezone.utc) + timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "user": {
                "email":                email,
                "name":                 user.get("name", email.split("@")[0]),
                "role":                 user.get("role", "candidate"),
                "onboarding_completed": user.get("onboarding_completed", False),
                "is_verified":          user.get("is_verified", True),
            }
        })

    except Exception as e:
        logging.error("Login Error: " + str(e))
        return jsonify({"error": "Login failed. Please try again."}), 500


@auth_bp.route("/verify-email", methods=["POST"])
@rate_limit
def verify_email():
    """Backward compatibility route for existing verification links."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        token = data.get("token")
        if not token:
            return jsonify({"error": "Missing token"}), 400

        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Verification link has expired"}), 400
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid verification link"}), 400

        if payload.get("type") != "verify":
            return jsonify({"error": "Invalid token type"}), 400

        email = payload.get("email")
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 404

        verify_user(email)
        return jsonify({
            "message": "Email verified successfully",
            "verified": True,
            "already_verified": True
        }), 200

    except Exception as e:
        logging.error("Verification Error: " + str(e))
        return jsonify({"error": "Verification failed"}), 500


@auth_bp.route("/resend-verification", methods=["POST"])
@rate_limit
def resend_verification():
    """
    Email verification is disabled in the current deployment.
    Returns an immediate safe response with 0 emails sent and 0 tokens generated.
    """
    return jsonify({
        "message": "Email verification is currently disabled.",
        "email_verification_disabled": True,
        "already_verified": True
    }), 200


@auth_bp.route("/me", methods=["GET"])
def get_current_user():
    """Returns authoritative user state from Neon PostgreSQL."""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return jsonify({"error": "Token missing"}), 401
    try:
        token_str = auth_header.split(" ")[1] if " " in auth_header else auth_header
        data = jwt.decode(token_str, Config.SECRET_KEY, algorithms=["HS256"])
        if data.get("type") not in ("access", None):
            return jsonify({"error": "Invalid token purpose"}), 401

        email = data.get("email")
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 401

        return jsonify({
            "user": {
                "id":                   str(user.get("id")),
                "email":                email,
                "name":                 user.get("name", email.split("@")[0]),
                "role":                 user.get("role", "candidate"),
                "is_verified":          user.get("is_verified", False),
                "email_verified":       user.get("email_verified", user.get("is_verified", False)),
                "onboarding_completed": user.get("onboarding_completed", False),
                "education":            user.get("education", ""),
                "current_job":          user.get("current_job", ""),
                "target_job":           user.get("target_job", ""),
                "bio":                  user.get("bio", ""),
            }
        }), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except Exception:
        return jsonify({"error": "Invalid token"}), 401


@auth_bp.route("/forgot-password", methods=["POST"])
@rate_limit
def forgot_password():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        email = str(data.get("email", "")).strip().lower()
        if not email:
            return jsonify({"error": "Email is required"}), 400

        if get_user_by_email(email):
            token = jwt.encode({
                "email": email,
                "type":  "reset",
                "exp":   datetime.now(timezone.utc) + timedelta(minutes=15)
            }, Config.SECRET_KEY, algorithm="HS256")
            send_password_reset_email(email, token)

        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200

    except Exception as e:
        return jsonify({"error": "Request failed"}), 500


@auth_bp.route("/reset-password", methods=["POST"])
@rate_limit
def reset_password():
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        token        = data.get("token")
        new_password = str(data.get("password", ""))

        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400

        if len(new_password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long."}), 400

        if len(new_password) > 128:
            return jsonify({"error": "Password exceeds maximum allowed length."}), 400

        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "reset":
            return jsonify({"error": "Invalid token type"}), 400

        email = payload.get("email")
        if not get_user_by_email(email):
            return jsonify({"error": "User not found"}), 404

        update_password(email, new_password)
        return jsonify({"message": "Password reset successfully"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Reset link has expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid reset link"}), 400
    except Exception as e:
        return jsonify({"error": "Password reset failed"}), 500


@auth_bp.route("/google", methods=["POST"])
@rate_limit
def google_auth():
    """Google OAuth Sign-In / Sign-Up handler."""
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        email = str(data.get("email", "")).strip().lower()
        name = str(data.get("name", email.split("@")[0])).strip()[:100]
        google_id = str(data.get("google_id", data.get("sub", "")))

        if not email or not EMAIL_REGEX.match(email):
            return jsonify({"error": "Valid email is required for Google Sign-In"}), 400

        user = get_user_by_email(email)
        if not user:
            # Create user automatically for first-time Google Sign-In
            placeholder_pw = f"GoogleAuth_{google_id or 'oauth'}_{datetime.now().timestamp()}"
            create_user(name, email, placeholder_pw)
            verify_user(email)
            user = get_user_by_email(email)

        # Issue access token
        token = jwt.encode({
            "email": email,
            "type":  "access",
            "exp":   datetime.now(timezone.utc) + timedelta(hours=24)
        }, Config.SECRET_KEY, algorithm="HS256")

        return jsonify({
            "token": token,
            "user": {
                "id":                   str(user.get("id")) if user else "",
                "email":                email,
                "name":                 user.get("name", name),
                "role":                 user.get("role", "candidate"),
                "onboarding_completed": user.get("onboarding_completed", False),
                "is_verified":          True,
            }
        }), 200

    except Exception as e:
        logging.error("Google Auth Error: " + str(e))
        return jsonify({"error": "Google Sign-In failed. Please try again."}), 500