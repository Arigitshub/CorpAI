# CorpAI Control Plane Architecture

## Purpose

This document defines the architectural shape of CorpAI as a control plane built on top of CLI-native agent runtimes and model-provider backends.

CorpAI is not the foundation model.
CorpAI is not the CLI runtime.
CorpAI is the governed execution layer that makes those runtimes usable in production workflows.

## System Layers

## 1. Entry Layer

Inputs:

- workflow trigger
- operator action
- scheduled job
- integration webhook
- internal retry or escalation event

Outputs:

- normalized task record
- tenant context
- workflow selection

## 2. Workflow Engine

Responsibilities:

- assign task type
- determine current stage
- determine required context
- determine policy and approval class
- advance state machine

Core states:

- queued
- running
- awaiting_approval
- approved
- rejected
- retrying
- completed
- failed
- escalated

## 3. Runtime Routing Layer

Responsibilities:

- choose execution backend per step
- manage fallback order
- enforce tenant routing preferences
- enforce cost and quota guardrails

Routing examples:

- use Codex CLI for repo and shell work
- use Gemini CLI for secondary code execution or comparison
- use OpenRouter for classification, summarization, ranking, and fallback reasoning

## 4. Runtime Adapter Layer

Each adapter should expose a common contract:

- `prepare(context, workflowStep)`
- `execute(runRequest)`
- `streamEvents()`
- `resume(sessionRef)`
- `cancel(runRef)`
- `collectUsage()`
- `collectArtifacts()`

Required normalized outputs:

- run id
- provider/runtime id
- model
- session id if available
- cost or token usage if available
- stdout/stderr or message transcript
- artifacts
- structured result code

## 5. Governance Layer

Responsibilities:

- evaluate action risk
- map step to approval requirement
- route approval request
- persist audit log
- enforce no-bypass on protected actions

Approval classes:

- none
- soft_review
- required_before_action
- required_before_commit
- blocked

Protected action examples:

- refunds above threshold
- customer-facing replies on risky tickets
- database writes with destructive impact
- repository merge or deploy
- billing or subscription changes

## 6. Context and Integration Layer

Responsibilities:

- fetch tenant-scoped context
- fetch knowledge or system records
- write outputs back into systems of record
- preserve tenant isolation

Initial integrations:

- Shopify
- Zendesk or Gorgias
- Slack
- email
- Notion

## 7. Observability and Metrics Layer

Responsibilities:

- track workflow counts
- track approval rate
- track escalation rate
- track completion rate
- track time saved
- track cost by runtime and workflow
- track failure modes

This layer is required for both renewal proof and routing optimization.

## 8. Billing and Packaging Layer

Responsibilities:

- tie tenants to commercial plans
- enforce plan-level limits
- meter workflow usage where needed
- support pilot and recurring contracts

This is where Stripe should eventually connect.

## First Build Rule

Only build architecture that directly supports:

- one workflow
- one pilot offer
- one approval system
- one reporting loop

Do not build for theoretical universality first.

## Near-Term Canonical Stack

- `corpai-portal`
  buyer-facing and operator-facing UI
- `paperclip-source`
  execution and adapter reference layer
- `corpai-cli`
  spec and validation utility surface
- `corpai-platform`
  optional dashboard and workflow management surface

## Architecture Decision

CorpAI should standardize around:

- multi-runtime adapter execution
- workflow-state orchestration
- first-class approvals
- business-facing metrics

That is the control plane.
