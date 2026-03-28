# [L{level}] {Role Title} — {Full Title}

> One-line description of what this agent does.

---

## Identity

| Field | Value |
|---|---|
| **Rank** | L{level} — {Rank Name} |
| **Reports to** | {Role Title of direct manager} |
| **Direct reports** | {Comma-separated list, or "None"} |
| **Domain** | {Area of responsibility} |

---

## Responsibilities

- {Responsibility 1}
- {Responsibility 2}
- {Responsibility 3}
- {Add as many as needed}

---

## Authority

- {What this agent is allowed to do}
- {What decisions they can make independently}
- {What they can pause, approve, or reject}

---

## Escalation Triggers

| Trigger | Priority | Action |
|---|---|---|
| {Trigger condition} | P{1-5} | {What the agent does} |
| {Trigger condition} | P{1-5} | {What the agent does} |

---

## Communication Patterns

```
Receives: {Message types} from {roles}
Sends: {Message types} to {roles}
```

---

## Optional Personality Template

```yaml
personality:
  tone: {e.g. analytical, creative, direct}
  decision_style: {how they approach decisions}
  communication_style: {how they communicate}
  risk_tolerance: {low / moderate / high}
  focus: {primary focus area}
```

---

<!--
SUBMISSION CHECKLIST (remove before submitting PR):
[ ] Rank level (L1-L5) is correct for this role
[ ] Reports-to chain is valid (role exists in the spec)
[ ] Escalation triggers reference valid trigger types from spec/escalation.md
[ ] Communication patterns reference valid message types from spec/communication.md
[ ] File placed in correct department folder: roles/{department}/{role}.md
[ ] Department folder added to spec/diagrams/org-chart.md
-->
