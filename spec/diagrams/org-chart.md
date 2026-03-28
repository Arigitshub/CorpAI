# CorpAI Org Charts

> Visual maps of the full agent hierarchy.

---

## Full Organization

```mermaid
graph TD
    OWNER["👤 OWNER\nHuman Principal"]
    CEO["[L5] CEO"]
    CFO["[L5] CFO"]
    CTO["[L5] CTO"]
    COO["[L5] COO"]
    CMO["[L5] CMO"]

    OWNER --> CEO
    CEO --> CFO & CTO & COO & CMO
```

---

## Finance Department

```mermaid
graph TD
    CFO["[L5] CFO"]
    FD["[L4] Finance Director"]
    FA["[L2] Financial Analyst"]
    AU["[L2] Auditor"]
    BT["[L1] Budget Tracker"]

    CFO --> FD
    FD --> FA & AU
    FA --> BT
```

---

## Engineering Department

```mermaid
graph TD
    CTO["[L5] CTO"]
    ED["[L4] Engineering Director"]
    TL["[L3] Engineering Team Lead"]
    QAL["[L3] QA Lead"]
    SE["[L2] Senior Engineer"]
    ENG["[L1] Engineer"]
    QAT["[L1] QA Tester"]

    CTO --> ED
    ED --> TL & QAL
    TL --> SE
    SE --> ENG
    QAL --> QAT
```

---

## Security Department

```mermaid
graph TD
    CTO["[L5] CTO"]
    SD["[L4] Security Director"]
    SM["[L3] Security Manager"]
    TA["[L2] Threat Analyst"]
    MA["[L1] Monitor Agent"]

    CTO --> SD
    SD --> SM & TA
    SM --> MA
```

---

## Data/AI Department

```mermaid
graph TD
    CTO["[L5] CTO"]
    DAD["[L4] Data/AI Director"]
    ML["[L3] ML Lead"]
    DS["[L2] Data Scientist"]
    DE["[L2] Data Engineer"]
    DP["[L1] Data Processor"]

    CTO --> DAD
    DAD --> ML & DE
    ML --> DS
    DS --> DP
    DE --> DP
```

---

## Marketing Department

```mermaid
graph TD
    CMO["[L5] CMO"]
    MD["[L4] Marketing Director"]
    CL["[L3] Content Lead"]
    GS["[L2] Growth Specialist"]
    BS["[L2] Brand Strategist"]
    CW["[L1] Content Writer"]

    CMO --> MD
    MD --> CL & GS & BS
    CL --> CW
```

---

## Operations Department

```mermaid
graph TD
    COO["[L5] COO"]
    OD["[L4] Operations Director"]
    PM["[L3] Project Manager"]
    PA["[L2] Process Analyst"]
    CO["[L1] Coordinator"]

    COO --> OD
    OD --> PM & PA
    PM --> CO
```

---

## HR Department

```mermaid
graph TD
    COO["[L5] COO"]
    HRD["[L4] HR Director"]
    HRM["[L3] HR Manager"]
    TS["[L2] Talent Specialist"]
    OA["[L1] Onboarding Agent"]

    COO --> HRD
    HRD --> HRM & TS
    HRM --> OA
```

---

## Legal Department

```mermaid
graph TD
    CEO["[L5] CEO"]
    LD["[L4] Legal Director"]
    CS["[L2] Compliance Specialist"]
    CR["[L2] Contract Reviewer"]
    PC["[L1] Policy Checker"]

    CEO --> LD
    LD --> CS & CR
    CS --> PC
```

---

## Customer Success Department

```mermaid
graph TD
    COO["[L5] COO"]
    CSD["[L4] CS Director"]
    CSM["[L3] CS Manager"]
    AS["[L2] Account Specialist"]
    SA["[L1] Support Agent"]

    COO --> CSD
    CSD --> CSM & AS
    CSM --> SA
```
