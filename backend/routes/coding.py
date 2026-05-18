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
        language = data.get("language", "python")
        action = data.get("action", "submit")
        
        challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
        if not challenge:
            return jsonify({"error": "Challenge not found"}), 404
            
        prompt = f"""
        Role: AI Technical Reviewer
        Goal: Analyze this user's solution in {language.capitalize()} for the challenge: '{challenge['title']}'.
        
        Challenge Description: {challenge['description']}
        User Code:
        ```{language}
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
            
        if action == "submit":
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

@coding_bp.route("/leaderboard", methods=["GET"])
@token_required
def get_leaderboard(current_user):
    """Fetches the top 20 users by coding score."""
    from extensions import coding_collection
    
    try:
        pipeline = [
            {"$match": {"success": True}},
            {"$group": {
                "_id": {
                    "user_id": "$user_id",
                    "challenge_id": "$challenge_id"
                }
            }},
            {"$group": {
                "_id": "$_id.user_id",
                "challenges_solved": {"$sum": 1}
            }},
            {"$addFields": {"score": {"$multiply": ["$challenges_solved", 500]}}},
            {"$lookup": {
                "from": "users",
                "localField": "_id",
                "foreignField": "_id",
                "as": "user_info"
            }},
            {"$unwind": "$user_info"},
            {"$project": {
                "name": "$user_info.name",
                "challenges_solved": 1,
                "score": 1,
                "_id": 0
            }},
            {"$sort": {"score": -1}},
            {"$limit": 20}
        ]
        
        leaderboard = list(coding_collection.aggregate(pipeline))
        return jsonify(leaderboard), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500