# Intake Backend Setup

This is the current board-approved intake backend direction for CorpAI.

## Decision

Use:

- static portal on Surge
- one tiny external write service
- Turso for persistence

Do not expand this into a larger backend rewrite yet.

## Current shape

Portal:

- `corpai-portal`
- public intake page posts to `NEXT_PUBLIC_INTAKE_ENDPOINT` when configured
- if no intake endpoint is configured, the portal falls back to the existing static-safe email/copy flow

Service:

- `corpai-intake-service`
- `POST /intake`
- `GET /health`

Database:

- Turso database: `corpai-intake`
- URL: `libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io`

## Required portal env

In `corpai-portal`:

```bash
NEXT_PUBLIC_INTAKE_ENDPOINT=
```

Example:

```bash
NEXT_PUBLIC_INTAKE_ENDPOINT=https://your-intake-service.example.com/intake
```

## Required service env

In `corpai-intake-service`:

```bash
PORT=8787
ALLOWED_ORIGINS=https://corpai-standard-vos.surge.sh,http://localhost:3000
TURSO_DATABASE_URL=libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=
```

## Database schema

Apply:

- `corpai-intake-service/sql/schema.sql`

Or run locally:

```bash
cd corpai-intake-service
npm install
npm run db:init
```

## Current status

- Turso MCP is connected locally via `turso-agentfs`
- Turso group `default` exists
- Turso database `corpai-intake` exists
- portal is now ready to talk to an external intake endpoint
- service code exists, but deployment is still needed

## Next backend steps

1. install dependencies in `corpai-intake-service`
2. initialize the Turso schema
3. deploy the intake service
4. set `NEXT_PUBLIC_INTAKE_ENDPOINT` in the portal deployment
5. republish the portal
