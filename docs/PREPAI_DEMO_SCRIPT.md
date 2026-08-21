# PrepAI — 5 to 10 Minute Live College Presentation Demo Script

---

## Demonstration Setup
- **Browser**: Google Chrome or Microsoft Edge
- **Target Role**: Senior Backend Developer
- **Target Experience**: 3–5 Years
- **Skills on Resume**: Python, FastAPI, PostgreSQL, Redis, REST APIs, Distributed Systems

---

## Step-by-Step Presentation Script

### Step 1: Landing Page & Architectural Overview (0:00 – 1:00)
- **What to Click**: Open `http://localhost:5173/` (Landing Page).
- **What to Say**:
  > "Welcome. Today we present PrepAI, an AI-powered job interview simulator engineered to evaluate candidates like a real Principal Engineering Director. Unlike multiple-choice quiz platforms or generic chatbots, PrepAI conducts a live, 5-stage adaptive technical and behavioral interview with explainable scoring and client-side telemetry."
- **What the System Does**: Renders the modern dark-themed hero page with role architecture badges.

---

### Step 2: Role Selection & Resume Ingestion (1:00 – 2:00)
- **What to Click**: Click **"Start Interview"** $\rightarrow$ Enter Role: `Senior Backend Developer` $\rightarrow$ Experience: `3-5 years` $\rightarrow$ Focus: `Technical` $\rightarrow$ Add Resume Context: `Experienced in Python, FastAPI, PostgreSQL indexing, Redis caching, and distributed transaction design.`
- **What to Say**:
  > "PrepAI ingests the candidate's target role and resume context. The backend orchestrator builds a role-tailored strategy mapping competencies across 5 stages: fundamentals, applied implementation, deep technical scale, system design, and behavioral STAR leadership."
- **What the System Does**: Generates the 5-stage interview strategy and transitions to the Hardware Diagnostic staging room.

---

### Step 3: Pre-Interview Hardware Diagnostic (2:00 – 2:45)
- **What to Click**: Observe the 4-point checklist in the System Check lobby $\rightarrow$ Click **"Enter Interview Studio"**.
- **What to Say**:
  > "Before entering the studio, PrepAI runs a 4-point diagnostic: Camera optical framing, microphone audio waveform, Web Speech engine, and database connection. Notice that all video and audio processing is 100% client-side in the browser. Missing hardware never blocks the candidate and never penalizes their technical score."
- **What the System Does**: Verifies devices with green indicators and transitions to the live interview studio.

---

### Step 4: Stage 1 — Fundamentals & Adaptive Escalation (2:45 – 4:00)
- **What the Interviewer Asks**:
  > *"In PostgreSQL, can you explain the internal mechanics of B-Tree indexing and how write amplification impacts high-throughput transactional endpoints?"*
- **What to Say (or Type)**:
  > *"PostgreSQL uses B-Tree indexes to provide O(log N) lookups. However, updating indexed columns forces table page updates and WAL logging, increasing write amplification. We mitigate this with fillfactor tuning and covering indexes."*
- **What to Point Out on Screen**:
  1. Live speech transcription with real-time WPM pill and filler-word counter.
  2. Floating webcam HUD showing face framing status and gaze stability without invasive overlays.
  3. Qualitative evaluation feedback: Awarded **Score: 92/100, Depth Level 5/5**, and recognized the trade-off between read speed and write amplification.
- **What to Say**:
  > "Because the candidate demonstrated Level 5 mastery on fundamentals, PrepAI adaptively increases difficulty and targets claimed resume skills in the next stage."

---

### Step 5: Stage 2 — Applied Scenario & Resume Validation (4:00 – 5:30)
- **What the Interviewer Asks**:
  > *"Given your Redis experience on your resume, how do you handle cache invalidation and prevent cache stampedes during sudden traffic spikes?"*
- **What to Say (or Type)**:
  > *"We implement cache-aside with mutex distributed locking via Redlock, and probabilistic early expiration (XFetch) so only a single worker queries the database while others receive cached data."*
- **What to Point Out on Screen**:
  1. Feedback validates candidate's claimed **Redis / Distributed Caching** skills.
  2. Next action advances smoothly to Deep Technical & System Design.

---

### Step 6: Stage 5 — Behavioral STAR Evaluation (5:30 – 6:45)
- **What to Click**: Advance to Question 5 (Behavioral).
- **What the Interviewer Asks**:
  > *"Describe a time when a critical database outage occurred in production. How did you resolve it?"*
- **What to Say (or Type)**:
  > *"Situation: Our primary DB reached connection limits during peak traffic. Task: Restore auth service within 5 minutes. Action: I scaled pgBouncer connection pooling and added read replicas. Result: Latency dropped from 2s to 40ms with zero data loss."*
- **What the System Does**: Detects full STAR adherence (**Situation: True, Task: True, Action: True, Result: True**) and awards high behavioral ownership.

---

### Step 7: Authoritative Performance Audit & Explainable Report (6:45 – 8:00)
- **What to Click**: Click **"Finish & View Audit"**.
- **What to Highlight on the Report Page**:
  1. **Score Separation**: Overall Score (90%) calculated strictly as **85% Content / 15% Delivery**.
  2. **Grounded Readiness Assessment**: *"Strong Technical Performance — Advanced Architectural Depth"*.
  3. **Explainable "Why" Rationales**: Grounded evidence citations for Technical Accuracy, Depth (Level 5/5), Reasoning & Trade-offs, and Clarity.
  4. **Resume Skills Validated**: Badges showing PostgreSQL, Redis, FastAPI, and Idempotent APIs successfully verified.
  5. **Actionable Delivery Coaching**: Non-psychological guidance on speaking pace, filler count, and face framing.
  6. **Persistence & PDF Export**: Refresh the page to demonstrate instant state restoration from Neon PostgreSQL and show the **"Download Official Audit PDF"** feature.

---

## 8. Summary Wrap-Up for Evaluators (8:00)
> "PrepAI represents an authentic, reproducible, and explainable technical interview platform. It separates substance from delivery, protects user privacy through client-side computer vision, and delivers grounded, evidence-backed feedback for real career readiness."
