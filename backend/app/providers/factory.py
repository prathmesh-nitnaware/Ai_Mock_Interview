import os
from .ollama_provider import OllamaProvider

class AIFactory:
    _instance = None
    _provider = None

    @classmethod
    def get_provider(cls):
        if cls._instance is None:
            provider_type = os.getenv("AI_PROVIDER", "ollama").lower()
            if provider_type == "ollama":
                cls._instance = OllamaProvider()
            # Add GeminiProvider / OpenAIProvider here later
            else:
                cls._instance = OllamaProvider() # Fallback
        return cls._instance

ai_service = AIFactory.get_provider()
