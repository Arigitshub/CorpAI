# CorpAI Board Decision: Turso Intake Backend

Date: 2026-04-12

## Decision

Switch the **intake backend only** to Turso if the goal is to stay free or near-free and avoid the current Supabase free-project constraint.

Do **not** move the broader CorpAI product architecture to Turso yet.

The approved shape is:

- keep the marketing and sales portal static on Surge
- keep Stripe as the checkout layer
- add one tiny server-side intake write endpoint
- use Turso as the persistence layer behind that endpoint

## Why

The board agrees that backend choice is not the product.

CorpAI wins by proving:

- governed execution
- workflow control
- approvals
- routing
- reporting
- measured ROI

The intake backend only needs to:

- persist submissions reliably
- connect the lead path from `buy` to `intake` to `success`
- stay cheap enough that infrastructure does not distract from proof and pilots

Given the current constraint that Supabase free capacity is already exhausted, Turso is an acceptable utility move.

## Approved Architecture

- `Surge` hosts the static portal
- the public intake form posts to a tiny API or edge endpoint
- that endpoint writes to `Turso`
- `Turso` stores:
  - intake submissions
  - lead metadata
  - simple status fields
  - later, lightweight pilot tracking if needed

Turso is approved for:

- intake persistence
- lightweight operational records

Turso is **not** yet approved as the primary backend for:

- auth
- policy enforcement
- audit-grade workflow orchestration
- multi-tenant control-plane logic

## Risks

- Turso is not a drop-in Supabase replacement
- browser-side direct writes are the wrong pattern because Turso relies on auth tokens
- switching backend plumbing can consume founder time if the scope expands
- dual-running Supabase and Turso for the same intake flow would create confusion
- infra work can still outrun proof work if not tightly bounded

## Board Instructions

1. Keep the switch narrow
2. Build the smallest possible Turso-backed intake service
3. Do not broaden the migration into a platform rewrite
4. Validate one thing first: lead capture works reliably
5. Return to proof and pilot conversion immediately after the intake path is live

## 30-Day Success Criteria

- no dependency on Supabase free-project availability for intake
- one clear lead flow from `buy` to `intake` to `success`
- reliable persistence of buyer submissions
- ability to track early audit and pilot leads
- zero narrative drift away from the AgentOps wedge

## Final Stance

Approved, but bounded.

Turso is a **utility backend decision**, not a product-strategy decision.

CorpAI should use it only to remove a near-term infrastructure constraint while staying focused on:

- the `PR Review AgentOps` wedge
- proof
- audits
- pilots
- recurring control-plane revenue
