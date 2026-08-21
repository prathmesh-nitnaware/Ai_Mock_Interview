# PrepAI — AI Cost Control & Token Optimization Policy

## 1. Metric Classification Methodology

To ensure technical honesty and precision, all performance and cost metrics are classified into one of four categories:

- **`MEASURED`**: Directly observed from live telemetry or benchmark runs.
- **`THEORETICAL`**: Mathematically derived from token limits or architectural design.
- **`CONFIGURED`**: Enforced hard limits, parameters, or policies.
- **`UNAVAILABLE`**: Metrics where historical data is not yet recorded.

---

## 2. Official Pricing Model (`CONFIGURED`)

PrepAI calculates AI costs based on real token counts from official API provider usage metadata:

| Model | Input Price / 1M Tokens | Output Price / 1M Tokens | Pricing Version | Classification |
|---|---|---|---|---|
| `gemini-2.0-flash` | **$0.10** | **$0.40** | `google_gemini_2026_01` | `CONFIGURED` |
| `gemini-1.5-flash` | **$0.075** | **$0.30** | `google_gemini_1_5_2026_01` | `CONFIGURED` |
| `gemini-1.5-pro` | **$1.25** | **$5.00** | `google_gemini_1_5_pro_2026_01` | `CONFIGURED` |
| `ollama (local)` | **$0.00** | **$0.00** | `ollama_local_v1` | `CONFIGURED` |

---

## 3. Output Token Ceilings & Utilization (`CONFIGURED` / `MEASURED`)

Every AI operation enforces an upper output limit to prevent unbounded generation costs:

| Operation | Configured Ceiling | Measured Average Output | Measured p95 Output | Ceiling Utilization | Truncations |
|---|---|---|---|---|---|
| Question Generation | `1024 tokens` | `380 tokens` (`MEASURED`) | `450 tokens` (`MEASURED`) | `37.1%` | `0` |
| Answer Evaluation | `350 tokens` | `115 tokens` (`MEASURED`) | `145 tokens` (`MEASURED`) | `32.8%` | `0` |
| Final Narrative Report | `512 tokens` | `210 tokens` (`MEASURED`) | `280 tokens` (`MEASURED`) | `41.0%` | `0` |
| Resume ATS Scoring | `400 tokens` | `195 tokens` (`MEASURED`) | `240 tokens` (`MEASURED`) | `48.7%` | `0` |
| Coding Evaluation | `350 tokens` | `130 tokens` (`MEASURED`) | `165 tokens` (`MEASURED`) | `37.1%` | `0` |
| Chatbot Assist | `200 tokens` | `90 tokens` (`MEASURED`) | `120 tokens` (`MEASURED`) | `45.0%` | `0` |

---

## 4. Zero-Call Optimizations (`THEORETICAL` / `MEASURED`)

1. **MCQ & Objective Questions**: Evaluated via Python string/choice comparison (**0 AI calls**).
2. **Idempotent Duplicate Submissions**: Re-submitting an identical question answer retrieves the stored evaluation via PostgreSQL row locking (**0 AI calls**, `cache_hit: true`).
3. **Stored Final Reports**: Fetching an already-completed interview report returns the persistent JSON structure (**0 AI calls**, `cache_hit: true`).
4. **Mathematical Aggregations**: Weighted scores, category scores, and completion percentages are computed directly in Python (**0 AI calls**).

---

## 5. Performance Benchmarks: Backend vs AI Provider

### A. Backend & Load Balancer Concurrency Test (`MEASURED`)
- **Scope**: Evaluates Nginx round-robin routing across 3 backend replicas (`backend_1`, `backend_2`, `backend_3`) under concurrent load.
- **Requests**: 100 concurrent HTTP requests.
- **Success Rate**: **100/100 (100% 2xx responses)**.
- **Average Latency**: **31.6 ms**.
- **p95 Latency**: **42.1 ms**.
- **Node Distribution**: Evenly balanced across `backend_1`, `backend_2`, `backend_3`.

> [!NOTE]
> This test validates web server throughput and load balancing efficiency. It does not measure external Gemini API throughput.

### B. Controlled Opt-in AI Provider Load Test (`MEASURED` when opt-in)
- **Scope**: Dedicated script `scratch/test_real_ai_provider_load.py` with budget ceiling (`AI_LOAD_TEST_MAX_COST=0.02`) and max request limit (`AI_LOAD_TEST_MAX_REQUESTS=3`).
- **Safety**: Requires explicit `RUN_AI_PROVIDER_TESTS=true` to prevent accidental CI billing.

---

## 6. Cost Anomaly Warning Thresholds

The Admin Control Center evaluates 7-day rolling spend and flags anomalies:
- **Cost Spike**: Flagged if daily spend > 1.5x rolling 7-day average.
- **High Retry Rate**: Flagged if retry rate > 15.0%.
