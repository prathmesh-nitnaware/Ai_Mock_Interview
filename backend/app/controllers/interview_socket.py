import json
from flask_sock import Sock
from app.providers.factory import ai_service

sock = Sock()

@sock.route('/api/v1/interview/stream')
def interview_stream(ws):
    """
    Real-time Interview WebSocket handler.
    Handles user speech (text) and streams AI response.
    """
    while True:
        data = ws.receive()
        if not data: break
        
        request = json.loads(data)
        user_input = request.get("text", "")
        role = request.get("role", "Software Engineer")
        
        prompt = f"Role: {role}. Candidate said: {user_input}. Generate a concise, challenging follow-up question."
        system_instruction = "You are a senior technical interviewer. Keep responses short and conversational for voice output."

        # Stream AI response back to client in chunks
        for chunk in ai_service.ask_stream(prompt, system_instruction):
            ws.send(json.dumps({
                "type": "token",
                "content": chunk
            }))
        
        ws.send(json.dumps({"type": "end"}))
