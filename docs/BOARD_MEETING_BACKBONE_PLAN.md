# CorpAI Board Meeting: Backbone Business Model Plan

Date: 2026-04-12

This memo reflects the operator view after the product clarification:

- `CorpAI` is the wrapper, orchestration layer, reporting layer, approval layer, and customer-facing service
- `Codex CLI`, `Gemini CLI`, `OpenRouter`, and direct model APIs are the execution backbone
- customers should buy outcomes and control, not raw model access

## Board-level conclusion

The business should not be sold as a generic "LLM wrapper."

It should be sold as:

- an `AI Service Operations Platform`
- with managed workflow deployment
- powered by a multi-provider model backbone
- priced on workflow value, operating coverage, and controlled usage

The economic logic is simple:

- model vendors provide inference
- CorpAI provides orchestration, routing, prompts, approvals, reporting, safety controls, and business integration
- the gross margin comes from the control plane, workflow packaging, and managed operations layer

The commercial unit is the workflow, not the model.

## 1. Business model options

### Option A: Managed AI workflow service

CorpAI owns setup, routing, prompts, approvals, reporting, and vendor accounts.

The customer buys:

- workflow automation
- human review thresholds
- weekly performance reporting

The customer does not buy:

- direct model access
- seats
- a builder

Pros:

- fastest to revenue
- easiest to close
- easiest to prove ROI
- highest control over delivery quality

Cons:

- lower gross margin than pure software
- requires service operations discipline

This is the best phase-one model.

### Option B: Hybrid platform plus managed service

CorpAI charges a recurring platform fee plus a managed workflow fee plus usage overages.

Pros:

- best long-term shape
- easier transition from service into software
- builds recurring revenue without pretending the service layer does not exist

Cons:

- requires clear billing logic
- requires usage accounting and margin discipline

This is the recommended default model once the first workflow is stable.

### Option C: Pure SaaS orchestration platform

CorpAI sells access to the wrapper and dashboard, with minimal services.

Pros:

- better theoretical software margins
- cleaner valuation story later

Cons:

- slower to close now
- weaker onboarding success
- harder to prove value without hands-on implementation

Do not lead with this in phase one.

### Option D: Enterprise BYOK control plane

The customer brings their own OpenAI, Google, OpenRouter, or other provider accounts. CorpAI charges for orchestration, approvals, reporting, integrations, and support.

Pros:

- strong gross margin
- reduced compute risk
- better fit for larger customers

Cons:

- more technical onboarding
- weaker fit for smaller buyers

This should be offered later as an enterprise option, not as the default for early pilots.

## Recommendation

Use this sequence:

1. `Managed workflow service`
2. `Hybrid platform plus managed service`
3. `Enterprise BYOK control plane`
4. `Pure SaaS control plane`

That sequence matches cash flow reality.

## 2. Pricing and packaging

## Packaging rule

Do not price by seat.

Do not price like a generic copilot.

Price on:

- workflow scope
- automation volume
- approval complexity
- integration count
- service intensity
- included model spend

## Recommended phase-one packaging

### Product 1: Design and Deployment Sprint

- Price: `$3k-$8k` one-time
- Includes:
  - workflow mapping
  - provider routing setup
  - prompt and policy setup
  - approval thresholds
  - baseline KPI definition
  - Stripe subscription setup

Use this to prevent unpaid implementation work.

### Product 2: Support OS Pilot

- Price: `$4k-$7k/mo`
- Setup: sprint required
- Includes:
  - one core workflow
  - one queue or channel
  - one weekly operating review
  - one dashboard/report pack
  - included model usage budget

Overages:

- bill model usage over a defined included threshold
- bill extra workflow or integration work separately

### Product 3: Support OS Core

- Price: `$8k-$15k/mo`
- Includes:
  - multiple support workflows
  - more integrations
  - better SLA and reporting
  - managed routing and playbook tuning
  - larger included usage budget

This should become the main recurring product.

### Product 4: Enterprise Control Plane / BYOK

- Price: `$2k-$6k/mo` platform fee plus services
- Customer pays model vendors directly
- CorpAI charges for:
  - orchestration
  - workflow runtime
  - approvals
  - reporting
  - support
  - custom integrations

This is the margin-protection offer for larger accounts.

## Packaging architecture

Each recurring package should have three billable layers:

1. `Base platform fee`
2. `Managed workflow fee`
3. `Usage overage or vendor pass-through`

That protects margin and keeps pricing legible.

## 3. Where Stripe should fit

Stripe should be the commercial system of record for billing, collections, and expansion.

Use Stripe for:

- one-time implementation invoices
- recurring monthly subscriptions
- usage-based overage billing
- annual prepay discounts
- add-on workflows
- expansion charges
- failed-payment recovery and dunning

## Recommended billing design in Stripe

Create separate prices for:

- `Deployment Sprint` as a one-time invoice item
- `Support OS Pilot` as a monthly recurring price
- `Support OS Core` as a monthly recurring price
- `Enterprise Control Plane` as a monthly recurring price
- `Model Usage Overage` as a metered price
- `Additional Workflow Pack` as a recurring add-on
- `Priority Support / Slack Channel` as an add-on if needed

## Stripe operating rules

- never hide overages inside labor
- never offer unlimited model usage
- include a clear monthly usage allowance in each plan
- trigger alerts before overages spike
- invoice services and software separately when the account is still implementation-heavy

Stripe should come in early, because billing discipline shapes packaging discipline.

## 4. What generates recurring revenue fastest

The fastest recurring revenue path is:

- one-time deployment sprint
- into a managed `Support OS Pilot`
- into `Support OS Core`

Why:

- support volume is recurring
- ROI is easy to explain
- escalation can be supervised
- the buyer feels pain immediately
- renewal is easier when weekly proof exists

The fastest path is not:

- selling access to model wrappers
- selling a generic CLI control panel
- selling seat-based agent software

Customers renew for:

- tickets handled
- time saved
- approvals reduced
- response time improved
- operator burden removed

That means recurring revenue comes from managed workflow ownership plus reporting, not from generic access.

## 5. Risk controls

## Commercial risk controls

- require a paid deployment sprint
- require a defined pilot scope
- require usage caps and overage terms
- require success metrics before launch
- require change orders for custom workflow expansion

## Margin risk controls

- track model spend by customer weekly
- set included usage budgets by plan
- maintain a minimum gross margin target per account
- route low-risk tasks to cheaper models where acceptable
- reserve premium models for high-value or high-risk steps

## Delivery risk controls

- define what can auto-execute and what must escalate
- keep refund, legal-risk, and VIP cases behind approval thresholds
- add provider fallback rules for outages or degraded quality
- avoid single-model dependence if the workflow is mission-critical

## Contract risk controls

- include a vendor-cost pass-through clause
- include a scope boundary clause
- include an acceptable-use and abuse clause
- include a pause or downgrade mechanism for non-paying or over-consuming accounts

## 6. What to measure weekly

These should be reviewed every week at the account level and company level.

## Revenue and finance

- new MRR
- expansion MRR
- churned MRR
- cash collected
- gross margin by account
- model/vendor spend as a percent of revenue
- implementation hours versus budget
- overage revenue

## Delivery and product

- workflow volume
- automation rate
- approval rate
- escalation rate
- first-response improvement
- resolution-time improvement
- hours saved or redirected
- workflow error rate
- provider fallback rate

## Sales and retention

- deployment sprint close rate
- sprint-to-pilot conversion rate
- pilot-to-core conversion rate
- weekly proof report sent on time
- renewal probability by account
- expansion pipeline by account

## 7. What to avoid financially in phase one

- free pilots
- unlimited usage plans
- seat pricing
- broad custom enterprise builds before one repeatable workflow is stable
- subsidizing heavy model usage without overage billing
- pretending services are software before the delivery model is repeatable
- building a self-serve builder before implementation is standardized
- supporting too many providers equally before routing economics are understood

## Phase-one financial rule

Protect cash first.

That means:

- charge setup
- charge monthly
- meter overages
- keep scope narrow
- measure margin weekly

## Immediate next decisions

The board should approve these next:

1. `Support OS` remains the first sellable workflow
2. default commercial model is `hybrid platform plus managed service`
3. default SMB/mid-market onboarding uses CorpAI-managed provider accounts
4. enterprise upgrade path is `BYOK`
5. Stripe becomes the billing system now, not later
6. every package has included usage plus overage logic
7. no unlimited or seat-based pricing in phase one

## Final recommendation

The backbone should absolutely use `Codex CLI`, `Gemini CLI`, `OpenRouter`, and direct provider APIs where appropriate.

But the business should not be valued or sold as access to those backbones.

CorpAI should own:

- orchestration
- workflow packaging
- approvals
- routing logic
- reporting
- ROI proof
- billing

That is where the recurring revenue and defensible margin live.
