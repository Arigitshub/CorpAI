# CorpAI Operator Strategy

> Note: This document captures the earlier service-operations thesis. The current board-level recommendation is in [BOARD_RECOMMENDATION_2026-04-12.md](BOARD_RECOMMENDATION_2026-04-12.md) and should be treated as the active positioning layer for CorpAI.

## 1. Category Definition and Positioning

### Category

CorpAI should define and occupy this category:

- `AI Service Operations Platform`

That is more useful than "agent platform," "autonomous corporation," or "AI org chart standard."

The product is not primarily a protocol. The product is a supervised AI operating layer that runs repetitive service work, routes exceptions to humans, and proves ROI with operational reporting.

The implementation backbone can and should use:

- `Codex CLI`
- `Gemini CLI`
- `OpenRouter`
- direct model APIs where needed

But those vendors should remain infrastructure.

CorpAI should own:

- workflow packaging
- orchestration
- prompt and policy design
- approval routing
- reporting
- billing
- account operations

### Positioning

CorpAI should be positioned as:

- the AI operating system for ticket-heavy businesses that want to automate support and service operations without losing control

### Plain-English positioning statement

CorpAI automates repetitive customer support and service operations for growing ecommerce brands, escalates edge cases to humans, and shows the buyer exactly how much labor, response time, and revenue impact it creates every week.

### What CorpAI is not

Do not lead with:

- autonomous company language
- generic "build any AI workforce" language
- open standard language
- marketplace or ecosystem language

Those may remain true in the architecture, but they are not the front-door offer.

### Positioning rule

A buyer should understand these four points immediately:

1. what workflow CorpAI runs
2. what the human still approves
3. what system it integrates with
4. what number improves if it works

## 2. Ideal Customer Profile and First Vertical

### First vertical

Start with:

- Shopify-native ecommerce brands with meaningful support volume

This is the best first wedge because:

- support pain is constant and obvious
- ROI is legible
- escalation logic is natural
- the workflow can be piloted without replacing the entire team
- the product can expand into returns, WISMO, order edits, refunds, VIP handling, and reporting

### Ideal customer profile

Target companies with:

- $1M to $20M annual revenue
- 500 to 15,000 support tickets per month
- 3 to 30 support or operations staff
- existing tools such as Shopify, Gorgias or Zendesk, Klaviyo, Slack, Notion, and a shipping platform
- a founder, COO, Head of CX, or support lead who already feels the support burden

### Buying roles

- Economic buyer: founder, COO, or Head of Operations
- Functional champion: Head of CX, support manager, or operations lead
- Technical approver: ops/generalist, agency partner, or technical founder

### Disqualifiers

Do not prioritize:

- pre-revenue startups
- enterprise procurement-heavy teams
- companies with very low ticket volume
- businesses wanting fully autonomous replies with no approval guardrails
- highly regulated first deployments that require long security reviews

## 3. Offer Ladder and Pricing Logic

### Core rule

Do not sell software access first.

Sell:

- a measurable outcome
- on a narrow workflow
- with human approvals
- with reporting that justifies renewal

In commercial terms, CorpAI should be sold as the wrapper and operating layer above the model providers, not as a resale storefront for third-party tokens.

### Value metric

Price on a combination of:

- workflow scope
- ticket volume
- automation coverage
- approval complexity

Do not price like a normal SaaS seat tool. A seat model weakens the ROI story and makes CorpAI look like a feature instead of a workflow operating layer.

### Recommended offer ladder

#### Offer 1: Diagnostic and Design Sprint

- Price: $2,500 to $7,500 one-time
- Purpose: paid discovery, workflow mapping, integration audit, approval policy design, baseline KPI capture
- Deliverable: automation plan, KPI baseline, pilot scope, approval matrix

Use this when a prospect is serious but not ready to commit to a recurring deployment.

#### Offer 2: Support OS Pilot

- Price: $3,000 to $5,000 per month
- Setup fee: $1,500 to $4,000 unless waived into annual terms
- Scope: one brand, one support queue, one or two high-volume workflows
- Example workflows:
  - WISMO and order status
  - refund and replacement triage
  - subscription change requests
  - support summarization and tagging
- Human approval:
  - refunds above threshold
  - angry or legal-risk tickets
  - VIP customers

Pilot success should be judged on:

- automation rate
- first response time
- time saved
- escalation quality

#### Offer 3: Support OS Core

- Price: $6,000 to $10,000 per month
- Scope: multiple support workflows, weekly reporting, queue analytics, supervised playbook tuning
- Includes:
  - dashboard and KPI reporting
  - escalation policies
  - workflow iteration
  - managed prompt and playbook updates

This is the main recurring revenue product.

#### Offer 4: Managed Service Operations Layer

- Price: $12,000 to $25,000+ per month
- Scope: support plus adjacent operations workflows
- Includes:
  - support workflow coverage
  - return and ops exception handling
  - knowledge base updates
  - renewal and expansion reviews
  - custom routing and reporting

This is where CorpAI becomes a managed AI workforce rather than just one workflow product.

### Pricing logic

Charge more when:

- ticket volume is higher
- more systems are involved
- more approvals are needed
- more weekly optimization work is required
- SLA expectations are stricter

Avoid underpricing pilots. The pilot is not a proof-of-concept toy. It is the first production wedge.

## 4. First 90-Day Execution Plan

## Days 1-15: Lock the category and the offer

- Finalize the category as `AI Service Operations Platform`
- Lock the first sellable offer as `Support OS for ecommerce`
- Rewrite all portal copy to align to one buyer and one use case
- Create a one-page ROI story:
  - tickets handled
  - time saved
  - response-time improvement
  - escalation rate
- Define the exact pilot package, setup process, and success criteria

Exit criteria:

- a buyer can understand the product in under 30 seconds
- the offer can be sold in one sentence
- the pilot has a clear price and scope

## Days 16-30: Build the demo and sales assets

- Build one working demo path:
  - ticket intake
  - triage
  - suggested response or action
  - escalation to human
  - weekly report output
- Build one ecommerce-specific starter pack
- Create a sales deck, demo script, and ROI calculator
- Create one implementation checklist and one weekly review template

Exit criteria:

- founder can run a live demo in under 10 minutes
- every step of the workflow is visible
- the output looks like something a buyer would pay for

## Days 31-60: Sell pilots

- Prospect 50 to 100 target accounts manually
- Focus on warm intros, founder outbound, agency partners, and operators already complaining about support load
- Sell 3 to 5 paid pilots
- Do not over-customize each pilot
- Use the same workflow and reporting structure unless a change directly increases close rate or retention

Exit criteria:

- first paid pilots signed
- baseline metrics captured
- one clear champion profile emerges

## Days 61-90: Prove ROI and convert to recurring

- Run pilots tightly with weekly reviews
- Track:
  - ticket volume
  - handled volume
  - approval rate
  - escalation rate
  - time saved
  - buyer-reported team relief
- Convert successful pilots into Core subscriptions
- Capture one case study and one quantified before/after story
- Start productizing the repeatable implementation steps

Exit criteria:

- at least one converted recurring account
- one case study with real numbers
- one stable onboarding and operations playbook

## 5. What Not to Build Yet

Do not build these yet:

- multi-vertical product lines
- marketplace or registry
- visual org builder
- broad self-serve onboarding
- open ecosystem narrative as the main homepage message
- generalized "build your own AI company" tooling
- complex role creation UX
- billing complexity before the first repeatable paid offer exists

The sequence should be:

- workflow
- pilot
- repeatability
- proof
- expansion
- platformization

Not the reverse.

## 6. Risks and Mitigation

### Risk: too much abstraction

If the product sounds like architecture, buyers will not understand what they are buying.

Mitigation:

- lead with one vertical and one workflow
- show real inputs and outputs
- force every page to answer "what does it do this week?"

### Risk: custom-services trap

If every deployment is unique, margins collapse and product never hardens.

Mitigation:

- hold the line on the first workflow
- standardize integrations
- use starter packs and implementation checklists

### Risk: weak ROI proof

If CorpAI cannot show economic value fast, renewals will be weak.

Mitigation:

- capture baseline metrics before launch
- ship weekly reports
- tie every review to labor, speed, quality, or revenue impact

### Risk: hallucination or bad actions

If the system takes the wrong action in production, trust erodes immediately.

Mitigation:

- narrow the workflow
- put humans on risky decisions
- use threshold-based approvals
- maintain audit logs and exception queues

### Risk: founder bandwidth fragmentation

If too many repos, narratives, and product lines move at once, nothing becomes sharp.

Mitigation:

- one canonical workspace
- one category
- one vertical
- one offer
- one demo

### Risk: premature platform building

If the team builds generic infrastructure before distribution and retention are proven, time is wasted.

Mitigation:

- platform work only when it directly supports the first paid workflow
- every engineering task must tie back to close rate, onboarding speed, or retention

## 7. Exact Docs That Should Exist in the Repo

These docs should exist and stay current:

### Strategy docs

- `docs/OPERATOR_STRATEGY.md`
- `docs/CATEGORY_BRIEF.md`
- `docs/ICP.md`
- `docs/OFFER_ARCHITECTURE.md`
- `docs/PRICING_POLICY.md`

### GTM docs

- `docs/SALES_NARRATIVE.md`
- `docs/DEMO_SCRIPT.md`
- `docs/ROI_MODEL.md`
- `docs/CASE_STUDY_TEMPLATE.md`
- `docs/OBJECTION_HANDLING.md`

### Delivery docs

- `docs/PILOT_PLAYBOOK.md`
- `docs/IMPLEMENTATION_CHECKLIST.md`
- `docs/APPROVAL_POLICY.md`
- `docs/WEEKLY_REVIEW_TEMPLATE.md`
- `docs/STARTER_PACK_ECOMMERCE_SUPPORT.md`

### Product docs

- `docs/WORKFLOW_SPEC_SUPPORT_OS.md`
- `docs/METRICS_DEFINITION.md`
- `docs/INTEGRATIONS_MAP.md`
- `docs/ESCALATION_THRESHOLDS.md`

### Operating docs

- `docs/EXECUTION_BACKLOG.md`
- `docs/ROADMAP_NOTES.md`
- `docs/WORKSPACE_LAYOUT.md`

## Immediate recommendation

If CorpAI wants to become the #1 product in its category, the path is not to become broader first.

The path is:

1. own one category
2. dominate one vertical
3. sell one workflow
4. prove ROI fast
5. convert services into productized recurring revenue

For now, that means:

- category: AI Service Operations Platform
- vertical: ecommerce
- first product: Support OS
- first win condition: paid pilots that convert into recurring subscriptions
