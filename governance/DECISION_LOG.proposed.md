# Decision Log — Proposed

## Template
- ID:
- Date:
- Status: proposed | accepted | superseded | rejected
- Decision:
- Context:
- Options considered:
- Rationale:
- Consequences:
- Owner:
- Review trigger:

## Initial candidate decisions
- DEC-001 — GitHub remains the controlled migration source until parity with bourkia.com production and explicit human approval; any canonical transition requires that approval.
- DEC-002 — Production remains on bourkia.com until replacement passes parity checks.
- DEC-003 — Privacy/human-authority concepts precede connected-app workflows.
- DEC-004 — All downloads are generated from canonical lesson/content sources, not hand-maintained copies.
- DEC-005 — Time-sensitive AI product claims must be registered and dated.

## Reconciliation and owner direction — review pending
- VERIFIED — Owner instructed documentation-only reconciliation from audit a6055e3, with a new branch and PR; no direct main commit, merge or deployment.
- VERIFIED — Public production recovery is authorized when original authoring source is unavailable; original source/build configuration remains UNKNOWN unless recovered. HTTP availability is not integrity or functional verification.
- VERIFIED — Observed course counts are 7 stages, 24 foundation lessons, 6 applied labs, EN/Darija; 45 observed endpoints supersede the old incomplete download proposal for recovery. See the observed content JSON inventories.
- VERIFIED — Owner-approved direction is a cleaner personal Home, dedicated Courses, Reality 101 and Workbench areas, and a publicly unnamed understated teaser with no book/release/purchase/download framing. See [proposed IA](../site/information-architecture.proposed.md) for the separation between direction and candidate design/paths.
- PROPOSED — Candidate /courses and /reality-101 paths and simplified navigation remain reviewable, not implemented. Preserve [production contracts](../migration/first-parity-contracts.md).
- VERIFIED — Normal workflow is branch → validation → pull request → independent review → human approval → merge; bootstrap direct-to-main was a one-time migration exception, not a precedent. Historical commits are not rewritten.
- UNKNOWN — PR acceptance and implementation authorization remain pending human review; no accepted source/build configuration is invented here.
