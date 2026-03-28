# Contributing to CorpAI

> CorpAI grows through community contributions. Every new role, department, and improvement makes the standard more useful for everyone.

---

## What You Can Contribute

| Contribution Type | Where it goes |
|---|---|
| New agent role | `roles/{department}/{role}.md` |
| New department | `roles/{new-department}/` + update org chart |
| Spec improvement | `spec/*.md` — open an issue first |
| New example | `examples/` |
| Bug fix / typo | Anywhere — just PR it |
| Translation | `i18n/{lang}/` (coming in v1.0) |

---

## Role Submission Process

### Step 1 — Check for duplicates
Search existing roles in `roles/` before creating a new one. Similar roles can be extended, not duplicated.

### Step 2 — Use the template
Copy [`templates/role-template.md`](templates/role-template.md) and fill in every field. Incomplete submissions will not be merged.

### Step 3 — Place it correctly
```
roles/
└── {department}/
    └── {role-slug}.md
```

If your department doesn't exist yet, create the folder and add it to the org chart in `spec/diagrams/org-chart.md`.

### Step 4 — Submit the PR

Your PR description must include:

```markdown
## Role Submission

**Role title:** [L{level}] {Title}
**Department:** {department}
**Reports to:** {role title}

## Checklist
- [ ] Used role-template.md
- [ ] Rank level is appropriate for the role's authority
- [ ] Reports-to role exists in the spec
- [ ] Escalation triggers use valid types from spec/escalation.md
- [ ] Communication patterns use valid message types from spec/communication.md
- [ ] Added role to spec/diagrams/org-chart.md
- [ ] No duplicate of an existing role
```

---

## Spec Changes

Changes to `spec/` files (ranks, communication, escalation) are **major decisions** that affect the whole standard.

1. Open an issue first — describe the problem and proposed change
2. Wait for community discussion (minimum 48 hours)
3. If approved, submit a PR with the change
4. Spec changes require maintainer approval

---

## Code of Conduct

- Be constructive — critique ideas, not people
- Every role is a real contribution — treat it with respect
- If you disagree with a decision, open an issue — don't fight in PRs

---

## Questions?

Use [GitHub Discussions](../../discussions) — not issues — for questions, ideas, and general conversation.
