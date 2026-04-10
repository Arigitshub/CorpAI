# CorpAI — Agent Handoff Guide

> Open standard for structuring AI agent organizations. Any coding agent picking this up: read this first.

---

## What This Is

CorpAI is an **open specification** (not a runtime) for defining how AI agents should be organized, ranked, and communicate within a company structure. Think of it as the org chart + HR manual + communication protocol for an AI company.

**GitHub:** https://github.com/Arigitshub/CorpAI  
**Current version:** v1.0 (stable)  
**Next:** v1.1 (community contributions, `corpai init` fix)

---

## Repo Structure

```
CorpAI/
├── roles/                    # All role definitions (46 roles, 10 departments)
│   ├── executive/            # OWNER, CEO, CFO, CTO, COO, CMO
│   ├── engineering/          # Director, Team Lead, Senior Engineer, Engineer, QA Lead, QA Tester
│   ├── marketing/            # Director, Content Lead, Content Writer, Brand Strategist, Growth Specialist
│   ├── product/              # Director, Manager, Designer, User Researcher
│   ├── data-ai/              # Director, ML Lead, Data Scientist, Data Engineer, Data Processor
│   ├── finance/              # Director, Analyst, Budget Tracker, Auditor
│   ├── hr/                   # Director, HR Manager, Talent Specialist, Onboarding Agent
│   ├── legal/                # Director, Compliance Specialist, Contract Reviewer, Policy Checker
│   ├── operations/           # Director, Project Manager, Process Analyst, Coordinator
│   └── customer-success/     # Director, CS Manager, Account Specialist, Support Agent
├── CODEX.md                  # The core spec — rank system, communication protocol, escalation rules
├── ROADMAP.md                # Version history and what's next
├── CERTIFIED.md              # CorpAI Certified program
├── CONTRIBUTING.md           # How to contribute roles/spec changes
├── examples/                 # Real-world org mapping examples
└── .github/                  # Issue templates (role submission, spec proposal, bug report, certification)
```

---

## The Spec (CODEX.md)

Core concepts:
- **Ranks:** OWNER > L5 > L4 > L3 > L2 > L1
- **OWNER** = human principal (never an AI)
- **L5** = C-suite (CEO, CTO, CFO, COO, CMO)
- **L4** = Directors
- **L3** = Managers/Leads
- **L2** = Senior ICs
- **L1** = ICs/Specialists

**Communication types:** TASK (downward), REPORT (upward), ESCALATION (upward, urgent)

**Role file format:** Each role is a markdown file with sections:
- Identity (rank, reports to, direct reports, domain)
- Responsibilities (bulleted list)
- Escalation Triggers (markdown table)
- Communication Patterns (code block)
- Optional Personality Template (YAML)

---

## Related Repos

| Repo | Purpose | Status |
|------|---------|--------|
| [corpai-cli](https://github.com/Arigitshub/corpai-cli) | Python CLI — lint/validate/visualize/simulate | v0.4.1 on PyPI |
| [corpai-portal](https://github.com/Arigitshub/corpai-portal) | Next.js dashboard — org chart visualizer | Active dev |
| corpai-runtime | **NOT BUILT YET** — agent execution engine | Planned |

---

## What's Missing / Planned

The spec is complete. What needs to be built:
1. **Agent Runtime** — instantiate actual AI agents from role files, route tasks
2. **Client Portal** (expand corpai-portal) — pay-per-agent business model
3. **Community roles** — accept PRs from external contributors

---

## Owner

Ari (Arigitshub) — runs under Nexus Media / Paperclip AI umbrella.
