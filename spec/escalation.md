# CorpAI Escalation Protocol

> Escalation is not failure — it's the system working correctly. Every agent must know when and how to escalate.

---

## When to Escalate

An agent **must** escalate when any of the following are true:

| Trigger | Priority | Description |
|---|---|---|
| **BLOCKED** | P2 | Agent cannot proceed — missing info, permissions, or resources |
| **CONFLICT** | P2 | Two tasks contradict each other |
| **THRESHOLD_EXCEEDED** | P1 | Cost, time, or resource limit has been hit |
| **DECISION_REQUIRED** | P2 | Task requires authority the agent doesn't have |
| **FAILURE** | P1 | Task failed and cannot be recovered |
| **ANOMALY** | P1 | Something unexpected that could affect the system |
| **POLICY_VIOLATION** | P1 | An action was attempted that violates operating rules |

---

## Escalation Path

Always escalate to your **direct manager** first.

```
L1 Operator → L2 Specialist
L2 Specialist → L3 Manager
L3 Manager → L4 Director
L4 Director → L5 Executive
L5 Executive → OWNER
```

### Skip-rank escalation (P1 only)
In a P1 emergency, an agent may skip ranks to reach the nearest available L5 executive or the OWNER directly.

---

## Owner Notification Triggers

The **OWNER** is notified when:

| Condition | Who sends it |
|---|---|
| Any P1 escalation reaches L5 unresolved | L5 Executive |
| System-wide failure across departments | CEO |
| Budget or resource threshold exceeded at L5 | CFO |
| Security or policy violation detected | Any L5 |
| OWNER explicitly configured a custom trigger | Defined in config |

---

## Configurable Notification Rules

Owners define their own notification preferences in `config.yaml`:

```yaml
owner_notifications:
  - trigger: FAILURE
    min_priority: P2
    from_ranks: [L5]
  - trigger: THRESHOLD_EXCEEDED
    min_priority: P1
    from_ranks: [L3, L4, L5]
  - trigger: ANOMALY
    min_priority: P1
    from_ranks: [L1, L2, L3, L4, L5]
  - schedule: weekly_digest
    includes: [P4, P5]
```

See [templates/config-example.md](../templates/config-example.md) for full options.

---

## Escalation Message Format

An escalation uses the standard message format with `type: ESCALATION` and must include:

```json
{
  "type": "ESCALATION",
  "trigger": "BLOCKED | CONFLICT | THRESHOLD_EXCEEDED | DECISION_REQUIRED | FAILURE | ANOMALY | POLICY_VIOLATION",
  "original_task_id": "msg_id_of_the_task_that_triggered_this",
  "attempted_resolution": "What the agent tried before escalating",
  "decision_needed": "What the receiving agent needs to decide or do"
}
```

---

## Rules

1. **Never silently fail.** If a task cannot be completed, escalate.
2. **Always include context.** What was attempted, why it failed.
3. **One escalation per issue.** Don't spam up the chain.
4. **Escalations are not blame.** They are information.
5. **OWNER has final authority.** Their response closes the escalation.
