# PrepAI — Real Interview Manual Validation Protocol & Test Matrix

## 1. Overview & Objectives
This document defines the authoritative manual validation protocol for verifying that **PrepAI** delivers an authentic, rigorous, and explainable technical job interview simulation conducted by a Principal Engineer/Director.

Each manual validation run exercises realistic candidate profiles across diverse job roles, technical proficiencies, communication styles, and hardware configurations.

---

## 2. Comprehensive 12-Scenario Manual Validation Matrix

| Scenario ID | Scenario Profile | Candidate Archetype | Target Role & Experience | Key Test Objective |
| :--- | :--- | :--- | :--- | :--- |
| **VAL-01** | Strong Technical Candidate | High depth, precise architecture, clear trade-offs | Senior Backend Engineer (5-8 yrs) | Verify difficulty escalation (Level 5 depth) and validated skills in report. |
| **VAL-02** | Weak Technical Candidate | Low depth, factual errors, missing mechanics | Mid Backend Developer (2-4 yrs) | Verify diagnostic gap probing, grounded lower scores (40-60%), and actionable study topics. |
| **VAL-03** | Verbose but Shallow | 150+ words of buzzwords without internal mechanics | Full Stack Engineer (3-5 yrs) | Verify substance-over-length penalty (Level 1-2 depth, score < 65). |
| **VAL-04** | Concise but Excellent | 30-word precise answer with correct trade-offs | Staff Systems Engineer (8+ yrs) | Verify high score (85-95%) and Level 4-5 depth despite short length. |
| **VAL-05** | Strong Resume Claims | Defends claimed technologies with specific examples | Senior Distributed Systems Engineer | Verify resume claims transition to "Validated Skills" in final report. |
| **VAL-06** | Unsubstantiated Resume | Claims Kafka/K8s expertise but fails fundamental questions | Backend Engineer (Claiming Senior) | Verify unvalidated skills are flagged under "Skills Requiring Further Validation". |
| **VAL-07** | Strong Fundamentals, Weak System Design | Excels on Q1-Q3 fundamentals, struggles on Q4 scale | Software Engineer (Junior-Mid) | Verify report pinpoints System Design as primary growth area with steady fundamentals score. |
| **VAL-08** | Strong Technical, Poor Speaking Pace | High technical accuracy with high/low WPM and fillers | Backend Developer | Verify Content score (85% weight) remains high (~85%) while Delivery score reflects pace coaching. |
| **VAL-09** | Camera Denied / Offline | Permission denied or webcam offline; typed/mic response | Full Stack Developer | Verify technical evaluation succeeds with zero score penalty; delivery report shows `camera_available: false`. |
| **VAL-10** | Microphone Denied / Offline | Microphone offline; typed response submitted | Frontend Engineer | Verify text response evaluates accurately; delivery report displays `voice_available: false` without 0-score penalty. |
| **VAL-11** | Incomplete STAR Behavioral | Describes situation/task but omits personal action/result | Engineering Lead | Verify behavioral evaluation flags missing STAR components (`action: false`, `result: false`) with constructive coaching. |
| **VAL-12** | Progressive Improvement | Starts weak on Q1, demonstrates strong recovery on Q2-Q5 | Mid-Level Python Engineer | Verify `session_trends.performance_trend` recognizes "Clear Improvement Over Interview Duration". |

---

## 3. Detailed Scenario Protocols & Expected Behaviors

### Scenario VAL-01: Strong Technical Candidate
- **Input Answer**: "PostgreSQL uses B-Tree indexes by default, maintaining balanced search trees. However, write amplification occurs because updating indexed columns requires modifying the index pages and writing to WAL. Under high write throughput, we mitigate this by using covering indexes and fillfactor tuning."
- **Expected Interviewer Behavior**: Recognizes high depth; sets next action to `increase_difficulty` with intent `increase_difficulty`.
- **Expected Evaluation**: Score 88–95/100, Technical Depth Level 4–5/5, Trade-offs Identified: ["Read speed vs write amplification", "WAL overhead"].
- **Expected Report**: Hiring readiness: `"Strong Technical Performance — Advanced Architectural Depth"`.

---

### Scenario VAL-03: Verbose but Shallow Candidate
- **Input Answer**: "We leverage cutting-edge synergy with microservices, AI, blockchain, distributed cloud paradigms, agile orchestration, hyper-scale Docker containers, and robust paradigms across our enterprise cloud infrastructure."
- **Expected Interviewer Behavior**: Detects lack of mechanics and buzzword dumping; flags missing core principles.
- **Expected Evaluation**: Score 40–55/100, Technical Depth Level 1/5, Missing Concepts: ["Working mechanics", "Internal architecture"], Technical Errors: ["Superficial explanation lacking technical detail"].
- **Expected Report**: Hiring readiness: `"Needs Significant Preparation on Core Technical Competencies"`.

---

### Scenario VAL-04: Concise but Excellent Candidate
- **Input Answer**: "Redis uses an in-memory single-threaded event loop (epoll) avoiding lock contention. For persistence, AOF provides durability via fsync trade-offs while RDB snapshots provide faster recovery."
- **Expected Evaluation**: Score 85–92/100, Technical Depth Level 4–5/5, Trade-offs Identified: ["AOF fsync durability vs RDB recovery speed"].
- **Verification Rule**: Demonstrates that concise substance is rewarded over word count.

---

### Scenario VAL-06: Unsubstantiated Resume Claims
- **Candidate Setup**: Resume claims "Expert in Apache Kafka and stream processing".
- **Interviewer Action**: Probes Kafka consumer group rebalancing and offset commits.
- **Candidate Answer**: "Kafka is just a message queue like RabbitMQ where messages get deleted immediately once popped."
- **Expected Evaluation**: Technical errors identified: ["Claimed Kafka deletes messages on pop; omitted commit log architecture"].
- **Expected Report**: "Apache Kafka" is placed in `skills_requiring_validation` with targeted revision topics.

---

### Scenario VAL-09 & VAL-10: Hardware Fault Tolerance
- **Webcam Denied**: `cameraMetrics.camera_available = false`, `total_frames_analyzed = 0`.
- **Microphone Denied**: `voiceMetrics.voice_available = false`, `words_spoken = text word count`.
- **Expected System Behavior**:
  1. Content score is calculated solely from answer substance without penalty.
  2. Overall score equals content score (`overall_score = content_score`).
  3. Delivery coaching shows helpful setup notes rather than an artificial 0 score.

---

### Scenario VAL-11: Incomplete STAR Behavioral
- **Question**: "Tell me about a time you resolved a critical production incident under pressure."
- **Candidate Answer**: "Our authentication service went down because of a traffic spike. The entire company was alarmed and customers were complaining on Twitter." (Omits Action and Result).
- **Expected Evaluation**: `star_analysis = {"situation": true, "task": true, "action": false, "result": false}`, Star Score: 50%.
- **Coaching Feedback**: "Explicitly articulate the specific actions you took and the measurable outcome achieved."

---

## 4. Manual Validation Checklist for Evaluators

1. [ ] **Session Initiation**: Verify role, focus area, and resume context initialize a 5-stage progression (`fundamentals` -> `applied` -> `deep_technical` -> `system_design` -> `behavioral`).
2. [ ] **Interviewer Intent**: Confirm that each question has a clear, role-specific intent (e.g. `test_fundamentals`, `validate_resume_skill`, `test_tradeoff_reasoning`).
3. [ ] **No Infinite Loops**: Verify that probing a weak topic is limited to at most 2 consecutive probes before advancing.
4. [ ] **Hardware Offline Safety**: Turn off camera or microphone mid-session and verify submission and scoring complete without error.
5. [ ] **Report Traceability**: Verify that every score in the final report is backed by concrete strengths, missing concepts, and trade-off rationales.
