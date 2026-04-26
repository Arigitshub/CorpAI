# CRM Browser Agent Prompt

Paste this into your browser agent.

```text
Set up a simple free CRM handoff for CorpAI using Google Sheets and Google Apps Script.

Goal:
- create one operator-friendly lead sheet for CorpAI
- use the live leads endpoint as the source of truth for imports
- keep the setup lightweight and free

Live leads endpoint:
- URL: https://corpai-intake-service.arimail-57e.workers.dev/leads?limit=100
- Header: Authorization: Bearer <ADMIN_READ_TOKEN from the founder's password manager>

Tasks:
1. Open Google Sheets and create a new sheet named `CorpAI Leads`
2. Add these header columns in row 1:
   - id
   - created_at
   - name
   - email
   - company
   - team_size
   - current_tools
   - target_workflow
   - monthly_volume
   - biggest_pain
   - timeline
   - source
   - status
   - owner
   - next_step
   - notes
3. Open Extensions -> Apps Script for this sheet
4. Add a simple script that:
   - reads `CORPAI_ADMIN_READ_TOKEN` from Apps Script project properties
   - fetches the live `/leads` endpoint with the Authorization header
   - clears existing data rows below the header
   - writes the returned leads into the sheet in header order
5. Save the script in the sheet project
6. Add script property `CORPAI_ADMIN_READ_TOKEN` using the live admin read token from the founder's password manager
7. If possible, run the script once so the current leads populate into the sheet
8. If a permission prompt appears, complete the minimum required authorization flow
9. Share back the sheet URL
10. If full script execution is blocked, still leave the sheet and Apps Script project prepared and note the blocker

Return only this exact structured output:

CRM_TYPE=google_sheets
CRM_NAME=CorpAI Leads
CRM_URL=<url>
IMPORT_STATUS=connected|sheet_only|script_added
NOTES=<short note if anything is blocked>
```
