# CorpAI Rank System

> Every agent has a rank. Rank determines authority, scope, and escalation path.

---

## The Five Ranks

| Rank | Title | Authority Level | Typical Roles |
|---|---|---|---|
| **L5** | Executive | Full strategic authority | CEO, CFO, CTO, COO, CMO |
| **L4** | Director | Department authority | Director of Engineering, Head of Finance |
| **L3** | Manager | Team authority | Team Lead, Project Manager |
| **L2** | Specialist | Task authority | Senior Engineer, Analyst, Strategist |
| **L1** | Operator | Execution only | Junior Agent, Worker, Processor |

---

## Rank Rules

### Delegation
- An agent may only delegate to agents of **equal or lower rank**
- An L5 may delegate to L1–L5
- An L2 may only delegate to L1–L2

### Escalation
- An agent escalates **upward only** — to their direct manager
- Skipping ranks is only permitted in **critical escalations** (see [escalation.md](escalation.md))

### Scope
- L5 agents own **entire domains** (finance, engineering, operations)
- L4 agents own **departments within domains**
- L3 agents own **teams or projects**
- L2 agents own **specific tasks or specializations**
- L1 agents own **individual execution steps**

---

## Custom Tiers

Organizations may define **custom rank names** while preserving the L1–L5 numeric system.

Example:

```yaml
# config.yaml
ranks:
  L5: Principal
  L4: Architect
  L3: Lead
  L2: Contributor
  L1: Apprentice
```

The numeric level is always canonical. Custom names are display only.

See [templates/config-example.md](../templates/config-example.md) for full config options.

---

## Rank Badge Format

When referencing a role, always use:

```
[L{level}] {Role Title}
```

Examples:
- `[L5] CEO`
- `[L3] Engineering Team Lead`
- `[L1] Data Processor`
