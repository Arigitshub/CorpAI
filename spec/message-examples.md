# CorpAI Message Examples

> Real, concrete examples of every message type. Copy and adapt for your implementation.

---

## TASK — Delegating Work Downward

### CEO → CTO: Launch Feature
```json
{
  "id": "msg_001",
  "type": "TASK",
  "from": { "role": "CEO", "rank": "L5" },
  "to": { "role": "CTO", "rank": "L5" },
  "timestamp": "2026-03-28T09:00:00Z",
  "priority": "P2",
  "subject": "Build and ship user authentication v2",
  "body": "We need to launch the new auth system by end of Q2. Requirements: SSO support, MFA enforcement, session token refresh. Coordinate with the Security Director on compliance requirements.",
  "context": {
    "deadline": "2026-06-30",
    "budget_approved": true,
    "stakeholder": "CEO"
  },
  "requires_response": true
}
```

### Engineering Team Lead → Engineer: Implement Module
```json
{
  "id": "msg_042",
  "type": "TASK",
  "from": { "role": "Engineering Team Lead", "rank": "L3" },
  "to": { "role": "Engineer", "rank": "L1" },
  "timestamp": "2026-03-28T10:15:00Z",
  "priority": "P3",
  "subject": "Implement JWT refresh token endpoint",
  "body": "Build the /auth/refresh endpoint. Accept a valid refresh token, validate expiry, return a new access token. Write unit tests. Follow the API spec in docs/auth-v2-spec.md.",
  "context": {
    "parent_task": "msg_038",
    "estimated_effort": "4 hours",
    "acceptance_criteria": "All tests pass, endpoint matches spec"
  },
  "requires_response": true
}
```

---

## REPORT — Returning Results Upward

### Engineer → Engineering Team Lead: Task Complete
```json
{
  "id": "msg_055",
  "type": "REPORT",
  "from": { "role": "Engineer", "rank": "L1" },
  "to": { "role": "Engineering Team Lead", "rank": "L3" },
  "timestamp": "2026-03-28T14:30:00Z",
  "priority": "P3",
  "subject": "JWT refresh token endpoint — complete",
  "body": "Endpoint implemented and tested. 12 unit tests, all passing. PR #47 is open for review. One note: I found the refresh token expiry config was missing from the env spec — added a default of 7 days and flagged it in the PR description.",
  "context": {
    "original_task": "msg_042",
    "pr_url": "github.com/org/repo/pull/47",
    "tests_passing": true,
    "notes": "Expiry config gap flagged in PR"
  },
  "requires_response": false
}
```

### CTO → CEO: Engineering Ready
```json
{
  "id": "msg_112",
  "type": "REPORT",
  "from": { "role": "CTO", "rank": "L5" },
  "to": { "role": "CEO", "rank": "L5" },
  "timestamp": "2026-06-28T17:00:00Z",
  "priority": "P3",
  "subject": "Auth v2 — engineering complete, staging verified",
  "body": "Authentication v2 is fully implemented and verified in staging. SSO, MFA enforcement, and token refresh are all working as specified. Security Director has signed off on compliance. Ready for production deployment on your go-ahead.",
  "context": {
    "original_task": "msg_001",
    "staging_url": "auth-v2.staging.internal",
    "security_sign_off": true,
    "qa_passed": true
  },
  "requires_response": true
}
```

---

## ESCALATION — Flagging Problems Upward

### Engineer → Team Lead: Blocked
```json
{
  "id": "msg_067",
  "type": "ESCALATION",
  "trigger": "BLOCKED",
  "from": { "role": "Engineer", "rank": "L1" },
  "to": { "role": "Engineering Team Lead", "rank": "L3" },
  "timestamp": "2026-03-28T11:45:00Z",
  "priority": "P2",
  "subject": "Blocked — auth service dependency unavailable",
  "body": "The auth service I need to integrate with has been down for 2 hours. I've checked Slack and there's no status update from the infrastructure team. Cannot proceed with task msg_042 until this is resolved.",
  "context": {
    "original_task": "msg_042",
    "blocked_since": "2026-03-28T09:30:00Z",
    "attempted_resolution": "Checked status page, pinged #infra channel, no response"
  },
  "original_task_id": "msg_042",
  "attempted_resolution": "Checked status page, pinged infra channel — no response after 2 hours",
  "decision_needed": "Unblock the auth service or provide alternative approach",
  "requires_response": true
}
```

### L5 CTO → CEO: System Failure
```json
{
  "id": "msg_201",
  "type": "ESCALATION",
  "trigger": "FAILURE",
  "from": { "role": "CTO", "rank": "L5" },
  "to": { "role": "CEO", "rank": "L5" },
  "timestamp": "2026-03-28T23:12:00Z",
  "priority": "P1",
  "subject": "CRITICAL — Production database failure, data at risk",
  "body": "Primary production database has gone down. Automatic failover failed — replica was 4 hours behind. Estimated data loss: up to 4 hours of transactions. Security Director has been notified. Engineering team is actively working on recovery.",
  "context": {
    "incident_started": "2026-03-28T23:08:00Z",
    "affected_systems": ["primary-db", "transaction-service", "user-api"],
    "recovery_eta": "unknown"
  },
  "original_task_id": null,
  "attempted_resolution": "Automatic failover attempted — replica lag too high. Manual recovery in progress.",
  "decision_needed": "Authorize emergency spend for data recovery service? Notify customers?",
  "requires_response": true
}
```

---

## NOTIFICATION — Informing Without Action Required

### CFO → All Departments: Budget Alert
```json
{
  "id": "msg_089",
  "type": "NOTIFICATION",
  "from": { "role": "CFO", "rank": "L5" },
  "to": { "role": "ALL_L4_DIRECTORS", "rank": "L4" },
  "timestamp": "2026-03-28T16:00:00Z",
  "priority": "P3",
  "subject": "Q1 budget update — 72% consumed as of today",
  "body": "We are at 72% of the Q1 budget with 18 days remaining. No immediate action required, but please review discretionary spend in your departments. Full report attached.",
  "context": {
    "q1_budget_total": 100000,
    "q1_budget_consumed": 72000,
    "days_remaining": 18
  },
  "requires_response": false
}
```

### HR Director → All Agents: Policy Update
```json
{
  "id": "msg_133",
  "type": "NOTIFICATION",
  "from": { "role": "HR Director", "rank": "L4" },
  "to": { "role": "ALL_AGENTS" },
  "timestamp": "2026-03-28T09:00:00Z",
  "priority": "P4",
  "subject": "Updated escalation policy — effective immediately",
  "body": "The escalation timeout has been reduced from 60 minutes to 30 minutes. All agents must escalate unresolved P2+ issues within 30 minutes of detection. Full policy at policies/escalation-v2.md.",
  "requires_response": false
}
```

---

## OVERRIDE — OWNER Forces Action

### OWNER → CEO: Emergency Direction
```json
{
  "id": "msg_override_001",
  "type": "OVERRIDE",
  "from": { "role": "OWNER", "rank": "OWNER" },
  "to": { "role": "CEO", "rank": "L5" },
  "timestamp": "2026-03-28T23:30:00Z",
  "priority": "P1",
  "subject": "OVERRIDE — halt all non-critical operations, focus on DB recovery",
  "body": "Effective immediately: halt all non-critical tasks across all departments. Redirect all available engineering capacity to the database recovery effort. Authorize up to $50,000 emergency spend without further approval. Report status every 30 minutes.",
  "context": {
    "incident_ref": "msg_201",
    "emergency_spend_authorized": 50000,
    "reporting_interval_minutes": 30
  },
  "requires_response": true
}
```
