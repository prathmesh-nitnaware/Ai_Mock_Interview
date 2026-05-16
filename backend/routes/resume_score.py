import os
import json
import logging
import tempfile
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from utils.ai_provider import ai_service
from utils.resume_parser import extract_text_from_file
from config import Config

resume_bp = Blueprint('resume', __name__)

logger = logging.getLogger(__name__)

@resume_bp.route('/score', methods=['POST'])
@token_required
def score_resume(current_user):
    try:
        if 'resume' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['resume']
        job_role = request.form.get('job_description', 'Software Engineer')
        
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = os.path.join(tmp_dir, file.filename)
            file.save(temp_path)
            
            # 1. Extract Text from PDF
            resume_text = extract_text_from_file(temp_path)
            
            # 2. Call AI Provider
            prompt = f"""
            Analyze this resume for the role: {job_role}.
            Resume Content: {resume_text[:5000]}
            
            Return ONLY a valid JSON object with this exact structure:
            {{
                "score": 85,
                "improvement_tips": ["Actionable tip 1", "Actionable tip 2"],
                "summary": "A brief, professional 2-3 sentence executive summary of the match.",
                "missing_keywords": ["Crucial Skill 1", "Tool 2"],
                "strengths": ["Core Strength 1", "Core Strength 2"],
                "weaknesses": ["Critical Gap 1", "Formatting Issue"]
            }}
            """
            
            result_data = ai_service.ask_json(prompt)
            
            if not result_data:
                 # Attempt simpler recovery
                 logger.warning("AI JSON parse failed. Returning heuristic fallback.")
                 result_data = {
                    "score": 70,
                    "improvement_tips": ["Include more quantifiable metrics", "Check for consistent formatting"],
                    "summary": "The resume was parsed but AI analysis hit a formatting wall. Basic text extraction succeeded.",
                    "missing_keywords": ["Technical terms specific to role", "Soft skills"],
                    "strengths": ["Clear section headers", "Machine readable format"],
                    "weaknesses": ["Lacks AI-specific keyword optimization", "Insufficient impact metrics"]
                 }

            from extensions import resumes_collection
            from datetime import datetime
            
            # Save history to DB
            history_doc = {
                "user_id": current_user["_id"],
                "role": job_role,
                "score": result_data.get("score"),
                "summary": result_data.get("summary"),
                "created_at": datetime.utcnow()
            }
            resumes_collection.insert_one(history_doc)
            
            return jsonify(result_data)



    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": "Ollama connection failed. Run 'ollama serve'."}), 500