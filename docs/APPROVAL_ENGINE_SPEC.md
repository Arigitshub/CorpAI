# Approval Engine Spec

## Purpose

Define how CorpAI pauses, escalates, approves, or blocks risky actions.

## Approval classes

- `none`
- `soft_review`
- `required_before_action`
- `required_before_commit`
- `blocked`

## Protected actions

Phase one should treat these as protected:

- merges
- deploys
- destructive shell commands
- database writes with destructive impact
- billing or subscription changes
- customer-facing actions in sensitive flows

## State transitions

- `queued`
- `running`
- `awaiting_approval`
- `approved`
- `rejected`
- `completed`
- `failed`
- `escalated`

## Review payload

Each approval request should include:

- workflow name
- repo or system target
- proposed action
- runtime used
- reason for approval requirement
- artifacts or diff summary

## Rule

No protected action may bypass the approval engine in phase one.
