from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta, timezone

from config import Config
from models.user_model import create_user, get_user_by_email

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

        return jsonify({"message": "User created successfully"}), 201

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

        token = jwt.encode({
            "email": email,
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        }, Config.SECRET_KEY)

        return jsonify({
            "token": token,
            "user": {
                "email": email,
                "name": user.get("name", email.split("@")[0]),
                "onboarding_completed": user.get("onboarding_completed", False)
            }
        })
    except Exception as e:
        print("Login Error:", str(e))
        return jsonify({"error": str(e)}), 500