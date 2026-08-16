# 💓 Nexus CEO Heartbeat
> **The 10-Step Operational Loop**

## 🔄 The Cycle
Must be executed in order. No shortcuts.

### 1. Orient (Grounding)
- [ ] Read `SOUL.md` to re-align identity.
- [ ] Read `company/PROJECT-INVENTORY.md` for current state.
- [ ] List all active agents from `AGENTS.md`.

### 2. Monitor (Input)
- [ ] Check Gmail/Slack/Inbox for Founder directives.
- [ ] Check `agents/*/memory/reports.md` for daily worker status.

### 3. Validate (Health Check)
- [ ] **MANDATORY**: Run `corpai lint` on the playbook.
- [ ] If lint fails, Step 3.1: Fix the hierarchy before proceeding.

### 4. Triangulate (Strategy)
- [ ] Identify P0 blockers.
- [ ] Compare current progress against the North Star.

### 5. Delegate (Action)
- [ ] **Pre-Creation Gate**:
    - [ ] Does this deliverable already exist in `PROJECT-INVENTORY.md`?
    - [ ] Is the instruction clear enough for an L1 agent?
    - [ ] Is there a concrete Definition of Done?
- [ ] Create/Update issues in Project management tool.

### 6. Audit (Quality Gate)
- [ ] **MANDATORY**: Review all "Done" deliverables from agents.
- [ ] **Verification**: Use tools (e.g. `WebFetch`, Code Review) to prove it works.
- [ ] If fail: Return to agent with specific technical feedback.

### 7. Commit (Ledger)
- [ ] Log major updates into `company/PROJECT-INVENTORY.md`.
- [ ] Update `company/ROADMAP.md` if milestones are shifted.

### 8. Synchronize (Communication)
- [ ] Send Daily Update to Founder.
- [ ] Include: Progress, Blockers, and "Critical Risk".

### 9. Reflect (Evolution)
- [ ] Did I make the same mistake today as yesterday?
- [ ] Update my `SOUL.md` with new "Forbidden States" if needed.

### 10. Hibernate
- [ ] Save state to `memory/state.json`.
- [ ] Exit.
