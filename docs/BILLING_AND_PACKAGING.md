# CorpAI Billing and Packaging

## Purpose

This document translates the business model into billable products, Stripe objects, and operating rules.

CorpAI is not billed as raw model access.

CorpAI is billed as:

- orchestration
- managed workflows
- approvals and policy controls
- reporting
- support
- controlled usage

## Packaging principles

- no seat pricing
- no unlimited usage
- no unpaid implementation
- no custom work without a scope boundary
- every recurring package includes a usage allowance and an overage rule

## Default packaging

## 1. Deployment Sprint

Commercial type:

- one-time

Stripe shape:

- one-time invoice item

Purpose:

- workflow mapping
- integration setup
- routing and model policy setup
- approval thresholds
- KPI baseline

Price range:

- `$3k-$8k`

## 2. Support OS Pilot

Commercial type:

- monthly recurring

Stripe shape:

- subscription

Includes:

- one workflow
- one primary queue or channel
- one weekly review
- one included usage budget

Price range:

- `$4k-$7k/mo`

Billing notes:

- overages bill separately
- scope expansion requires add-on or plan upgrade

## 3. Support OS Core

Commercial type:

- monthly recurring

Stripe shape:

- subscription

Includes:

- multiple workflows
- multiple integrations
- richer reporting
- managed optimization
- larger included usage budget

Price range:

- `$8k-$15k/mo`

## 4. Enterprise Control Plane / BYOK

Commercial type:

- monthly recurring plus services

Stripe shape:

- subscription plus optional invoice items

Includes:

- orchestration layer
- approvals
- routing policy
- reporting
- support

Customer pays provider costs directly when BYOK is enabled.

Price range:

- `$2k-$6k/mo` platform fee plus services

## Billable components

Every account should map to these billable components:

1. `base_platform_fee`
2. `managed_workflow_fee`
3. `usage_overage`
4. `implementation_or_change_order`
5. `optional_add_ons`

## Stripe product structure

Create products and prices for:

- `Deployment Sprint`
- `Support OS Pilot`
- `Support OS Core`
- `Enterprise Control Plane`
- `Usage Overage`
- `Additional Workflow Pack`
- `Priority Support`

## Metering rules

Usage should be measured in the simplest way that preserves margin.

Acceptable phase-one options:

- model spend dollars
- workflow runs
- tickets processed

The recommended starting metric is:

- usage overage tied to measured model spend and high-volume workflow activity

That keeps economics legible while the runtime layer is still evolving.

## Included usage policy

Each plan should include a monthly usage budget.

That budget should be expressed internally as:

- expected workflow volume
- expected vendor cost
- expected gross margin floor

When the customer exceeds the included budget:

- Stripe meter records the overage
- finance reviews margin impact
- account team recommends plan upgrade if recurring

## BYOK policy

BYOK should not be the default.

Use BYOK when:

- the customer is larger
- security or procurement prefers direct provider accounts
- model spend is large enough to threaten CorpAI margin

When BYOK is active:

- CorpAI charges platform and service fees
- customer covers provider costs directly
- CorpAI does not absorb vendor overage risk

## Discounting rules

- do not discount the deployment sprint to zero
- do not discount recurring fees without term commitment
- tie discounts to:
  - annual prepay
  - public case study rights
  - reduced support scope

## Collections rules

- collect the deployment sprint before implementation begins
- start recurring billing at go-live or clearly defined pilot start
- do not allow unbilled overages to accumulate for multiple months
- pause expansion work for accounts with unresolved payment issues

## Finance review cadence

Review weekly:

- revenue by account
- model spend by account
- gross margin by account
- usage against allowance
- implementation hours against plan
- overage billing captured versus missed

## Rule

If a package cannot be billed clearly in Stripe and explained in one paragraph, it is too complex for phase one.
