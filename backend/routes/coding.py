from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from datetime import datetime
import ollama
import json
from config import Config

coding_bp = Blueprint("coding", __name__)
client = ollama.Client(host=Config.OLLAMA_HOST)

# Systematic ML & Algorithm Library
CHALLENGES = [
    {
        "id": "ml_1",
        "title": "Linear Regression from Scratch",
        "difficulty": "Medium",
        "description": "Implement a simple Linear Regression model using only NumPy. You must implement the fit() method using Gradient Descent and the predict() method.",
        "constraints": ["Time complexity: O(epochs * n_samples)", "Memory: < 256MB"],
        "starter_code": "import numpy as np\n\nclass LinearRegression:\n    def __init__(self, lr=0.01, epochs=1000):\n        self.lr = lr\n        self.epochs = epochs\n        self.weights = None\n        self.bias = None\n\n    def fit(self, X, y):\n        # TODO: Implement Gradient Descent logic\n        pass\n\n    def predict(self, X):\n        # TODO: Implement Prediction logic\n        pass",
        "sample_input": "X = [[1], [2], [3]], y = [2, 4, 6]",
        "sample_output": "Predictions: [2, 4, 6]"
    },
    {
        "id": "ds_1",
        "title": "K-Nearest Neighbors Logic",
        "difficulty": "Easy",
        "description": "Calculate the Euclidean distance between a query point and a list of dataset points, returning the indices of the K nearest neighbors.",
        "constraints": ["Use standard math libraries", "K will always be < len(points)"],
        "starter_code": "import math\n\ndef get_knn(query, points, k):\n    # Write your distance calculation logic here\n    # Return the indices of the K closest points\n    return []",
        "sample_input": "query=[0,0], points=[[1,1],[0.1,0.1],[2,2]], k=1",
        "sample_output": "[1]"
    },
    {
        "id": "ml_2",
        "title": "Sigmoid Activation Function",
        "difficulty": "Easy",
        "description": "Implement the Sigmoid activation function which is essential for Logistic Regression and Neural Networks.",
        "constraints": ["Handle large positive/negative inputs to avoid overflow"],
        "starter_code": "import math\n\ndef sigmoid(z):\n    # TODO: Implement Sigmoid: 1 / (1 + exp(-z))\n    return 0.0",
        "sample_input": "z = 0",
        "sample_output": "0.5"
    }
]

@coding_bp.route("/challenges", methods=["GET"])
@token_required
def get_challenges(current_user):
    """Returns the list for the Dojo selection screen."""
    return jsonify(CHALLENGES), 200

@coding_bp.route("/challenge/<challenge_id>", methods=["GET"])
@token_required
def get_single_challenge(current_user, challenge_id):
    """Returns a specific challenge by ID."""
    challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        return jsonify({"error": "Challenge not found"}), 404
    return jsonify(challenge), 200

@coding_bp.route("/submit", methods=["POST"])
@token_required
def submit_challenge(current_user):
    """Evaluates the user's code via AI review."""
    try:
        data = request.json
        challenge_id = data.get("challenge_id")
        code = data.get("code")
        
        challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
        if not challenge:
            return jsonify({"error": "Challenge not found"}), 404
            
        prompt = f"""
        Role: AI Technical Reviewer
        Goal: Analyze this user's solution for the challenge: '{challenge['title']}'.
        
        Challenge Description: {challenge['description']}
        User Code:
        ```python
        {code}
        ```
        
        Please provide feedback on correctness, efficiency, and code quality.
        Return ONLY valid JSON:
        {{
            "success": true/false (if it passes basic logic),
            "feedback": "Concise review",
            "clarity_score": 1-10,
            "confidence_score": 1-10,
            "improvements": ["tip1", "tip2"]
        }}
        """
        
        response = client.chat(model=Config.OLLAMA_MODEL, messages=[{"role": "user", "content": prompt}])
        content = response["message"]["content"]
        start, end = content.find("{"), content.rfind("}")
        result = json.loads(content[start:end+1])
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500