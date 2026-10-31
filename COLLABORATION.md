# Multi-AI Collaboration Protocol

## Authority and evidence
- VERIFIED — GitHub is the controlled migration source, not canonical today. bourkia.com remains production authority until the [parity gate](migration/first-parity-contracts.md) and explicit human approval.
- VERIFIED — Public production recovery is an owner-authorized reconstruction source when original authoring source is unavailable. Cite the observed URL/artifact, method, audit commit and limits. Do not present reconstructed code as recovered original source.
- UNKNOWN — Original source/build/deployment configuration remains unknown unless actually recovered and verified.
- VERIFIED — HTTP availability, file integrity and functional tests are distinct evidence categories; no category substitutes for another.

## Roles and normal workflow
ChatGPT is integrator/continuity controller; Claude is architecture/editorial/QA challenger; Gemini is UX/design reviewer; Replit implements/tests; the human owner gives final sign-off.

branch → validation → pull request → independent review → human approval → merge

- Read README.md, PROJECT_CONSTITUTION.md, CHANGELOG.md and relevant manifests before editing.
- Work on a new branch. Record changes and scoped validation. Open a PR; do not merge without explicit human approval. Merge does not authorize deployment.
- The bootstrap direct-to-main commit was a one-time migration exception. Preserve the historical bootstrap and audit commits; neither permits future direct-to-main work.
- Do not assume another AI's suggestion is correct. Separate VERIFIED, INFERRED, PROPOSED and UNKNOWN throughout findings/specifications.
- Preserve working features and [production contracts](migration/first-parity-contracts.md) unless an approved task explicitly replaces them. Prefer small reversible changes; do not silently redesign.
- Never insert credentials, private user/browser data or secrets into repository files. Use synthetic fixtures for future tests.
- Do not deploy, publish, delete, purchase, change DNS, widen visibility or connect sensitive accounts without explicit human approval.
- Preserve learning progression, accessibility, responsive/RTL behavior, downloads and privacy promises. Do not turn the course into a prompt list or rewrite lessons/translations without approval.

## Handoff format
1. What I inspected
2. What I changed/propose
3. Files/sections affected
4. Risks or uncertainties
5. Validation performed
6. Recommended next reviewer

For changes also state why, remaining risks and whether production deployment is recommended. An inventory or passing HTTP probe is not a deployment recommendation.
