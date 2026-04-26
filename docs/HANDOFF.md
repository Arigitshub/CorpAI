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

Remaining manual account actions:

- run the staged Google Apps Script once and approve Google permissions in the browser; Codex cannot complete this yet because the stored sheet URL is a placeholder and no Apps Script CLI auth is present locally
- rotate the broader Turso token from the Turso account, then update the Worker secret if needed; Codex cannot complete this yet because no Turso Cloud CLI/API auth is present locally

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

Provisioning already completed:

- Turso AgentFS MCP connected locally as `turso-agentfs`
- Turso group `default` created in org `ariofficial`
- Turso database `corpai-intake` created
- Turso schema applied successfully
- local end-to-end service check passed
- live Worker deployed at `https://corpai-intake-service.arimail-57e.workers.dev/`
- production portal rebuilt against `https://corpai-intake-service.arimail-57e.workers.dev/intake`
- protected lead-review endpoint live at `https://corpai-intake-service.arimail-57e.workers.dev/leads`

Deployment target:

- primary: `Cloudflare Workers`
- fallback: `Vercel Hobby`
- browser-agent prompt: `docs/CLOUDFLARE_BROWSER_AGENT_PROMPT.md`

What is still missing:

1. run the staged Google Apps Script once and complete the one-time Google authorization flow
2. rotate the broader Turso account token after deployment
3. continue replacing modeled proof with real customer proof

Browser-agent prompt for the CRM handoff step:

- `docs/CRM_BROWSER_AGENT_PROMPT.md`
- this prompt now targets Google Sheets plus Google Apps Script, not just a blank sheet

Current staged CRM handoff:

- Google Sheet: `https://docs.google.com/spreadsheets/d/1B7T_example_id/edit`
- reference Apps Script saved in-repo at `docs/CRM_APPS_SCRIPT.gs`

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

## Immediate next actions

1. Run the staged Google Apps Script once and complete the one-time Google authorization flow
2. Rotate the broader Turso account token after deployment
3. Replace the modeled PR review case study with actual customer proof once pilots land
