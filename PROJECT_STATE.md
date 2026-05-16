# Prep AI | Project Status Report
**Date**: April 14, 2026  
**Status**: Optimized & Cleaned

## 1. Project Overview
Prep AI is a professional, minimalist technical interview preparation platform designed for modern engineers. It leverages local and cloud-based AI to simulate high-fidelity interview environments, provide real-time feedback on coding challenges, and optimize resumes for ATS (Applicant Tracking Systems).

---

## 2. Core Architecture
The project is structured as a consolidated monorepo with an orchestrator at the root level.

- **Frontend**: Located in `/frontend`. A React 18 + Vite application using a specialized "Executive Light" UI aesthetic.
- **Backend**: Located in `/backend`. A Flask-based REST API that communicates with MongoDB and AI providers.
- **ML / Training**: Specialized modules for behavioral analysis (eye tracking, posture) and dataset management.

---

## 3. Key Functional Modules
### 🎙️ Mock Interview Engine
A 5-stage AI simulation that generates role-specific interview questions based on user experience and focus areas.
- **Unified Provider**: Uses `AIProvider` to switch between Ollama (Local) and Gemini (Cloud).
- **Feedback Loop**: Analyzes candidate responses for clarity, confidence, and technical accuracy.

### 📝 Resume Intelligence (ATS)
Upload and analyze resumes against specific job descriptions.
- **Parsing**: Uses PyMuPDF for high-accuracy text extraction.
- **Optimization**: AI-driven suggestions for missing keywords, strengths, and weaknesses.

### 💻 Coding Dojo
A "HackerRank-style" environment for practicing data structures and algorithms.
- **Editor**: Integrated Monaco Editor (VS Code core) for a premium coding experience.
- **AI Reviewer**: Evaluates code logic, time complexity, and quality without requiring local execution.

---

## 4. Technical Stack
### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Custom Variable Design System)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Services**: Axios (with centralized interceptors for Auth)

### Backend
- **Framework**: Flask
- **Database**: MongoDB
- **AI Logic**: Ollama (primary local client), Google GenAI SDK (Alpha/Beta)
- **PDF Processing**: PyMuPDF (fitz)
- **Environment**: Python 3.x (with `.venv` support)

---

## 5. Current Directory Structure
```text
Prep_AI/
├── frontend/               # React application
│   ├── src/                # Components, Pages, Services
│   ├── public/             # Static assets
│   └── .env                # Frontend environment config
├── backend/                # Flask API
│   ├── routes/             # Blueprint-based route handlers
│   ├── utils/              # AI providers, parsers, helpers
│   └── .env                # Backend environment config
├── ml/                     # behavior analysis & CV modules
├── scripts/                # Utility scripts (Ollama/Env setup)
├── training/               # Dataset & training artifacts
├── package.json            # Root orchestrator (Concurrent runner)
└── PROJECT_STATE.md        # This file
```

---

## 6. AI Provider Strategy (Recent Updates)
The project has been refactored to use a **Unified AI Provider System**:
- **Ollama Consistency**: Optimized for local models (`llama3:8b`). Features robust JSON extraction that handles conversational filler and markdown blocks common in local LLM outputs.
- **Default AI**: Explicitly set to `ollama` in the backend environment.
- **Resilience**: Every critical route calls `ai_service` which handles error catching and fallback logic internally.

---

## 7. Operational Commands
- **Install All**: `npm run install-all` (Root level)
- **Start Dev Stack**: `npm run dev` (Root level - launches both Frontend & Backend)
- **Backend Direct**: `python backend/app.py`
- **Frontend Direct**: `npm run dev --prefix frontend`
