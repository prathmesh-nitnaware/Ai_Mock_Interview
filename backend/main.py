import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from app.controllers.interview_socket import sock
from routes import register_routes
from config import Config

# Allowed frontend origins
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://prep-ai-smoky-five.vercel.app",
]

def create_app():
    app = Flask(__name__)

    # Add any extra origin from env variable
    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url and frontend_url not in ALLOWED_ORIGINS:
        ALLOWED_ORIGINS.append(frontend_url.rstrip("/"))

    # Primary CORS setup via flask-cors
    CORS(
        app,
        resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # Safety net: inject CORS headers on every response for matched origins
    @app.after_request
    def inject_cors_headers(response):
        origin = request.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        return response

    # Explicitly handle preflight OPTIONS for all /api/* routes
    @app.route("/api/<path:path>", methods=["OPTIONS"])
    def handle_options(path):
        origin = request.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            resp = jsonify({"status": "ok"})
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Access-Control-Allow-Credentials"] = "true"
            resp.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return resp, 200
        return jsonify({"error": "Origin not allowed"}), 403

    # Initialize WebSockets
    sock.init_app(app)

    # Register existing routes (Legacy support)
    register_routes(app)

    @app.route("/api/health")
    def health():
        return {"status": "production-ready", "ai": "active"}

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
