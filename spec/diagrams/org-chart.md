# CorpAI Org Charts

> Visual maps of the full agent hierarchy.

---

## 🏛️ Full Organization

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIE9XTkVSWyLwn5GkIE9XTkVSXG5IdW1hbiBQcmluY2lwYWwiXQogICAgQ0VPWyJbTDVdIENFTyJdCiAgICBDRk9bIltMNV0gQ0ZPIl0KICAgIENUT1siW0w1XSBDVE8iXQogICAgQ09PWyJbTDVdIENPTyJdCiAgICBDTU9bIltMNV0gQ01PIl0KCiAgICBPV05FUiAtLT4gQ0VPCiAgICBDRU8gLS0+IENGTyAmIENUTyAmIENPTyAmIENNTw==)

<details>
<summary>View Source</summary>

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

</details>

---

## 💰 Finance Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENGT1siW0w1XSBDRk8iXQogICAgRkRbIltMNF0gRmluYW5jZSBEaXJlY3RvciJdCiAgICBGQVsiW0wyXSBGaW5hbmNpYWwgQW5hbHlzdCJdCiAgICBBVVsiW0wyXSBBdWRpdG9yIl0KICAgIEJUWyJbTDFdIEJ1ZGdldCBUcmFja2VyIl0KCiAgICBDRk8gLS0+IEZECiAgICBGRCAtLT4gRkEgJiBBVQogICAgRkEgLS0+IEJU)

<details>
<summary>View Source</summary>

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

</details>

---

## ⚙️ Engineering Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENUT1siW0w1XSBDVE8iXQogICAgRURbIltMNF0gRW5naW5lZXJpbmcgRGlyZWN0b3IiXQogICAgVExbIltMM10gRW5naW5lZXJpbmcgVGVhbSBMZWFkIl0KICAgIFFBTFsiW0wzXSBRQSBMZWFkIl0KICAgIFNFWyJbTDJdIFNlbmlvciBFbmdpbmVlciJdCiAgICBFTkdbIltMMV0gRW5naW5lZXIiXQogICAgUUFUWyJbTDFdIFFBIFRlc3RlciJdCgogICAgQ1RPIC0tPiBFRAogICAgRUQgLS0+IFRMICYgUUFMCiAgICBUTCAtLT4gU0UKICAgIFNFIC0tPiBFTkcKICAgIFFBTCAtLT4gUUFU)

<details>
<summary>View Source</summary>

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

</details>

---

## 📦 Product Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENFT1siW0w1XSBDRU8iXQogICAgUERbIltMNF0gUHJvZHVjdCBEaXJlY3RvciJdCiAgICBQTVsiW0wzXSBQcm9kdWN0IE1hbmFnZXIiXQogICAgUERlc1siW0wyXSBQcm9kdWN0IERlc2lnbmVyIl0KICAgIFVSWyJbTDFdIFVzZXIgUmVzZWFyY2hlciJdCgogICAgQ0VPIC0tPiBQRAogICAgUEQgLS0+IFBNCiAgICBQTSAtLT4gUERlcyAmIFVS)

<details>
<summary>View Source</summary>

```mermaid
graph TD
    CEO["[L5] CEO"]
    PD["[L4] Product Director"]
    PM["[L3] Product Manager"]
    PDes["[L2] Product Designer"]
    UR["[L1] User Researcher"]

    CEO --> PD
    PD --> PM
    PM --> PDes & UR
```

</details>

---

## 🧠 Data/AI Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENUT1siW0w1XSBDVE8iXQogICAgREFEWyJbTDRdIERhdGEvQUkgRGlyZWN0b3IiXQogICAgTUxbIltMM10gTUwgTGVhZCJdCiAgICBEU1siW0wyXSBEYXRhIFNjaWVudGlzdCJdCiAgICBERVsiW0wyXSBEYXRhIEVuZ2luZWVyIl0KICAgIERQWyJbTDFdIERhdGEgUHJvY2Vzc29yIl0KCiAgICBDVE8gLS0+IERBRAogICAgREFEIC0tPiBNTCAmIERFCiAgICBNTCAtLT4gRFMKICAgIERTIC0tPiBEUAogICAgREUgLS0+IERQ)

<details>
<summary>View Source</summary>

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

</details>

---

## 🔐 Security Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENUT1siW0w1XSBDVE8iXQogICAgU0RbIltMNF0gU2VjdXJpdHkgRGlyZWN0b3IiXQogICAgU01bIltMM10gU2VjdXJpdHkgTWFuYWdlciJdCiAgICBUQVsiW0wyXSBUaHJlYXQgQW5hbHlzdCJdCiAgICBNQVsiW0wxXSBNb25pdG9yIEFnZW50Il0KCiAgICBDVE8gLS0+IFNECiAgICBTRCAtLT4gU00gJiBUQQogICAgU00gLS0+IE1B)

<details>
<summary>View Source</summary>

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

</details>

---

## 📊 Marketing Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENNT1siW0w1XSBDTU8iXQogICAgTURbIltMNF0gTWFya2V0aW5nIERpcmVjdG9yIl0KICAgIENMWyJbTDNdIENvbnRlbnQgTGVhZCJdCiAgICBHU1siW0wyXSBHcm93dGggU3BlY2lhbGlzdCJdCiAgICBCU1siW0wyXSBCcmFuZCBTdHJhdGVnaXN0Il0KICAgIENXWyJbTDFdIENvbnRlbnQgV3JpdGVyIl0KCiAgICBDTU8gLS0+IE1ECiAgICBNRCAtLT4gQ0wgJiBHUyAmIEJTCiAgICBDTCAtLT4gQ1c=)

<details>
<summary>View Source</summary>

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

</details>

---

## 🚀 Operations Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENPT1siW0w1XSBDT08iXQogICAgT0RbIltMNF0gT3BlcmF0aW9ucyBEaXJlY3RvciJdCiAgICBQTVsiW0wzXSBQcm9qZWN0IE1hbmFnZXIiXQogICAgUEFbIltMMl0gUHJvY2VzcyBBbmFseXN0Il0KICAgIENPWyJbTDFdIENvb3JkaW5hdG9yIl0KCiAgICBDT08gLS0+IE9ECiAgICBPRCAtLT4gUE0gJiBQQQogICAgUE0gLS0+IENP)

<details>
<summary>View Source</summary>

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

</details>

---

## 🤝 HR Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENPT1siW0w1XSBDT08iXQogICAgSFJEWyJbTDRdIEhSIERpcmVjdG9yIl0KICAgIEhSTVsiW0wzXSBIUiBNYW5hZ2VyIl0KICAgIFRTWyJbTDJdIFRhbGVudCBTcGVjaWFsaXN0Il0KICAgIE9BWyJbTDFdIE9uYm9hcmRpbmcgQWdlbnQiXQoKICAgIENPTyAtLT4gSFJECiAgICBIUkQgLS0+IEhSTSAmIFRTCiAgICBIUk0gLS0+IE9B)

<details>
<summary>View Source</summary>

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

</details>

---

## ⚖️ Legal Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENFT1siW0w1XSBDRU8iXQogICAgTERbIltMNF0gTGVnYWwgRGlyZWN0b3IiXQogICAgQ1NbIltMMl0gQ29tcGxpYW5jZSBTcGVjaWFsaXN0Il0KICAgIENSWyJbTDJdIENvbnRyYWN0IFJldmlld2VyIl0KICAgIFBDWyJbTDFdIFBvbGljeSBDaGVja2VyIl0KCiAgICBDRU8gLS0+IExECiAgICBMRCAtLT4gQ1MgJiBDUgogICAgQ1MgLS0+IFBD)

<details>
<summary>View Source</summary>

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

</details>

---

## 📊 Sales Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENFT1siW0w1XSBDRU8iXQogICAgU0RbIltMNF0gU2FsZXMgRGlyZWN0b3IiXQogICAgQUVbIltMM10gQWNjb3VudCBFeGVjdXRpdmVcbihBRSkiXQogICAgU0RSWyJbTDJdIFNhbGVzIERldmVsb3BtZW50XG5SZXAgKFNEUikiXQogICAgTFJbIltMMV0gTGVhZCBSZXNlYXJjaGVyIl0KCiAgICBDRU8gLS0+IFNECiAgICBTRCAtLT4gQUUKICAgIEFFIC0tPiBTRFIACiAgICBTRFIgLS0+IExSCiAgICBBRSAtLT4gTFI=)

<details>
<summary>View Source</summary>

```mermaid
graph TD
    CEO["[L5] CEO"]
    SD["[L4] Sales Director"]
    AE["[L3] Account Executive\n(AE)"]
    SDR["[L2] Sales Development\nRep (SDR)"]
    LR["[L1] Lead Researcher"]

    CEO --> SD
    SD --> AE
    AE --> SDR 
    SDR --> LR
    AE --> LR
```

</details>

---

## 📞 Customer Success Department

![Chart](https://mermaid.ink/svg/Z3JhcGggVEQKICAgIENPT1siW0w1XSBDT08iXQogICAgQ1NEWyJbTDRdIENTIERpcmVjdG9yIl0KICAgIENTTVsiW0wzXSBDUyBNYW5hZ2VyIl0KICAgIEFTWyJbTDJdIEFjY291bnQgU3BlY2lhbGlzdCJdCiAgICBTQVsiW0wxXSBTdXBwb3J0IEFnZW50Il0KCiAgICBDT08gLS0+IENTRAogICAgQ1NEIC0tPiBDU00gJiBBUwogICAgQ1NNIC0tPiBTQQ==)

<details>
<summary>View Source</summary>

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

</details>
