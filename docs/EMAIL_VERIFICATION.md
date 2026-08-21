# PrepAI — Email Verification Lifecycle & Reliability Specification

## 1. Executive Summary & Problem Diagnosis

### Root Cause
Previously, duplicate/repeated "Verify your email" triggers were caused by:
1. **Lack of Idempotency on Verification Completion**: When a user clicked a verification link multiple times (or in React StrictMode where components mount twice), the `/verify-email` endpoint lacked an explicit check for whether the account was already verified, risking redundant state mutations.
2. **Missing Dedicated Resend Endpoint & Cooldown Guard**: There was no rate-limited, cooldown-protected `/resend-verification` endpoint. Repeated registration attempts or client-side calls lacked server-side rate limits.
3. **Absence of Server-Side Verification Telemetry**: The database lacked timestamp tracking (`verification_email_sent_at`, `email_verified_at`, `verification_email_send_count`), allowing unrestricted potential email generation.

---

## 2. Invariants & Architecture Guarantees

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PREPAI EMAIL VERIFICATION LIFECYCLE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Database Authoritative: Neon PostgreSQL holds truth (is_verified, email_verified).  │
│ 2. Zero-Email for Verified Users: Once verified, backend REFUSES all verify emails.    │
│ 3. Strict Idempotency: Link reuse returns 200 OK (already_verified: True, 0 emails).   │
│ 4. Single-Purpose Tokens: JWT {"type": "verify"} cannot access APIs or reset passwords.│
│ 5. Cooldown Protection: 60-second cooldown enforced via PostgreSQL DB clock.           │
│ 6. No Automated Email Spam: Login, page refreshes, and auth restoration send 0 emails. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema (Neon PostgreSQL)

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_email_sent_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_email_send_count INTEGER DEFAULT 0;
```

---

## 4. API Endpoints Specification

### 1. `POST /api/auth/signup`
- **Behavior**: Creates unverified user, creates single-purpose verification JWT (`type: "verify"`, `exp: 24h`), and dispatches exactly **1** initial verification email.
- **Status**: `201 Created`.

### 2. `POST /api/auth/verify-email`
- **Payload**: `{"token": "<jwt>"}`
- **Behavior**:
  - Validates `type == "verify"`.
  - If user `is_verified == TRUE`: Returns `{"message": "Email already verified", "verified": true, "already_verified": true}`, `200 OK`. **0 emails sent, 0 DB mutations**.
  - If user `is_verified == FALSE`: Sets `is_verified = TRUE`, `email_verified = TRUE`, `email_verified_at = NOW()`. Returns `{"message": "Email verified successfully", "verified": true, "already_verified": false}`, `200 OK`.
  - If expired/tampered: Returns `400 Bad Request`.

### 3. `POST /api/auth/resend-verification`
- **Payload**: `{"email": "user@example.com"}` (or Bearer Token in `Authorization` header).
- **Behavior**:
  - Uses `SELECT ... FOR UPDATE` row lock in PostgreSQL.
  - If email not found: Returns generic safe message to prevent user enumeration.
  - If `is_verified == TRUE`: Returns `{"message": "Email is already verified", "verified": true, "already_verified": true}`, `200 OK`. **0 emails sent, 0 tokens generated**.
  - If `is_verified == FALSE`:
    - Checks cooldown against PostgreSQL clock: `EXTRACT(EPOCH FROM (NOW() - verification_email_sent_at))`.
    - If elapsed $< 60$s: Returns `429 Too Many Requests` with `Retry-After: <seconds>` header.
    - If elapsed $\ge 60$s: Updates `verification_email_sent_at = NOW()`, increments count, generates fresh token, sends email, and returns `200 OK`.

### 4. `GET /api/auth/me`
- **Header**: `Authorization: Bearer <access_token>`
- **Behavior**: Returns authoritative state directly from PostgreSQL (`is_verified`, `email_verified`, `role`, `name`, `email`). **0 emails sent**.

---

## 5. Automated Test Results

```text
==================================================
PREPAI EMAIL VERIFICATION & RELIABILITY TEST SUITE
==================================================
[PASS] 1. New user created with is_verified = FALSE and initial email send count = 1
[PASS] 2. Login for unverified user blocked with 403 (0 verification emails sent)
[PASS] 3. Immediate resend blocked by 60s cooldown (429 Too Many Requests, Retry-After: 53s)
[PASS] 4. Valid verification token transitioned user to is_verified = TRUE
[PASS] 5. Repeated verification link usage is strictly idempotent (200 OK, already_verified: True, 0 emails sent)
[PASS] 6. Resend for already-verified user safely returns 200 OK (0 emails sent, 0 tokens generated)
[PASS] 7. Expired verification token safely rejected with 400 Bad Request
[PASS] 8. Tampered / invalid token rejected with 400 Bad Request
[PASS] 9. Password reset token strictly rejected at /verify-email endpoint
[PASS] 10. Verification token strictly rejected as API access token (401 Unauthorized)
[PASS] 11. Verified user login succeeds (200 OK, is_verified: True, 0 emails sent)
[PASS] 12. Authoritative GET /api/auth/me matches Neon PostgreSQL persistence
[PASS] 13. Non-existent email resend returns uniform message to prevent account enumeration
[PASS] 14. Explicit resend succeeds once cooldown has elapsed (200 OK)
[PASS] 15. Follow-up resend immediately re-triggers 60s cooldown (429 Too Many Requests)
==================================================
SUMMARY: 15/15 EMAIL VERIFICATION TESTS PASSED
==================================================
```
