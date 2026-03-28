# CorpAI Multi-Org Spec

> When two CorpAI organizations need to work together, they don't merge hierarchies. They establish a **Federation** — a formal inter-org protocol with defined contact points, message contracts, and escalation boundaries.

---

## Core Concept

Each CorpAI org is sovereign. No external org can issue commands inside another org below the agreed contact point. All inter-org communication flows through designated **Federation Agents** at L4 or L5.

```mermaid
graph LR
    subgraph Org A
        CEO_A["[L5] CEO"]
        COO_A["[L5] COO"]
        FA_A["[L4] Federation Agent (Org A)"]
    end

    subgraph Org B
        CEO_B["[L5] CEO"]
        COO_B["[L5] COO"]
        FA_B["[L4] Federation Agent (Org B)"]
    end

    FA_A <-->|"Inter-Org Channel"| FA_B
    COO_A --> FA_A
    COO_B --> FA_B
```

---

## Federation Setup

Before two orgs can communicate, they must establish a **Federation Agreement** — a config document both orgs sign off on.

```yaml
# federation.yaml

federation:
  org_a:
    name: "Org Alpha"
    contact_role: "Operations Director"
    contact_rank: L4

  org_b:
    name: "Org Beta"
    contact_role: "Operations Director"
    contact_rank: L4

  allowed_message_types:
    - TASK
    - REPORT
    - NOTIFICATION

  # ESCALATION and OVERRIDE are never allowed cross-org by default
  blocked_message_types:
    - ESCALATION
    - OVERRIDE

  scope:
    - "Joint project: [project name]"
    - "Service: [service name]"

  # Max rank that can receive inter-org messages (no OWNER contact)
  max_inbound_rank: L4

  # How long until federation auto-expires if not renewed
  expiry: "2026-12-31"
```

---

## Federation Agent Role

Each org designates a **Federation Agent** — typically the Operations Director (L4) or COO (L5) depending on scope.

```markdown
## Federation Agent Responsibilities
- Single point of contact for all inter-org messages
- Translates external TASKs into internal org tasks
- Never forwards raw inter-org messages internally — always repackages them
- Reports inter-org activity to their direct manager
- Escalates inter-org conflicts to their L5 executive
```

---

## Inter-Org Message Format

Inter-org messages extend the standard CorpAI message format with federation metadata:

```json
{
  "id": "intorg_msg_id",
  "type": "TASK",
  "federation": {
    "from_org": "Org Alpha",
    "to_org": "Org Beta",
    "agreement_id": "fed_alpha_beta_2026",
    "channel": "operations"
  },
  "from": {
    "role": "Operations Director",
    "rank": "L4",
    "org": "Org Alpha"
  },
  "to": {
    "role": "Operations Director",
    "rank": "L4",
    "org": "Org Beta"
  },
  "timestamp": "ISO-8601",
  "priority": "P3",
  "subject": "Deliver data export by EOD",
  "body": "...",
  "requires_response": true
}
```

---

## Inter-Org Flow Diagrams

### Joint Task Execution
```mermaid
sequenceDiagram
    participant CEO_A as CEO (Org A)
    participant FA_A as Fed Agent (Org A)
    participant FA_B as Fed Agent (Org B)
    participant Team_B as Internal Team (Org B)

    CEO_A->>FA_A: TASK — coordinate delivery with Org B
    FA_A->>FA_B: INTER-ORG TASK — deliver component X
    FA_B->>Team_B: TASK (internal) — build component X
    Team_B->>FA_B: REPORT — component X complete
    FA_B->>FA_A: INTER-ORG REPORT — delivery confirmed
    FA_A->>CEO_A: REPORT — joint task complete
```

### Inter-Org Conflict
```mermaid
sequenceDiagram
    participant FA_A as Fed Agent (Org A)
    participant FA_B as Fed Agent (Org B)
    participant COO_A as COO (Org A)
    participant COO_B as COO (Org B)

    FA_A->>FA_B: INTER-ORG TASK — extend deadline
    FA_B->>FA_A: INTER-ORG REPORT — cannot comply, conflict
    FA_A->>COO_A: ESCALATION — inter-org conflict
    FA_B->>COO_B: ESCALATION — inter-org conflict
    COO_A->>COO_B: NOTIFICATION — direct L5 negotiation
    COO_B->>COO_A: NOTIFICATION — resolution agreed
    COO_A->>FA_A: TASK — proceed with new terms
    COO_B->>FA_B: TASK — proceed with new terms
```

---

## Rules

1. **No org can issue OVERRIDEs to another org.** Sovereignty is absolute.
2. **No org can contact below the federation contact rank.** All inter-org comms go through the Federation Agent.
3. **Escalations stay internal.** An inter-org TASK failure becomes an internal escalation, not an inter-org one.
4. **Federation Agents repackage messages.** They never forward raw inter-org messages internally — they translate them into internal TASKs.
5. **Agreements expire.** All federations have an expiry date and must be renewed.
6. **OWNER is never exposed.** Inter-org comms never reach or reference the OWNER of either org.
