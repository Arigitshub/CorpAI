# CorpAI Execution Backlog

## Phase 1: Make the product legible

- Lock the narrative: CorpAI is the control plane, not the model provider.
- Define the runtime contract for CLI and API backends.
- Define the provider-routing policy for Codex CLI, Gemini CLI, and OpenRouter.
- Define the approval engine state machine and protected action classes.
- Align the README, portal, and roadmap to the control-plane story.

## Phase 2: Make the offer easy to buy

- Lock the category as `Agent Operations Control Plane`.
- Lock the first buyer lane as `AI-native agencies` or `startup engineering teams`.
- Package `AgentOps Audit` and `Managed Pilot` as the first default offers.
- Rewrite portal copy around one buyer, one control-plane pain, and one ROI story.
- Add pricing guidance tied to repos, workflows, run volume, and policy complexity.
- Add included-usage and overage rules to every package.
- Define when CorpAI uses managed provider accounts versus enterprise BYOK.
- Create one demo story that shows intake, execution, escalation, and reporting.
- Create the minimum GTM docs listed in `docs/REQUIRED_DOCS.md`.

## Phase 3: Make delivery measurable

- Track approvals, escalations, tasks completed, and saved time by workflow.
- Track runtime selection, provider failures, and cost by step.
- Track gross margin by account every week.
- Add a report template that proves output each week.
- Build one starter pack for coding-agent workflows.
- Define the metric formulas in a canonical metrics doc.
- Define approval thresholds and exception routing.

## Phase 4: Turn delivery into a system

- Add reusable workflow templates with clear inputs and outputs.
- Standardize escalation thresholds by workflow type.
- Create renewal review templates that show value delivered.
- Add expansion prompts for adjacent workflows.
- Keep adjacent workflows limited to coding-agent execution until the first workflow pack converts consistently.

## Phase 5: Turn the system into an engine

- Automate lead qualification and proposal assembly.
- Link workflow metrics to revenue and margin reporting.
- Prioritize the highest-retention verticals.
- Convert the best managed service packages into more self-serve product layers.
- Add Stripe-backed billing and subscription controls now, then expand into metering and expansion pricing once the first offer is stable.
- Add enterprise BYOK as a margin-protection offer, not as the default onboarding path.

## Non-goals for now

- broad ecosystem messaging as the main homepage story
- speculative fully autonomous company claims
- shipping too many products at once
- building a registry before the first serious revenue workflow lands
- broad self-serve builder UX before the first repeatable paid workflow is proven
- building custom provider logic before the runtime contract is stable
- unlimited usage pricing
- seat-based pricing
- subsidizing model spend without overage billing
