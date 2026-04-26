# CorpAI AgentOps

![CorpAI Hero](assets/hero.png)

> The control plane for governed AI agent execution.

[![Website](https://img.shields.io/badge/live-corpai--standard--vos-blue?style=flat-square)](https://corpai-standard-vos.surge.sh)
[![Product](https://img.shields.io/badge/product-AgentOps-orange?style=flat-square)](docs/BOARD_DECISION_2026-04-12.md)
[![corpai CLI](https://img.shields.io/badge/CLI-corpai-orange?style=flat-square)](https://github.com/Arigitshub/corpai-cli)
[![License](https://img.shields.io/badge/license-BSL%201.1-red?style=flat-square)](LICENSE)

## What CorpAI Is

CorpAI is built to sit above `Codex CLI`, `Gemini CLI`, `Claude Code`, `OpenRouter`, and direct provider APIs.

The runtime vendors provide inference and execution.
CorpAI provides:

- policy
- routing
- approvals
- workflow packs
- audit logs
- spend visibility
- operator reporting

That is the business.

## Category

`CorpAI is the control plane for governed AI agent execution.`

This means:

- teams can standardize how agent workflows run across repos and tools
- protected actions can be reviewed before they ship
- provider routing and fallback can be centrally managed
- managers can see spend, output quality, and workflow outcomes without tracing terminal sessions

## Who It Is For

The first wedge is narrow on purpose:

- technical teams already using coding agents
- engineering orgs that need governance, not another model endpoint
- buyers who care about speed, risk control, and measurable ROI

CorpAI should not be positioned as:

- a generic AI dashboard
- a model vendor
- a vague AI transformation platform
- a broad wrapper for every business workflow

## Live Sales Surface

Production site:

- [corpai-standard-vos.surge.sh](https://corpai-standard-vos.surge.sh)

Current routes:

- `/`
- `/buy`
- `/pricing`
- `/demo`
- `/demo/pr-review`
- `/roi`
- `/intake`
- `/success`
- `/map`

## Current Offer Ladder

- `AgentOps Audit`
- `Managed Pilot`
- `Hosted Control Plane`

The current go-to-market motion is:

1. sell audits
2. convert audits into pilots
3. convert successful pilots into recurring control-plane subscriptions

## Product Direction

The board decision is the source of truth:

- [docs/BOARD_DECISION_2026-04-12.md](docs/BOARD_DECISION_2026-04-12.md)
- [docs/STATUS.md](docs/STATUS.md)
- [docs/HANDOFF.md](docs/HANDOFF.md)

Most important supporting docs:

- [docs/CATEGORY_BRIEF.md](docs/CATEGORY_BRIEF.md)
- [docs/ICP.md](docs/ICP.md)
- [docs/OFFER_ARCHITECTURE.md](docs/OFFER_ARCHITECTURE.md)
- [docs/PRICING_POLICY.md](docs/PRICING_POLICY.md)
- [docs/SALES_NARRATIVE.md](docs/SALES_NARRATIVE.md)
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md)
- [docs/RUNTIME_CONTRACT.md](docs/RUNTIME_CONTRACT.md)
- [docs/PROVIDER_ROUTING_POLICY.md](docs/PROVIDER_ROUTING_POLICY.md)
- [docs/APPROVAL_ENGINE_SPEC.md](docs/APPROVAL_ENGINE_SPEC.md)
- [docs/ROI_MODEL.md](docs/ROI_MODEL.md)
- [docs/METRICS_DEFINITION.md](docs/METRICS_DEFINITION.md)
- [docs/WORKFLOW_PACK_SPEC.md](docs/WORKFLOW_PACK_SPEC.md)

## Repo Structure

Key areas:

- `corpai-portal` buyer-facing portal and live marketing surface
- `corpai-intake-service` tiny Turso-backed intake write service
- `corpai-founder-mobile` internal Android-first founder cockpit prototype
- `corpai-founder-bridge` local bridge that lets the founder app drive Codex CLI on this machine
- `corpai-cli` CLI tooling
- `corpai-platform` platform work
- `docs` strategy, product, GTM, and handoff docs
- `roles`, `spec`, and templates legacy spec assets that still inform the product

Workspace layout notes:

- [docs/WORKSPACE_LAYOUT.md](docs/WORKSPACE_LAYOUT.md)

## Legacy Spec

The original CorpAI spec work still exists in this repo and remains useful as source material for governance, role structure, and operating concepts.

Legacy sections include:

- `roles/`
- `spec/`
- `templates/`
- `examples/`

Those assets are no longer the front-door product story. They are supporting infrastructure and reference material behind the `AgentOps` business direction.

## Quick Start

Portal:

```bash
cd corpai-portal
npm install
npm run dev
```

Validation:

```bash
cd corpai-portal
npm run lint
npm run build
```

CLI:

```bash
pip install corpai
```

## Stripe

Stripe payment links are already wired into the portal.

If you need to update Stripe-side redirects to the site success flow, use:

- [docs/STRIPE_BROWSER_AGENT_PROMPT.md](docs/STRIPE_BROWSER_AGENT_PROMPT.md)
- [docs/STRIPE_SUCCESS_REDIRECT_PROMPT.md](docs/STRIPE_SUCCESS_REDIRECT_PROMPT.md)

## License

This repository now uses the `Business Source License 1.1`.

The intent is:

- source available for evaluation, internal development, and testing
- protected against unlicensed production or hosted commercial use
- converts to `Apache-2.0` on the stated change date

## Community

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [BADGE.md](BADGE.md)
- [CERTIFIED.md](CERTIFIED.md)
