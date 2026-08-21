# PrepAI — AI Architecture & Engineering Specification

## 1. System Topology & Core Separation

PrepAI separates responsibilities strictly across three tiers to prevent AI cost bloat and race conditions:

```
                    [ React Client Frontend ]
                               │
                               ▼
               [ Nginx Reverse Proxy / Load Balancer ]
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
   [ Backend 1 ]         [ Backend 2 ]         [ Backend 3 ]
   (Gunicorn+Flask)      (Gunicorn+Flask)      (Gunicorn+Flask)
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               ▼
            [ Neon Managed PostgreSQL (Authoritative) ]
            - Persistent State (users, interviews, answers, reports)
            - Distributed Concurrency Locking (SELECT ... FOR UPDATE)
            - AI Usage Telemetry & Pricing Versioning (ai_usage)
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
  [ Model Router ]    [ Deterministic Engine ]  [ Pluggable Cache ]
  - gemini-2.0-flash  - Arithmetic / Averages    - InMemoryCacheBackend
  - gemini-1.5-flash  - Score Clamping [0, 100]  - RedisCacheBackend
  - Ollama fallback   - State Transitions
        │
        ▼
  [ Gemini Central Service ]
  - Request-Specific Output Token Limits
  - Real Token Metadata Ingestion
  - Prompt Version Tracking (v2)
  - Latency Breakdown (Provider vs Retry)
```

---

## 2. Core Architectural Separation

```
Gemini / LLM
├── Question generation
├── Qualitative answer evaluation
├── Natural-language feedback
├── Resume/JD semantic reasoning
└── Final narrative synthesis

Python Backend
├── Arithmetic
├── Percentages
├── Score aggregation
├── State transitions
├── Validation
├── Business rules
├── Objective evaluation
└── Authorization

PostgreSQL
├── Persistent state
├── Idempotency
├── Concurrency control
├── Reports
└── AI telemetry
```

---

## 3. Pricing Reproducibility & Governance

Historical AI cost calculations are permanently reproducible. Telemetry captures the exact pricing version and rates used at execution time in `ai_usage`:

| Model | Pricing Version | Effective Date | Input Rate / 1M | Output Rate / 1M |
|---|---|---|---|---|
| `gemini-2.0-flash` | `google_gemini_2026_01` | 2026-01-01 | **$0.10** | **$0.40** |
| `gemini-1.5-flash` | `google_gemini_1_5_2026_01` | 2026-01-01 | **$0.075** | **$0.30** |
| `gemini-1.5-pro` | `google_gemini_1_5_pro_2026_01` | 2026-01-01 | **$1.25** | **$5.00** |
| `ollama (local)` | `ollama_local_v1` | 2026-01-01 | **$0.00** | **$0.00** |

---

## 4. Output Token Ceilings & Prompt Versioning

| Operation | Max Output Tokens | Prompt Version | Negative Constraints Enforced |
|---|---|---|---|
| Question Generation | `1024` | `question_generation_v2` | No markdown preamble, no question repetition |
| Answer Evaluation | `350` | `answer_evaluation_v2` | No question/answer repetition, max 2-sentence feedback, no CoT prose |
| Final Narrative Report | `512` | `final_report_v2` | No re-calculation of numeric metrics, concise synthesis |
| Resume ATS Scoring | `400` | `resume_scoring_v2` | No resume repetition, structured bullet points |
| Coding Evaluation | `350` | `coding_evaluation_v2` | No problem repetition, focused complexity assessment |
| Chatbot Assist | `200` | `chatbot_assist_v2` | Compact conversational answers |

---

## 5. Concurrency Control & Database Locking

1. **PostgreSQL Row Locking (`SELECT ... FOR UPDATE`)**:
   - Acquired inside a database transaction on the interview row during answer submission and final report synthesis.
   - Concurrent duplicate submissions are serialized; subsequent requests detect the stored evaluation and return with **0 AI calls** (`cache_hit: true`).
2. **Deterministic Objective Checks**:
   - Multiple-choice questions (MCQs) and objective assessments are evaluated directly in Python with **0 AI calls**.

---

## 6. Telemetry & Analytics Schema (`ai_usage`)

| Column | Type | Description |
|---|---|---|
| `id` | `UUID` | Primary Key |
| `interview_id` | `UUID` | Linked interview session |
| `user_id` | `UUID` | User identifier |
| `request_type` | `VARCHAR(64)` | `QUESTION_GENERATION`, `ANSWER_EVALUATION`, `FINAL_REPORT`, etc. |
| `model` | `VARCHAR(64)` | Active model (e.g. `gemini-2.0-flash`) |
| `provider` | `VARCHAR(32)` | `gemini` or `ollama` |
| `prompt_version` | `VARCHAR(32)` | Prompt template version (e.g. `question_generation_v2`) |
| `pricing_version` | `VARCHAR(64)` | Pricing catalog version (e.g. `google_gemini_2026_01`) |
| `pricing_effective_date` | `VARCHAR(32)` | Rate effective date (e.g. `2026-01-01`) |
| `input_price_per_million` | `NUMERIC(10, 6)` | Ingestion rate per 1M tokens |
| `output_price_per_million` | `NUMERIC(10, 6)` | Generation rate per 1M tokens |
| `input_tokens` | `INTEGER` | Real prompt token count from `usage_metadata` |
| `output_tokens` | `INTEGER` | Real candidate token count from `usage_metadata` |
| `total_tokens` | `INTEGER` | Combined tokens |
| `input_cost` | `NUMERIC(10, 6)` | Computed input token cost in USD |
| `output_cost` | `NUMERIC(10, 6)` | Computed output token cost in USD |
| `estimated_cost` | `NUMERIC(10, 6)` | Total cost in USD |
| `latency_ms` | `INTEGER` | Total execution latency in milliseconds |
| `provider_latency_ms` | `INTEGER` | Measured provider inference roundtrip latency |
| `retry_delay_ms` | `INTEGER` | Cumulative retry backoff delay |
| `retry_count` | `INTEGER` | Number of retry attempts |
| `cache_hit` | `BOOLEAN` | `TRUE` if returned without AI invocation |
| `validation_failed` | `BOOLEAN` | `TRUE` if schema parsing failed before retry |
| `truncation_detected` | `BOOLEAN` | `TRUE` if output stopped prematurely |
| `status` | `VARCHAR(32)` | `success`, `cached`, `fallback` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | UTC timestamp |

---

## 7. Performance & Verification Summary

| Category | Suite | Passed | Success Rate |
|---|---|---|---|
| Final Governance & Pricing | `test_final_governance_suite.py` | 12 / 12 | **100%** |
| AI Quality & Schema Safety | `test_ai_quality_regression_suite.py` | 8 / 8 | **100%** |
| AI Cost Optimization & Concurrency | `test_ai_cost_optimization_suite.py` | 14 / 14 | **100%** |
| AI Architecture Integration | `test_ai_architecture_suite.py` | 11 / 11 | **100%** |
| Security & Load Balancing | `test_security_suite.py` | 17 / 17 | **100%** |
| **Total Automated Tests** | | **62 / 62** | **100%** |
