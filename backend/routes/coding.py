from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from datetime import datetime
import json
from config import Config
from utils.ai_provider import ai_service

coding_bp = Blueprint("coding", __name__)


from .coding_data import CHALLENGES


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
        
        result = ai_service.ask_json(prompt)
        if not result:
            return jsonify({"error": "AI failed to evaluate code"}), 500
            
        from extensions import coding_collection
        submission_doc = {
            "user_id": current_user["_id"],
            "challenge_id": challenge_id,
            "code": code,
            "success": result.get("success", False),
            "clarity_score": result.get("clarity_score", 0),
            "confidence_score": result.get("confidence_score", 0),
            "feedback": result.get("feedback", ""),
            "created_at": datetime.utcnow()
        }
        coding_collection.insert_one(submission_doc)
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500