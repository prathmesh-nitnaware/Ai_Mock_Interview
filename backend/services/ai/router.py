"""
backend/services/ai/router.py
=============================
Configurable AI Model Router for PrepAI.
Enables quality-aware model selection, request-specific routing policies,
and structured preparation for future A/B testing without hardcoding model IDs.
"""
import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


class AIModelRouter:
    """
    Central router governing model selection across all AI request types.
    Preserves deterministic default routing while enabling environment-based configuration.
    """

    def __init__(self):
        self.default_model = os.getenv("AI_DEFAULT_MODEL", os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
        self._routes: Dict[str, str] = {
            "QUESTION_GENERATION": os.getenv(
                "AI_MODEL_QUESTION_GENERATION",
                os.getenv("GEMINI_QUESTION_MODEL", self.default_model),
            ),
            "ANSWER_EVALUATION": os.getenv(
                "AI_MODEL_ANSWER_EVALUATION",
                os.getenv("GEMINI_EVALUATION_MODEL", self.default_model),
            ),
            "FINAL_REPORT": os.getenv(
                "AI_MODEL_FINAL_REPORT",
                os.getenv("GEMINI_REPORT_MODEL", self.default_model),
            ),
            "RESUME_SCORING": os.getenv("AI_MODEL_RESUME_SCORING", self.default_model),
            "CODING_EVALUATION": os.getenv("AI_MODEL_CODING_EVALUATION", self.default_model),
            "CHATBOT_ASSIST": os.getenv("AI_MODEL_CHATBOT", self.default_model),
        }

    def select_model(
        self,
        request_type: str,
        complexity: Optional[str] = None,
        input_size: Optional[int] = None,
    ) -> str:
        """
        Selects the optimal model for the given request type, complexity, and payload size.
        """
        model = self._routes.get(request_type, self.default_model)

        # Quality-aware policy hook: High-complexity tasks preserve top-tier models
        if complexity and complexity.lower() in ("hard", "expert", "high") and "flash" in model:
            # Can conditionally route to pro if configured
            pro_override = os.getenv("AI_MODEL_HIGH_COMPLEXITY")
            if pro_override:
                return pro_override

        return model

    def register_route(self, request_type: str, model_name: str) -> None:
        """Dynamically updates the model route for a specific request type."""
        self._routes[request_type] = model_name
        logger.info(f"Updated AI model route: {request_type} -> {model_name}")

    def get_routing_policy(self) -> Dict[str, str]:
        """Returns the active model routing configuration."""
        return dict(self._routes)


# Central singleton instance
model_router = AIModelRouter()
