from flask import Blueprint, jsonify
from utils.auth_helpers import admin_required
from extensions import users_collection, interviews_collection, coding_collection
from datetime import datetime, timedelta, timezone
from bson import ObjectId
from .coding_data import CHALLENGES

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/analytics", methods=["GET", "OPTIONS"])
@admin_required
def get_analytics(current_user):
    try:
        total_users = users_collection.count_documents({})
        
        # Generate last 7 days list
        today = datetime.now(timezone.utc)
        days = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            days.append({
                "date": d.strftime("%a"), # e.g. "Mon"
                "full_date": d.strftime("%Y-%m-%d"),
                "users": 0
            })
            
        seven_days_ago = today - timedelta(days=7)
        
        # Aggregate 7 days users
        users = list(users_collection.find({}))
        for u in users:
            dt = u.get("created_at") or u["_id"].generation_time
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt >= seven_days_ago:
                dt_str = dt.strftime("%Y-%m-%d")
                for day in days:
                    if day["full_date"] == dt_str:
                        day["users"] += 1
                        
        # Clean full_date from output
        for day in days:
            del day["full_date"]

        return jsonify({
            "total_users": total_users,
            "chart_data": days
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/users", methods=["GET", "OPTIONS"])
@admin_required
def get_users(current_user):
    try:
        users_cursor = users_collection.find({}, {"password": 0})
        users = []
        for user in users_cursor:
            user["_id"] = str(user["_id"])
            users.append(user)
            
        return jsonify({"users": users}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@admin_bp.route("/user/<user_id>/activity", methods=["GET", "OPTIONS"])
@admin_required
def get_user_activity(current_user, user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)}, {"password": 0})
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        # Find interviews: match by string or ObjectId
        interviews = list(interviews_collection.find({
            "$or": [
                {"user_id": user_id},
                {"user_id": ObjectId(user_id)}
            ]
        }))
        
        # Find coding submissions
        coding = list(coding_collection.find({
            "$or": [
                {"user_id": user_id},
                {"user_id": ObjectId(user_id)}
            ]
        }))
        
        # Calculate stats
        total_interviews = len(interviews)
        avg_score = 0
        if total_interviews > 0:
            avg_score = sum(int(i.get("overall_score") or 0) for i in interviews) / total_interviews
            
        coding_solved = sum(1 for c in coding if c.get("success", False))
        
        # Build timeline
        timeline = []
        for i in interviews:
            dt = i.get("created_at") or i["_id"].generation_time
            timeline.append({
                "type": "interview",
                "title": f"Completed Mock Interview ({i.get('role', 'Developer')})",
                "detail": f"Score: {i.get('overall_score', 0)}% | Difficulty: {i.get('difficulty', 'Medium')}",
                "date": dt.strftime("%Y-%m-%d %H:%M")
            })
            
        for c in coding:
            dt = c.get("created_at") or c["_id"].generation_time
            challenge = next((ch for ch in CHALLENGES if ch["id"] == c.get("challenge_id")), None)
            title = challenge["title"] if challenge else "Coding Dojo Challenge"
            timeline.append({
                "type": "coding",
                "title": f"Submitted solution for '{title}'",
                "detail": "Success / Passed" if c.get("success", False) else "Failed / Compilation Error",
                "date": dt.strftime("%Y-%m-%d %H:%M")
            })
            
        if user.get("resume_filename"):
            resume_dt = user.get("resume_updated_at") or user["_id"].generation_time
            timeline.append({
                "type": "resume",
                "title": "Uploaded Resume to Vault",
                "detail": f"Filename: {user.get('resume_filename')}",
                "date": resume_dt.strftime("%Y-%m-%d %H:%M")
            })
            
        # Sort timeline by date descending
        timeline.sort(key=lambda x: x["date"], reverse=True)
        
        return jsonify({
            "user": {
                "name": user.get("name"),
                "email": user.get("email"),
                "role": user.get("role", "candidate"),
                "onboarding_completed": user.get("onboarding_completed", False),
                "is_verified": user.get("is_verified", False)
            },
            "stats": {
                "total_interviews": total_interviews,
                "average_score": round(avg_score, 1),
                "coding_challenges_submitted": len(coding),
                "coding_challenges_solved": coding_solved,
                "has_resume": bool(user.get("resume_filename")),
                "resume_name": user.get("resume_filename", "")
            },
            "timeline": timeline
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

