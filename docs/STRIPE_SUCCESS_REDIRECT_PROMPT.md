# Stripe Success Redirect Prompt

Paste this into your browser agent.

```text
Open Stripe Dashboard and update the three existing CorpAI payment links so they redirect buyers to the CorpAI success page after checkout.

Use this success URL:
https://corpai-standard-vos.surge.sh/success/

Update these payment links if Stripe allows setting an after-payment redirect or success URL on them:

1. AgentOps Audit
https://buy.stripe.com/bIY2aZ51s9ZH9484kodAk01

2. Managed Pilot
https://buy.stripe.com/4gfcN589A8VFa844kpeAk82

3. Hosted Control Plane
https://buy.stripe.com/aFAdR9gm4Fn1sxlYadAk03

Requirements:
- keep the existing products and prices unchanged
- only update the post-checkout redirect behavior
- if Stripe requires a different setting name like confirmation page, success page, or redirect URL, use the correct Stripe setting
- after finishing, return only this exact structured output:

AUDIT_SUCCESS_REDIRECT=updated|not_updated
PILOT_SUCCESS_REDIRECT=updated|not_updated
CONTROL_PLANE_SUCCESS_REDIRECT=updated|not_updated
NOTES=<short note if Stripe blocks or limits this>
```
