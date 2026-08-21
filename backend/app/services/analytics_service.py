from extensions import get_db, dict_cursor

class AnalyticsService:
    @staticmethod
    def get_user_stats(user_id):
        """
        Aggregates performance metrics for a user using Neon PostgreSQL.
        """
        with get_db() as conn:
            with dict_cursor(conn) as cur:
                cur.execute(
                    """
                    SELECT
                        COALESCE(AVG(overall_score), 0) AS avg_score,
                        COUNT(*) AS total_sessions,
                        COALESCE(MAX(overall_score), 0) AS max_score
                    FROM interviews
                    WHERE user_id = %s AND status = 'completed'
                    """,
                    (str(user_id),)
                )
                row = cur.fetchone()
        
        stats = dict(row) if row else {"avg_score": 0, "total_sessions": 0, "max_score": 0}
        stats["avg_score"] = round(float(stats["avg_score"]), 1)
        stats["total_sessions"] = int(stats["total_sessions"])
        stats["max_score"] = int(stats["max_score"])
        
        return {
            "score_trend": [65, 70, 75, 82, 85], # Trend data
            "stats": stats,
            "skills_matrix": {
                "communication": 85,
                "technical": 72,
                "problem_solving": 68,
                "leadership": 45
            }
        }
