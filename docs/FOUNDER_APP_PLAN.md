# CorpAI Founder App Plan

Date: 2026-04-12

## Purpose

Build an internal Android-first founder cockpit that helps answer one question:

`Should I start a new company or take over an existing one, and what should CorpAI execute next?`

This is not the public product surface. It is an internal operator tool for the founder.

## Product shape

App name:

- `CorpAI Founder`

Primary user:

- the founder / operator

Core modes:

- `Launch New`
- `Acquire Existing`

Core feeling:

- interactive
- sharp
- cinematic
- useful in five minutes
- grounded in real execution, not motivational fluff

## Why this is worth building

The portal sells AgentOps to buyers.

The founder app makes the internal operating loop tangible:

- mission planning
- scenario comparison
- board-style guidance
- Codex-backed execution requests
- eventual approvals and runtime review from mobile

It also gives CorpAI a higher-fidelity internal dogfood surface before external productization.

## Codex CLI architecture

The app should not run `Codex CLI` on-device.

The correct model is:

1. mobile app creates a mission
2. CorpAI broker sends that mission to the appropriate runtime
3. `Codex CLI`, `Gemini CLI`, or another adapter executes server-side
4. the app receives:
   - status
   - summary
   - approvals required
   - artifact links
   - next actions

This keeps:

- repo access off the phone
- secrets off the phone
- governance centralized
- audit logs intact

## Current prototype

New internal app scaffold:

- `corpai-founder-mobile`

Current screens:

- `Path`
- `Briefing`
- `Missions`
- `Board`

Current data model:

- local mocked state only

Current status:

- visual front-end prototype complete
- Android-first Expo scaffold complete
- runtime path described but not wired

## Next build steps

1. add live mission submission to a CorpAI broker endpoint
2. add authentication for founder-only access
3. add mission history and artifact timeline
4. add approval inbox
5. add company takeover checklist and scoring model
6. add launch wedge builder tied to real CorpAI docs and runtime prompts

## Constraint

Do not let this app dilute the main business.

The public category remains:

- `CorpAI AgentOps`

The founder app is an internal operator surface, not a second market category.
