# Founder Bridge Plan

Date: 2026-04-12

## Decision

The founder mobile app should connect to a local bridge service running on the founder machine.

The bridge should own `Codex CLI` execution.

The phone should remain a control surface.

## Current implementation

New local service:

- `corpai-founder-bridge`

Routes:

- `GET /health`
- `GET /missions`
- `GET /missions/:id`
- `POST /missions`

Security:

- bearer token required for all routes except `/health`

Execution:

- constrained founder mission templates
- local `codex exec` path
- mock mode available for first-time testing

## Why this is the right model

This preserves the main CorpAI thesis:

- local and governed execution
- provider-agnostic runtime brokering
- operator review from a remote surface

It also avoids the wrong architecture:

- no CLI on the phone
- no repo secrets on the phone
- no direct filesystem access from the phone

## Immediate next steps

1. start the bridge locally in mock mode
2. point the app to the PC LAN IP
3. verify mission create + mission polling from the app
4. then disable mock mode and test one real Codex mission
