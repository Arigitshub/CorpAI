# Vercel Browser Agent Prompt

Paste this into your browser agent.

```text
Open Vercel and create or configure a project for the folder `corpai-intake-service`.

Requirements:
- project name: corpai-intake-service
- deploy as a standard Vercel project
- root directory: corpai-intake-service
- framework preset: Other

Set these production environment variables:

TURSO_DATABASE_URL=libsql://corpai-intake-ariofficial.aws-us-east-1.turso.io
TURSO_AUTH_TOKEN=<ask me for the value if needed>
ALLOWED_ORIGINS=https://corpai-standard-vos.surge.sh,http://localhost:3000

After deployment, return only this exact structured output:

VERCEL_PROJECT_URL=<url>
VERCEL_PROJECT_NAME=<name>
NOTES=<short note if anything is blocked>
```
