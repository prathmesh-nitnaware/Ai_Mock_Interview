"""
routes/profile.py — Profile & Resume routes using Neon PostgreSQL
"""
import base64
import tempfile
import os
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from models.user_model import get_user_by_id, update_user_fields, clear_resume_fields
from utils.resume_parser import extract_text_from_file

profile_bp = Blueprint("profile", __name__)


from werkzeug.utils import secure_filename
from utils.middleware import rate_limit

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@profile_bp.route("/resume/upload", methods=["POST"])
@token_required
@rate_limit
def upload_resume(current_user):
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files.get("resume")
        if not file or not file.filename:
            return jsonify({"error": "Empty filename"}), 400

        safe_name = secure_filename(file.filename)
        _, ext = os.path.splitext(safe_name.lower())
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Invalid file type. Only PDF, DOCX, and TXT files are allowed."}), 400

        file_bytes = file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            return jsonify({"error": "File size exceeds the 10MB limit."}), 400

        # Validate PDF header if extension is .pdf
        if ext == ".pdf" and not file_bytes.startswith(b"%PDF-"):
            return jsonify({"error": "Invalid PDF file structure."}), 400

        encoded_string = base64.b64encode(file_bytes).decode("utf-8")

        # Extract text for AI context safely using NamedTemporaryFile
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp_file:
            tmp_path = tmp_file.name
            tmp_file.write(file_bytes)

        try:
            extracted_text = extract_text_from_file(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        update_user_fields(str(current_user["id"]), {
            "resume_data":       encoded_string,
            "resume_filename":   safe_name,
            "resume_text":       extracted_text,
            "resume_updated_at": datetime.now(timezone.utc),
        })

        return jsonify({"success": True, "filename": safe_name, "extracted_text": extracted_text[:500]}), 200

    except Exception as e:
        return jsonify({"error": "Failed to process resume"}), 500


@profile_bp.route("/resume/get", methods=["GET"])
@token_required
def get_resume(current_user):
    user = get_user_by_id(str(current_user["id"]))
    if not user or not user.get("resume_data"):
        return jsonify({"error": "No resume found"}), 404

    return jsonify({
        "resume_filename": user.get("resume_filename"),
        "resume_data":     user.get("resume_data"),
        "resume_text":     user.get("resume_text", ""),
    }), 200


@profile_bp.route("/resume/delete", methods=["DELETE"])
@token_required
def delete_resume(current_user):
    try:
        clear_resume_fields(str(current_user["id"]))
        return jsonify({"success": True, "message": "Resume deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@profile_bp.route("/update", methods=["PUT"])
@token_required
def update_profile(current_user):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        allowed = [
            "name", "bio", "github", "linkedin", "website",
            "education", "current_job", "target_job", "onboarding_completed"
        ]
        update_doc = {k: data[k] for k in allowed if k in data}

        if update_doc:
            update_user_fields(str(current_user["id"]), update_doc)

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500