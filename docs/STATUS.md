# CorpAI Status

Last updated: 2026-04-26

## Current position

CorpAI is now positioned as `CorpAI AgentOps`: the control plane for governed AI agent execution across `Codex CLI`, `Gemini CLI`, `Claude Code`, `OpenRouter`, and direct provider APIs.

The product thesis is no longer "general AI org framework first." The current commercial direction is:

- sell governed execution, not raw model access
- sell managed pilots before pure software
- prove ROI on technical workflows first
- use coding-agent teams as the first wedge

## What is done

- CorpAI v0.1 engineering release candidate verified on 2026-04-26
- Board meeting completed and synthesized into `docs/BOARD_DECISION_2026-04-12.md`
- Turso intake backend board decision added in `docs/BOARD_DECISION_TURSO_2026-04-12.md`
- Turso AgentFS MCP server connected locally as `turso-agentfs`
- repository license changed from MIT to `Business Source License 1.1`
- Top-level `README.md` and `ROADMAP.md` rewritten to align with the AgentOps direction
- Main portal homepage rewritten around the `AgentOps` control-plane thesis
- Buyer-facing `/pricing` page added
- Buyer-facing `/buy` page added
- Buyer-facing `/demo` page added
- Dedicated `/demo/pr-review` proof page added
- Dedicated `/case-study/pr-review` buyer-facing proof page added
- Dedicated `/roi` page added
- Buyer-facing `/intake` page added
- Buyer-facing `/success` page added
- Stripe-ready `/api/checkout` route added
- Real Stripe payment links are now wired in as route defaults
- Stripe payment links now redirect to `/success` after checkout
- Interactive multi-scenario workflow simulation added to the portal demo surface
- Supabase-backed intake path added to the portal with static-safe fallback still preserved
- Turso intake service scaffolded in `corpai-intake-service`
- intake service adapted for `Cloudflare Workers` as the primary deploy target, with Vercel retained as fallback
- Turso group `default` created in org `ariofficial`
- Turso database `corpai-intake` created
- Turso intake schema applied successfully
- Portal intake flow converted to use `NEXT_PUBLIC_INTAKE_ENDPOINT` instead of the Supabase browser client
- Cloudflare Worker `corpai-intake-service` deployed successfully at `https://corpai-intake-service.arimail-57e.workers.dev/`
- Production portal rebuilt and republished with the live intake endpoint
- Protected lead-review endpoint added at `GET /leads` on the intake Worker
- Cloudflare secret `ADMIN_READ_TOKEN` set and verified live
- Google Sheet CRM handoff created at `https://docs.google.com/spreadsheets/d/1w66Zh56WxHY7zkN5cqabdNJxWAVbQm8TydyGILM-7ig/edit`
- Google Apps Script CRM import flow authorized and verified
- Post-crash recovery completed on 2026-04-26: portal rebuilt with the live intake endpoint and republished to Surge
- Turso Cloud CLI path set up through WSL Ubuntu 24.04 on 2026-04-26
- Turso group `default` database-token keys rotated on 2026-04-26
- Fresh database-scoped token for `corpai-intake` uploaded to Cloudflare Worker secret `TURSO_AUTH_TOKEN`
- Local Turso CLI account auth token removed after rotation
- DailyVinkel selected as the free CorpAI test company/revival project
- DailyVinkel Supabase backup inspected and public product-table restore package created under `D:\daily vinkel`
- `Arigitshub/collive-reimagined` verified private and live-site-linked; proprietary license and env-secret cleanup pushed in commit `7537555`
- DailyVinkel recovery-mode app committed and pushed to `Arigitshub/collive-reimagined` in commit `48d83af`
- DailyVinkel recovery app deployed to Vercel at `https://daily-vinkel-collive-reimagined.vercel.app/`
- `dailyvinkel.com` added to Vercel, pending IONOS DNS update to `A dailyvinkel.com 76.76.21.21`
- DailyVinkel Neon database created with `npx get-db`, public product tables restored, and row counts verified
- Internal founder-facing Android app scaffold created in `corpai-founder-mobile`
- Local founder bridge scaffold created in `corpai-founder-bridge` for Codex-backed missions from mobile
- Founder bridge fixed to pass mission prompts to `codex exec -` over stdin on Windows
- Real founder bridge mission completed with `MOCK_CODEX=0`
- Hard-coded operator read tokens removed from repo docs and CRM script
- Portal README rewritten to reflect current direction
- Static portal exported and deployed to `https://corpai-standard-vos.surge.sh`
- Core strategy and implementation docs created for category, ICP, offers, pricing, routing, approvals, ROI, metrics, and workflow packs
- Workspace consolidated under `D:\CorpAI`

## Important files

- `corpai-portal/src/app/page.tsx`
- `corpai-portal/src/app/pricing/page.tsx`
- `corpai-portal/src/app/demo/page.tsx`
- `corpai-portal/src/app/case-study/pr-review/page.tsx`
- `corpai-portal/src/app/api/checkout/route.ts`
- `corpai-portal/src/components/WorkflowSimulation.tsx`
- `corpai-portal/src/components/IntakeForm.tsx`
- `corpai-portal/src/lib/intake.ts`
- `corpai-portal/.env.example`
- `corpai-intake-service/server.mjs`
- `corpai-intake-service/api/intake.js`
- `corpai-intake-service/api/health.js`
- `corpai-intake-service/src/worker.js`
- `corpai-intake-service/wrangler.jsonc`
- `corpai-intake-service/vercel.json`
- `corpai-intake-service/sql/schema.sql`
- `corpai-intake-service/README.md`
- `corpai-founder-mobile/App.tsx`
- `corpai-founder-bridge/server.mjs`
- `docs/FOUNDER_APP_PLAN.md`
- `docs/FOUNDER_BRIDGE_PLAN.md`
- `docs/INTAKE_BACKEND_SETUP.md`
- `docs/BOARD_DECISION_TURSO_2026-04-12.md`
- `docs/CLOUDFLARE_BROWSER_AGENT_PROMPT.md`
- `docs/CRM_BROWSER_AGENT_PROMPT.md`
- `docs/CRM_APPS_SCRIPT.gs`
- `docs/VERCEL_BROWSER_AGENT_PROMPT.md`
- `D:\daily vinkel\CORPAI-HANDOFF.md`
- `D:\daily vinkel\neon\restore-public.sql`
- `D:\daily-vinkel-collive-reimagined\LICENSE`
- `D:\daily-vinkel-collive-reimagined\src\lib\recoveryData.ts`

## Stripe links

- `AgentOps Audit`: `https://buy.stripe.com/bIY2aZ51s9ZH9484kodAk01`
- `Managed Pilot`: `https://buy.stripe.com/4gfcN589A8VFa844kpeAk82`
- `Hosted Control Plane`: `https://buy.stripe.com/aFAdR9gm4Fn1sxlYadAk03`

## Open items

- some legacy spec assets still remain in the repo by design, but the top-level narrative is now aligned to AgentOps
- no live product-authenticated workflow exists yet; the current demo is simulated but credible
- the portal now includes modeled ROI and modeled case-study proof, but there is still no real customer proof yet
- the portal now has a dedicated buyer-facing case-study asset for the wedge, but it is still modeled proof rather than real customer proof
- the portal still contains some legacy Supabase scaffolding files that are no longer the preferred direction
- DailyVinkel Neon database needs to be claimed into the Neon account before the claimable DB expiry on 2026-04-29
- DailyVinkel real domain still needs DNS changed at IONOS before it points to Vercel
- old `collive-reimagined` Stripe/Supabase/Clerk keys should be rotated because `.env` existed in git history before the cleanup commit

## Validation

- 2026-04-26: `npm run lint` passes in `corpai-portal`
- 2026-04-26: `npm run build` passes in `corpai-portal`
- `npm run db:init` passes in `corpai-intake-service`
- local end-to-end service check passed for `GET /health` and `POST /intake`
- 2026-04-26: live end-to-end Worker checks passed for `GET /health` and `POST /intake`
- 2026-04-26: production portal smoke checks returned `200` for `/`, `/pricing/`, `/intake/`, and `/success/`
- live protected Worker check passed for `GET /leads`
- local founder-bridge mock check passed for `GET /health`, `POST /missions`, and `GET /missions/:id`
- 2026-04-26: founder mobile typecheck passed
- founder bridge mock mission flow verified again on local port `8793`
- 2026-04-26: real founder bridge mission completed through `POST /missions` and `GET /missions/:id` on port `8790`
- 2026-04-26: `wrangler secret list` confirms `ADMIN_READ_TOKEN` and `TURSO_AUTH_TOKEN` are configured on the Worker
- 2026-04-26: Google Apps Script `syncCorpAILeads` completed and populated the `CorpAI Leads` sheet
- 2026-04-26 post-crash check: `npm run lint` passes in `corpai-portal`
- 2026-04-26 post-crash check: `npm run build` passes in `corpai-portal` with `NEXT_PUBLIC_INTAKE_ENDPOINT=https://corpai-intake-service.arimail-57e.workers.dev/intake`
- 2026-04-26 post-crash check: `npm run typecheck` passes in `corpai-founder-mobile`
- 2026-04-26 post-crash check: production portal smoke checks returned `200` for `/`, `/pricing/`, `/buy/`, `/demo/`, `/demo/pr-review/`, `/case-study/pr-review/`, `/roi/`, `/intake/`, and `/success/`
- 2026-04-26 post-crash check: live Worker `GET /health` returned `200 {"ok":true}`
- 2026-04-26 post-crash check: live Worker `POST /intake` accepted a clearly labeled smoke-test submission
- 2026-04-26 post-crash check: `surge out corpai-standard-vos.surge.sh` published successfully
- 2026-04-26 post-crash check: local `npm run db:init` was not rerun because no local `.env.local` with `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` is present; deployed Worker secrets remain configured
- 2026-04-26 token-rotation check: WSL Ubuntu 24.04 installed and Turso CLI `v1.0.20` verified
- 2026-04-26 token-rotation check: `turso group tokens invalidate default --yes` completed successfully
- 2026-04-26 token-rotation check: fresh `corpai-intake` database token piped directly into `npx wrangler secret put TURSO_AUTH_TOKEN`
- 2026-04-26 token-rotation check: live Worker `GET /health` returned `200 {"ok":true}` after rotation
- 2026-04-26 token-rotation check: live Worker `POST /intake` accepted a clearly labeled token-rotation smoke-test submission
- 2026-04-26 token-rotation check: production `/intake/` returned `200 OK`
- 2026-04-26 token-rotation check: local Turso CLI `auth logout` completed and config token value is empty
- 2026-04-26 DailyVinkel check: Supabase backup is a plain PostgreSQL cluster dump
- 2026-04-26 DailyVinkel check: public product-table counts from backup are 10 articles, 4 classified listings, 5 ad placements, 15 ad sizes, and 4 classified ad sizes
- 2026-04-26 DailyVinkel check: public-only Neon restore SQL generated at `D:\daily vinkel\neon\restore-public.sql`
- 2026-04-26 DailyVinkel check: WSL PostgreSQL client installed and `psql 16.13` verified
- 2026-04-26 repo check: `Arigitshub/collive-reimagined` is private, GitHub Pages is not enabled, and license now reports as custom/Other proprietary license
- 2026-04-26 DailyVinkel recovery check: `npm run build` passes locally
- 2026-04-26 DailyVinkel recovery check: Vercel production deployment is `Ready`
- 2026-04-26 DailyVinkel recovery check: `npm run lint` still fails on preexisting legacy lint issues across the old app and Supabase functions
- 2026-04-26 DailyVinkel Neon check: restore completed with 10 articles, 4 classified listings, 5 ad placements, 15 ad sizes, 4 classified ad sizes, and empty submissions/jobs/sections

## Next best moves

1. Point `dailyvinkel.com` DNS at Vercel by setting IONOS `A dailyvinkel.com 76.76.21.21`, then recheck Vercel certificate/domain status.
2. Claim the `npx get-db` Neon database into the Neon account before 2026-04-29; connection strings are local-only in `D:\daily vinkel\.env`.
3. Rotate old `collive-reimagined` Stripe/Supabase/Clerk secrets because `.env` existed in git history.
4. Replace the modeled PR review case study with real customer proof once the first pilots land.
