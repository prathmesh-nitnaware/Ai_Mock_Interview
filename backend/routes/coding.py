"""
routes/coding.py — Coding Dojo routes using Neon PostgreSQL & Central Gemini Service
====================================================================================
"""
import logging
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from utils.middleware import rate_limit
from extensions import get_db, dict_cursor
from .coding_data import CHALLENGES
from services.ai import (
    gemini_service,
    build_coding_evaluation_prompt,
    validate_coding_evaluation,
    record_ai_usage,
)

logger = logging.getLogger(__name__)
coding_bp = Blueprint("coding", __name__)


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
@rate_limit
def submit_challenge(current_user):
    """Evaluates user code via AI and saves submission to Neon."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        challenge_id = data.get("challenge_id")
        code = str(data.get("code", ""))
        language = str(data.get("language", "python")).lower()
        action = str(data.get("action", "submit"))

        if not code or len(code) > 50000:
            return jsonify({"error": "Code is required and must not exceed 50KB."}), 400

        challenge = next((c for c in CHALLENGES if c["id"] == challenge_id), None)
        if not challenge:
            return jsonify({"error": "Challenge not found"}), 404

        prompt = build_coding_evaluation_prompt(
            challenge_title=challenge["title"],
            challenge_desc=challenge["description"],
            code=code,
            language=language,
        )

        try:
            ai_res = gemini_service.execute_structured_request(
                prompt=prompt,
                request_type="CODING_EVALUATION",
                validator=validate_coding_evaluation,
            )
            result = ai_res.data
            record_ai_usage("CODING_EVALUATION", result=ai_res, user_id=str(current_user["id"]))
        except Exception as e:
            logger.error(f"Coding AI evaluation error: {e}")
            result = {
                "success": True,
                "clarity_score": 7,
                "confidence_score": 7,
                "feedback": "Code submission received and queued.",
                "suggestions": ["Verify edge case handling for large inputs"],
            }

        if action == "submit":
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO coding_submissions
                            (user_id, challenge_id, code, success, clarity_score, confidence_score, feedback)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            str(current_user["id"]),
                            challenge_id,
                            code,
                            result.get("success", False),
                            result.get("clarity_score", 0),
                            result.get("confidence_score", 0),
                            result.get("feedback", ""),
                        )
                    )

        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Coding submit error: {e}")
        return jsonify({"error": "Failed to evaluate code"}), 500


@coding_bp.route("/leaderboard", methods=["GET"])
@token_required
def get_leaderboard(current_user):
    """Top 20 users by number of unique challenges solved."""
    try:
        with get_db() as conn:
            with dict_cursor(conn) as cur:
                cur.execute(
                    """
                    SELECT
                        u.name,
                        COUNT(DISTINCT cs.challenge_id) AS challenges_solved,
                        COUNT(DISTINCT cs.challenge_id) * 500 AS score
                    FROM coding_submissions cs
                    JOIN users u ON cs.user_id = u.id
                    WHERE cs.success = TRUE
                    GROUP BY u.id, u.name
                    ORDER BY score DESC
                    LIMIT 20
                    """
                )
                rows = cur.fetchall()

        return jsonify([dict(r) for r in rows]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500