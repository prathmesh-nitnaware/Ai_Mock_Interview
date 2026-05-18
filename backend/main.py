import os
from flask import Flask
from flask_cors import CORS
from app.controllers.interview_socket import sock
from routes import register_routes
from config import Config

def create_app():
    app = Flask(__name__)
    
    frontend_url = os.getenv("FRONTEND_URL")
    origins = [
        "http://localhost:5173", 
        "http://127.0.0.1:5173", 
        "http://localhost:5174", 
        "http://127.0.0.1:5174"
    ]
    if frontend_url:
        origins.append(frontend_url)
        
    CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)
    
    # Initialize WebSockets
    sock.init_app(app)
    
    # Register existing routes (Legacy support)
    register_routes(app)
    
    @app.route("/api/health")
    def health():
        return {"status": "production-ready", "ai": "active"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
