# CorpAI Board Recommendation - 2026-04-12

## Executive Summary

CorpAI should not be positioned as a generic AI workflow company or a vague autonomous business framework.

The stronger opportunity is to become the **Agent Operations Control Plane** for teams running agentic developer workflows through tools such as Codex CLI, Gemini CLI, Claude Code, and OpenRouter-backed model routing.

The product should sit above those runtimes and providers and answer the operational questions that individual CLIs do not solve well on their own:

- who can run what
- which model or provider should be used
- what budget or policy applies
- what prompt, repo context, and workflow template should be loaded
- what happened during the run
- what should be reviewed, approved, or escalated
- what outcome was produced across a team, not just one terminal session

The sellable thesis is not "we built another coding agent."
The sellable thesis is:

- your team already uses agentic CLIs
- unmanaged usage becomes expensive, inconsistent, and hard to govern
- CorpAI turns ad hoc agent usage into a repeatable operating system with policy, routing, observability, approvals, and reusable playbooks

## Market Basis

As of April 12, 2026, the market signal is clear:

- OpenAI Codex is positioned as a terminal coding agent and is bundled across ChatGPT plans, with CLI and app surfaces available
- Gemini CLI is positioned as an open-source AI agent for the terminal that can connect to local tools and the web
- Claude Code has become an official CLI-style coding workflow with increasing autonomy features
- OpenRouter explicitly markets multi-model, multi-provider routing, fallback, and consolidated billing

That means the infrastructure layer is real. The gap is now the management layer above it.

## 1. Best Category Definition

CorpAI should define this category:

- `Agent Operations Control Plane`

Alternative acceptable phrasing:

- `AI Agent Control Plane`
- `Agent Runtime Control Plane`
- `Control Plane for Agentic Developer Workflows`

Preferred category sentence:

- CorpAI is the control plane for teams running AI agents across CLIs, models, repositories, and workflows.

Why this category works:

- it is closer to real buyer pain than "agent platform"
- it naturally supports policy, budget, observability, routing, and approvals
- it allows CorpAI to sit above multiple vendors instead of betting on one model company
- it is credible for a wrapper or orchestration layer business
- it creates a path to software revenue plus managed services without sounding like a consultancy first

## 2. Ideal Customer Profile

### Primary ICP

Start with:

- AI-native software agencies
- product engineering teams at startups using coding agents daily
- internal platform or dev productivity teams at software companies

Best first customer shape:

- 8 to 80 engineers or technical operators
- already using at least one agent CLI in production work
- likely experimenting with multiple backends such as OpenAI, Google, Anthropic, or OpenRouter
- multiple repositories and multiple contributors
- visible pain around consistency, approvals, logging, spend, or security

### Strongest first wedge account

The first truly attractive buyer is not the hobbyist.
It is a team that says some version of:

- "Our engineers already use coding agents, but it is messy."
- "We need visibility into prompts, runs, changes, and cost."
- "We need a safe way to standardize how agents operate across repos."
- "We want to use multiple providers without rebuilding workflows each time."

### Economic buyer

- founder at an AI-native agency
- CTO
- VP Engineering
- Head of Platform
- Head of Developer Experience

### Champion

- engineering manager
- staff engineer
- AI automation lead
- platform engineer
- agency operations lead

### Do not prioritize first

- solo developers
- very large enterprises with year-long procurement cycles
- non-technical SMBs that are not already using agentic tooling
- buyers asking for broad "AI transformation" before one workflow is proven

## 3. Wedge Product

The first product should be:

- `CorpAI Control Plane for Coding Agents`

More concrete external packaging:

- `CorpAI for engineering teams`
- `CorpAI for AI-native agencies`
- `CorpAI AgentOps`

### Core wedge workflow

Start with one narrow promise:

- standardize, govern, and optimize agent runs across repos and providers

### Version 1 product surface

The first wedge should include:

- workspace and repository registry
- CLI session registration for Codex CLI, Gemini CLI, Claude Code, and OpenRouter-backed jobs
- provider and model routing policies
- budget and usage guardrails
- approval and escalation checkpoints
- run logs and audit trails
- reusable workflow templates such as bug fix, PR review, migration, docs update, and incident triage
- team analytics for volume, spend, success rate, review rate, and time saved

### Why this wedge is good

- the pain is already present
- the buyer already spends money on the underlying models or tools
- the control plane does not require CorpAI to outperform foundational models
- the product can start as a high-value wrapper and mature into infrastructure
- the same architecture can later expand into non-coding agent workflows

## 4. How to Sell a Wrapper as a Service

Do not use the word `wrapper` in customer-facing language.

Sell it as:

- managed agent operations
- governed AI execution
- policy and routing for coding agents
- the control layer for team-wide AI execution

### What the service actually does

The service offer should combine:

- hosted control plane software
- integration and policy setup
- workflow templates
- prompt and approval tuning
- weekly optimization review

### Offer ladder

#### Offer 1: AgentOps Audit

- one-time
- review current agent tool usage, spend, repos, approval risks, and failure patterns
- output: policy map, routing plan, rollout sequence, KPI baseline

#### Offer 2: Managed Pilot

- 30-day or 45-day pilot
- onboard one team or one agency pod
- standardize 3 to 5 workflows such as bugfixes, PR reviews, docs generation, or migration tasks
- measure spend, cycle-time reduction, and review quality

#### Offer 3: Hosted Control Plane

- recurring SaaS or managed SaaS
- includes policy engine, run logs, routing, approvals, analytics, and templates

#### Offer 4: Managed Agent Operations

- higher-priced retained service
- includes ongoing workflow optimization, model/provider tuning, budget review, template creation, incident support, and rollout to more teams

### Pricing logic

Do not price by seats first.

Better pricing anchors:

- active repositories
- managed workflows
- monthly agent run volume
- policy complexity
- managed support level

Why:

- seat pricing makes CorpAI look like a chat app
- the value comes from governed execution and operational leverage, not access to a text box

## 5. What the Homepage Should Say

The homepage should not introduce the product as a protocol, standard, multi-agent org chart, or abstract operating system.

It should say, in practical language:

### Headline option 1

- Govern every AI agent run across your team.

### Headline option 2

- The control plane for Codex, Gemini, Claude Code, and multi-model agent workflows.

### Headline option 3

- Standardize how your team uses coding agents across repos, providers, and approvals.

### Supporting subheadline

- CorpAI gives engineering teams one place to route models, enforce policy, track spend, review outputs, and reuse proven agent workflows across Codex CLI, Gemini CLI, Claude Code, and OpenRouter-backed execution.

### Three proof blocks

- `Policy`: define who can run which workflows, with which models, under which approval rules
- `Routing`: choose the best provider or model for each workflow and fail over safely
- `Visibility`: see run history, spend, review status, and outcomes across all repos

### Strong CTA

- Book an AgentOps audit
- Run a managed pilot
- See the control plane demo

### Product page structure

1. show the messy current state
2. show the CorpAI control layer
3. show one or two high-value workflows
4. show the governance and budget layer
5. show the ROI and rollout path
6. show pilot CTA

## 6. What Not to Say

Do not lead with:

- autonomous corporation
- replace your whole company
- build any AI workforce
- universal multi-agent society
- AI employees with no supervision
- a markdown org chart for agents
- wrapper around Codex or Gemini
- bring your own LLM standard
- protocol-first language before buyer pain is clear

Do not promise:

- fully autonomous code shipping from day one
- zero human review on risky actions
- vendor neutrality as the primary value prop
- huge enterprise platform breadth before one workflow is proven

Do not make the homepage feel like:

- an open-source spec repo
- a research project
- an ideology about agents
- a marketplace before there is demand for the control plane

## 7. Next 90-Day GTM Plan

## Days 1-15: Lock positioning and package the first offer

- finalize category as `Agent Operations Control Plane`
- choose the first buyer lane: AI-native agencies or startup engineering teams
- choose one wedge workflow bundle: bugfix, PR review, docs, migration, incident triage
- rewrite homepage and portal around the control-plane story
- define the pilot package and KPI scorecard
- create one architecture diagram showing CLIs and providers flowing through CorpAI

Exit criteria:

- the product can be explained in one sentence
- the homepage speaks to one buyer and one pain pattern
- the pilot is clearly scoped

## Days 16-30: Build the demo and proof assets

Build one live or simulated demo showing:

- a repo enters CorpAI
- an engineer launches a standard workflow from their CLI
- CorpAI applies policy, routing, and budget rules
- the task runs through the selected backend
- outputs are logged and flagged for approval when needed
- the manager sees spend, status, and outcome in one dashboard

Also create:

- pricing page
- AgentOps audit offer page
- pilot one-pager
- ROI model based on time saved, review reduction, and spend control
- security and governance FAQ

Exit criteria:

- there is a credible demo
- there is a way to buy
- there is a way to prove value

## Days 31-60: Sell managed pilots

- founder-led outbound to agencies and engineering leaders already using coding agents
- target communities and operators already discussing Codex, Gemini CLI, Claude Code, and multi-model usage
- sell 3 to 5 paid managed pilots
- avoid building custom product branches for each customer
- keep workflow pack and KPI model mostly fixed

What the outbound angle should be:

- your team already uses coding agents
- CorpAI makes that usage governable, measurable, and repeatable
- we can standardize your highest-value workflows in weeks, not quarters

Exit criteria:

- first paid pilots signed
- one champion profile clearly wins
- one use case converts better than the rest

## Days 61-90: Convert to recurring and sharpen the product

- run pilots with weekly scorecards
- track run volume, policy exceptions, review rate, spend, cycle-time impact, and workflow success rate
- convert the best pilots into recurring hosted control-plane subscriptions
- capture one strong case study with before/after metrics
- productize the most common workflow pack

Exit criteria:

- 1 to 3 recurring customers
- one repeatable pilot motion
- one clear case study
- enough proof to double down on one ICP segment

## Strategic Order of Operations

The sequence should be:

1. control plane for coding-agent workflows
2. managed pilot motion
3. recurring hosted product
4. reusable workflow packs and policy templates
5. expansion into broader agent operations beyond coding

Do not reverse that order.

## Board-Level Recommendation

The board-level recommendation is:

- position CorpAI as the control plane above agentic CLIs and providers
- sell governance, routing, visibility, and repeatability
- start with technical teams already using these tools
- make the first product a paid managed pilot plus hosted control plane
- avoid broad workflow abstraction until one narrow developer-facing wedge converts repeatedly

If CorpAI executes this correctly, it is not "another coding agent."
It becomes the company that makes agentic execution manageable at team scale.
