import jwt
import os
from functools import wraps
from flask import request, jsonify
from config import Config
from extensions import users_collection

SECRET_KEY = Config.SECRET_KEY

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
            data = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            user = users_collection.find_one({
                "email": data["email"]
            })

            if not user:
                return jsonify({"error": "User not found"}), 401

        except Exception as e:
            return jsonify({
                "error": "Invalid token",
                "details": str(e)
            }), 401

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
            data = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            user = users_collection.find_one({
                "email": data["email"]
            })

            if not user:
                return jsonify({"error": "User not found"}), 401

            if user.get("role") != "admin":
                return jsonify({"error": "Admin privileges required"}), 403

        except Exception as e:
            return jsonify({
                "error": "Invalid token",
                "details": str(e)
            }), 401

        return f(user, *args, **kwargs)

    return decorated