# Changelog

All notable changes to the CorpAI standard are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [v0.3.1] — 2026-03-28

### Fixed
- `roles/data-ai/data-processor.md` — "Reports to" corrected to single role (Data Engineer)

---

## [v0.3.0] — 2026-03-28

### Added
- `spec/lifecycle.md` — Full agent lifecycle state machine (Proposed → Configured → Active → Suspended → Decommissioned) with ownership matrix
- `spec/cross-department.md` — Inter-department interaction spec with Mermaid sequence diagrams (product launch, security incident, budget approval, agent onboarding)

---

## [v0.2.0] — 2026-03-28

### Added
- **Engineering department** — Director, Team Lead, Senior Engineer, Engineer, QA Lead, QA Tester (6 roles)
- **Finance department** — Director, Financial Analyst, Auditor, Budget Tracker (4 roles)
- **Marketing department** — Director, Content Lead, Growth Specialist, Brand Strategist, Content Writer (5 roles)
- **Operations department** — Director, Project Manager, Process Analyst, Coordinator (4 roles)
- **Legal department** — Director, Compliance Specialist, Contract Reviewer, Policy Checker (4 roles)
- **HR department** — Director, HR Manager, Talent Specialist, Onboarding Agent (4 roles)
- **Security department** — Director, Security Manager, Threat Analyst, Monitor Agent (4 roles)
- **Data/AI department** — Director, ML Lead, Data Scientist, Data Engineer, Data Processor (5 roles)
- **Customer Success department** — Director, CS Manager, Account Specialist, Support Agent (4 roles)
- `spec/diagrams/org-chart.md` updated with all 9 department Mermaid charts

---

## [v0.1.0] — 2026-03-28

### Added
- `CODEX.md` — founding philosophy and core principles
- `spec/ranks.md` — L1–L5 rank system with custom tier support
- `spec/communication.md` — message types, format, priority levels (P1–P5), Mermaid flow diagrams
- `spec/escalation.md` — escalation triggers, owner notification config
- `spec/diagrams/org-chart.md` — initial executive org chart
- **Executive layer** — OWNER, CEO, CFO, CTO, COO, CMO (6 roles)
- `templates/role-template.md` — standard template for new roles
- `templates/config-example.md` — full `corpai.config.yaml` reference
- `examples/real-world-mapping.md` — mapping human jobs to CorpAI roles
- `CONTRIBUTING.md` — role submission process and PR template
- `ROADMAP.md` — v0.1 → v1.0 milestones
- `BADGE.md` — CorpAI Compatible badge
- `_config.yml` — GitHub Pages (Cayman theme)
- `.github/PULL_REQUEST_TEMPLATE.md`
- MIT license
