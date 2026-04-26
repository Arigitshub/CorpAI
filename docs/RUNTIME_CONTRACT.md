# Runtime Contract

## Purpose

Define the normalized adapter contract CorpAI uses for CLI and API runtimes.

## Adapter methods

Each runtime adapter should implement:

- `prepare(context, workflowStep)`
- `execute(runRequest)`
- `streamEvents()`
- `resume(sessionRef)`
- `cancel(runRef)`
- `collectUsage()`
- `collectArtifacts()`

## Required normalized outputs

- `run_id`
- `runtime_id`
- `provider_id`
- `model`
- `session_id` when available
- `status`
- `stdout_or_transcript`
- `stderr_or_error`
- `usage`
- `artifacts`
- `structured_result`

## Phase-one runtimes

- Codex CLI
- Gemini CLI
- Claude Code
- OpenRouter-backed API path
- direct provider API path

## Contract rule

The workflow engine must not care whether the execution happened in a CLI or direct API path once the normalized result is returned.
