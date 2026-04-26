# Cloudflare Browser Agent Prompt

Paste this into your browser agent.

```text
Open Cloudflare Workers for account `54200ec6f47b7fe5b2d2cec32579e2e7`.

First, check whether a `workers.dev` subdomain is already registered for this account.

If it is not registered:
- complete the Workers onboarding flow
- register a `workers.dev` subdomain
- make sure the account is ready for Wrangler CLI deploys to workers.dev

Then create or configure a Worker project for `corpai-intake-service`.

Requirements:
- worker name: corpai-intake-service
- deployment target: Cloudflare Workers
- use the local folder `corpai-intake-service` later if needed, but set up the Worker and bindings now

Set these production bindings:

Vars:
- TURSO_DATABASE_URL=libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io
- ALLOWED_ORIGINS=https://corpai-standard-vos.surge.sh,http://localhost:3000

Secret:
- TURSO_AUTH_TOKEN=<ask me for the value if needed>

After setup, return only this exact structured output:

CLOUDFLARE_WORKERS_SUBDOMAIN_READY=yes|no
CLOUDFLARE_WORKERS_SUBDOMAIN=<subdomain or none>
CLOUDFLARE_WORKER_NAME=<name>
CLOUDFLARE_WORKER_URL=<url>
NOTES=<short note if anything is blocked>
```
