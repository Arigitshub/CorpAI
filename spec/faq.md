# CorpAI FAQ

> Common questions about the CorpAI standard.

---

## General

### What is CorpAI?
CorpAI is an open standard for structuring AI agent organizations. It defines how agents are ranked, how they communicate, how they delegate and escalate, and how humans stay in control. Think of it as an employee handbook and org chart for your AI workforce.

### Is CorpAI a framework or a library?
Neither. It's a **specification** — a set of markdown documents that define structure and protocol. You implement it in whatever language, platform, or LLM stack you choose.

### Does CorpAI require a specific LLM?
No. CorpAI is LLM-agnostic. You can implement it with Claude, GPT-4, open-source models, or any other system. The spec defines behavior, not technology.

### Can I use CorpAI with a single agent?
Technically yes, but CorpAI is designed for multi-agent systems. If you have one agent, you don't need a hierarchy spec.

---

## Structure

### Why is there an OWNER above the CEO?
The OWNER is the human principal — the person who created and controls the AI organization. CEOs make strategic decisions, but the OWNER has final authority, can issue OVERRIDEs, and is the ultimate escalation destination. This keeps humans in the loop by design.

### Does every role need to be filled?
No. CorpAI defines roles that *can* exist. Your org only needs the roles that make sense for your use case. You can run a functional CorpAI org with just an OWNER, CEO, and a few L1 Operators.

### Can I add custom roles?
Yes — that's what the role template and CONTRIBUTING.md are for. Any role that follows the spec format and has a valid rank and reporting chain is valid.

### Can I rename the ranks?
Yes. The numeric levels (L1–L5) are canonical, but you can give them custom names (e.g., "Principal" for L5) using the config file. See [templates/config-example.md](../templates/config-example.md).

---

## Communication

### What's the difference between ESCALATION and NOTIFICATION?
A **NOTIFICATION** is informational — it doesn't require the recipient to act. An **ESCALATION** means "I cannot proceed without your help" — it requires a response and blocks the escalating agent.

### Can an agent skip levels when escalating?
Only in P1 (critical) emergencies. In all other cases, agents escalate one level at a time through the chain of command.

### What happens if a TASK never gets a REPORT?
Per the spec, every TASK must receive a REPORT. If an agent cannot complete a task, they must ESCALATE — never silently abandon. Silence is a spec violation.

### Can two agents at the same rank communicate directly?
Direct peer communication isn't explicitly defined in the spec for standard operations. Cross-department comms go through L4+ directors. Within a department, Team Leads coordinate directly. When in doubt, route through the chain.

---

## Implementation

### How do I implement this with an actual LLM?
1. Parse the role `.md` files to extract each agent's responsibilities and escalation rules
2. Use the personality template YAML as a system prompt modifier
3. Implement the message format for inter-agent communication
4. Wire up escalation logic: if an agent hits a trigger condition, generate an ESCALATION message
5. Implement the OWNER notification layer based on your `corpai.config.yaml`

### Is there a reference implementation?
Not yet — that's coming in v1.0. If you build one, submit it via [GitHub Discussions](https://github.com/Arigitshub/CorpAI/discussions).

### Can I validate my org against the spec?
Yes — install the CLI: `pip install corpai` then run `corpai lint`. See [corpai-cli](https://github.com/Arigitshub/corpai-cli).

---

## Contributing

### How do I add a new role?
Copy [templates/role-template.md](../templates/role-template.md), fill in all fields, place it in the correct `roles/{department}/` folder, and submit a PR. See [CONTRIBUTING.md](../CONTRIBUTING.md).

### How do I propose a change to the spec?
Open a GitHub issue first. Spec changes require community discussion before a PR is accepted.

### What is CorpAI Certified?
A quality badge for role definitions that have been reviewed and approved by CorpAI maintainers as exemplary, well-documented, and spec-compliant. Coming in v1.0.
