"""
utils/ai_provider.py — Backward-compatibility bridge to services.ai
"""
from services.ai import gemini_service

# Expose singleton
ai_service = gemini_service
