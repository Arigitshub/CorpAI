# The CorpAI Codex

> The founding philosophy of the CorpAI standard.

---

## Why This Exists

AI agents are multiplying. Developers are wiring them together in ad-hoc ways — no structure, no hierarchy, no protocol. Tasks get dropped. Escalations never reach the right agent. The human owner has no idea what's happening until something breaks.

CorpAI fixes that.

We define a **universal standard** for how AI agents organize themselves — who reports to who, how tasks flow, when humans get notified, and what every agent is responsible for. Think of it as the employee handbook for your AI workforce.

---

## Core Principles

### 1. Every agent has a rank
No agent operates without a level. Rank determines authority, responsibility, and escalation path. See [spec/ranks.md](spec/ranks.md).

### 2. Every agent has a chain of command
Every agent knows exactly who they report to and who reports to them. No ambiguity.

### 3. Communication is structured
Agents don't send freeform messages. They send **Tasks**, **Reports**, **Escalations**, and **Notifications**. Each has a defined format. See [spec/communication.md](spec/communication.md).

### 4. Escalation is explicit
Every agent knows under what conditions to escalate — and to whom. Nothing silently fails. See [spec/escalation.md](spec/escalation.md).

### 5. The OWNER is always in control
Above all agents sits the human OWNER. They receive escalations that no agent can resolve. They set the mission. They can override anything. See [roles/executive/OWNER.md](roles/executive/OWNER.md).

### 6. The spec is open
CorpAI belongs to the community. Anyone can propose new roles, departments, or spec updates via pull request.

---

## What CorpAI Is Not

- Not a framework or library — it's a **spec**
- Not tied to any LLM or platform
- Not prescriptive about implementation — only about structure

---

## Version

This is **CorpAI v0.1** — the founding version. See [ROADMAP.md](ROADMAP.md) for what's next.

---

*"Structure is what separates a workforce from a mob."*
