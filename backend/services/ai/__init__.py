"""
backend/services/ai/__init__.py
===============================
Central AI Services Package for PrepAI
"""
from .gemini_service import gemini_service, AIResult, TokenUsage
from .orchestrator import (
    orchestrator,
    record_ai_usage,
    calculate_interview_scores,
    get_interview_ai_summary,
    get_admin_ai_metrics,
)
from .router import model_router, AIModelRouter
from .pricing import (
    calculate_token_cost,
    get_model_pricing,
    get_model_pricing_metadata,
    get_max_output_tokens,
    get_prompt_version,
    AI_MODEL_PRICING,
    DEFAULT_MODEL_PRICING,
    MAX_OUTPUT_TOKENS,
    PROMPT_VERSIONS,
)
from .exceptions import (
    AIServiceError,
    AITimeoutError,
    AIRateLimitError,
    AIValidationError,
    AIProviderUnavailableError,
)
from .prompts import (
    build_question_generation_prompt,
    build_answer_evaluation_prompt,
    build_final_report_prompt,
    build_coding_evaluation_prompt,
    build_resume_analysis_prompt,
)
from .schemas import (
    validate_questions_output,
    validate_answer_evaluation,
    validate_final_report,
    validate_coding_evaluation,
    validate_resume_analysis,
)

__all__ = [
    "gemini_service",
    "orchestrator",
    "record_ai_usage",
    "calculate_interview_scores",
    "get_interview_ai_summary",
    "get_admin_ai_metrics",
    "calculate_token_cost",
    "get_model_pricing",
    "get_max_output_tokens",
    "get_prompt_version",
    "AI_MODEL_PRICING",
    "MAX_OUTPUT_TOKENS",
    "PROMPT_VERSIONS",
    "AIServiceError",
    "AITimeoutError",
    "AIRateLimitError",
    "AIValidationError",
    "AIProviderUnavailableError",
    "build_question_generation_prompt",
    "build_answer_evaluation_prompt",
    "build_final_report_prompt",
    "build_coding_evaluation_prompt",
    "build_resume_analysis_prompt",
    "validate_questions_output",
    "validate_answer_evaluation",
    "validate_final_report",
    "validate_coding_evaluation",
    "validate_resume_analysis",
]
