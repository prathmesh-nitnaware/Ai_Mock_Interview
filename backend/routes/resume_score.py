import os
import json
import tempfile
import ollama
from flask import Blueprint, request, jsonify
from utils.resume_parser import extract_text_from_file
from config import Config

resume_bp = Blueprint('resume', __name__)
client = ollama.Client(host=Config.OLLAMA_HOST)

@resume_bp.route('/score', methods=['POST'])
def score_resume():
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
            
            # 2. Call Ollama (Using llama3:8b from your list)
            prompt = f"""
            Analyze this resume for the role: {job_role}.
            Resume Content: {resume_text[:2000]}
            
            Return ONLY a valid JSON object.
            {{
                "score": 85,
                "improvement_tips": ["tip1", "tip2"],
                "summary": "brief summary",
                "missing_keywords": ["skill1"],
                "strengths": ["strength1"],
                "weaknesses": ["weakness1"]
            }}
            """
            
            # Use the EXACT name from your 'ollama list'
            response = client.chat(
                model=Config.OLLAMA_MODEL, 
                messages=[{'role': 'user', 'content': prompt}]
            )
            content = response['message']['content']
            
            # 3. Clean and Parse JSON
            start, end = content.find("{"), content.rfind("}")
            if start == -1 or end == -1:
                return jsonify({"error": "AI failed to format response"}), 500
                
            result_data = json.loads(content[start:end+1])
            result_data['extracted_text'] = resume_text 
            
            return jsonify(result_data)

    except Exception as e:
        print(f"Server Error: {str(e)}")
        return jsonify({"error": "Ollama connection failed. Run 'ollama serve'."}), 500