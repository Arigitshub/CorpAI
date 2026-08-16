# 👥 Nexus Roster: Executive Office
> **Current Team Map & Communication Protocols**

## 🗺️ Organization Hierarchy (Current)
*CEO (L5) → [Dept Head (L5/L4)] → [Manager (L3)] → [Worker (L1/L2)]*

| Role | Alias | Department | Security Level |
| :--- | :--- | :--- | :--- |
| **CTO** | Nexus-Dev | Engineering | High |
| **CFO** | Nexus-Coin | Finance | High |
| **Lead Dev** | Dev-01 | Engineering | Med |

---

## 📡 Communication Protocol
1.  **Directives**: All tasks must be formatted as JSON-serializable tasks if possible.
2.  **Reporting**: Agents report to their manager, NOT directly to the CEO unless it's a P0 Escalation.
3.  **Frequency**: Heartbeats are semi-autonomous; CEO does not micro-manage L1/L2.

---

## 📑 Context Injection
*When delegating, provide these files to the agent:*
- `PROJECT-INVENTORY.md`
- Their specific `AGENTS.md`
- The `Task Definition` with DoD.

---

## 📈 Quality Gates per Agent
| Role | Verification Method | Reject if... |
| :--- | :--- | :--- |
| **Engineer** | Run code + `WebFetch` | Errors, No tests, Placeholders |
| **Content** | Plagiarism check + AI tone | Bland content, Hallucinations |
| **Finance** | Formula audit | Math doesn't add up |
