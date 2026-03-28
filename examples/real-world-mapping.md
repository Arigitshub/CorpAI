# Real-World Role Mapping

> Optional reference: how CorpAI agent roles map to real human job titles and responsibilities.

This doc is for orientation — it's not part of the core spec. Use it to help design your AI org by analogy.

---

## Executive Layer

| CorpAI Role | Real-World Equivalent | What They Actually Do |
|---|---|---|
| OWNER | Founder / Board | Sets mission, has final say, rarely in day-to-day |
| CEO | CEO | Owns strategy, coordinates execs, answers to founder |
| CFO | CFO / Finance Director | Watches money, approves spend, flags overruns |
| CTO | CTO / VP Engineering | Owns tech stack, architecture, engineering team |
| COO | COO / Head of Operations | Makes sure the machine runs — processes, capacity, delivery |
| CMO | CMO / VP Marketing | Brand, growth, messaging, campaigns |

---

## What AI Agents Can Replace (or Augment)

| Human Role | AI Agent Equivalent | Notes |
|---|---|---|
| Project Manager | L3 Manager agent | Tracks tasks, routes work, reports up |
| Software Engineer | L2 Specialist (Engineering) | Writes, reviews, tests code |
| Data Analyst | L2 Specialist (Data) | Queries, interprets, summarizes data |
| Content Writer | L1–L2 Operator/Specialist (Marketing) | Drafts content to spec |
| QA Tester | L1 Operator (Engineering) | Runs test suites, reports failures |
| Customer Support | L1 Operator (Customer Success) | Handles tier-1 queries |
| Legal Reviewer | L2 Specialist (Legal) | Flags compliance issues |
| HR Coordinator | L3 Manager (HR) | Manages agent onboarding, policy enforcement |

---

## How Decisions Flow in a Real Company vs CorpAI

| Scenario | Real Company | CorpAI |
|---|---|---|
| New product feature | CEO → CTO → Engineering team | CEO sends TASK to CTO, CTO delegates to L4 Director |
| Budget overrun | Finance alerts CFO, CFO tells CEO | CFO sends P1 ESCALATION to CEO |
| Critical bug in production | Engineer → Team Lead → CTO | L1 sends ESCALATION to L3, L3 to CTO, CTO to CEO |
| Weekly status update | Department heads email CEO | All L5s send P5 REPORT digest to CEO |
| Emergency decision needed | Manager calls CEO directly | L3 skips to L5 via P1 skip-rank escalation |

---

## Mapping Your Own Organization

To map your existing structure to CorpAI:

1. List all human roles in your org
2. Assign each an L1–L5 rank based on authority level
3. Map reporting lines to CorpAI's chain-of-command rules
4. Identify which roles could be handled by AI agents today
5. Define escalation triggers for each agent role
6. Configure `corpai.config.yaml` with your notification preferences
