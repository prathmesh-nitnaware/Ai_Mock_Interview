from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta, timezone

from config import Config
from models.user_model import create_user, get_user_by_email, verify_user, update_password
from utils.email_utils import send_verification_email, send_password_reset_email

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        name = data.get("name", email.split("@")[0])

        if get_user_by_email(email):
            return jsonify({"error": "User already exists"}), 409

        create_user(name, email, password)
        
        token = jwt.encode({
            "email": email, 
            "type": "verify", 
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }, Config.SECRET_KEY)
        
        send_verification_email(email, token)

        return jsonify({"message": "User created successfully. Please check your email to verify your account."}), 201

    except Exception as e:
        print("Signup Error:", str(e))
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        email = data.get("email")
        password = data.get("password")

        user = get_user_by_email(email)

        if not user:
            return jsonify({"error": "User not found"}), 404

        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password"}), 401
            
        if not user.get("is_verified", False):
            return jsonify({"error": "Please verify your email before logging in."}), 403

        token = jwt.encode({
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }, Config.SECRET_KEY)

        return jsonify({
            "token": token,
            "user": {
                "email": email,
                "name": user.get("name", email.split("@")[0]),
                "role": user.get("role", "candidate"),
                "onboarding_completed": user.get("onboarding_completed", False),
                "is_verified": user.get("is_verified", False)
            }
        })
    except Exception as e:
        print("Login Error:", str(e))
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/verify-email", methods=["POST"])
def verify_email():
    try:
        data = request.get_json()
        token = data.get("token")
        if not token:
            return jsonify({"error": "Missing token"}), 400
            
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "verify":
            return jsonify({"error": "Invalid token type"}), 400
            
        email = payload.get("email")
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        verify_user(email)
        return jsonify({"message": "Email verified successfully"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Verification link has expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid verification link"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400
            
        user = get_user_by_email(email)
        if user:
            token = jwt.encode({
                "email": email, 
                "type": "reset", 
                "exp": datetime.now(timezone.utc) + timedelta(minutes=15)
            }, Config.SECRET_KEY)
            send_password_reset_email(email, token)
            
        return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    try:
        data = request.get_json()
        token = data.get("token")
        new_password = data.get("password")
        
        if not token or not new_password:
            return jsonify({"error": "Token and new password are required"}), 400
            
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "reset":
            return jsonify({"error": "Invalid token type"}), 400
            
        email = payload.get("email")
        user = get_user_by_email(email)
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        update_password(email, new_password)
        return jsonify({"message": "Password reset successfully"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Reset link has expired"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid reset link"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500