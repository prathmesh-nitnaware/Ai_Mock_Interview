"""
backend/services/ai/exceptions.py
=================================
Custom exception hierarchy for AI operations in PrepAI.
"""

class AIServiceError(Exception):
    """Base exception for all AI service errors."""
    def __init__(self, message: str, is_transient: bool = False):
        super().__init__(message)
        self.is_transient = is_transient


class AITimeoutError(AIServiceError):
    """Raised when an AI provider times out."""
    def __init__(self, message: str = "AI request timed out"):
        super().__init__(message, is_transient=True)


class AIRateLimitError(AIServiceError):
    """Raised when an AI provider throttles or returns 429 rate limit."""
    def __init__(self, message: str = "AI rate limit exceeded"):
        super().__init__(message, is_transient=True)


class AIValidationError(AIServiceError):
    """Raised when AI output fails schema validation."""
    def __init__(self, message: str = "AI response failed schema validation"):
        super().__init__(message, is_transient=False)


class AIProviderUnavailableError(AIServiceError):
    """Raised when no AI provider (Gemini or Ollama) is reachable."""
    def __init__(self, message: str = "No AI provider available"):
        super().__init__(message, is_transient=True)
