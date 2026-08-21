"""
routes/admin.py — Admin routes using Neon PostgreSQL
"""
from flask import Blueprint, jsonify
from utils.auth_helpers import admin_required
from extensions import get_db, dict_cursor
from datetime import datetime, timedelta, timezone
from .coding_data import CHALLENGES

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/analytics", methods=["GET", "OPTIONS"])
@admin_required
def get_analytics(current_user):
    try:
        today = datetime.now(timezone.utc)
        seven_days_ago = today - timedelta(days=7)

        with get_db() as conn:
            with dict_cursor(conn) as cur:
                # Total users (non-admin)
                cur.execute("SELECT COUNT(*) AS total FROM users WHERE role != 'admin'")
                total_users = cur.fetchone()["total"]

                # Signups per day for last 7 days
                cur.execute(
                    """
                    SELECT TO_CHAR(created_at AT TIME ZONE 'UTC', 'Dy') AS day,
                           COUNT(*) AS users
                    FROM users
                    WHERE role != 'admin'
                      AND created_at >= %s
                    GROUP BY TO_CHAR(created_at AT TIME ZONE 'UTC', 'Dy'),
                             DATE_TRUNC('day', created_at)
                    ORDER BY DATE_TRUNC('day', created_at)
                    """,
                    (seven_days_ago,)
                )
                db_days = {r["day"]: r["users"] for r in cur.fetchall()}

        # Build 7-day chart with 0-fill for missing days
        chart_data = []
        for i in range(6, -1, -1):
            d   = today - timedelta(days=i)
            key = d.strftime("%a")
            chart_data.append({"date": key, "users": db_days.get(key, 0)})

        return jsonify({"total_users": total_users, "chart_data": chart_data}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/users", methods=["GET", "OPTIONS"])
@admin_required
def get_users(current_user):
    try:
        with get_db() as conn:
            with dict_cursor(conn) as cur:
                cur.execute(
                    """
                    SELECT
                        u.id, u.name, u.email, u.role,
                        u.is_verified, u.onboarding_completed,
                        u.resume_filename, u.created_at,
                        COUNT(DISTINCT i.id)                              AS interviews_count,
                        COALESCE(AVG(i.overall_score), 0)                AS average_score,
                        COUNT(DISTINCT cs.challenge_id)
                            FILTER (WHERE cs.success = TRUE)             AS problems_solved
                    FROM users u
                    LEFT JOIN interviews        i  ON i.user_id = u.id
                    LEFT JOIN coding_submissions cs ON cs.user_id = u.id
                    WHERE u.role != 'admin'
                    GROUP BY u.id
                    ORDER BY u.created_at DESC
                    """
                )
                rows = cur.fetchall()

        users = []
        for r in rows:
            d = dict(r)
            d["id"]             = str(d["id"])
            d["average_score"]  = round(float(d["average_score"] or 0), 1)
            d["problems_solved"]= int(d["problems_solved"] or 0)
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            users.append(d)

        return jsonify({"users": users}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/user/<user_id>/activity", methods=["GET", "OPTIONS"])
@admin_required
def get_user_activity(current_user, user_id):
    try:
        today          = datetime.now(timezone.utc)
        seven_days_ago = today - timedelta(days=7)

        with get_db() as conn:
            with dict_cursor(conn) as cur:
                # User info
                cur.execute(
                    "SELECT id, name, email, role, onboarding_completed, is_verified, resume_filename, resume_updated_at "
                    "FROM users WHERE id = %s",
                    (user_id,)
                )
                user = cur.fetchone()
                if not user:
                    return jsonify({"error": "User not found"}), 404
                user = dict(user)

                # Interviews
                cur.execute(
                    "SELECT id, role, difficulty, overall_score, created_at FROM interviews WHERE user_id = %s",
                    (user_id,)
                )
                interviews = [dict(r) for r in cur.fetchall()]

                # Coding submissions
                cur.execute(
                    "SELECT id, challenge_id, success, created_at FROM coding_submissions WHERE user_id = %s",
                    (user_id,)
                )
                coding = [dict(r) for r in cur.fetchall()]

        # Stats
        total_interviews = len(interviews)
        avg_score = round(
            sum(int(i.get("overall_score") or 0) for i in interviews) / total_interviews, 1
        ) if total_interviews else 0
        coding_solved = sum(1 for c in coding if c.get("success", False))

        # Timeline
        timeline = []
        for i in interviews:
            timeline.append({
                "type":   "interview",
                "title":  f"Completed Mock Interview ({i.get('role', 'Developer')})",
                "detail": f"Score: {i.get('overall_score', 0)}% | Difficulty: {i.get('difficulty', 'Medium')}",
                "date":   i["created_at"].strftime("%Y-%m-%d %H:%M") if i.get("created_at") else "",
            })
        for c in coding:
            ch    = next((ch for ch in CHALLENGES if ch["id"] == c.get("challenge_id")), None)
            title = ch["title"] if ch else "Coding Dojo Challenge"
            timeline.append({
                "type":   "coding",
                "title":  f"Submitted solution for '{title}'",
                "detail": "Success / Passed" if c.get("success") else "Failed / Compilation Error",
                "date":   c["created_at"].strftime("%Y-%m-%d %H:%M") if c.get("created_at") else "",
            })
        if user.get("resume_filename") and user.get("resume_updated_at"):
            timeline.append({
                "type":   "resume",
                "title":  "Uploaded Resume to Vault",
                "detail": f"Filename: {user.get('resume_filename')}",
                "date":   user["resume_updated_at"].strftime("%Y-%m-%d %H:%M"),
            })
        timeline.sort(key=lambda x: x["date"], reverse=True)

        # Scores chart
        sorted_iv    = sorted(interviews, key=lambda x: x.get("created_at") or datetime.min)
        scores_list  = [{"role": i.get("role", "Developer"), "score": int(i.get("overall_score") or 0)} for i in sorted_iv]

        # Activity chart — last 7 days
        activity_days = []
        for idx in range(6, -1, -1):
            d = today - timedelta(days=idx)
            activity_days.append({
                "date":      d.strftime("%a"),
                "full_date": d.strftime("%Y-%m-%d"),
                "count":     0,
            })

        all_activities = interviews + coding
        for act in all_activities:
            dt = act.get("created_at")
            if dt and dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            if dt and dt >= seven_days_ago:
                dt_str = dt.strftime("%Y-%m-%d")
                for day in activity_days:
                    if day["full_date"] == dt_str:
                        day["count"] += 1

        for day in activity_days:
            del day["full_date"]

        return jsonify({
            "user": {
                "name":                 user.get("name"),
                "email":                user.get("email"),
                "role":                 user.get("role", "candidate"),
                "onboarding_completed": user.get("onboarding_completed", False),
                "is_verified":          user.get("is_verified", False),
            },
            "stats": {
                "total_interviews":            total_interviews,
                "average_score":               avg_score,
                "coding_challenges_submitted": len(coding),
                "coding_challenges_solved":    coding_solved,
                "has_resume":                  bool(user.get("resume_filename")),
                "resume_name":                 user.get("resume_filename", ""),
            },
            "timeline":       timeline,
            "scores_chart":   scores_list,
            "activity_chart": activity_days,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── AI COST & TELEMETRY ANALYTICS (Phase 11) ─────────────────
@admin_bp.route("/ai/metrics", methods=["GET", "OPTIONS"])
@admin_required
def get_ai_metrics(current_user):
    """
    Returns platform-wide AI usage, real token consumption,
    calculated costs, latency percentiles, pricing versioning, and cost anomaly alerts.
    """
    try:
        from flask import request
        from services.ai.orchestrator import get_admin_ai_metrics
        period = request.args.get("period", "today").lower().strip()
        custom_start = request.args.get("start")
        custom_end = request.args.get("end")
        metrics = get_admin_ai_metrics(period=period, custom_start=custom_start, custom_end=custom_end)
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

