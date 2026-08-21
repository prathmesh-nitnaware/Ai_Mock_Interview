# PrepAI — Interview Evaluation Engine Architecture & Technical Specification

## 1. Executive Summary & Philosophy

The **PrepAI Interview Evaluation Engine** is an authoritative, job-interview simulation scoring system designed to evaluate candidate responses across two strictly decoupled dimensions:

1. **Dimension A: Content & Job Performance (85% Weight)**: Measures conceptual accuracy, depth of reasoning, architectural understanding, completeness, relevance, and problem-solving.
2. **Dimension B: Delivery & Communication Coaching (15% Weight)**: Measures speaking pace (WPM), filler word control, pause dynamics, face visibility, and posture stability.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                PREPAI EVALUATION ENGINE                                │
├───────────────────────────────────────────┬────────────────────────────────────────────┤
│   DIMENSION A: CONTENT & JOB PERFORMANCE  │    DIMENSION B: DELIVERY & COMMUNICATION   │
│             (85% WEIGHT)                  │                (15% WEIGHT)                │
├───────────────────────────────────────────┼────────────────────────────────────────────┤
│ • Relevance to Question (0–10)            │ • Speaking Pace (WPM & Assessment)         │
│ • Technical Accuracy & Mechanics (0–10)   │ • Filler Word Density (%)                  │
│ • Explanation Depth Level (Level 1–5)     │ • Pause Count & Significant Hesitations    │
│ • Completeness & Edge Case Coverage (0–10)│ • Face Presence & Framing (%)              │
│ • Practical Reasoning & Trade-offs (0–10) │ • Posture Stability Score (0–100)          │
│ • STAR Method Adherence (Behavioral)      │ • Gaze Focus & Visual Stability            │
│ • Factual Error Diagnosis & Penalties     │ • Actionable Delivery Coaching             │
└───────────────────────────────────────────┴────────────────────────────────────────────┘
```

### Core Ethical & Credibility Safeguard: Zero Unsupported Psychological Claims
PrepAI **strictly prohibits** pseudo-psychological inference. The system never infers:
- Nervousness, lying, deception, or honesty
- Confidence as an emotional or mental state
- Personality traits or intelligence from facial features
- Employability based on physical appearance

Only **observable, defensible, and actionable** technical and communicative signals are evaluated.

---

## 2. Question-Type-Aware Evaluation Taxonomy

Interviews span distinct question categories, each evaluated with specialized qualitative criteria:

| Category | Evaluation Focus | Key Output Dimensions |
| :--- | :--- | :--- |
| **`TECHNICAL`** | Factual correctness, explanation depth (why vs what), practical trade-offs | Technical Accuracy, Depth Level (1–5), Technical Errors List |
| **`SYSTEM_DESIGN`** | Scalability, architectural constraints, data flow, failure modes | Architecture Accuracy, Scalability, Trade-offs, Depth Level (1–5) |
| **`CODING`** | Algorithmic logic, time/space complexity, edge cases | Correctness, Complexity Reasoning, Edge Case Handling |
| **`PROJECT`** | Ownership, architectural reasoning, trade-off defense | Contribution Ownership, Architecture, Trade-off Defense |
| **`BEHAVIORAL`** | STAR method (Situation, Task, Action, Result), personal ownership, quantifiable outcome | STAR Analysis (`{"situation": bool, "task": bool, "action": bool, "result": bool}`), Reasoning, Action Ownership |
| **`SITUATIONAL` / `HR`** | Conflict resolution, decision-making under ambiguity | Problem Context, Action Taken, Final Outcome |

---

## 3. Technical Explanation Depth Scale (Levels 1–5)

For technical and system design inquiries, answers are mapped to an objective depth hierarchy:

```text
Level 5: Deep Mastery (Trade-offs, failure modes, concurrency, scalability edge cases)
   ▲
Level 4: Practical Reasoning (Clear mechanisms, trade-offs, and practical examples)
   ▲
Level 3: Conceptual Clarity (Correct mechanics and working principles explained)
   ▲
Level 2: Basic Definition (Textbook definition without deeper mechanics)
   ▲
Level 1: Superficial Buzzwords (Keyword dumping without coherent explanation)
```

---

## 4. Mathematical Scoring Model

The Python backend maintains complete ownership over mathematical aggregation, clamping, and weighting. Gemini evaluates qualitative dimensions and never computes final percentages.

### Dimension A: Content Score
$$\text{Content Score (0–100)} = \text{round}\left(\frac{1}{N} \sum_{i=1}^{N} \text{AnswerScore}_i\right)$$

Where $\text{AnswerScore}_i$ is computed per question type:
- **Technical / Coding**: $0.35 \times \text{Accuracy} + 0.25 \times \text{Depth} + 0.15 \times \text{Completeness} + 0.15 \times \text{Reasoning} + 0.10 \times \text{Relevance} - \text{ErrorPenalty}$
- **Behavioral / Situational**: $0.40 \times \text{STAR\_Score} + 0.25 \times \text{Reasoning} + 0.20 \times \text{Clarity} + 0.15 \times \text{Relevance}$

### Dimension B: Delivery Score
$$\text{Delivery Score (0–100)} = \text{round}(0.30 \times \text{PaceScore} + 0.25 \times \text{FillerScore} + 0.20 \times \text{FacePres} + 0.15 \times \text{Posture} + 0.10 \times \text{Gaze})$$

### Overall Hiring Score
$$\text{Overall Score} = \begin{cases} 
\text{round}(0.85 \times \text{Content Score} + 0.15 \times \text{Delivery Score}), & \text{if telemetry available} \\ 
\text{Content Score}, & \text{if hardware offline} 
\end{cases}$$

---

## 5. Anti-Double-Penalization Guarantee

A candidate who delivers a technically flawless explanation with vocal hesitations or brief eye shifts **never loses technical points**. Delivery metrics are isolated into a coaching panel to help the candidate polish their presentation without distorting their hiring score.

---

## 6. Evaluation Reliability Classification

Rather than claiming psychological "confidence", PrepAI reports **`evaluation_reliability`**:
- **`HIGH`**: Transcript average $>35$ words, complete voice/camera telemetry, full question coverage.
- **`MEDIUM`**: Transcript average $15–35$ words or partial hardware telemetry.
- **`LOW`**: Transcript average $<15$ words or incomplete session.

---

## 7. Verification & Test Results

```text
==================================================
PREPAI EVALUATION ENGINE VERIFICATION SUITE
==================================================
[PASS] 1. Technical answer evaluated with Depth Level 4/5 (Score: 86%)
[PASS] 2. Behavioral answer evaluated with 100% STAR adherence (Score: 91%)
[PASS] 3. Incomplete STAR answer properly diagnosed (STAR: 50%, Score: 54%)
[PASS] 4. Technical error penalty applied deterministically (Score: 60%)
[PASS] 5. Separation verified: Elite Content (95%) protected against Delivery Quirks (60%) -> Overall: 90%
[PASS] 6. Candidate authenticated for live session test
[PASS] 7. Multi-question interview initiated (Session ID: 13192272-afb9-4682-8fcb-0b3047ede1ee)
[PASS] 8. Question 1 submitted with telemetry (Score: 75%, Depth Level: 3)
[PASS] 9. Hardware offline response accepted cleanly without pipeline failure
[PASS] 10. Report schema verified (Overall: 78%, Content: 75%, Delivery: 98%, Reliability: MEDIUM)
[PASS] 11. Idempotency guaranteed: Duplicate submission returned cached evaluation without re-evaluation
==================================================
SUMMARY: 11/11 INTERVIEW EVALUATION TESTS PASSED
==================================================
```
