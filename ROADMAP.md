# CorpAI Roadmap

## Current Phase

CorpAI is in the `AgentOps` phase.

The goal is not to broaden the product surface. The goal is to win one wedge hard:

- technical teams already using coding agents
- one strong workflow proof
- audits -> pilots -> recurring control-plane revenue

## Phase 1: Sales Surface and Funnel

Completed:

- [x] reposition portal around `CorpAI AgentOps`
- [x] launch homepage, pricing, buy page, demo page, intake page, success page, and ROI page
- [x] deploy live portal to `https://corpai-standard-vos.surge.sh`
- [x] wire live Stripe payment links into the portal
- [x] create multi-scenario workflow simulation
- [x] create dedicated `PR Review AgentOps` proof page
- [x] create modeled ROI calculator for the PR review wedge

Remaining:

- [ ] configure Stripe payment links to return to `/success`
- [ ] tighten post-checkout conversion and intake flow

## Phase 2: Proof and Commercial Validation

Priority:

- [ ] close 3 paid `AgentOps Audit` engagements
- [ ] convert the best audit buyers into `Managed Pilot` customers
- [ ] replace modeled proof with real pilot proof
- [ ] publish one quantified case study
- [ ] publish one customer-backed ROI story

## Phase 3: Product Moat

Priority:

- [ ] build provider-agnostic runtime layer
- [ ] standardize runtime contract across Codex CLI, Gemini CLI, Claude Code, OpenRouter, and direct APIs
- [ ] add routing and fallback engine
- [ ] add first-class approval engine
- [ ] persist audit logs, usage, and artifacts
- [ ] connect billing and entitlement logic to product access

## Phase 4: Workflow Expansion

Only after the wedge converts:

- [ ] expand `PR Review AgentOps` into repeatable workflow packs
- [ ] add bugfix workflow pack
- [ ] add migration workflow pack
- [ ] add incident-triage workflow pack

## Phase 5: Control Plane Productization

- [ ] convert managed service learnings into a repeatable hosted control-plane product
- [ ] support recurring subscriptions with stronger activation and onboarding flows
- [ ] support enterprise BYOK on top of the control plane

## Source Documents

The roadmap should be interpreted through these docs:

- `docs/BOARD_DECISION_2026-04-12.md`
- `docs/STATUS.md`
- `docs/HANDOFF.md`
- `docs/CATEGORY_BRIEF.md`
- `docs/OFFER_ARCHITECTURE.md`
- `docs/RUNTIME_CONTRACT.md`
