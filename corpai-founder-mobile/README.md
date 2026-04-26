# CorpAI Founder Mobile

Internal founder-facing Android app for exploring two modes:

- start a new company
- take over and modernize an existing company

This app is not the public buyer-facing product. It is an internal operator surface for the founder to stress-test decisions, workflows, and AgentOps-backed execution ideas.

## Why it exists

The public CorpAI site sells `AgentOps`.

This mobile app is the founder cockpit:

- simulate company paths
- compare launch vs acquisition decisions
- stage Codex-backed missions
- review risk, leverage, and cash posture
- feel what the operator experience should be before wider productization

## Codex CLI position

The app is designed to be **powered by Codex CLI through CorpAI**, not by running Codex CLI directly on-device.

The intended architecture is:

1. mobile app sends a mission request
2. CorpAI runtime broker selects the right adapter
3. Codex CLI or another approved runtime executes server-side
4. result, approvals, and artifacts stream back to the mobile app

This keeps secrets, repos, approvals, and audit logs off the handset.

Current local bridge workspace:

- `..\corpai-founder-bridge`

Use that service when you want the phone to talk to the machine running `Codex CLI`.

## Screens

- `Path`: choose `Launch New` or `Acquire Existing`
- `Briefing`: see interactive scorecards, cash posture, and pressure points
- `Missions`: stage Codex-backed execution plans
- `Board`: review board guidance, risks, and next moves

## Run

```bash
cd corpai-founder-mobile
npm install
npm run start
```

For Android:

```bash
npm run android
```

## Current state

- rich front-end prototype
- local mocked data
- Codex execution model represented in UI
- not yet connected to live AgentOps runtime, leads DB, or approval engine
