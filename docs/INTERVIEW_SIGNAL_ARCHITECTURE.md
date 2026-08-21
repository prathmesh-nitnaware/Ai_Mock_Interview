# PrepAI — Interview Signal Architecture & Telemetry Specification

## 1. Executive Summary

The **PrepAI Unified Interview Signal Architecture** standardizes how multimodal telemetry (voice, camera, and timing) flows from client-side capture to authoritative backend aggregation and final report generation.

A core principle of PrepAI is the strict architectural separation between **Content & Technical Mastery** and **Delivery & Communication Coaching**:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INTERVIEW EVALUATION                              │
├──────────────────────────────────────┬──────────────────────────────────────┤
│    1. CONTENT & TECHNICAL MASTERY    │  2. DELIVERY & COMMUNICATION COACHING│
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Overall Hiring Score (0–100%)      │ • Speaking Pace (WPM & Assessment)   │
│ • Technical Depth (1–10)             │ • Filler Word Density (%)            │
│ • Clarity of Explanation (1–10)      │ • Pause Duration & Frequency         │
│ • Confidence & Structured Reasoning  │ • Face Presence & Framing (%)        │
│ • Objective Question Accuracy        │ • Posture Stability Score (0–100)    │
│ • Core Strengths & Growth Areas      │ • Actionable Delivery Recommendations│
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Telemetry Payload Schema

### A. Answer Submission Payload (`POST /api/interview/submit`)

```json
{
  "session_id": "cb7575fc-256b-45eb-8b27-e2a91fc3b84d",
  "question": {
    "id": 1,
    "question": "How do you handle distributed transactions across microservices?"
  },
  "answer": "We use the Saga pattern with compensating transactions and event sourcing.",
  "signals": {
    "duration_ms": 28000,
    "voice": {
      "speaking_duration_ms": 25000,
      "silence_duration_ms": 3000,
      "total_duration_ms": 28000,
      "words_spoken": 60,
      "wpm": 144,
      "pace_rating": "Optimal Conversational",
      "filler_word_count": 1,
      "filler_word_rate_pct": 1.7,
      "detected_fillers": { "basically": 1 },
      "pause_count": 2,
      "avg_pause_ms": 1500,
      "longest_pause_ms": 1800,
      "coaching_tips": [
        "Optimal speaking pace at 144 WPM.",
        "Minimal filler words detected."
      ]
    },
    "camera": {
      "total_frames_analyzed": 140,
      "face_presence_pct": 96,
      "looking_away_pct": 7,
      "posture_stability_score": 94,
      "excessive_movement_events": 2,
      "coaching_tips": [
        "Consistent camera framing and eye contact maintained."
      ]
    }
  }
}
```

---

## 3. Database Persistence (Neon PostgreSQL)

Multimodal signals are stored ephemerally in client memory during the question and written in a compact JSON structure to the `interviews.answers` JSONB column upon submission:

```sql
SELECT answers FROM interviews WHERE id = 'cb7575fc-256b-45eb-8b27-e2a91fc3b84d';
```

---

## 4. Final Aggregation & Coaching Generation

When an interview completes, `calculate_interview_scores` aggregates:
- **`avg_wpm`**: Average words per minute across all responses.
- **`total_filler_words`**: Total filler tokens across all responses.
- **`avg_filler_rate_pct`**: Overall filler rate percentage.
- **`avg_face_presence_pct`**: Overall face visibility percentage.
- **`avg_posture_stability`**: Overall posture stability score.
- **`delivery_coaching`**: Deduplicated list of actionable delivery tips.

The authoritative report is persisted into the `interviews.report` JSONB column and served idempotently without additional AI calls.
