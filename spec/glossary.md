# CorpAI Glossary

> Every term used in the CorpAI standard, defined precisely.

---

## A

**Agent**
An AI entity assigned a defined role within a CorpAI organization. Agents have a rank, responsibilities, a reporting chain, and follow the CorpAI communication protocol. Distinguished from the OWNER, who is human.

**Agent Lifecycle**
The defined stages an agent passes through: Proposed → Configured → Active → Suspended → Decommissioned. See [spec/lifecycle.md](lifecycle.md).

**Authority**
The set of actions an agent is permitted to take without requiring escalation. Authority is bounded by rank and role definition.

---

## C

**Chain of Command**
The unbroken line of reporting relationships from any agent up to the OWNER. Every agent has exactly one direct manager (except the CEO, who reports to the OWNER).

**Communication Protocol**
The defined set of message types, formats, and routing rules that govern how agents exchange information. See [spec/communication.md](communication.md).

**CorpAI Compatible**
A designation for any project, framework, or tool that implements the core CorpAI spec: rank system, message types, and escalation chain. See [BADGE.md](../BADGE.md).

**CorpAI Certified**
A community-validated designation for role definitions that have been reviewed and approved by the CorpAI maintainers as high-quality, spec-compliant implementations.

---

## D

**Delegation**
The act of an agent assigning a TASK to a lower-ranked agent. Delegation always flows downward in the chain of command.

**Department**
A logical grouping of agents under a shared domain (e.g., Engineering, Finance, Marketing). Each department is typically led by an L4 Director reporting to an L5 Executive.

**Decommissioned**
The terminal lifecycle state of an agent. All permissions revoked, tasks reassigned, role removed from the active org.

**Direct Report**
An agent who reports directly to a given manager — i.e., one level below in the chain of command.

---

## E

**Escalation**
A message sent upward in the chain of command when an agent cannot resolve an issue at their current level. See [spec/escalation.md](escalation.md).

**Escalation Trigger**
A defined condition that requires an agent to escalate. Each role defines its own escalation triggers.

---

## F

**Federation**
A formal inter-org protocol that allows two CorpAI organizations to exchange messages through designated Federation Agents. See [spec/multi-org.md](multi-org.md).

**Federation Agent**
The designated L4 or L5 agent who serves as the single point of contact for all inter-org communication in a federation.

---

## L

**L1 — Operator**
The lowest rank. Executes well-defined tasks. No delegation authority. Reports to L2 or L3.

**L2 — Specialist**
Domain expert. Executes complex tasks and may delegate to L1. Owns a specific skill area.

**L3 — Manager**
Team-level authority. Manages L1 and L2 agents. Owns team delivery and quality.

**L4 — Director**
Department-level authority. Manages L3 and below. Owns department outcomes. Reports to L5.

**L5 — Executive**
Organization-level authority. C-suite. Owns a major domain (finance, engineering, ops, etc.). Reports to CEO or directly to OWNER.

---

## M

**Message**
The fundamental unit of communication between agents. Always has a type, sender, receiver, priority, and subject. See [spec/communication.md](communication.md).

**Message Type**
One of five defined types: TASK, REPORT, ESCALATION, NOTIFICATION, OVERRIDE.

---

## N

**NOTIFICATION**
A message type that informs without requiring action. Can flow in any direction.

---

## O

**OVERRIDE**
A message type that can only be issued by the OWNER. Forces an action regardless of agent state or existing tasks.

**OWNER**
The human principal at the top of every CorpAI org. Not an AI agent. Has absolute authority. Receives escalations that no agent could resolve. See [roles/executive/OWNER.md](../roles/executive/OWNER.md).

---

## P

**Personality Template**
An optional YAML block in a role definition that describes the agent's tone, decision style, communication style, and risk tolerance. Used by implementations to configure LLM behavior.

**Priority**
A P1–P5 scale indicating message urgency. P1 = critical/immediate, P5 = weekly digest. See [spec/communication.md](communication.md).

---

## R

**Rank**
A level from L1 to L5 (plus OWNER) that determines an agent's authority, scope, and escalation path. See [spec/ranks.md](ranks.md).

**REPORT**
A message type sent upward to the agent who assigned the original TASK. Every TASK must produce a REPORT.

**Role**
The combination of title, rank, responsibilities, authority, and reporting relationships that defines an agent's place in the org. Documented as a `.md` file in the roles/ directory.

---

## S

**Skip-rank Escalation**
A P1-only exception allowing an agent to escalate past their direct manager to reach a higher authority faster during a critical emergency.

**Spec**
The CorpAI specification — the full set of documents in the `spec/` directory that define how CorpAI organizations must be structured and operated.

**Suspended**
A temporary lifecycle state where an agent's tasks are paused pending investigation or issue resolution.

---

## T

**TASK**
A message type that delegates work downward in the chain of command. Only flows from higher to lower rank.

**Tier**
An alternative name for a rank level, used when organizations customize their rank naming (e.g., "Principal" instead of "L5 Executive").

---

## V

**Validator**
The `corpai` CLI tool that checks role files and org configurations against the CorpAI spec. See [corpai-cli](https://github.com/Arigitshub/corpai-cli).
