# CorpAI Intake Service

Tiny Turso-backed intake write service for the static CorpAI portal.

## Purpose

This service exists to keep the public portal static on Surge while persisting intake submissions to Turso.

It is intentionally narrow:

- `POST /intake`
- `GET /health`
- `GET /leads` with bearer-token protection for operator review

## Deployment targets

Primary target:

- `Cloudflare Workers`

Secondary target:

- `Vercel Hobby`

Cloudflare Worker entrypoint:

- `src/worker.js`

Wrangler config:

- `wrangler.jsonc`

Secondary Vercel functions:

- `api/intake.js`
- `api/health.js`

Local Node server:

- `server.mjs`

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `ALLOWED_ORIGINS`

The current Turso database URL is:

- `libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io`

## Local usage

Install:

```bash
npm install
```

Initialize the database:

```bash
npm run db:init
```

Run locally:

```bash
npm run dev
```

## Cloudflare deploy

Set these Worker bindings:

Vars:

- `TURSO_DATABASE_URL`
- `ALLOWED_ORIGINS`
- `ADMIN_READ_TOKEN`

Secret:

- `TURSO_AUTH_TOKEN`

Recommended values:

```bash
TURSO_DATABASE_URL=libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io
ALLOWED_ORIGINS=https://corpai-standard-vos.surge.sh,http://localhost:3000
ADMIN_READ_TOKEN=<set a strong random bearer token>
```

Once Cloudflare gives you a production URL, set this in the portal deployment:

```bash
NEXT_PUBLIC_INTAKE_ENDPOINT=https://your-worker.workers.dev/intake
```

Current live Worker:

- `https://corpai-intake-service.arimail-57e.workers.dev/`

Current live intake endpoint:

- `https://corpai-intake-service.arimail-57e.workers.dev/intake`

Operator leads endpoint:

- `https://corpai-intake-service.arimail-57e.workers.dev/leads`

Example:

```bash
curl -H "Authorization: Bearer <ADMIN_READ_TOKEN>" \
  "https://corpai-intake-service.arimail-57e.workers.dev/leads?limit=25"
```

Browser-agent setup prompt:

- `../docs/CLOUDFLARE_BROWSER_AGENT_PROMPT.md`

## Vercel deploy

Vercel remains available as a fallback deployment target.

## Portal wiring

Set this in `corpai-portal` deployment when the service is live:

```bash
NEXT_PUBLIC_INTAKE_ENDPOINT=https://your-intake-service.example.com/intake
```

If that env is missing, the portal falls back to the static-safe email/copy flow.
