# CorpAI Config Example

> Copy this file to your project as `corpai.config.yaml` and customize it.

---

## Full Config Reference

```yaml
# corpai.config.yaml

# ─────────────────────────────────────────
# Organization identity
# ─────────────────────────────────────────
org:
  name: "My AI Company"
  version: "0.1"
  corpai_spec_version: "0.1"

# ─────────────────────────────────────────
# Custom rank names (optional)
# Numeric levels are canonical — names are display only
# ─────────────────────────────────────────
ranks:
  L5: Executive      # default
  L4: Director       # default
  L3: Manager        # default
  L2: Specialist     # default
  L1: Operator       # default

# ─────────────────────────────────────────
# Owner notification preferences
# ─────────────────────────────────────────
owner_notifications:
  - trigger: FAILURE
    min_priority: P1
    from_ranks: [L5]

  - trigger: POLICY_VIOLATION
    min_priority: P1
    from_ranks: [L1, L2, L3, L4, L5]

  - trigger: THRESHOLD_EXCEEDED
    min_priority: P1
    from_ranks: [L5]

  - trigger: ANOMALY
    min_priority: P2
    from_ranks: [L4, L5]

  # Weekly digest — batches P4 and P5 messages
  - schedule: weekly_digest
    day: monday
    time: "09:00"
    includes: [P4, P5]

# ─────────────────────────────────────────
# Department activation
# Uncomment departments as you add their roles
# ─────────────────────────────────────────
departments:
  executive: true
  # engineering: false
  # finance: false
  # marketing: false
  # operations: false
  # legal: false
  # hr: false
  # security: false
  # data_ai: false
  # customer_success: false

# ─────────────────────────────────────────
# Escalation settings
# ─────────────────────────────────────────
escalation:
  # Allow agents to skip ranks in P1 emergencies
  skip_rank_on_p1: true

  # Max escalation chain length before OWNER is auto-notified
  max_chain_length: 4

  # Timeout before an unresponded escalation auto-escalates up
  escalation_timeout_minutes: 30

# ─────────────────────────────────────────
# Communication settings
# ─────────────────────────────────────────
communication:
  # Require all tasks to have an explicit priority set
  require_priority: true

  # Default priority if not specified
  default_priority: P3

  # Require a REPORT for every TASK
  require_report: true
```
