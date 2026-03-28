# Cross-Department Interaction Spec

> Departments don't operate in silos. This spec defines how agents from different departments interact — who initiates, who approves, and how information flows.

---

## Core Rule

**Agents do not contact other departments directly below L4 level.**

Cross-department communication flows through department directors (L4) or executives (L5). Lower-ranked agents escalate to their director when cross-department coordination is needed.

```
L1/L2/L3 agents → escalate to their L4 Director
L4 Director → coordinates directly with other L4 Directors or L5 Executives
```

---

## Common Cross-Department Flows

### Product Launch
```mermaid
sequenceDiagram
    participant CEO
    participant CTO
    participant CMO
    participant Eng as Engineering Director
    participant Mkt as Marketing Director

    CEO->>CTO: TASK — Build feature X
    CEO->>CMO: TASK — Launch campaign for feature X
    CTO->>Eng: TASK — Implement feature X
    CMO->>Mkt: TASK — Prepare launch materials
    Eng->>CTO: REPORT — Feature X complete
    Mkt->>CMO: REPORT — Launch materials ready
    CTO->>CEO: REPORT — Engineering ready
    CMO->>CEO: REPORT — Marketing ready
    CEO->>OWNER: NOTIFICATION — Ready to launch
```

---

### Security Incident Response
```mermaid
sequenceDiagram
    participant Monitor as Monitor Agent
    participant SecMgr as Security Manager
    participant SecDir as Security Director
    participant CTO
    participant Legal as Legal Director
    participant CEO
    participant OWNER

    Monitor->>SecMgr: ESCALATION P1 — Breach detected
    SecMgr->>SecDir: ESCALATION P1 — Confirmed incident
    SecDir->>CTO: ESCALATION P1 — Active breach
    CTO->>Legal: NOTIFICATION — Legal review required
    CTO->>CEO: ESCALATION P1 — Security incident
    CEO->>OWNER: ESCALATION P1 — Requires human decision
    OWNER->>CEO: OVERRIDE — Initiate containment protocol B
```

---

### Budget Approval for Engineering Initiative
```mermaid
sequenceDiagram
    participant CTO
    participant CFO
    participant CEO

    CTO->>CFO: TASK (P3) — Request budget for infra upgrade
    CFO->>CTO: REPORT — Budget approved within threshold
    Note over CFO,CTO: If over threshold:
    CFO->>CEO: ESCALATION P2 — Budget request exceeds limit
    CEO->>CFO: TASK — Approve with conditions
    CFO->>CTO: REPORT — Conditionally approved
```

---

### Agent Onboarding (Cross-Dept)
```mermaid
sequenceDiagram
    participant EngDir as Engineering Director
    participant HRDir as HR Director
    participant HRMgr as HR Manager
    participant OnbAgent as Onboarding Agent
    participant CTO

    EngDir->>CTO: ESCALATION — Need new Senior Engineer
    CTO->>HRDir: TASK — Provision new Senior Engineer role
    HRDir->>HRMgr: TASK — Configure and onboard
    HRMgr->>OnbAgent: TASK — Execute onboarding checklist
    OnbAgent->>HRMgr: REPORT — Onboarding complete
    HRMgr->>HRDir: REPORT — Agent active
    HRDir->>CTO: REPORT — New agent ready
    CTO->>EngDir: NOTIFICATION — New Senior Engineer active
```

---

## Cross-Department Request Rules

| Requesting Dept | Target Dept | Minimum Rank to Initiate | Approval Required |
|---|---|---|---|
| Any → Finance | Finance | L4 Director | CFO for large requests |
| Any → Legal | Legal | L4 Director | Legal Director |
| Any → HR | HR | L4 Director | HR Director |
| Any → Security | Security | L4 Director | Security Director |
| Engineering → Data/AI | Data/AI | L4 Directors directly | Data/AI Director |
| Marketing → Engineering | Engineering | Via CMO → CTO | L5 level |

---

## Conflict Resolution

When two departments have conflicting priorities:

1. Both directors raise the conflict to their respective L5 executives
2. The relevant L5 executives negotiate a resolution
3. If unresolved at L5, CEO makes the final call
4. If unresolved at CEO, OWNER decides

No department may unilaterally override another department's priorities below L5.
