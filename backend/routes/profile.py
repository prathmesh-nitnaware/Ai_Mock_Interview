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

        # Convert PDF to Base64 for easy storage/retrieval in this demo
        # For larger files, GridFS is recommended
        encoded_string = base64.b64encode(file.read()).decode('utf-8')

        users_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": {
                "resume_data": encoded_string,
                "resume_filename": file.filename,
                "resume_updated_at": datetime.utcnow()
            }}
        )
        return jsonify({"success": True, "filename": file.filename}), 200
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
        "resume_data": user.get("resume_data")
    }), 200