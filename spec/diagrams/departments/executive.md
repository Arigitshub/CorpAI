# Executive Department Org Chart

![Executive Agent](../../../assets/executive_agent.png)

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

    click OWNER "/roles/executive/owner.md"
    click CEO "/roles/executive/ceo.md"
    click CFO "/roles/executive/cfo.md"
    click CTO "/roles/executive/cto.md"
    click COO "/roles/executive/coo.md"
    click CMO "/roles/executive/cmo.md"
```
