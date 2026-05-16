import base64
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.auth_helpers import token_required
from extensions import users_collection
from bson import ObjectId

profile_bp = Blueprint("profile", __name__)

@profile_bp.route("/resume/upload", methods=["POST"])
@token_required
def upload_resume(current_user):
    try:
        file = request.files.get('resume')
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        # Convert PDF to Base64 for easy storage/retrieval
        file_bytes = file.read()
        encoded_string = base64.b64encode(file_bytes).decode('utf-8')
        
        # Also extract text for AI Context Sync
        import tempfile
        import os
        from utils.resume_parser import extract_text_from_file
        
        file.seek(0)
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_path = os.path.join(tmp_dir, file.filename)
            file.save(temp_path)
            extracted_text = extract_text_from_file(temp_path)

        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "resume_data": encoded_string,
                "resume_filename": file.filename,
                "resume_text": extracted_text,
                "resume_updated_at": datetime.utcnow()
            }}
        )
        return jsonify({"success": True, "filename": file.filename, "extracted_text": extracted_text}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profile_bp.route("/resume/get", methods=["GET"])
@token_required
def get_resume(current_user):
    user = users_collection.find_one({"_id": current_user["_id"]})
    if not user or "resume_data" not in user:
        return jsonify({"error": "No resume found"}), 404
    
    return jsonify({
        "resume_filename": user.get("resume_filename"),
        "resume_data": user.get("resume_data"),
        "resume_text": user.get("resume_text", "")
    }), 200

@profile_bp.route("/resume/delete", methods=["DELETE"])
@token_required
def delete_resume(current_user):
    try:
        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$unset": {
                "resume_data": "",
                "resume_filename": "",
                "resume_text": "",
                "resume_updated_at": ""
            }}
        )
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
        
        updatable_fields = ["name", "role", "bio", "github", "linkedin", "website", "education", "current_job", "target_job", "onboarding_completed"]
        update_doc = {}
        for field in updatable_fields:
            if field in data:
                update_doc[field] = data[field]
                
        if update_doc:
            users_collection.update_one(
                {"_id": current_user["_id"]},
                {"$set": update_doc}
            )
            
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500