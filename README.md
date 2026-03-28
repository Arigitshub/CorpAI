# CorpAI

> The open standard for AI agent organizations — a corporate hierarchy for your AI workforce, defining how agents delegate, communicate, and escalate.

[![CorpAI Compatible](https://img.shields.io/badge/CorpAI-Compatible-0a0a0a?style=flat-square)](BADGE.md)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v0.3-green?style=flat-square)](ROADMAP.md)
[![Roles](https://img.shields.io/badge/roles-40%2B-purple?style=flat-square)](roles/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

---

## Imagine you have an AI company.

Not a chatbot. Not a single agent. A **full organization** — with a CEO that sets direction, a CTO that owns architecture, a CFO watching the budget, and dozens of specialized agents executing below them.

Who tells who what to do?
How does a failure at L1 reach the OWNER?
What does a cross-department request actually look like?
When does a task become an escalation?

**CorpAI answers all of that.**

It's not a framework. It's not a library. It's an **open standard** — written in markdown, designed to be implemented in any language, on any platform, with any LLM.

---

## The Hierarchy

```mermaid
graph TD
    OWNER["👤 OWNER — Human Principal"]
    CEO["[L5] CEO"]
    CFO["[L5] CFO"]
    CTO["[L5] CTO"]
    COO["[L5] COO"]
    CMO["[L5] CMO"]

    OWNER --> CEO
    CEO --> CFO & CTO & COO & CMO

    CFO --> Finance["Finance Dept\nDirector → Analyst → Auditor → Tracker"]
    CTO --> Engineering["Engineering Dept\nDirector → Team Lead → Engineer → QA"]
    CTO --> Security["Security Dept\nDirector → Manager → Analyst → Monitor"]
    CTO --> DataAI["Data/AI Dept\nDirector → ML Lead → Scientist → Engineer"]
    COO --> Operations["Operations Dept\nDirector → PM → Analyst → Coordinator"]
    COO --> HR["HR Dept\nDirector → Manager → Specialist → Onboarding"]
    COO --> CS["Customer Success\nDirector → Manager → Specialist → Support"]
    CMO --> Marketing["Marketing Dept\nDirector → Content Lead → Writer → Growth"]
    CEO --> Legal["Legal Dept\nDirector → Compliance → Contract → Policy"]
```

> Full department charts → [spec/diagrams/org-chart.md](spec/diagrams/org-chart.md)

---

## What's Inside

### Core Spec
| File | What it defines |
|---|---|
| [CODEX.md](CODEX.md) | The founding philosophy |
| [spec/ranks.md](spec/ranks.md) | L1–L5 rank system with custom tier support |
| [spec/communication.md](spec/communication.md) | Message types, format, priority levels |
| [spec/escalation.md](spec/escalation.md) | Escalation triggers and OWNER notifications |
| [spec/lifecycle.md](spec/lifecycle.md) | Agent lifecycle: Proposed → Active → Decommissioned |
| [spec/cross-department.md](spec/cross-department.md) | How departments interact and coordinate |

### Roles (40+ defined)
| Department | Roles |
|---|---|
| [Executive](roles/executive/) | OWNER, CEO, CFO, CTO, COO, CMO |
| [Engineering](roles/engineering/) | Director, Team Lead, Senior Engineer, Engineer, QA Lead, QA Tester |
| [Finance](roles/finance/) | Director, Financial Analyst, Auditor, Budget Tracker |
| [Marketing](roles/marketing/) | Director, Content Lead, Growth Specialist, Brand Strategist, Content Writer |
| [Operations](roles/operations/) | Director, Project Manager, Process Analyst, Coordinator |
| [Legal](roles/legal/) | Director, Compliance Specialist, Contract Reviewer, Policy Checker |
| [HR](roles/hr/) | Director, HR Manager, Talent Specialist, Onboarding Agent |
| [Security](roles/security/) | Director, Security Manager, Threat Analyst, Monitor Agent |
| [Data/AI](roles/data-ai/) | Director, ML Lead, Data Scientist, Data Engineer, Data Processor |
| [Customer Success](roles/customer-success/) | Director, CS Manager, Account Specialist, Support Agent |

### Templates & Examples
| File | What it's for |
|---|---|
| [templates/role-template.md](templates/role-template.md) | Create a new role |
| [templates/config-example.md](templates/config-example.md) | Configure your org |
| [examples/real-world-mapping.md](examples/real-world-mapping.md) | Map real jobs to CorpAI roles |

---

## Quick Start

1. Read the [CODEX.md](CODEX.md)
2. Understand the [rank system](spec/ranks.md)
3. Browse [roles/](roles/) for your departments
4. Configure your org with [templates/config-example.md](templates/config-example.md)
5. Use [spec/communication.md](spec/communication.md) to wire up agent messaging
6. Set up escalation rules in [spec/escalation.md](spec/escalation.md)

---

## CorpAI Compatible

Implementing this spec? Add the badge → [BADGE.md](BADGE.md)

---

## Roadmap

- [x] v0.1 — Executive layer + core spec
- [x] v0.2 — All 9 departments (40+ roles)
- [x] v0.3 — Agent lifecycle + cross-department flows
- [ ] v0.4 — CLI validator tooling
- [ ] v1.0 — Stable standard + reference implementations

Full roadmap → [ROADMAP.md](ROADMAP.md)

---

## Community

- [GitHub Discussions](../../discussions) — questions, proposals, ideas
- [CONTRIBUTING.md](CONTRIBUTING.md) — add roles, departments, spec improvements
