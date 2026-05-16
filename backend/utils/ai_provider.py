import os
import json
import logging
from google import genai
import ollama
from config import Config

logger = logging.getLogger(__name__)

class AIProvider:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "ollama").lower()
        
        # Setup Gemini
        self.gemini_client = None
        gemini_key = os.getenv("GEMINI_API_KEY")
        if gemini_key:
            try:
                self.gemini_client = genai.Client(api_key=gemini_key)
            except Exception as e:
                logger.warning(f"Gemini client init failed: {e}")

        # Setup Ollama
        self.ollama_client = ollama.Client(host=Config.OLLAMA_HOST)
        self.ollama_model = Config.OLLAMA_MODEL

    def _clean_json_response(self, content):
        """Extracts and parses JSON from a string that might contain markdown or other text."""
        if not content:
            return None
        try:
            # Handle markdown blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            
            start = content.find("{")
            end = content.rfind("}")
            if start != -1 and end != -1:
                json_str = content[start:end+1]
                return json.loads(json_str)
            return None
        except Exception as e:
            logger.error(f"JSON Parsing Error: {e} | Content: {content[:100]}")
            return None

    def ask(self, prompt, system_instruction=None):
        """Unified method to get a response from the configured AI provider."""
        if self.provider == "gemini" and self.gemini_client:
            try:
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                response = self.gemini_client.models.generate_content(
                    model=Config.GEMINI_MODEL,
                    contents=full_prompt
                )
                return response.text
            except Exception as e:
                logger.error(f"Gemini Error: {e}. Falling back to Ollama.")
                return self._ask_ollama(prompt, system_instruction)
        else:
            return self._ask_ollama(prompt, system_instruction)

    def _ask_ollama(self, prompt, system_instruction=None):
        """Sends request to local Ollama instance."""
        try:
            options = {
                "temperature": 0.3, # Lower temperature for more consistent JSON
                "num_ctx": 4096
            }
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            response = self.ollama_client.chat(
                model=self.ollama_model, 
                messages=messages,
                options=options
            )
            return response["message"]["content"]
        except Exception as e:
            logger.error(f"Ollama Error: {e}")
            return None

    def ask_json(self, prompt, system_instruction=None):
        """Gets a response and ensures it's valid JSON."""
        # Inject JSON instruction for Ollama if not present
        if self.provider == "ollama" and "JSON" not in prompt:
            prompt += "\n\nIMPORTANT: Return ONLY valid JSON."
            
        content = self.ask(prompt, system_instruction)
        if content:
            return self._clean_json_response(content)
        return None


# Singleton instance
ai_service = AIProvider()
