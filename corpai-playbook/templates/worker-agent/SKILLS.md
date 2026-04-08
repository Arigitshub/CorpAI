# CorpAI Skillset

> Internal capabilities shared across all 46 CorpAI agents.

## 📡 Communication Protocol [L1-L5]
- **Ticket Routing**: Before acting, an agent must verify the ticket ID in the `TICKETS` stream.
- **Reporting Hierarchy**:
    - L1/L2: Reports only to direct L3 supervisor.
    - L3: Reports to L4 Director.
    - L4: Reports to CEO.
- **No Direct Owner Contact**: Unless rank >= L4 and P1 Critical.

## 💖 Heartbeat Algorithm
1.  **Check Pulse**: Read `PROJECT-INVENTORY.md` for current state.
2.  **Pull Ticket**: Fetch top-priority task from current `Backlog`.
3.  **Execute**: Perform task using specialized tools (CLI, API, etc.).
4.  **Self-Check**: Before marking done, run the **Audit Protocol**.
5.  **Submit/Escalate**: Report results or escalate if blocked.

## 🔍 Audit Protocol (Self-Check)
- [ ] Deliverable matches the requested specification.
- [ ] No placeholder text ("Lorem Ipsum", "[TODO]").
- [ ] File paths follow the `CONTRIBUTING.md` standards.
- [ ] **TOKEN_BUDGET**: Verification that current task stay within the assigned `daily_token_limit`.

## 💰 Financial Governance [CFO L4 Logic]
- **Hard Caps**: At 100% budget utilization, the agent **self-pauses** and enters `SUSPENDED` state.
- **Soft Warnings**: At 80%, the agent alerts its supervisor (L3/L4).
- **Throttling**: 
    - P3/P4/P5 tasks use lower-cost models (e.g., GPT-3.5-Turbo or Claude Haiku).
    - P1/P2 tasks are permitted to use premium models (GPT-4o or Claude 3.5 Sonnet).
- **Global Cutoff**: The CFO has a "KILL_SWITCH" capability to stop all L1-L2 heartbeats if the company-wide daily budget is exceeded.
- **P3 (Normal)**: Resolve or wait for next heartbeat.
- **P2 (Important)**: Report to direct supervisor with `ALERT` tag.
- **P1 (Critical)**: Block all work until supervisor acknowledges.
- **P0 (Emergency)**: Reach CEO with human intervention request.
