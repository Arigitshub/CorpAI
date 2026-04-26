# Provider Routing Policy

## Goal

Choose the right runtime and provider for each workflow step based on policy, cost, and fallback rules.

## Phase-one routing defaults

- use `Codex CLI` for repository and shell-heavy tasks
- use `Gemini CLI` for secondary comparison or alternative execution paths
- use `Claude Code` where team policy explicitly allows it
- use `OpenRouter` for multi-model fallback, classification, summarization, and provider flexibility
- use direct provider APIs when a workflow does not need CLI execution

## Routing inputs

- workflow type
- repo access requirement
- shell requirement
- cost ceiling
- tenant preference
- approval class
- fallback order

## Fallback policy

If the preferred runtime fails due to outage, quota, or policy block:

1. check approved fallback list
2. preserve the same workflow and policy class
3. log fallback event
4. continue only if risk class allows it

## Cost policy

- reserve expensive models for high-value or high-risk steps
- route low-risk classification and summarization to cheaper paths
- track fallback rate and provider spend weekly

## Rule

Routing should optimize for outcome quality under policy, not brand loyalty to a provider.
