# CorpAI Handoff

Use this file to resume work quickly without reconstructing context from chat history.

## Resume prompt

```text
It is [DATE] at [TIME] America/New_York. Continue CorpAI from docs/STATUS.md and docs/HANDOFF.md, then [task].
```

Example:

```text
It is April 12, 2026 at 8:30 PM America/New_York. Continue CorpAI from docs/STATUS.md and docs/HANDOFF.md, then deploy the portal and wire the real Stripe links.
```

For the next session, this is enough:

```text
Continue with CorpAI.
```

On that prompt, start with this file, `docs/STATUS.md`, and the DailyVinkel handoff at `D:\daily vinkel\CORPAI-HANDOFF.md`.

## Product direction

CorpAI should be built and sold as:

- `CorpAI AgentOps`
- a control plane above `Codex CLI`, `Gemini CLI`, `Claude Code`, `OpenRouter`, and direct APIs
- a governed execution layer with policy, routing, approvals, workflow packs, spend visibility, and reporting

CorpAI should not be sold as:

- another model vendor
- a generic AI dashboard
- a vague "AI transformation" platform
- fully autonomous execution without review controls

## Current sales surface

- `/` homepage for the AgentOps thesis
- `/buy` direct purchase path
- `/pricing` offer ladder and live Stripe checkout routing
- `/demo` buyer-facing workflow walkthrough plus multi-scenario simulation
- `/demo/pr-review` wedge proof page
- `/case-study/pr-review` buyer-facing case-study proof asset
- `/roi` modeled ROI page
- `/intake` buyer intake flow with external intake-service path available when envs are configured
- `/success` post-checkout next-step page
- `/map` existing org/spec map
- production site: `https://corpai-standard-vos.surge.sh`

## Current commercial posture

The site now does three useful things:

- explains the category
- shows the product surface through simulation
- lets qualified buyers purchase immediately

## v0.1 state

Engineering release-candidate checks are complete as of 2026-04-26:

- portal lint/build pass
- live intake Worker health and intake submission pass
- mobile typecheck passes
- founder bridge mock and real Codex-backed missions pass
- repository docs no longer include the live admin read token
- post-crash recovery pass completed: portal rebuilt with the live intake endpoint, republished to Surge, and smoke-checked across all v0.1 buyer routes
- Turso token rotation completed: WSL Ubuntu 24.04 installed, Turso CLI installed, group token keys invalidated, fresh `corpai-intake` database token uploaded to the Worker secret, and local Turso account auth removed

## Current offer ladder

- `AgentOps Audit`
- `Managed Pilot`
- `Hosted Control Plane`
- `Enterprise BYOK` remains a later-stage motion

## Stripe state

Stripe MCP tools were not available in this session, so the current implementation uses direct payment-link routing with real links already wired in:

- `AgentOps Audit`: `https://buy.stripe.com/bIY2aZ51s9ZH9484kodAk01`
- `Managed Pilot`: `https://buy.stripe.com/4gfcN589A8VFa844kpeAk82`
- `Hosted Control Plane`: `https://buy.stripe.com/aFAdR9gm4Fn1sxlYadAk03`

All three payment links have now been updated in Stripe to redirect to:

- `https://corpai-standard-vos.surge.sh/success/`

Legacy override env vars still exist in docs and `.env.example`, but the pricing surface now reads directly from the shared payment-link config:

- `STRIPE_AUDIT_PAYMENT_LINK`
- `STRIPE_PILOT_PAYMENT_LINK`
- `STRIPE_CONTROL_PLANE_PAYMENT_LINK`

The browser-agent prompt for creating those links is in:

- `docs/STRIPE_BROWSER_AGENT_PROMPT.md`
- `docs/STRIPE_SUCCESS_REDIRECT_PROMPT.md`

## Intake backend state

The current preferred direction is recorded in:

- `docs/BOARD_DECISION_TURSO_2026-04-12.md`

Current implementation:

- `corpai-portal/src/components/IntakeForm.tsx`
- `corpai-portal/src/lib/intake.ts`
- `corpai-intake-service/server.mjs`
- `corpai-intake-service/sql/schema.sql`
- `corpai-intake-service/README.md`
- `docs/INTAKE_BACKEND_SETUP.md`

Current behavior:

- if `NEXT_PUBLIC_INTAKE_ENDPOINT` is configured, `/intake` posts to the external intake service and redirects to `/success/?intake=submitted`
- if that env is missing, `/intake` stays on the static-safe email/copy fallback path
- 2026-04-26 post-crash recovery rebuilt and republished the static portal with `NEXT_PUBLIC_INTAKE_ENDPOINT=https://corpai-intake-service.arimail-57e.workers.dev/intake`

Provisioning already completed:

- Turso AgentFS MCP connected locally as `turso-agentfs`
- Turso group `default` created in org `ariofficial`
- Turso database `corpai-intake` created
- Turso schema applied successfully
- 2026-04-26: WSL Ubuntu 24.04 installed for the official Turso Cloud CLI path
- 2026-04-26: Turso CLI `v1.0.20` installed in WSL at `/root/.turso/turso`
- 2026-04-26: Turso group `default` token keys invalidated with `turso group tokens invalidate default --yes`
- 2026-04-26: fresh database-scoped token for `corpai-intake` piped directly into `npx wrangler secret put TURSO_AUTH_TOKEN`
- 2026-04-26: local Turso account auth token removed with `turso auth logout`
- local end-to-end service check passed
- live Worker deployed at `https://corpai-intake-service.arimail-57e.workers.dev/`
- production portal rebuilt against `https://corpai-intake-service.arimail-57e.workers.dev/intake`
- protected lead-review endpoint live at `https://corpai-intake-service.arimail-57e.workers.dev/leads`

Deployment target:

- primary: `Cloudflare Workers`
- fallback: `Vercel Hobby`
- browser-agent prompt: `docs/CLOUDFLARE_BROWSER_AGENT_PROMPT.md`

What is still missing:

1. continue replacing modeled proof with real customer proof

Browser-agent prompt for the CRM handoff step:

- `docs/CRM_BROWSER_AGENT_PROMPT.md`
- this prompt now targets Google Sheets plus Google Apps Script, not just a blank sheet

Current staged CRM handoff:

- Google Sheet: `https://docs.google.com/spreadsheets/d/1w66Zh56WxHY7zkN5cqabdNJxWAVbQm8TydyGILM-7ig/edit`
- reference Apps Script saved in-repo at `docs/CRM_APPS_SCRIPT.gs`
- 2026-04-26: Apps Script project `1Sih8cM6Ynv7EHgfPl0yOKvBbI93EH6mxN-JeY5AognOmCpd9lIbsb9dp` is bound to the sheet, `CORPAI_ADMIN_READ_TOKEN` is stored as a script property, and `syncCorpAILeads` imported live leads successfully

## Founder mobile app

New internal app scaffold:

- `corpai-founder-mobile`

Purpose:

- let the founder compare `Launch New` vs `Acquire Existing`
- stage Codex-backed missions from mobile
- review board-style guidance, leverage, and risk from one screen set

Design intent:

- interactive
- sharp
- Android-first
- internal-use premium surface

Architecture note:

- the phone should not run `Codex CLI` directly
- the app should call a CorpAI broker which routes into `Codex CLI`, `Gemini CLI`, or other approved runtimes server-side

Planning doc:

- `docs/FOUNDER_APP_PLAN.md`

Bridge doc:

- `docs/FOUNDER_BRIDGE_PLAN.md`

Local bridge workspace:

- `corpai-founder-bridge`

Bridge intent:

- run on the founder PC
- accept mobile mission requests over LAN
- broker into local `Codex CLI`
- return logs, status, and final summaries to the app

Current bridge validation:

- local mock-mode bridge check passed for `GET /health`
- mission creation and mission polling passed end-to-end in mock mode
- 2026-04-26: mock bridge started on `127.0.0.1:8793`; `POST /missions` for `launch` completed and returned final mission output
- 2026-04-26: `npm run typecheck` passed in `corpai-founder-mobile`
- 2026-04-26: mobile default bridge URL updated to this PC's current Wi-Fi address, `http://192.168.1.101:8790`
- 2026-04-26: real bridge mission completed on `127.0.0.1:8790` with `MOCK_CODEX=0` after changing the bridge to pass prompts via stdin to `codex exec -`

## Post-crash validation

Completed on 2026-04-26:

- `npm run lint` passed in `corpai-portal`
- `npm run build` passed in `corpai-portal` with the live intake endpoint configured
- `npm run typecheck` passed in `corpai-founder-mobile`
- `surge out corpai-standard-vos.surge.sh` published successfully
- production portal returned `200` for `/`, `/pricing/`, `/buy/`, `/demo/`, `/demo/pr-review/`, `/case-study/pr-review/`, `/roi/`, `/intake/`, and `/success/`
- live Worker `GET /health` returned `200 {"ok":true}`
- live Worker `POST /intake` accepted a clearly labeled smoke-test submission
- `wrangler secret list` confirmed `ADMIN_READ_TOKEN` and `TURSO_AUTH_TOKEN` are configured
- local `npm run db:init` was not rerun because no local `.env.local` with Turso credentials is present; the deployed Worker path remains healthy
- token-rotation smoke passed after replacing `TURSO_AUTH_TOKEN`: Worker `GET /health`, Worker `POST /intake`, and production `/intake/` all returned healthy responses

## DailyVinkel test company

DailyVinkel is the next practical CorpAI test-company path.

Current facts:

- domain: `dailyvinkel.com`
- live-site/source repo: `https://github.com/Arigitshub/collive-reimagined`
- local clone: `D:\daily-vinkel-collive-reimagined`
- recovery workspace: `D:\daily vinkel`
- handoff: `D:\daily vinkel\CORPAI-HANDOFF.md`
- Supabase project is paused and cannot be unpaused
- recovery Vercel deployment: `https://daily-vinkel-collive-reimagined.vercel.app/`
- Vercel project: `aris-projects-fdb64b1f/daily-vinkel-collive-reimagined`
- `dailyvinkel.com` is added to Vercel but still needs IONOS DNS set to
  `A dailyvinkel.com 76.76.21.21`
- Neon database created with `npx get-db`; public product tables restored and verified.
  Claim the database into the Neon account before 2026-04-29. Connection strings
  are stored only in `D:\daily vinkel\.env`.
- repo commits:
  - `48d83af Add DailyVinkel recovery mode`
  - `4d42be5 Ignore Vercel project metadata`
- Supabase backup is at `D:\daily vinkel\db_cluster-16-12-2025@07-23-31.backup\db_cluster-16-12-2025@07-23-31.backup`
- target database is Neon free Postgres

Work completed tonight:

- inspected the Supabase backup as a plain PostgreSQL cluster dump
- identified product tables: `articles`, `classified_listings`, `classified_submissions`, `jobs`, `sections`, `ad_placements`, `ad_sizes`, `classified_ad_sizes`
- generated public-only Neon restore SQL at `D:\daily vinkel\neon\restore-public.sql`
- added restore scripts:
  - `D:\daily vinkel\scripts\extract-public-restore.ps1`
  - `D:\daily vinkel\scripts\restore-to-neon.ps1`
- installed WSL Ubuntu 24.04 and PostgreSQL client for restore operations
- installed `neonctl` globally, but Neon CLI commands hung/timeout in this shell before auth/project creation completed
- verified `Arigitshub/collive-reimagined` is already private
- verified GitHub Pages is not enabled for `collive-reimagined`
- pushed commit `7537555` to `collive-reimagined`: removed tracked `.env`, added `.env.example`, added proprietary `LICENSE`, and updated README

Security note:

- because `collive-reimagined` previously tracked `.env`, rotate old Stripe, Supabase, and Clerk secrets in their dashboards before relying on that deployment for production traffic

Next DailyVinkel steps:

1. Create or authenticate a Neon project/database for DailyVinkel.
2. Set `NEON_DATABASE_URL` locally.
3. Run `D:\daily vinkel\scripts\restore-to-neon.ps1`.
4. Verify `select count(*) from public.articles;` and `select count(*) from public.classified_listings;`.
5. Wire `collive-reimagined` or a simplified rebuild to Neon.
6. Keep `dailyvinkel.com` live with at least a recovery page if the full rebuild takes longer than one session.

## Operator access

Current operator leads endpoint:

- `GET https://corpai-intake-service.arimail-57e.workers.dev/leads?limit=25`

Required header:

```text
Authorization: Bearer <ADMIN_READ_TOKEN>
```

Example:

```bash
curl -H "Authorization: Bearer <ADMIN_READ_TOKEN>" \
  "https://corpai-intake-service.arimail-57e.workers.dev/leads?limit=25"
```

## Most important docs

- `docs/BOARD_DECISION_2026-04-12.md`
- `docs/BOARD_RECOMMENDATION_2026-04-12.md`
- `docs/CATEGORY_BRIEF.md`
- `docs/ICP.md`
- `docs/OFFER_ARCHITECTURE.md`
- `docs/PRICING_POLICY.md`
- `docs/DEMO_SCRIPT.md`
- `docs/RUNTIME_CONTRACT.md`
- `docs/PROVIDER_ROUTING_POLICY.md`
- `docs/APPROVAL_ENGINE_SPEC.md`
- `docs/ROI_MODEL.md`
- `docs/METRICS_DEFINITION.md`
- `docs/WORKFLOW_PACK_SPEC.md`
- `docs/INTAKE_BACKEND_SETUP.md`
- `docs/BOARD_DECISION_TURSO_2026-04-12.md`
- `docs/STATUS.md`
- `D:\daily vinkel\CORPAI-HANDOFF.md`

## Immediate next actions

1. Continue DailyVinkel as the free CorpAI test company: create/auth Neon, restore public product tables, and connect the live site path.
2. Rotate old `collive-reimagined` Stripe/Supabase/Clerk secrets because `.env` existed in git history.
3. Replace the modeled PR review case study with actual customer proof once pilots land.
