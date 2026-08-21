"""
backend/services/ai/gemini_service.py
=====================================
Central AI Service for Google Gemini with Ollama fallback,
model routing, real token tracking, pricing versioning & reproducibility,
request-specific output limits, latency breakdown, and schema validation.
"""
import os
import json
import time
import logging
from dataclasses import dataclass
from typing import Any, Callable, Dict, Generator, Optional, Tuple
try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None
    genai_types = None
try:
    import ollama
except ImportError:
    ollama = None
from config import Config
from .exceptions import (
    AIServiceError,
    AITimeoutError,
    AIRateLimitError,
    AIValidationError,
    AIProviderUnavailableError,
)
from .pricing import (
    calculate_token_cost,
    get_model_pricing_metadata,
    get_max_output_tokens,
    get_prompt_version,
)
from .router import model_router

logger = logging.getLogger(__name__)

# Configurable limits and retries
MAX_AI_RETRIES = int(os.getenv("MAX_AI_RETRIES", "2"))
RETRY_BASE_DELAY = 1.0  # seconds


@dataclass
class TokenUsage:
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    total_tokens: Optional[int] = None
    input_cost: float = 0.0
    output_cost: float = 0.0
    estimated_cost: float = 0.0
    pricing_version: str = "google_gemini_2026_01"
    pricing_effective_date: str = "2026-01-01"
    input_price_per_million: float = 0.10
    output_price_per_million: float = 0.40


@dataclass
class AIResult:
    data: Any
    usage: TokenUsage
    latency_ms: int
    provider_latency_ms: int
    retry_delay_ms: int
    retry_count: int
    model_used: str
    prompt_version: str = "v1"
    provider: str = "gemini"
    status: str = "success"
    cache_hit: bool = False
    validation_failed: bool = False
    truncation_detected: bool = False


class GeminiService:
    def __init__(self):
        self.provider = os.getenv("AI_PROVIDER", "gemini").lower()
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.gemini_client: Optional[genai.Client] = None
        
        if self.gemini_key and genai is not None:
            try:
                self.gemini_client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}")

        self.ollama_client = ollama.Client(host=Config.OLLAMA_HOST, timeout=3.0) if ollama else None
        self.ollama_model = Config.OLLAMA_MODEL

    def _clean_json_response(self, content: str) -> Tuple[Any, bool]:
        """
        Extracts and parses JSON from markdown code blocks or text.
        Returns tuple of (parsed_json, truncation_detected).
        """
        if not content:
            return None, False
        clean = content.strip()
        truncation = not clean.endswith(("}", "]"))
        try:
            if "```json" in clean:
                clean = clean.split("```json", 1)[1].split("```", 1)[0].strip()
            elif "```" in clean:
                clean = clean.split("```", 1)[1].split("```", 1)[0].strip()

            # Find outer brackets
            first_brace = clean.find("{")
            first_bracket = clean.find("[")
            last_brace = clean.rfind("}")
            last_bracket = clean.rfind("]")

            if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
                json_str = clean[first_brace:last_brace + 1]
                return json.loads(json_str), truncation
            elif first_bracket != -1:
                json_str = clean[first_bracket:last_bracket + 1]
                return json.loads(json_str), truncation

            return json.loads(clean), truncation
        except Exception as e:
            logger.warning(f"JSON extract failed: {e} | Raw string: {clean[:150]}")
            return None, truncation

    def execute_structured_request(
        self,
        prompt: str,
        request_type: str,
        validator: Callable[[Any], Any],
        model: Optional[str] = None,
        complexity: Optional[str] = None,
        system_instruction: Optional[str] = None,
    ) -> AIResult:
        """
        Executes an AI request with request-specific token ceilings,
        model routing, pricing metadata capture, latency breakdown,
        controlled retries, and strict schema validation.
        """
        selected_model = model or model_router.select_model(request_type, complexity=complexity)
        max_tokens = get_max_output_tokens(request_type)
        prompt_ver = get_prompt_version(request_type)
        retries = 0
        total_retry_delay_ms = 0
        validation_failed_flag = False
        start_time = time.perf_counter()

        while retries <= MAX_AI_RETRIES:
            try:
                logger.info(
                    f"AI request started: type={request_type}, model={selected_model}, max_output_tokens={max_tokens}, ver={prompt_ver}, attempt={retries + 1}"
                )
                t_prov_start = time.perf_counter()
                raw_text, token_usage, actual_model, active_provider = self._call_provider(
                    prompt=prompt,
                    model=selected_model,
                    max_output_tokens=max_tokens,
                    system_instruction=system_instruction,
                )
                prov_latency_ms = int((time.perf_counter() - t_prov_start) * 1000)

                parsed_json, truncation_detected = self._clean_json_response(raw_text)
                if parsed_json is None:
                    validation_failed_flag = True
                    if truncation_detected:
                        logger.warning(f"Output truncated for {request_type} at {len(raw_text)} chars (hit token ceiling)")
                    raise AIValidationError(f"Could not parse valid JSON from AI response for {request_type}")

                # Validate against strict schema
                validated_data = validator(parsed_json)

                latency_ms = int((time.perf_counter() - start_time) * 1000)
                logger.info(
                    f"AI request completed: type={request_type}, tokens={token_usage.total_tokens}, cost=${token_usage.estimated_cost:.6f}, total_latency={latency_ms}ms, provider_latency={prov_latency_ms}ms, retries={retries}"
                )

                return AIResult(
                    data=validated_data,
                    usage=token_usage,
                    latency_ms=latency_ms,
                    provider_latency_ms=prov_latency_ms,
                    retry_delay_ms=total_retry_delay_ms,
                    retry_count=retries,
                    model_used=actual_model,
                    prompt_version=prompt_ver,
                    provider=active_provider,
                    status="success",
                    cache_hit=False,
                    validation_failed=validation_failed_flag,
                    truncation_detected=truncation_detected,
                )

            except (AITimeoutError, AIRateLimitError) as err:
                retries += 1
                if retries > MAX_AI_RETRIES:
                    latency_ms = int((time.perf_counter() - start_time) * 1000)
                    logger.error(f"AI request failed after {retries} retries: {err}")
                    raise AIServiceError(f"AI service failed for {request_type}: {str(err)}", is_transient=True)
                delay = RETRY_BASE_DELAY * (2 ** (retries - 1))
                total_retry_delay_ms += int(delay * 1000)
                logger.warning(f"Transient AI failure: {err}. Retrying in {delay}s...")
                time.sleep(delay)

            except AIProviderUnavailableError as prov_err:
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                logger.warning(f"AI provider unavailable: {prov_err}. Failing fast for fallback handler.")
                raise AIServiceError(f"AI provider unavailable for {request_type}: {str(prov_err)}", is_transient=False)

            except AIValidationError as val_err:
                validation_failed_flag = True
                retries += 1
                if retries > MAX_AI_RETRIES:
                    latency_ms = int((time.perf_counter() - start_time) * 1000)
                    logger.error(f"AI schema validation failed after {retries} retries: {val_err}")
                    raise val_err
                total_retry_delay_ms += 1000
                logger.warning(f"AI output schema invalid, retrying: {val_err}")
                time.sleep(1.0)

            except Exception as e:
                latency_ms = int((time.perf_counter() - start_time) * 1000)
                logger.error(f"Non-transient AI exception: {e}")
                raise AIServiceError(f"Unexpected AI error in {request_type}: {str(e)}", is_transient=False)

        raise AIServiceError(f"Max retries exceeded for {request_type}", is_transient=True)

    def _call_provider(
        self,
        prompt: str,
        model: str,
        max_output_tokens: int = 512,
        system_instruction: Optional[str] = None,
    ) -> Tuple[str, TokenUsage, str, str]:
        """Calls Gemini if available with output token limits, or falls back to Ollama."""
        # 1. Try Gemini
        if self.gemini_client:
            try:
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                
                config_kwargs = {}
                if genai_types and hasattr(genai_types, "GenerateContentConfig"):
                    config_kwargs["config"] = genai_types.GenerateContentConfig(
                        max_output_tokens=max_output_tokens,
                        temperature=0.2,
                        response_mime_type="application/json",
                    )

                response = self.gemini_client.models.generate_content(
                    model=model,
                    contents=full_prompt,
                    **config_kwargs,
                )
                
                # Extract real token usage from response.usage_metadata
                pricing_meta = get_model_pricing_metadata(model)
                usage = TokenUsage(
                    pricing_version=pricing_meta.get("pricing_version", "google_gemini_2026_01"),
                    pricing_effective_date=pricing_meta.get("effective_date", "2026-01-01"),
                    input_price_per_million=float(pricing_meta.get("input_per_million", 0.10)),
                    output_price_per_million=float(pricing_meta.get("output_per_million", 0.40)),
                )
                if hasattr(response, "usage_metadata") and response.usage_metadata:
                    meta = response.usage_metadata
                    usage.input_tokens = getattr(meta, "prompt_token_count", None)
                    usage.output_tokens = getattr(meta, "candidates_token_count", None)
                    usage.total_tokens = getattr(meta, "total_token_count", None)

                # Compute real cost with pricing metadata
                in_cost, out_cost, tot_cost = calculate_token_cost(
                    model_name=model,
                    input_tokens=usage.input_tokens,
                    output_tokens=usage.output_tokens,
                    custom_pricing=pricing_meta,
                )
                usage.input_cost = in_cost
                usage.output_cost = out_cost
                usage.estimated_cost = tot_cost

                return response.text, usage, model, "gemini"

            except Exception as e:
                err_msg = str(e).lower()
                if "429" in err_msg or "quota" in err_msg or "rate limit" in err_msg:
                    raise AIRateLimitError(f"Gemini rate limit: {e}")
                if "timeout" in err_msg or "timed out" in err_msg:
                    raise AITimeoutError(f"Gemini timeout: {e}")
                if "api_key_invalid" in err_msg or "api key not valid" in err_msg or "permission_denied" in err_msg:
                    logger.warning(f"Gemini permanent auth failure: {e}. Falling back immediately without retry.")
                    return self._call_ollama_fallback(prompt, max_output_tokens, system_instruction)

                logger.warning(f"Gemini error: {e}. Falling back to Ollama.")

        # 2. Fallback to Ollama
        return self._call_ollama_fallback(prompt, max_output_tokens, system_instruction)

    def _call_ollama_fallback(
        self,
        prompt: str,
        max_output_tokens: int = 512,
        system_instruction: Optional[str] = None,
    ) -> Tuple[str, TokenUsage, str, str]:
        """Calls Ollama or raises AIProviderUnavailableError if offline."""
        if self.ollama_client:
            try:
                messages = []
                if system_instruction:
                    messages.append({"role": "system", "content": system_instruction})
                messages.append({"role": "user", "content": prompt + "\n\nIMPORTANT: Return ONLY valid JSON."})

                res = self.ollama_client.chat(
                    model=self.ollama_model,
                    messages=messages,
                    options={"temperature": 0.2, "num_ctx": max(1024, max_output_tokens * 2)},
                )
                raw_text = res["message"]["content"]
                in_tok = res.get("prompt_eval_count")
                out_tok = res.get("eval_count")
                tot_tok = (in_tok or 0) + (out_tok or 0) or None

                pricing_meta = get_model_pricing_metadata("ollama")
                in_cost, out_cost, tot_cost = calculate_token_cost(
                    model_name="ollama",
                    input_tokens=in_tok,
                    output_tokens=out_tok,
                    custom_pricing=pricing_meta,
                )

                usage = TokenUsage(
                    input_tokens=in_tok,
                    output_tokens=out_tok,
                    total_tokens=tot_tok,
                    input_cost=in_cost,
                    output_cost=out_cost,
                    estimated_cost=tot_cost,
                    pricing_version=pricing_meta.get("pricing_version", "ollama_local_v1"),
                    pricing_effective_date=pricing_meta.get("effective_date", "2026-01-01"),
                    input_price_per_million=0.0,
                    output_price_per_million=0.0,
                )
                return raw_text, usage, f"ollama/{self.ollama_model}", "ollama"
            except Exception as e:
                logger.warning(f"Ollama local connection failed: {e}")

        raise AIProviderUnavailableError("No active AI provider (Gemini or Ollama) reachable.")

    def stream_response(self, prompt: str, system_instruction: Optional[str] = None) -> Generator[str, None, None]:
        """Streams AI responses in real-time for live WebSocket interview sessions."""
        if self.gemini_client:
            try:
                full_prompt = f"{system_instruction}\n\n{prompt}" if system_instruction else prompt
                response_stream = self.gemini_client.models.generate_content_stream(
                    model=model_router.select_model("ANSWER_EVALUATION"),
                    contents=full_prompt,
                )
                for chunk in response_stream:
                    if chunk.text:
                        yield chunk.text
                return
            except Exception as e:
                logger.warning(f"Gemini streaming failed: {e}. Falling back to Ollama stream.")

        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            stream = self.ollama_client.chat(
                model=self.ollama_model,
                messages=messages,
                stream=True,
            )
            for chunk in stream:
                yield chunk["message"]["content"]
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield "I encountered a momentary processing delay. Could you please elaborate on that?"


# Central singleton instance
gemini_service = GeminiService()
