# Founder Directive: Continue CorpAI

Date: 2026-04-28
Priority: P1
Owner: CorpAI CEO

## Directive

Continue CorpAI from the current AgentOps direction. Do not resume the old trading-company path. The current business is:

`CorpAI AgentOps: the control plane for governed AI agent execution.`

The team must start from:

- `D:\CorpAI\docs\STATUS.md`
- `D:\CorpAI\docs\HANDOFF.md`
- `D:\CorpAI\README.md`
- `D:\CorpAI\docs\BOARD_DECISION_2026-04-12.md`
- `D:\daily vinkel\CORPAI-HANDOFF.md`

## Required Team Response

Before implementation, each lead must report:

- what they will continue
- what files/repos they will touch
- blockers
- estimated time to done
- validation they will run

## Assignments

### CEO

Coordinate the continuation plan and keep the public direction narrow:

- AgentOps control plane
- PR Review AgentOps wedge
- audits -> pilots -> hosted control plane
- DailyVinkel as the free test-company proof path

Expected ETA to planning response: 30-45 minutes.

### CTO / Engineering

Continue technical work from the active docs and dirty worktrees:

- inspect `corpai-portal`, `corpai-intake-service`, `corpai-founder-mobile`, `corpai-founder-bridge`, and `corpai-cli`
- identify which changes are user work vs. repo work before editing
- preserve the live portal and intake Worker behavior
- provide a build/test matrix before changes

Expected ETA to technical estimate: 45-90 minutes.

### Product / COO

Convert the current handoff into a near-term execution order:

1. DailyVinkel v1 polish and secret-rotation coordination
2. CorpAI proof surface improvements
3. Founder mobile/bridge next integration
4. first real AgentOps runtime loop beyond simulation

Expected ETA to execution estimate: 30-60 minutes.

### CMO / Sales

Keep the buyer story aligned:

- do not broaden into generic AI platform language
- keep the first buyer lane technical teams already using coding agents
- improve proof only where it supports audit, pilot, or hosted-control-plane conversion

Expected ETA to GTM estimate: 30-60 minutes.

### Security / Compliance

Review the DailyVinkel and CorpAI secret notes:

- old `collive-reimagined` Stripe/Supabase/Clerk keys must be rotated because `.env` existed in git history
- no secrets should be pasted into docs, comments, or browser prompts
- verify `.env.example` only contains placeholders

Expected ETA to security estimate: 30-60 minutes after dashboard access is available.

## Current Rough Timeline

- DailyVinkel polish plus secret-rotation coordination: 0.5-1 day after dashboard access.
- CorpAI portal/proof surface improvements: 1-2 days.
- Founder bridge/mobile next integration pass: 1-2 days.
- First credible real AgentOps runtime loop beyond simulation: 3-7 days.

## Definition Of Done For This Directive

- CEO posts a short continuation plan.
- CTO posts repo-specific ETA and validation plan.
- Product/COO posts execution order.
- CMO posts GTM/proof ETA.
- Security posts secret-rotation status and blockers.
- All estimates must include assumptions and blockers.
