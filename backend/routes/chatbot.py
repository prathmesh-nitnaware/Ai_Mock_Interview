"""
routes/chatbot.py — Support Assistant route using Central Gemini Service
=======================================================================
"""
import logging
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from utils.middleware import rate_limit
from services.ai import gemini_service, record_ai_usage

logger = logging.getLogger(__name__)
chatbot_bp = Blueprint("chatbot", __name__)


@chatbot_bp.route("/ask", methods=["POST"])
@token_required
@rate_limit
def ask_chatbot(current_user):
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"error": "Missing or malformed JSON body"}), 400

        user_message = str(data.get("message", "")).strip()[:2000]
        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        prompt = f"""You are 'PrepAI Support Assistant', a helpful support chatbot for the PrepAI platform.
Your ONLY purpose is to answer questions about the PrepAI website, its features, and how to use them.

PrepAI Platform Features:
1. AI Mock Interviews: Customizable live technical and behavioral interviews using facial/audio monitoring. Users can pick 'Technical', 'Behavioral', 'System Design' and set Difficulty.
2. ATS Resume Scorer: Users upload PDFs to get scored against target roles.
3. Coding Dojo: Contains curated DSA challenges (Easy/Medium/Hard) to practice algorithm skills with AI evaluating code efficiency and logic.
4. User Profile: Stores performance metrics and allows users to update social links and upload resumes.

Strict Rules:
- If the user asks about ANYTHING outside of how to use PrepAI, careers, interview prep, or technical support for the platform, politely refuse to answer and redirect them.
- Keep answers concise, helpful, and friendly. Limit response to 3-4 sentences.

User Inquiry: "{user_message}"

Return ONLY valid JSON:
{{"reply": "Concise 2-3 sentence helpful answer."}}"""

        def validate_chat_output(res):
            if isinstance(res, dict) and "reply" in res:
                return str(res["reply"]).strip()
            if isinstance(res, str):
                return res.strip()
            return "Welcome to PrepAI! You can practice technical mock interviews, score your resume against target roles, or solve coding challenges in the Coding Dojo."

        try:
            ai_res = gemini_service.execute_structured_request(
                prompt=prompt,
                request_type="CHATBOT_ASSIST",
                validator=validate_chat_output,
            )
            reply = ai_res.data
            record_ai_usage("CHATBOT_ASSIST", result=ai_res, user_id=str(current_user["id"]))
        except Exception as e:
            logger.warning(f"Chatbot AI assist error: {e}")
            reply = "Welcome to PrepAI! You can practice technical mock interviews, score your resume against target roles, or solve coding challenges in the Coding Dojo."

        return jsonify({"reply": reply}), 200

    except Exception as e:
        logger.error(f"Chatbot route error: {e}")
        return jsonify({"error": "Failed to process support request"}), 500
