from extensions import interviews_collection
from bson import ObjectId

class AnalyticsService:
    @staticmethod
    def get_user_stats(user_id):
        """
        Aggregates performance metrics for a user.
        """
        pipeline = [
            {"$match": {"user_id": str(user_id), "status": "completed"}},
            {"$group": {
                "_id": None,
                "avg_score": {"$avg": "$overall_score"},
                "total_sessions": {"$sum": 1},
                "max_score": {"$max": "$overall_score"}
            }}
        ]
        
        results = list(interviews_collection.aggregate(pipeline))
        stats = results[0] if results else {"avg_score": 0, "total_sessions": 0, "max_score": 0}
        
        # Calculate weak areas (this would be based on feedback analysis in a real scenario)
        # For now, we return placeholder categories derived from role
        return {
            "score_trend": [65, 70, 75, 82, 85], # Mock trend data
            "stats": stats,
            "skills_matrix": {
                "communication": 85,
                "technical": 72,
                "problem_solving": 68,
                "leadership": 45
            }
        }
