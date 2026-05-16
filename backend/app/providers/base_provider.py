from abc import ABC, abstractmethod

class BaseAIProvider(ABC):
    @abstractmethod
    def ask(self, prompt: str, system_instruction: str = None, stream: bool = False):
        """Standard text completion."""
        pass

    @abstractmethod
    def ask_json(self, prompt: str, system_instruction: str = None):
        """Structured output (JSON)."""
        pass

    @abstractmethod
    def ask_stream(self, prompt: str, system_instruction: str = None):
        """Generator for streaming responses."""
        pass
