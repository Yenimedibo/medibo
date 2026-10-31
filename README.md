# Medibo / TALK TO AI — Controlled Migration Source

## Authority and current state
- VERIFIED — This GitHub repository is the controlled migration source, not yet canonical. https://bourkia.com remains the production authority until the parity gate passes and the human owner explicitly approves the transition.
- VERIFIED — The repository contains governance, observed inventories and proposed specifications, not a rebuilt replacement website. The audit baseline is a6055e3.
- UNKNOWN — Original authoring source, complete source export, build/dependency configuration and deployment configuration have not been recovered. Earlier governance described ChatGPT Sites; public frontend observations do not establish the original build setup.
- VERIFIED — Owner-authorized recovery from the public production frontend is a valid reconstruction source when original authoring source is unavailable. Record provenance and limitations; do not invent missing original source or call reconstruction an exact export.

## Evidence versus proposals
Use VERIFIED (directly observed), INFERRED (supported interpretation), PROPOSED (recommendation/specification) and UNKNOWN (not determined).
- [Production observations](audit/production-site-inventory.md) and [link evidence](audit/public-link-checks.csv) record scoped observations. HTTP 200 means availability only, not file integrity, correct contents or functional success.
- [Observed course inventory](content/course-inventory.observed.json): 7 stages, 24 foundation lessons, 6 applied labs, EN and Darija.
- [Observed download inventory](content/downloads.observed.json): 45 endpoints; supersedes the original incomplete proposed filenames for recovery, not proof of binary parity.
- [First-parity contracts and gate](migration/first-parity-contracts.md) preserve routes, URLs/aliases, RTL, browser-storage compatibility and privacy promises.
- [Proposed information architecture](site/information-architecture.proposed.md) records owner-approved direction separately from proposed route/layout decisions. It is not implementation or deployment approval.

## Normal workflow
branch → validation → pull request → independent review → human approval → merge

Read README.md, PROJECT_CONSTITUTION.md, COLLABORATION.md, CHANGELOG.md and relevant manifests before editing. Make small reversible changes; update CHANGELOG.md and validate the affected scope. Never commit directly to main under this normal workflow. The bootstrap direct-to-main commit was a one-time migration exception, not a precedent. Historical commits remain unchanged.

Merge is not deployment approval. Publishing, DNS, visibility/access changes, deletion, spending and sensitive connections require explicit human approval. Keep production untouched during migration.

## Roles
- ChatGPT: integrator and continuity controller.
- Claude: independent architecture/editorial/QA challenger.
- Gemini: independent UX/design reviewer.
- Replit: implementation and technical testing/validation.
- Human owner: absolute final sign-off on scope, content, merge, publication and consequential actions.
