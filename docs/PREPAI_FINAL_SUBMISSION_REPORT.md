# PrepAI — Final College Submission & Engineering Report

---

## 1. Project Objective
**PrepAI** is an AI-powered, realistic job interview simulator engineered to bridge the gap between academic preparation and industry technical hiring. Unlike multiple-choice quiz platforms or generic unstructured chatbots, PrepAI conducts a live, multimodal technical and behavioral interview tailored to specific engineering roles, actively probes knowledge gaps, evaluates trade-off reasoning, validates claimed resume competencies, and delivers an evidence-backed performance audit.

---

## 2. Problem Statement
Traditional technical interview preparation tools suffer from three core deficiencies:
1. **Trivia & MCQ Focus**: Platforms assess memorization rather than real-world architectural trade-offs, concurrency reasoning, and verbal articulation.
2. **Superficial Feedback**: Generic chatbots reward buzzword dumping and offer vague feedback without explaining *why* a candidate received a particular rating.
3. **Black-Box Psychological Speculation**: Commercial video interview tools attempt to infer "personality", "honesty", or "nervousness", introducing bias and unscientific conclusions.

PrepAI resolves these challenges by combining a 5-stage adaptive technical interview progression with an 85% Content / 15% Delivery scoring separation, deterministic schema validation, and observable-only computer vision and speech telemetry.

---

## 3. System Architecture

```text
[ React 18 / Vite Frontend ]
   ├── Hardware Diagnostic (Camera, Mic, Web Speech API, Backend Sync)
   ├── Client-Side FaceAPI (5 FPS TinyFaceDetector — Zero Video Upload)
   ├── Client-Side Web Audio API (Volume & Pause Engine — Zero Audio Persistence)
   └── Interactive Interview Studio & Authoritative Report UI
             │
             ▼ HTTPS / REST (JWT Auth & Idempotency Keys)
[ Flask / Python 3.12 Backend ]
   ├── Centralized AI Gateway (Gemini API with Fast Failover to Ollama / Heuristics)
   ├── Adaptive Interview Orchestrator (Intent Tracking & Anti-Looping Guards)
   ├── Deterministic Scoring Engine (85% Content / 15% Delivery Mathematical Isolation)
   └── Resilient Database Layer (Neon Serverless PostgreSQL with Liveness Auto-Ping)
```

---

## 4. The 5-Stage Adaptive Interview Lifecycle

Every interview advances sequentially through 5 distinct competency stages:

1. **Stage 1: Core Fundamentals (`fundamentals`)** — Investigates language internals, database mechanics, memory allocation, and core principles.
2. **Stage 2: Applied Architecture (`applied`)** — Investigates real-world framework implementation, API design, and claimed resume skills.
3. **Stage 3: Deep Technical Reasoning (`deep_technical`)** — Evaluates concurrency, race conditions, caching strategies, and performance bottlenecks.
4. **Stage 4: Practical Scenario / System Design (`system_design`)** — Tests distributed scalability, partition tolerance, failure recovery, and architectural trade-offs.
5. **Stage 5: Behavioral & Leadership (`behavioral`)** — Assesses cross-functional collaboration, ownership, and critical incident response via the **STAR method** (Situation, Task, Action, Result).

---

## 5. Adaptive Questioning & Intent Attribution
Each question generated (or served via fallback) internally assigns an explicit interviewer `intent`:
- `test_fundamentals`
- `validate_resume_skill`
- `probe_technical_gap`
- `increase_difficulty`
- `test_tradeoff_reasoning`
- `system_design`
- `behavioral`

**Anti-Looping Protection**: If a candidate provides a flawed response on a specific topic, the orchestrator permits a maximum of 2 consecutive diagnostic probes before advancing the competency stage to ensure full 5-stage interview coverage.

---

## 6. Resume Validation Engine
- **Extraction**: Parses claimed frameworks, databases, and architectural concepts from candidate resume context.
- **Dynamic Targeting**: Directly inserts unvalidated skills into Stage 2 applied scenario questions.
- **Categorization**: Compares candidate answers against evaluation criteria and populates `validated_skills` and `skills_requiring_validation` in the final audit report.

---

## 7. Technical Evaluation & Substance-Over-Length Protection
Evaluations strictly assess semantic substance rather than token quantity:
- **Explanation Depth Levels**:
  - *Level 1*: Superficial buzzword dumping without explanation.
  - *Level 2*: Basic textbook definition lacking internal mechanics.
  - *Level 3*: Correct conceptual explanation with working mechanics.
  - *Level 4*: Clear reasoning with practical edge cases and production constraints.
  - *Level 5*: Deep mastery with architectural trade-offs, failure modes, and performance limits.
- **Concise Mastery**: A concise, 30-word response identifying correct trade-offs is awarded Level 4–5 depth.
- **Verbose Shallow Answers**: A 150-word answer filled with buzzwords but lacking mechanics is penalized to Level 1–2 depth.

---

## 8. Behavioral & STAR Evaluation
Behavioral questions (Stage 5) evaluate narrative structure against 4 objective criteria:
- **Situation**: Context and challenge described.
- **Task**: Candidate's specific responsibility defined.
- **Action**: Direct engineering and leadership actions articulated.
- **Result**: Measurable business/system outcome demonstrated.

---

## 9. Client-Side Camera Analytics Engine
- **In-Browser Execution**: Runs TinyFaceDetector via FaceAPI at 5 FPS (<3% CPU utilization).
- **Observable Signals Only**: Measures face framing percentage, sustained gaze deviation (>800ms threshold), and posture stability.
- **Zero Video Uploads**: Video frames never leave the candidate's browser memory.
- **Non-Psychological Taxonomy**: Strictly forbids inferences of "nervousness", "lying", or "dishonesty".

---

## 10. Client-Side Voice Analytics Engine
- **Active Speaking WPM**: Calculates words per minute solely over active speaking duration (excluding pauses).
- **Word-Boundary Filler Detection**: Uses regex matching (`\bum\b`, `\blike\b`, `\byou know\b`) to avoid substring false positives.
- **Observable Pauses**: Categorizes pauses into "short pause", "normal pause", and "extended silence (>3.5s)".
- **Typed Fallback**: If microphone is denied or speech recognition is unavailable, typed text responses are fully supported.

---

## 11. Scoring Architecture & Hardware Isolation
$$\text{Overall Score} = (0.85 \times \text{Content Score}) + (0.15 \times \text{Delivery Score})$$
- **Hardware Offline Guarantee**: If camera or microphone telemetry is absent, $\text{Overall Score} = \text{Content Score}$. Missing hardware is never penalized as a 0 score.
- **Delivery Independence**: Poor posture or high filler density can reduce the delivery coaching score (15%), but can never degrade technical mastery (85%).

---

## 12. Explainability & Evidence-Backed Reporting
The final audit answers *"Why did I receive this score?"* for every dimension:
- **Technical Accuracy**: Concrete mistakes and missing concepts cited.
- **Explanation Depth**: Explicit depth level (1–5) and rationale.
- **Reasoning**: Trade-offs identified vs trade-offs missed.
- **Communication**: Observable pace, filler rate, and framing stability.

---

## 13. Security & Prompt Injection Isolation
- **Untrusted Input Boundaries**: Candidate answers and resumes are encapsulated in `<<<UNTRUSTED_CANDIDATE_ANSWER>>>` and `<<<UNTRUSTED_RESUME_DATA>>>` delimiters.
- **Evaluator Defense**: Explicit instructions prevent candidate text from overriding scoring rules. Injection attempts are assigned 0 accuracy and flagged under technical errors.
- **JWT & Cooldown Security**: Enforces 60-second email verification resend cooldown and prevents token purpose re-use.

---

## 14. Database Persistence & Resilience
- **Neon Serverless PostgreSQL**: Persistent relational schema storing interview sessions, answers, states, strategies, and reports.
- **Connection Liveness Auto-Ping**: Automatically detects serverless idle socket disconnects (`SELECT 1` ping on checkout) and reconnects gracefully.
- **Distributed Idempotency**: Submissions and reports use idempotent tokens to prevent duplicate processing on double-clicks or page reloads.

---

## 15. Failure Resilience
- **AI Timeout Failover (3.0s)**: If Gemini API is unreachable, the system fails over to local Ollama, and if unavailable, seamlessly activates role-specific deterministic fallback questions and evaluations.
- **Non-Blocking Hardware Staging**: Pre-interview diagnostic allows candidates to enter the studio even if webcam/mic are restricted.

---

## 16. Authentication & Email Policy
- **General-Purpose Authentication**: Email verification is currently disabled to simplify deployment and eliminate dependencies on external SMTP delivery services.
- **Immediate Onboarding**: Accounts register with any valid email domain (`gmail.com`, `college.edu`, etc.) and log in immediately.
- **Institutional Flexibility**: The institution can configure domain-specific authentication, SSO, or email verification policies post-handover.

---

## 17. Test Verification Summary
- **P0 Interview Test Suite**: **25/25 PASS (100%)**
- **P1.5 Completeness Test Suite**: **5/5 PASS (100%)**
- **P1 Product Quality Suite**: **6/6 PASS (100%)**
- **Security & Idempotency Suite**: **17/17 PASS (100%)**
- **Frontend Production Build**: **Clean Vite build in 11.0s (1810 modules transformed, zero runtime errors)**

---

## 18. Known Limitations
- Native voice recognition uses the Web Speech API (supported on Chromium browsers: Chrome, Edge, Brave). Non-Chromium browsers use typed responses with full audio volume analytics.
- Client-side face detection requires standard ambient room lighting for optimal bounding box tracking.

---

## 19. Future Roadmap
- Integration with institutional LMS (Canvas, Moodle) via LTI 1.3 standards.
- WebAssembly-based offline local speech recognition for non-Chromium browser support.
- Multi-party collaborative technical whiteboarding interviews.

---

## 20. Demonstration Instructions
Refer to [`docs/PREPAI_DEMO_SCRIPT.md`](file:///d:/Prep_AI/docs/PREPAI_DEMO_SCRIPT.md) for the exact step-by-step 5–10 minute presentation sequence.
