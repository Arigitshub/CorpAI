# Stripe Browser Agent Prompt

Paste the prompt below into your browser agent.

```text
Open Stripe Dashboard and create three payment links for my CorpAI offers.

Business context:
- Product name: CorpAI AgentOps
- Positioning: control plane for governed AI agent execution across Codex CLI, Gemini CLI, Claude Code, OpenRouter, and direct APIs

Create exactly these three payment links:

1. AgentOps Audit
- one-time payment
- price: USD 5000
- product name: CorpAI AgentOps Audit
- description: Audit of current coding-agent workflows, runtime routing, policy gaps, approval risks, spend leakage, and rollout plan

2. Managed Pilot
- recurring monthly subscription
- price: USD 6000 per month
- product name: CorpAI Managed Pilot
- description: Managed pilot for 3-5 governed coding-agent workflows with policy, routing, approvals, logging, and weekly operating review

3. Hosted Control Plane
- recurring monthly subscription
- price: USD 12000 per month
- product name: CorpAI Hosted Control Plane
- description: Hosted control plane plus managed operations for governed AI agent execution across teams and repositories

Requirements:
- use USD
- make each payment link active and shareable
- label each clearly so I can identify which is which
- after creating them, return only this exact structured output:

AUDIT_PAYMENT_LINK=<url>
PILOT_PAYMENT_LINK=<url>
CONTROL_PLANE_PAYMENT_LINK=<url>
```

## What to paste back into Codex

Paste the browser agent response exactly as returned, for example:

```text
AUDIT_PAYMENT_LINK=https://buy.stripe.com/...
PILOT_PAYMENT_LINK=https://buy.stripe.com/...
CONTROL_PLANE_PAYMENT_LINK=https://buy.stripe.com/...
```
