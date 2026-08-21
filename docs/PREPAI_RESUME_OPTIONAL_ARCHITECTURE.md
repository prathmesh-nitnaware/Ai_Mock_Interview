# PrepAI — Resume-Optional Architecture Specification
## Unified Candidate-Profile Driven Adaptive Interviewing

---

## 1. Architectural Principles

1. **Resume Is Optional, Never Required**:
   A candidate can register, complete onboarding, configure interview setups, conduct full 5-stage adaptive mock interviews, and view comprehensive performance reports without ever uploading a resume.
2. **First-Class Absence Contract (No 404s for Normal State)**:
   The endpoint `GET /api/profile/resume/get` returns `HTTP 200 OK` with `has_resume: false` when a resume is not uploaded, avoiding false error toasts, broken states, or console noise.
3. **Multi-Source Candidate Context**:
   When a resume is absent, PrepAI synthesizes candidate context from:
   - **Onboarding Responses**: `education`, `current_job`, `target_job`
   - **User Profile**: `bio`, `role`, `name`
   - **Interview Setup Form**: `role`, `experience`, `type` (Track Focus), `difficulty`, `question_count`
4. **Resume as Enrichment**:
   When a resume is uploaded, it seamlessly enriches the interview with resume-grounded skill verification, project-specific inquiries, and ATS keyword extraction.
5. **No AI Failure on Missing Resume**:
   The AI orchestrator explicitly operates in two distinct modes:
   - `RESUME-GROUNDED INTERVIEW`: Probes and validates candidate's claimed resume technologies.
   - `CANDIDATE-PROFILE DRIVEN INTERVIEW`: Personalizes strictly from the candidate profile, target role, and focus area without inventing fake resume claims (*"According to your resume..."*).

---

## 2. API Contract Specifications

### `GET /api/profile/resume/get`

#### Case A: Resume Present
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "has_resume": true,
  "resume_filename": "candidate_cv.pdf",
  "resume_data": "base64_encoded_file_string",
  "resume_text": "Extracted text content..."
}
```

#### Case B: Resume Absent
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "has_resume": false,
  "resume_filename": null,
  "resume_data": null,
  "resume_text": "",
  "message": "No resume uploaded"
}
```

---

### `GET /api/interview/resume-context`

#### Case A: Resume Present
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "has_resume": true,
  "resume_text": "Extracted text...",
  "resume_filename": "candidate_cv.pdf"
}
```

#### Case B: Resume Absent
```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "has_resume": false,
  "resume_text": "",
  "resume_filename": null
}
```

---

## 3. Interview Strategy & 5-Stage Progression

The 5-stage adaptive progression functions identically across both modes:

```text
               ┌───────────────────────────┐
               │  1. CS Fundamentals       │
               └─────────────┬─────────────┘
                             ▼
               ┌───────────────────────────┐
               │  2. Applied Architecture  │
               └─────────────┬─────────────┘
                             ▼
               ┌───────────────────────────┐
               │  3. Deep Technical Gap    │
               └─────────────┬─────────────┘
                             ▼
               ┌───────────────────────────┐
               │  4. System Design Scale   │
               └─────────────┬─────────────┘
                             ▼
               ┌───────────────────────────┐
               │  5. Behavioral STAR       │
               └───────────────────────────┘
```

- **Without Resume**: Evaluates declared competencies derived from the chosen placement track and target role.
- **With Resume**: Validates claimed skills and projects extracted from the uploaded document.

---

## 4. Multi-User Isolation & Security

- All resume lookups, updates, and deletes are strictly filtered by authenticated JWT `user_id`.
- User B attempting to view User A's session or resume receives `HTTP 404 Not Found`.
- Prompt injection protection delimiters (`<<<UNTRUSTED_RESUME_DATA>>>` and `<<<UNTRUSTED_CANDIDATE_ANSWER>>>`) are strictly maintained.
