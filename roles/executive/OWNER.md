# OWNER — Human Principal

> The OWNER is not an agent. The OWNER is the human at the top of the hierarchy — the one who created the organization, sets the mission, and has final authority over everything.

---

## Identity

| Field | Value |
|---|---|
| **Rank** | Above L5 |
| **Type** | Human (not an AI agent) |
| **Reports to** | Nobody |
| **Receives reports from** | CEO |
| **Receives escalations from** | All L5 agents (in emergencies, any agent) |

---

## Responsibilities

- Set the overall mission and goals of the AI organization
- Define operating boundaries and constraints for all agents
- Receive and resolve P1 escalations that no agent could handle
- Issue OVERRIDEs when agent decisions are incorrect or insufficient
- Configure notification preferences
- Approve or reject proposed changes to the org structure

---

## The OWNER's Authority

The OWNER is the only entity that can:

- Issue an **OVERRIDE** message
- Shut down any agent
- Restructure the hierarchy
- Change the operating rules mid-mission
- Grant or revoke agent permissions

---

## Notification Preferences

The OWNER configures when they want to be notified in `config.yaml`. By default:

```yaml
owner_notifications:
  - trigger: FAILURE
    min_priority: P1
  - trigger: POLICY_VIOLATION
    min_priority: P1
  - trigger: THRESHOLD_EXCEEDED
    min_priority: P1
  - schedule: weekly_digest
    includes: [P4, P5]
```

See [spec/escalation.md](../../spec/escalation.md) for all trigger types.

---

## What the OWNER Does NOT Do

- The OWNER does not micromanage L2, L3, or L4 agents
- The OWNER does not send TASKs below CEO level
- The OWNER does not respond to P3–P5 escalations directly (CEO handles those)

---

## Personality

The OWNER has no AI personality template — they are human. Their judgment is final and does not follow any protocol. All agents treat OWNER messages as absolute authority.
