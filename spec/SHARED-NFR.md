# Shared Non-Functional Requirements (NFR)

This document defines organization-wide non-functional requirements.
Individual service specs may only tighten (never relax) these requirements unless an approved exception (architecture decision record) exists.

## 1. Reliability
* Services MUST provide read-after-write consistency for single-resource fetches after successful 2xx mutations.
* Client retries for idempotent operations MUST be side‑effect free.

## 2. Availability
* Monthly availability objective: ≥99.9%.
* Rolling deployments MUST avoid serving traffic from unready instances (readiness & liveness probes mandatory).

## 3. Performance
* Per-endpoint latency metrics (p50, p90, p95, p99) MUST be published.
* Baseline targets (unless tightened): p95 read ≤250 ms; p95 simple write ≤400 ms under nominal load.
* Batch / list endpoints MUST use indexed access (no full table scans for routine queries).
* Large collections MUST support cursor pagination (offset only for small <5k stable sets).

## 4. Scalability
* Horizontal scaling MUST be achievable by adding replicas without protocol changes.
* Critical dependencies MUST define timeouts and SHOULD implement circuit breaking & bulkheads.
* Work queues / background processors MUST be horizontally scalable (partition or competing consumers).
* Storage growth strategies (sharding / partitioning) SHOULD be documented for datasets exceeding planned thresholds.

## 5. Security
* Authorization MUST be enforced server-side (zero trust toward client-provided role hints).
* Secrets MUST reside in an approved secret management system (never in source control).
* Principle of least privilege MUST guide DB/service IAM policies.
* Security-related events (auth failures, permission denials, significant config changes) SHOULD be logged.

## 6. Privacy
* Data minimization: store only attributes required for declared features.
* Logs / metrics MUST NOT contain raw PII beyond stable hashed/ID references.
* Mask or redact sensitive fields for unauthorized users.
* User data deletion / anonymization MUST be supported where regulatory obligations apply.

## 7. Observability
* Structured JSON logs MUST include: timestamp, level, service, environment, requestId, route/operation, durationMs, status, errorCode (if any).
* Core metrics: RPS, latency histograms, error rate by class (4xx/5xx), saturation (CPU, memory), rate-limit hits, queue depth (if applicable).
* Alerts MUST cover: elevated 5xx, p95/p99 latency SLO breach, abnormal 429 surge, error budget burn, queue backlog saturation.

## 8. Backward Compatibility
* Additive schema changes (new JSON fields) MUST NOT break clients; clients are expected to ignore unknown fields.

## 9. API Evolution
* Deprecations MUST follow: announce → telemetry usage monitoring → grace period → removal in next major version.
* Experimental fields MAY be flagged (e.g., "beta") and documented with stability expectations.
* Concurrency control MUST be provided (ETag + If-Match or numeric version attributes) for mutable resources.

## 10. Data Integrity
* Datastores MUST enforce primary keys, uniqueness, foreign keys (or equivalent referential integrity), and length/format constraints.
* Server-generated timestamps MUST be UTC ISO-8601; client-supplied timestamps ignored unless explicitly allowed.
* Text inputs MUST be trimmed & NFC-normalized prior to validation.
* Idempotent create flows MUST rely on unique constraints or a dedupe ledger keyed by Idempotency-Key.
* Ordering / ranking keys MUST use deterministic binary collation to guarantee consistent sorting.

## 11. Error Handling
* Error responses MUST follow Problem semantic (RFC7807)
* HTTP status codes MUST align with semantics (400 validation shape errors, 401 auth, 403 forbidden, 404 not found, 409 conflict, 412 precondition, 422 domain validation, 429 rate limit, 500/502/503 server).
* Internal stack traces MUST NOT be returned to clients (log only).
* Retry guidance MUST be consistent: idempotent 5xx & network errors → exponential backoff + jitter; 429 → honor Retry-After; 409/412 → refetch & retry.

## 12. UX Quality
* API responses MUST be deterministic for identical inputs (idempotent reads).
* List ordering MUST be stable (explicit tie-breakers).
* Long-running (>250 ms perceived) client actions SHOULD surface progress indicators.
* Accessibility: keyboard alternatives MUST exist for pointer-only interactions (e.g., drag & drop).

## 13. Limits, Quotas & Protection
* Rate-limited responses MUST include: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset.
* Abuse protections SHOULD include: input validation allowlists, anomaly detection, WAF rules.
* Pagination MUST default to bounded page sizes with enforced maximum.

## 14. Operability & Support
* Each service MUST maintain runbooks for: high latency, partial dependency outage, elevated error rate, rate-limit tuning, rollback.
* Migrations MUST be reversible or have a documented rollback strategy.
* Feature flags MAY control progressive rollout; a kill-switch SHOULD exist for risky features.
* Alerts MUST be actionable and link to runbooks (no unactionable noise).

---

Service specs should add a "Service-specific adjustments" section listing only the stricter or additional requirements unique to that service.
