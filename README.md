# CorpAI

> The open standard for AI agent organizations — a corporate hierarchy for your AI workforce, defining how agents delegate, communicate, and escalate.

[![CorpAI Compatible](https://img.shields.io/badge/CorpAI-Compatible-0a0a0a?style=flat-square)](BADGE.md)
[![MIT License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Version](https://img.shields.io/badge/version-v1.0-green?style=flat-square)](ROADMAP.md)
[![Roles](https://img.shields.io/badge/roles-46%2B-purple?style=flat-square)](roles/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![corpai CLI](https://img.shields.io/badge/CLI-corpai-orange?style=flat-square)](https://github.com/Arigitshub/corpai-cli)

---

## Imagine you have an AI company.

Not a chatbot. Not a single agent. A **full organization** — with a CEO that sets direction, a CTO that owns architecture, a CFO watching the budget, and dozens of specialized agents executing below them.

Who tells who what to do?
How does a failure at L1 reach the OWNER?
What does a cross-department request actually look like?
When does a task become an escalation?
What happens when two AI orgs need to work together?

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

    CFO --> Finance["Finance\nDirector → Analyst → Auditor → Tracker"]
    CTO --> Engineering["Engineering\nDirector → Lead → Engineer → QA"]
    CTO --> Security["Security\nDirector → Manager → Analyst → Monitor"]
    CTO --> DataAI["Data/AI\nDirector → ML Lead → Scientist → Engineer"]
    COO --> Operations["Operations\nDirector → PM → Analyst → Coordinator"]
    COO --> HR["HR\nDirector → Manager → Specialist → Onboarding"]
    COO --> CS["Customer Success\nDirector → Manager → Specialist → Support"]
    CMO --> Marketing["Marketing\nDirector → Content → Writer → Growth"]
    CEO --> Legal["Legal\nDirector → Compliance → Contract → Policy"]
```

> Full department charts → [spec/diagrams/org-chart.md](spec/diagrams/org-chart.md)

---

## Quick Start

```bash
# Install the CLI
pip install corpai

# Validate any CorpAI org
git clone https://github.com/Arigitshub/CorpAI
cd CorpAI

corpai lint                                              # validate all roles
corpai graph                                             # ASCII org tree
corpai simulate --from CEO --to "QA Tester" --priority P2   # trace a message
corpai info                                              # org summary
```

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
| [spec/multi-org.md](spec/multi-org.md) | Federation protocol for inter-org communication |
| [spec/message-examples.md](spec/message-examples.md) | Real message examples for every type |
| [spec/glossary.md](spec/glossary.md) | Every term, defined |
| [spec/faq.md](spec/faq.md) | Common questions answered |

### Roles (46 defined)
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

### Templates & Resources
| File | What it's for |
|---|---|
| [templates/role-template.md](templates/role-template.md) | Create a new role |
| [templates/config-example.md](templates/config-example.md) | Configure your org |
| [examples/real-world-mapping.md](examples/real-world-mapping.md) | Map real jobs to CorpAI roles |
| [CERTIFIED.md](CERTIFIED.md) | CorpAI Certified program |
| [CHANGELOG.md](CHANGELOG.md) | Version history |

---

## CorpAI CLI

The official validator and tooling for this spec:

```bash
pip install corpai
```

| Command | What it does |
|---|---|
| `corpai lint` | Validates all role files — 11 checks + cross-role chain verification |
| `corpai graph` | ASCII tree or Mermaid org chart, filter by dept |
| `corpai simulate` | Traces every hop a TASK or ESCALATION makes |
| `corpai info` | Org summary — roles, departments, rank distribution |

→ [Arigitshub/corpai-cli](https://github.com/Arigitshub/corpai-cli)

---

## CorpAI Compatible

Implementing this spec? Add the badge to your repo → [BADGE.md](BADGE.md)

Want CorpAI Certified status? → [CERTIFIED.md](CERTIFIED.md)

---

## Roadmap

- [x] v0.1 — Executive layer + core spec
- [x] v0.2 — All 9 departments (46 roles)
- [x] v0.3 — Agent lifecycle + cross-department flows
- [x] v0.4 — CLI validator tooling (`pip install corpai`)
- [x] v1.0 — Multi-org spec, glossary, FAQ, message examples, issue templates, certified program, changelog

Full roadmap → [ROADMAP.md](ROADMAP.md)

---

## Community

- [GitHub Discussions](../../discussions) — questions, proposals, ideas
- [CONTRIBUTING.md](CONTRIBUTING.md) — add roles, departments, spec improvements
- [Issue Templates](.github/ISSUE_TEMPLATE/) — role submissions, spec proposals, bug reports, certifications
