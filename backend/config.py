import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY    = os.getenv("SECRET_KEY", "prepai_local_dev_secret_key_2026_minimum_32_bytes_long")
    DATABASE_URL  = os.getenv("DATABASE_URL")          # Neon PostgreSQL connection string
    OLLAMA_HOST   = os.getenv("OLLAMA_HOST",  "http://127.0.0.1:11434")
    OLLAMA_MODEL  = os.getenv("OLLAMA_MODEL", "llama3:8b")
    GEMINI_MODEL            = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
    GEMINI_QUESTION_MODEL   = os.getenv("GEMINI_QUESTION_MODEL", os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    GEMINI_EVALUATION_MODEL = os.getenv("GEMINI_EVALUATION_MODEL", os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    GEMINI_REPORT_MODEL     = os.getenv("GEMINI_REPORT_MODEL", os.getenv("GEMINI_MODEL", "gemini-2.0-flash"))
    MAX_AI_RETRIES          = int(os.getenv("MAX_AI_RETRIES", "2"))
    MAX_INTERVIEW_QUESTIONS = int(os.getenv("MAX_INTERVIEW_QUESTIONS", "10"))
    MAX_REPORT_GENERATIONS  = int(os.getenv("MAX_REPORT_GENERATIONS", "1"))

    # Email & Authentication Policy
    EMAIL_VERIFICATION_ENABLED = os.getenv("EMAIL_VERIFICATION_ENABLED", "False").lower() in ("true", "1", "t")
    MAIL_SERVER   = os.getenv("MAIL_SERVER",   "smtp.gmail.com")
    MAIL_PORT     = int(os.getenv("MAIL_PORT", 587))
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_USE_TLS  = os.getenv("MAIL_USE_TLS", "True").lower() in ("true", "1", "t")
    FRONTEND_URL  = os.getenv("FRONTEND_URL",  "http://localhost:5173")

