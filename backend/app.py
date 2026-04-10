import os
from flask import Flask
from flask_cors import CORS
from routes import register_routes
from config import Config

app = Flask(__name__)

# Optimized CORS for Prathmesh's development environment
CORS(app, resources={r"/api/*": {"origins": os.getenv("FRONTEND_URL", "http://localhost:5173")}}, supports_credentials=True)

# Register all route blueprints including the new Coding Dojo logic
register_routes(app)

@app.route("/api/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    # Running on port 5000 as configured for the Prep AI backend
    app.run(host="0.0.0.0", port=5000, debug=True)