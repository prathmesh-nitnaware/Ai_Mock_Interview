import os
import json
from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from utils.ai_provider import ai_service
from extensions import interviews_collection
from config import Config

interview_bp = Blueprint("interview", __name__)

# ============================
# Helper: Generate Question
# ============================
def generate_question(role, experience, focus, difficulty="Medium", resume_context=""):
    prompt = f"""
    You are an expert technical interviewer. Generate ONE interview question.
    Role: {role} | Experience: {experience} | Focus: {focus} | Difficulty: {difficulty}
    Resume Context: {resume_context[:500]}
    
    CRITICAL INSTRUCTION:
    If Focus is "Technical", the question MUST NOT always be a coding exercise. You should alternate between asking conceptual/theoretical questions (e.g. explain how X works, system design concepts, trade-offs) and actual coding questions. Make sure it matches the {difficulty} difficulty level.
    
    Return ONLY valid JSON with this exact structure:
    {{
    "title": "Question Title",
    "description": "The actual interview question text",
    "input_format": "text or code",
    "output_format": "text or code"
    }}
    """
    result = ai_service.ask_json(prompt)
    if result:
        return result
    
    # Fallback
    return {
        "title": "Technical Background",
        "description": f"Explain your experience working with projects related to {role}.",
        "input_format": "text", "output_format": "text"
    }

# ============================
# Helper: Analyze Answer
# ============================
def analyze_answer(question, answer):
    prompt = f"""
    Analyze this interview response. Question: {question} | Answer: {answer}
    Return ONLY valid JSON with this exact structure:
    {{
        "clarity_score": 1-10,
        "confidence_score": 1-10,
        "feedback": "Concise 1-2 sentence feedback"
    }}
    """
    result = ai_service.ask_json(prompt)
    if result:
        return result
        
    return {"clarity_score": 5, "confidence_score": 5, "feedback": "Good effort."}


# ============================
# Routes
# ============================

@interview_bp.route("/initiate", methods=["POST"])
@token_required
def initiate_session(current_user):
    try:
        data = request.json
        session = {
            "user_id": str(current_user["_id"]),
            "role": data.get("role", "Software Engineer"),
            "experience": data.get("experience", "0-2 years"),
            "focus": data.get("focus", "Technical"),
            "difficulty": data.get("difficulty", "Medium"),
            "created_at": datetime.utcnow(),
            "questions": [],
            "answers": [],
            "status": "active"
        }
        # Generate first question
        question = generate_question(session['role'], session['experience'], session['focus'], session['difficulty'], data.get("resume_context", ""))
        session["questions"].append(question)
        
        result = interviews_collection.insert_one(session)
        return jsonify({"session_id": str(result.inserted_id), "question": question}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@interview_bp.route("/submit", methods=["POST"])
@token_required
def submit_answer(current_user):
    try:
        data = request.json
        session_id = data.get("session_id")
        answer = data.get("answer")
        question_title = data.get("question_title")

        review = analyze_answer(question_title, answer)

        interviews_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$push": {"answers": {"question": question_title, "answer": answer, "feedback": review}}}
        )
        return jsonify({"success": True, "review": review}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@interview_bp.route("/next", methods=["POST"])
@token_required
def next_question(current_user):
    try:
        data = request.json
        session_id = data.get("session_id")
        session = interviews_collection.find_one({"_id": ObjectId(session_id)})
        
        question = generate_question(session['role'], session['experience'], session['focus'], session.get('difficulty', 'Medium'))
        interviews_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$push": {"questions": question}}
        )
        return jsonify(question), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@interview_bp.route("/complete", methods=["POST"])
@token_required
def complete_session(current_user):
    try:
        data = request.json
        session_id = data.get("session_id")
        overall_score = data.get("overall_score")
        
        interviews_collection.update_one(
            {"_id": ObjectId(session_id)},
            {"$set": {"status": "completed", "overall_score": overall_score}}
        )
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@interview_bp.route("/history", methods=["GET"])
@token_required
def get_history(current_user):
    try:
        history = list(interviews_collection.find({"user_id": str(current_user["_id"])}).sort("created_at", -1))
        for item in history:
            item["_id"] = str(item["_id"])
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@interview_bp.route("/delete/<session_id>", methods=["DELETE"])
@token_required
def delete_session(current_user, session_id):
    try:
        interviews_collection.delete_one({"_id": ObjectId(session_id), "user_id": str(current_user["_id"])})
        return jsonify({"success": True}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500