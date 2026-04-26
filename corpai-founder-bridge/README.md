# CorpAI Founder Bridge

Local bridge service that lets the founder mobile app talk to `Codex CLI` running on this computer.

This service is meant to run on the founder machine, not in public cloud infrastructure.

## What it does

- exposes a small local HTTP API
- accepts founder mission requests from the mobile app
- starts constrained `codex exec` runs on this PC
- returns run state, logs, and final summaries

## Why this exists

The mobile app should not run `Codex CLI` on-device.

The bridge keeps:

- execution on the developer machine
- secrets on the developer machine
- repository access on the developer machine
- phone usage focused on control, review, and orchestration

## API

- `GET /health`
- `GET /missions`
- `GET /missions/:id`
- `POST /missions`

All routes except `/health` require:

```text
Authorization: Bearer <BRIDGE_TOKEN>
```

## Supported mission templates

- `launch`
- `acquire`

These map to founder prompts that are safe to run in the `D:\CorpAI` workspace.

## Run

```bash
cd corpai-founder-bridge
copy .env.example .env.local
node --env-file=.env.local server.mjs
```

## Mock mode

Set:

```text
MOCK_CODEX=1
```

This simulates a successful Codex mission without running the real CLI. Use it first to test the phone-to-bridge loop.
