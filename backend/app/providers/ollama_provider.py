import json
import logging
import ollama
from .base_provider import BaseAIProvider
from config import Config

logger = logging.getLogger(__name__)

class OllamaProvider(BaseAIProvider):
    def __init__(self):
        self.client = ollama.Client(host=Config.OLLAMA_HOST)
        self.model = Config.OLLAMA_MODEL

    def _clean_json(self, content):
        if not content: return None
        try:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            start, end = content.find("{"), content.rfind("}")
            if start != -1 and end != -1:
                return json.loads(content[start:end+1])
            return None
        except Exception as e:
            logger.error(f"JSON Parse Error: {e}")
            return None

    def ask(self, prompt, system_instruction=None, stream=False):
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        try:
            response = self.client.chat(model=self.model, messages=messages, stream=stream)
            if stream: return response
            return response["message"]["content"]
        except Exception as e:
            logger.error(f"Ollama Error: {e}")
            return None

    def ask_json(self, prompt, system_instruction=None):
        if "JSON" not in prompt:
            prompt += "\n\nIMPORTANT: Return ONLY valid JSON."
        content = self.ask(prompt, system_instruction)
        return self._clean_json(content)

    def ask_stream(self, prompt, system_instruction=None):
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        for chunk in self.client.chat(model=self.model, messages=messages, stream=True):
            yield chunk['message']['content']
