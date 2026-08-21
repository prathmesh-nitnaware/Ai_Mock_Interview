import json
import time
import jwt
from flask import request as flask_request
from flask_sock import Sock
from services.ai import gemini_service
from config import Config
from models.user_model import get_user_by_email

sock = Sock()

MAX_INPUT_LENGTH = 3000
RATE_LIMIT_COOLDOWN = 1.0  # seconds between user messages

@sock.route('/api/v1/interview/stream')
def interview_stream(ws):
    """
    Real-time Interview WebSocket handler with JWT authentication,
    input sanitization, and rate limiting.
    """
    # 1. Authenticate connection via query parameter ?token=... or first message
    auth_token = flask_request.args.get("token")
    authenticated_user = None

    if auth_token:
        try:
            payload = jwt.decode(auth_token, Config.SECRET_KEY, algorithms=["HS256"])
            authenticated_user = get_user_by_email(payload.get("email"))
        except Exception:
            ws.send(json.dumps({"type": "error", "message": "Authentication failed"}))
            ws.close()
            return

    last_message_time = 0.0

    while True:
        try:
            raw_data = ws.receive(timeout=120)
        except Exception:
            break

        if not raw_data:
            break

        try:
            req_data = json.loads(raw_data)
        except Exception:
            ws.send(json.dumps({"type": "error", "message": "Invalid JSON format"}))
            continue

        # Handle inline auth message if not yet authenticated
        if not authenticated_user:
            token = req_data.get("token")
            if token:
                try:
                    payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
                    authenticated_user = get_user_by_email(payload.get("email"))
                    if authenticated_user:
                        ws.send(json.dumps({"type": "authenticated"}))
                        continue
                except Exception:
                    pass
            ws.send(json.dumps({"type": "error", "message": "Unauthorized: valid token required"}))
            ws.close()
            return

        # Rate limiting per connection
        now = time.monotonic()
        if now - last_message_time < RATE_LIMIT_COOLDOWN:
            ws.send(json.dumps({"type": "error", "message": "Rate limit exceeded. Please wait a moment."}))
            continue
        last_message_time = now

        user_input = str(req_data.get("text", "")).strip()[:MAX_INPUT_LENGTH]
        role = str(req_data.get("role", "Software Engineer"))[:100]

        if not user_input:
            continue

        prompt = f"Role: {role}. Candidate said: {user_input}. Generate a concise, challenging follow-up question."
        system_instruction = "You are a senior technical interviewer. Keep responses short and conversational for voice output."

        # Stream AI response back to client in chunks
        try:
            for chunk in gemini_service.stream_response(prompt, system_instruction):
                ws.send(json.dumps({
                    "type": "token",
                    "content": chunk
                }))
            ws.send(json.dumps({"type": "end"}))
        except Exception as e:
            ws.send(json.dumps({"type": "error", "message": "AI stream generation failed"}))
