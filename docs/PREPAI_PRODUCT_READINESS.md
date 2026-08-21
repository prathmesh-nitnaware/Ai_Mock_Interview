# PrepAI — Product Readiness, Architecture & Live Demo Guide

## 1. Executive Summary & Product Architecture
**PrepAI** is an AI-powered, realistic job interview simulator designed to replicate an authentic technical and behavioral interview conducted by a Principal Engineer/Engineering Director.

### Core Architectural Stack:
- **Frontend**: React 18 + Vite (Vanilla CSS design system, Lucide icons, responsive layout).
- **Backend API**: Python 3.12 / Flask with Neon PostgreSQL persistent storage.
- **AI Core**: Centralized Gemini AI service with fast failover to local Ollama (`3.0s` timeout) and deterministic heuristic evaluation fallback.
- **Client-side Computer Vision**: FaceAPI running in-browser (5 FPS) for face framing, gaze stability, posture stability, and observation coverage.
- **Client-side Speech Analytics**: Web Audio API volume/silence monitoring, Web Speech API speech-to-text, deterministic WPM (calculated on speaking duration), and word-boundary filler matching.

```text
[Candidate Browser]
  ├── Webcam Stream  ──> [FaceAPI Detector]  ──> [Observable Camera Metrics] (Client-side)
  ├── Mic Stream     ──> [Web Audio Engine]  ──> [WPM & Filler Metrics]    (Client-side)
  └── Text/Voice Ans ──> [API /submit]
                             │
                             ▼
                    [Flask Backend]
                             │
                             ├──> [Neon PostgreSQL: Row Locking & State]
                             ├──> [Gemini AI Service / Ollama Fallback]
                             └──> [Deterministic 85/15 Scoring Engine]
```

---

## 2. The 5-Stage Adaptive Interview Lifecycle

PrepAI advances candidates through a 5-stage interview progression:

1. **Stage 1: Fundamentals (`fundamentals`)** — Verifies core domain principles, language/database mechanics, and theoretical foundations.
2. **Stage 2: Applied Architecture (`applied`)** — Investigates real-world implementation, framework usage, and claimed resume skills.
3. **Stage 3: Deep Technical Reasoning (`deep_technical`)** — Explores concurrency, memory models, race conditions, and architectural trade-offs.
4. **Stage 4: Practical Scenario / System Design (`system_design`)** — Tests distributed scalability, failure modes, partitioning, and disaster recovery.
5. **Stage 5: Behavioral & Leadership (`behavioral`)** — Assesses cross-functional collaboration, critical incident ownership, and conflict resolution via the **STAR method** (Situation, Task, Action, Result).

---

## 3. Authoritative Scoring & Explainability Engine

### Score Separation Rule:
- **Content / Job Performance (85% Weight)**: Evaluated purely on technical accuracy, explanation depth (Level 1–5), trade-offs analyzed, and problem-solving reasoning.
- **Delivery / Communication Coaching (15% Weight)**: Evaluated on speaking pace (WPM), filler density, face framing, gaze stability, and posture.
- **Hardware Fault Tolerance**: If webcam or microphone is unavailable, `overall_score = content_score`. Missing hardware is never scored as a 0 penalty.

### Grounded Readiness Levels:
- **Score $\ge$ 85% & Depth $\ge$ 4**: `"Strong Technical Performance — Advanced Architectural Depth"`
- **Score 75% – 84%**: `"Interview Ready for Target Role — Solid Conceptual Foundation"`
- **Score 60% – 74%**: `"Developing — Recommended Additional Preparation on Core Systems"`
- **Score < 60%**: `"Needs Significant Preparation on Core Technical Competencies"`

---

## 4. Multimodal Telemetry Rules & Observable Taxonomy

1. **Strictly Non-Psychological**:
   - Telemetry reports only observable physical and vocal behavior.
   - Forbidden terms: "nervous", "lying", "dishonest", "confident", "insecure", "distracted", "emotional".
   - Approved terms: "sustained gaze deviation", "normal pause", "short pause", "extended silence (>3.5s)", "stable face framing".
2. **Local Processing**: Raw video frames and audio buffers are processed entirely client-side; no raw media is transmitted or stored on backend servers.

---

## 5. Security & Prompt Injection Defenses
- **Untrusted Input Isolation**: All candidate-provided answers and resumes are wrapped in strict delimiters (`<<<UNTRUSTED_CANDIDATE_ANSWER>>>` and `<<<UNTRUSTED_RESUME_DATA>>>`).
- **Evaluator Defense**: Evaluator prompt instructions explicitly forbid user input from overriding evaluation criteria or assigning artificial scores. Attempts to inject instructions are penalized with 0 accuracy and flagged under technical errors.

---

## 6. College Live Presentation & Demo Checklist

Before presenting a live demonstration:

| Checkpoint | Action | Expected Status |
| :--- | :--- | :--- |
| **1. Database Connection** | Verify Neon PostgreSQL connection pool | Pool initialized and schema ready |
| **2. Browser Permissions** | Allow Camera and Microphone access in Chrome | Video preview active, Face framing status green |
| **3. Offline AI Fallback** | If internet drops, system falls back cleanly | Deterministic role questions & evaluations generate without crashing |
| **4. Speech Recognition** | Speak clearly into microphone or use typed input | Transcript populates live with WPM and filler count |
| **5. Interview Progression** | Complete 5 questions across all 5 stages | Report page renders 100% complete with PDF download option |
| **6. Resource Cleanup** | Navigate to Dashboard after interview | Webcam indicator turns off; AudioContext is disposed |

---

## 7. Known Limitations & Future Roadmap
- **Browser Speech Recognition**: Web Speech API requires Chrome/Edge for native voice transcription. Firefox users can use typed text input with full audio volume/pause analytics.
- **Model Quantization**: Client-side face detection uses TinyFaceDetector (`models/` folder) for minimal CPU footprint (under 3% CPU usage on modern laptops).
