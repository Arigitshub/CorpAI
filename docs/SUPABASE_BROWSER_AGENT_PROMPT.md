# Supabase Browser Agent Prompt

Paste this into your browser agent.

```text
Open the Supabase project used for CorpAI and collect the frontend connection values needed for the static portal.

I need:

1. Project URL
2. Publishable browser key (safe for frontend use)

Return only this exact structured output:

NEXT_PUBLIC_SUPABASE_URL=<value>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<value>
NOTES=<short note if anything is blocked>
```
