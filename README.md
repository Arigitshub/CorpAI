# CorpAI

[![Version](https://img.shields.io/badge/version-v1.0-brightgreen?style=flat-square)](CHANGELOG.md)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![PyPI](https://img.shields.io/pypi/v/corpai?style=flat-square)](https://pypi.org/project/corpai/)
[![Stars](https://img.shields.io/github/stars/Arigitshub/CorpAI?style=flat-square)](https://github.com/Arigitshub/CorpAI/stargazers)
[![CorpAI Compatible](https://img.shields.io/badge/CorpAI-Compatible-0a0a0a?style=flat-square)](BADGE.md)

**The open standard for AI agent organizations** — define, validate, and deploy AI teams with ranked roles, communication protocols, and escalation rules.

No framework lock-in. No library required. Just markdown — implementable in any language, on any platform, with any LLM.

---

## Get Started in 3 Steps

```bash
# 1. Install the CLI
pip install corpai

# 2. Clone the spec
git clone https://github.com/Arigitshub/CorpAI && cd CorpAI

# 3. Validate and explore
corpai lint          # validate all 46 roles
corpai graph         # visualize the org tree
corpai info          # org summary
```

---

## The Hierarchy

```mermaid
graph TD
    OWNER["OWNER — Human Principal"]
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

Full charts → [spec/diagrams/org-chart.md](spec/diagrams/org-chart.md)

---

## Why CorpAI

- **Language-agnostic** — the spec is markdown. Implement it in Python, TypeScript, Go, or whatever you ship in.
- **Production-ready structure** — 46 defined roles across 10 departments, with ranks (L1–L5), escalation rules, and cross-department protocols baked in.
- **CLI-validated** — `corpai lint` catches broken chains, missing fields, and spec violations before you deploy.

---

## The Ecosystem

| Repo | What it is |
|---|---|
| [CorpAI](https://github.com/Arigitshub/CorpAI) | The spec — this repo |
| [corpai-cli](https://github.com/Arigitshub/corpai-cli) | CLI to lint, visualize, simulate (`pip install corpai`) |
| [corpai-runtime](https://github.com/Arigitshub/corpai-runtime) | Provider-agnostic agent execution engine |
| [corpai-portal](https://github.com/Arigitshub/corpai-portal) | Interactive org chart dashboard |

---

## What's in the Spec

| File | What it defines |
|---|---|
| [spec/ranks.md](spec/ranks.md) | L1–L5 rank system |
| [spec/communication.md](spec/communication.md) | Message types, format, priority levels |
| [spec/escalation.md](spec/escalation.md) | Escalation triggers and OWNER notifications |
| [spec/lifecycle.md](spec/lifecycle.md) | Agent lifecycle: Proposed → Active → Decommissioned |
| [spec/cross-department.md](spec/cross-department.md) | How departments interact |
| [spec/multi-org.md](spec/multi-org.md) | Federation protocol for inter-org communication |
| [spec/message-examples.md](spec/message-examples.md) | Real message examples |
| [spec/glossary.md](spec/glossary.md) | Every term, defined |

### Roles (46 defined across 10 departments)

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

---

## Implementing CorpAI?

Add the badge to your repo → [BADGE.md](BADGE.md)  
Apply for CorpAI Certified status → [CERTIFIED.md](CERTIFIED.md)

---

## Contributing

PRs and proposals welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to add roles, propose spec changes, or submit a certified implementation.

[GitHub Discussions](../../discussions) — questions, ideas, proposals
