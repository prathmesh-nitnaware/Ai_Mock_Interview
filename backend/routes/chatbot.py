from flask import Blueprint, request, jsonify
from utils.ai_provider import ai_service
from utils.auth_helpers import token_required

chatbot_bp = Blueprint("chatbot", __name__)

@chatbot_bp.route("/ask", methods=["POST"])
@token_required
def ask_chatbot(current_user):
    try:
        data = request.get_json()
        user_message = data.get("message", "")
        
        if not user_message:
            return jsonify({"error": "Empty message"}), 400

        prompt = f"""
        You are 'PrepAI Support Assistant', an exclusive chatbot for the PrepAI platform.
        Your ONLY purpose is to answer questions about the PrepAI website, its features, and how to use them.

        PrepAI Platform Features:
        1. AI Mock Interviews: Customizable live technical and behavioral interviews using facial/audio monitoring. Users can pick 'Technical', 'Behavioral', 'System Design' and set Difficulty.
        2. ATS Resume Scorer: Users upload PDFs to get scored against target roles.
        3. Coding Dojo: Contains 50 DSA challenges (Easy/Medium/Hard) to practice algorithm skills with AI evaluating code efficiency and logic.
        4. User Profile: Stores performance metrics and allows users to update social links and upload resumes.
        
        Strict Rules:
        - If the user asks about ANYTHING outside of how to use PrepAI, careers, interview prep, or technical support for the platform, you MUST politely refuse to answer.
        - Even if they ask you to write code or solve a math problem, refuse and redirect them to the Coding Dojo.
        - Keep answers concise, helpful, and friendly. Limit response to 3-4 sentences.

        User Message: "{user_message}"
        """

        result = ai_service.ask_json(f"{{ \"response\": \"{prompt} -> respond and format as valid JSON exactly like {{ 'response': 'your answer' }}\" }}")
        # In case the provider fails to format JSON properly, use general text parse method
        
        # We can just extract the response string if it's text
        text_prompt = prompt + "\n\nProvide the response as plain text."
        response_text = ai_service.ask_gemini(text_prompt)

        return jsonify({"reply": response_text}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
