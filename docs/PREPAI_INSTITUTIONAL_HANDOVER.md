# PrepAI — Institutional Handover & System Administration Manual

---

## 1. Product Purpose & Institutional Role
**PrepAI** is an institutional-grade, AI-powered mock interview simulator engineered specifically for college placement cells and engineering departments. It prepares students for real-world software engineering, backend, frontend, and ML/AI placement interviews through live, multimodal verbal/video simulation, adaptive difficulty escalation, knowledge gap diagnosis, trade-off reasoning evaluation, and evidence-backed performance audits.

---

## 2. Intended Users & Access Tiers
1. **Students / Candidates**:
   - Independent self-service account registration with college email address.
   - Resume context upload and target role selection.
   - Live 5-stage adaptive technical and behavioral mock interview sessions.
   - Private, permanent access to generated performance audits and PDF downloads.
2. **College Faculty / Placement Administrators**:
   - Platform administration, AI quota and cost monitoring, database health verification.

---

## 3. End-to-End Student Lifecycle
```text
[Direct Account Registration (Any Valid Email)]
        │
        ▼
[Immediate Login & Profile/Resume Setup]
        │
        ▼
[Role Selection & 5-Stage Strategy Generation]
        │
        ▼
[4-Point Hardware Pre-Check (Non-Blocking)]
        │
        ▼
[Live Adaptive Interview Studio (Q1 -> Q5)]
        │
        ▼
[Deterministic 85/15 Scoring & Report Generation]
        │
        ▼
[Persistent Storage in Neon PostgreSQL & PDF Export]
```

> [!NOTE]
> **Authentication Policy**: Email verification is currently disabled to simplify deployment and avoid dependency on external email delivery services. PrepAI remains general-purpose and accepts any valid email domain. The institution can implement domain-specific authentication, SSO, or email verification policies after handover.

---

## 4. System Architecture

```text
[ React 18 / Vite Frontend ]
   ├── In-Browser Computer Vision (TinyFaceDetector via FaceAPI @ 5 FPS)
   ├── In-Browser Audio Engine (Web Audio API Volume & Pause Tracking)
   ├── Speech-to-Text & Typed Fallback Interface
   └── Responsive Report & Audio Visualizer Components
             │
             ▼ HTTPS / JWT Authorization (Bearer Header)
[ Flask / Python 3.12 Backend API ]
   ├── Centralized AI Gateway (Gemini API with Fast Failover to Ollama / Heuristics)
   ├── Adaptive Interview Orchestrator (Intent Tracking & Anti-Looping Guards)
   ├── Mathematical Scoring Engine (85% Content / 15% Delivery Isolation)
   └── Resilient Database Layer (Neon Serverless PostgreSQL with Liveness Auto-Ping)
```

---

## 5. AI Interview Engine & Provider Redundancy
- **Primary AI Provider**: Google Gemini API via Centralized Gateway (`gemini_service.py`).
- **Failover Provider**: Local Ollama instance (3.0s timeout per attempt).
- **Deterministic Heuristic Fallback**: If internet connectivity is interrupted, the backend immediately activates role-specific deterministic technical question banks and qualitative evaluations without crashing the student's interview.

---

## 6. Adaptive Questioning & 5-Stage Progression
1. **Stage 1: Core Fundamentals (`fundamentals`)** — Verifies internal mechanics and core engineering principles.
2. **Stage 2: Applied Architecture (`applied`)** — Investigates practical implementation and targets claimed resume skills.
3. **Stage 3: Deep Technical Reasoning (`deep_technical`)** — Evaluates concurrency, scale, and performance limits.
4. **Stage 4: Practical Scenario / System Design (`system_design`)** — Tests distributed reliability, partition tolerance, and failure modes.
5. **Stage 5: Behavioral & Leadership (`behavioral`)** — Assesses cross-functional collaboration and incident ownership via the STAR method.

**Anti-Looping Protection**: Maximum of 2 consecutive diagnostic probes on a single topic before advancing competency stages.

---

## 7. Client-Side Camera Analytics Engine
- **Processing**: 100% in-browser face detection using `@vladmandic/face-api` (5 FPS, <3% CPU utilization).
- **Privacy Guarantee**: Zero video frames are transmitted to servers or stored on disk.
- **Signals**: Face framing ratio, sustained gaze deviation (>800ms threshold), and posture stability.
- **Taxonomy**: Strictly non-psychological. No claims of "nervousness", "lying", or "dishonesty".

---

## 8. Client-Side Voice Analytics Engine
- **WPM Metric**: Calculated exclusively on active speech duration (excluding pauses).
- **Word-Boundary Filler Detection**: Regex-based detection (`\bum\b`, `\blike\b`, `\byou know\b`).
- **Observable Pauses**: Categorized into "short pause", "normal pause", and "extended silence (>3.5s)".
- **Typed Fallback**: Complete support for typed answers if microphone is unavailable.

---

## 9. Deterministic Scoring Model
$$\text{Overall Score} = (0.85 \times \text{Content Score}) + (0.15 \times \text{Delivery Score})$$
- **Hardware Offline Isolation**: Missing or denied webcam/mic sets `camera_available: false` / `voice_available: false` and computes $\text{Overall Score} = \text{Content Score}$ with zero penalty.
- **Substance Over Length**: A concise 30-word response with correct trade-offs achieves Level 4–5 depth; a 150-word answer of superficial buzzwords is restricted to Level 1–2.

---

## 10. Resume Validation Engine
- Claims extracted from resume text are actively injected into applied scenarios.
- Demonstrated competencies transition to `validated_skills`.
- Unsubstantiated claims are highlighted under `skills_requiring_validation` with targeted revision topics.

---

## 11. Security, Authorization & Multi-User Isolation
- **Strict Server-Side Ownership**: Every database query on interviews, reports, answers, and resumes is scoped by `WHERE user_id = current_user['id']`.
- **IDOR / BOLA Prevention**: Student A cannot read, submit answers to, advance, or delete Student B's interview sessions.
- **Prompt Injection Defense**: Untrusted candidate answers and resumes are wrapped in explicit boundary delimiters with strict evaluator defense instructions.
- **JWT Purpose Isolation**: Verification tokens are rejected for API authentication.

---

## 12. Data Storage & Privacy Audit
| Data Item | Storage Location | Data Format | Retention Policy |
| :--- | :--- | :--- | :--- |
| **User Account & Passwords** | Neon PostgreSQL (`users`) | Argon2 / bcrypt hash | Permanent until user deletion |
| **Resume Text** | Neon PostgreSQL (`users.resume_text`) | Plain text (Parsed) | User editable |
| **Interview Questions & Answers**| Neon PostgreSQL (`interviews`) | JSON structured records | Permanent historical record |
| **Video Frames** | None | Ephemeral in-memory | **Zero video frames stored** |
| **Microphone Audio** | None | Web Audio in-memory | **Zero audio recorded or stored** |
| **AI Telemetry & Costs** | Neon PostgreSQL (`ai_usage`) | Token counts & latency ms | Operational monitoring |

---

## 13. Failure Resilience & Recovery
- **Database Idle Liveness**: Auto-ping (`SELECT 1`) on connection checkout prevents serverless socket timeouts.
- **Report Reload Resilience**: Authoritative server-side state retrieval restores full report metrics upon direct URL navigation or page reload.
- **Duplicate Prevention**: Distributed idempotency keys prevent double-click duplicate answer submissions.

---

## 14. Supported Browser Matrix
| Browser | Video Framing | Audio Analytics | Speech Recognition | Typed Fallback | Overall Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Google Chrome** | Full (5 FPS) | Full | Native Web Speech API | Supported | **Recommended** |
| **Microsoft Edge** | Full (5 FPS) | Full | Native Web Speech API | Supported | **Recommended** |
| **Brave** | Full (5 FPS) | Full | Native Web Speech API | Supported | **Supported** |
| **Mozilla Firefox** | Full (5 FPS) | Full | Typed Input Fallback | Supported | Supported (Typed) |
| **Apple Safari** | Full (5 FPS) | Full | Typed Input Fallback | Supported | Supported (Typed) |

---

## 15. Deployment Requirements
- **Backend**: Python 3.12+ runtime (Gunicorn / Flask) on Linux/Windows/Docker container.
- **Database**: PostgreSQL 14+ (Neon Serverless PostgreSQL recommended).
- **Frontend**: Static file hosting (Vercel, Netlify, Nginx, or AWS S3/CloudFront).
- **Environment Variables**:
  - `DATABASE_URL`: PostgreSQL connection string with SSL mode required.
  - `SECRET_KEY`: Minimum 32-byte cryptographic JWT secret.
  - `GEMINI_API_KEY`: Google AI Studio API key.
  - `FRONTEND_URL`: Allowed CORS origin for production frontend.

---

## 16. Institutional Administration & Maintenance
- **AI Quota Monitoring**: Administrators can query aggregate token usage and cost metrics via `ai_usage` table.
- **Database Health**: Connection pool is managed with `minconn=1`, `maxconn=10` per backend instance with automatic connection recycling.
- **Log Inspection**: Structured JSON logs are emitted on stdout with request IDs, endpoints, HTTP status, and latency in milliseconds.
